// Scan Model
module.exports = {
  getScans: function (db) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, description, tags FROM scans`;
      const params = [];

      db.all(sql, params, function (err, rows) {
        if (err) {
          reject(err);
        }

        resolve(rows);
      });
    });
  },
  getScan: function (db, identifier) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, description, tags, collection_id, owner_id FROM scans WHERE id=?`;
      const params = [identifier];

      db.get(sql, params, function (err, row) {
        if (err) {
          reject(err);
        }

        resolve(row);
      });
    });
  },
  createScan: function (db, scanData) {
    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO scans (name, description, browser, discord, network) VALUES (?, ?, ?, ?, ?)";
      const params = Object.values(scanData);

      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }

        resolve({ message: "success", data: scanData });
      });
    });
  },
  updateScan: function (db, scanData) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE scans SET name = ?, description = ?, tags = ? WHERE id = ?`;
      const params = Object.values(scanData);

      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }

        resolve({ message: "success", data: scanData });
      });
    });
  },
  deleteScan: function (db, identifier) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM scans WHERE id = ?`;
      const params = [identifier];

      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }

        resolve({ message: "success" });
      });
    });
  },
  getAllScan: function (db, identifier) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM scans WHERE id=?`;
      const params = [identifier];

      db.all(sql, params, function (err, rows) {
        if (err) {
          reject(err);
        }

        resolve(rows);
      });
    });
  },
};
