var sqlite3 = require("sqlite3").verbose();
var md5 = require("md5");

const DBSOURCE = "db.sqlite";
// Create the 'users' table
let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    // * Make so that foreign keys are enabled
    db.run(`PRAGMA foreign_keys = ON`, (err) => {
      if (err) {
        console.log("Error enabling foreign keys:", err);
      } else {
        console.log("Foreign keys enabled.");
      }
    });

    // * Users table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating 'users' table:", err);
        } else {
          console.log("'users' table created.");
        }
      }
    );

    // * Collections table
    db.run(
      `CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        tags TEXT,
        owner_id INTEGER, -- Reference to the user who owns the collection
        FOREIGN KEY (owner_id) REFERENCES users (id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating 'collections' table:", err);
        } else {
          console.log("'collections' table created.");
        }
      }
    );

    // * Scans table
    db.run(
      `CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        tags TEXT,

        browser TEXT,
        discord TEXT,
        network TEXT,

        collection_id INTEGER, -- Reference to the collection that contains the scan
        owner_id INTEGER, -- Reference to the user who owns the scan
        FOREIGN KEY (collection_id) REFERENCES collections (id),
        FOREIGN KEY (owner_id) REFERENCES users (id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating 'scans' table:", err);
        } else {
          console.log("'scans' table created.");
        }
      }
    );
  }
});

module.exports = db;
