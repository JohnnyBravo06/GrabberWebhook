var sqlite3 = require("sqlite3").verbose();
var md5 = require("md5");

const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");

    // Create the 'grabber' table
    db.run(
      `CREATE TABLE IF NOT EXISTS grabber (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT,
        browser TEXT,
        discord TEXT,
        network TEXT,
        computer TEXT,
        custom TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating 'grabber' table:", err);
        } else {
          console.log("'grabber' table created.");
        }
      }
    );

    // Create the 'users' table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        collections TEXT,
        scans TEXT,
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

    // Create the 'clients' table
    db.run(
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        company TEXT,
        bio TEXT,
        role TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating 'clients' table:", err);
        } else {
          console.log("'clients' table created.");
        }
      }
    );
  }
});

module.exports = db;
