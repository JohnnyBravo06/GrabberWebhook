// Collection Model
module.exports = {
  getCollections: function (db) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, description, tags, owner_id FROM collections`;
      const params = [];

      db.all(sql, params, function (err, rows) {
        if (err) {
          reject(err);
        }

        resolve(rows);
      });
    });
  },
  getCollection: function (db, identifier) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, description, tags, owner_id FROM collections WHERE id=?`;
      const params = [identifier];

      db.get(sql, params, function (err, row) {
        if (err) {
          reject(err);
        }

        resolve(row);
      });
    });
  },
  createCollection: function (db, collectionData) {
    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO collections (name, description, tags, owner_id) VALUES (?, ?, ?, ?)";
      const params = Object.values(collectionData);

      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }

        resolve({ message: "success", data: collectionData });
      });
    });
  },
  updateCollection: function (db, collectionData) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE collections SET name = ?, description = ?, tags = ? WHERE id = ?`;
      const params = Object.values(collectionData);

      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }

        resolve({ message: "success", data: collectionData });
      });
    });
  },
  deleteCollection: function (db, identifier) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM collections WHERE id = ?`;
      const params = [identifier];

      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }

        resolve({ message: "success", data: identifier });
      });
    });
  },
};
