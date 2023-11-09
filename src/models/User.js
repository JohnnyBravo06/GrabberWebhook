module.exports = {
  getUsers: function (db) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, email, role FROM users`;
      const params = [];

      db.all(sql, params, function (err, rows) {
        if (err) {
          reject(err);
        }

        resolve(rows);
      });
    });
  },
  getUser: function (db, identifier) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, email, role FROM users WHERE id=?`;
      const params = [identifier];

      db.get(sql, params, function (err, row) {
        if (err) {
          reject(err);
        }

        resolve(row);
      });
    });
  },
  getUserFromName: function (db, name) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, email, role FROM users WHERE name=?`;
      const params = [name];

      db.get(sql, params, function (err, row) {
        if (err) {
          reject(err);
        }

        resolve(row);
      });
    });
  },
  getUserFromEmail: function (db, email) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, email, role, password FROM users WHERE email=?`;
      const params = [email];

      db.get(sql, params, function (err, row) {
        if (err) {
          reject(err);
        }

        resolve(row);
      });
    });
  },
  verifyToken: function (db, user) {
    return new Promise((resolve, reject) => {
      if (!user) {
        reject({ message: "failure", status: "Unauthorized" });
      } else {
        // Check if the user exists
        const sql = `SELECT * FROM users WHERE id=?`;
        const params = [user.id];

        db.get(sql, params, function (err, row) {
          if (err) {
            reject(err);
          }

          if (!row) {
            reject({ message: "failure", error: "Unauthorized" });
          }

          resolve({ message: "success", status: "Authorized" });
        });
      }
    });
  },
  createUser: function (db, userData) {
    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
      const params = Object.values(userData);

      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }

        resolve({ message: "New entry created successfully" });
      });
    });
  },
  updateUser: function (db, userData) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE users SET name=?, email=?, password=?, role=? WHERE id=?`;
      const params = Object.values(userData);

      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }

        resolve({ message: "Data updated successfully" });
      });
    });
  },
  deleteUser: function (db, identifier) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM users WHERE id=?`;
      const params = [identifier];

      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }

        resolve({ message: "Entry deleted successfully" });
      });
    });
  },
};
