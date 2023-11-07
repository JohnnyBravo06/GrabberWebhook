const express = require("express");
const router = express.Router();
const db = require("../../database.js");
const jwt = require("jsonwebtoken");

router.get("/current_user", function (req, res) {
  console.log("Current user: ", req.user);
  if (!req.user || !req.user.id || req.user.type !== "user") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Check if the jwt is valid

  const sql = `SELECT * FROM users WHERE id=?`;
  const params = [req.user.id];

  db.get(sql, params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    // Do not include password, collections or scans
    const customRow = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
    };

    res.json({
      message: "success",
      data: customRow,
    });
  });
});

router.post("/login", function (req, res) {
  const body = req.body;
  const email = body.email;
  const password = body.password;

  const sql = `SELECT * FROM users WHERE email=? AND password=?`;
  const params = [email, password];

  db.get(sql, params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Do not include password, collections or scans
    const customRow = {
      id: row.id,
      name: row.name,
      role: row.role,
    };

    res.json({
      message: "success",
      data: customRow,
      token: jwt.sign({ id: row.id, type: "user" }, "secret", {
        expiresIn: "1d",
      }),
    });
  });
});

router.post("/register", function (req, res) {
  const body = req.body;
  console.log("Body: ", body);
  const name = body.name;
  const email = body.email;
  const password = body.password;

  // Check if the user already exists
  const sql = `SELECT * FROM users WHERE name=?`;
  const params = [name];

  db.get(sql, params, function (err, row) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (row) {
      res.status(401).json({ error: "User already exists" });
      return;
    }

    if (name === "" || email === "" || password === "") {
      res.status(400).json({
        message: "error",
        data: "Invalid request",
      });
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      console.log(email);
      res.status(400).json({
        message: "error",
        data: "Invalid email",
      });
      return;
    }

    // Create the user
    const sql = `INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)`;
    const params = [name, email, password, "user"];

    db.run(sql, params, function (err, row) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      res.json({
        message: "success",
      });
    });
  });
});

router.get("/users", function (req, res) {
  const sql = `SELECT id, name, email, role FROM users`;
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

router.get("/user/:id", function (req, res) {
  const sql = `SELECT id, name, email, role FROM users WHERE id=?`;
  const params = [req.params.id];

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

module.exports = router;
