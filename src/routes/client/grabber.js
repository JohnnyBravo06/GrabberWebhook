const express = require("express");
const router = express.Router();

router.post("/grab", function (req, res) {
  const body = req.body;
  const dataType = body.dataType; // Update this to 'dataType' if needed
  const data_information = body.data;

  if (!req.user && !req.user.id && !req.user.type !== "client") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const client_id = req.user.id;

  // Update SQL database, if the user exists, update the data, if not, create a new entry

  const sql = `SELECT * FROM grabber WHERE client_id=?`;
  const params = [client_id];

  db.get(sql, params, function (err, row) {
    console.log("Row: ", row);
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (row) {
      // Update the data
      const updateSql = `UPDATE grabber SET ${dataType}=? WHERE client_id=?`;
      const updateParams = [data_information, client_id];

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
      const insertSql = `INSERT INTO grabber (client_id, ${dataType}) VALUES (?,?)`;
      const insertParams = [client_id, data_information];

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

module.exports = router;
