const express = require("express");
const app = express();
const db = require("./database.js");
var cors = require("cors");
var { expressjwt: jwt } = require("express-jwt");

const routes = require("./routes/index.js");

const HTTP_PORT = 8080;

app.use(cors());
app.use(express.json({ limit: "100mb" }));

// Define your JWT middleware
const jwtMiddleware = jwt({
  secret: "secret",
  algorithms: ["HS256"],
  requestProperty: "user",
  getToken: function (req) {
    const {
      headers: { authorization },
    } = req;

    if (authorization && authorization.split(" ")[0] === "Bearer") {
      console.log("Authorization: ", authorization.split(" ")[1]);
      return authorization.split(" ")[1];
    }

    return null;
  },
});

// Apply JWT middleware conditionally
function conditionalJWT(req, res, next) {
  // Define an array of routes that should skip JWT authentication
  const publicRoutes = ["/api/v2/user/login", "/api/v2/user/register", "/"]; // Add more routes as needed

  if (publicRoutes.includes(req.path)) {
    // Skip JWT middleware for public routes
    next();
  } else {
    // Apply JWT middleware for other routes
    jwtMiddleware(req, res, (err) => {
      if (err) {
        console.log("Error: ", err);
        // Handle JWT authentication errors, e.g., unauthorized access
        res.status(401).json({ error: "Unauthorized" });
      } else {
        console.log("JWT is valid");
        // Set the req.user property to the decoded JWT payload
        req.user = req.user;
        // Continue to the next middleware if JWT is valid
        next();
      }
    });
  }
}

const SQLRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

function protectSQLInjections(req, res, next) {
  let hasSQLInjection = false;
  const body = req.body;

  for (const key in body) {
    if (typeof body[key] === "string") {
      if (SQLRegex.test(body[key])) {
        hasSQLInjection = false;
        break;
      }
    }
  }
  if (hasSQLInjection) {
    res
      .status(400)
      .json({ error: "Invalid request", ban: "SQL Attack has been attempted" });
    return;
  } else {
    next();
  }
}

// Use the conditionalJWT middleware
app.use(protectSQLInjections);
app.use(conditionalJWT);

app.get("/", function (req, res) {
  res.send({
    status: "OK",
    message: "Hello World!",
  });
});

app.use("/api/v2", routes);

app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});
