const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "notes.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Enable foreign key support
db.run("PRAGMA foreign_keys = ON");

// ==========================================
// FOLDERS TABLE
// ==========================================

db.run(`
  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ==========================================
// NOTES TABLE
// ==========================================

db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folder_id INTEGER DEFAULT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (folder_id)
      REFERENCES folders(id)
      ON DELETE SET NULL
  )
`);

// ==========================================
// TODOS TABLE
// ==========================================

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folder_id INTEGER DEFAULT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    pinned INTEGER DEFAULT 0,
    due_date TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (folder_id)
      REFERENCES folders(id)
      ON DELETE SET NULL
  )
`);

// ==========================================
// DATABASE MIGRATION
// Add folder_id to existing notes table
// ==========================================

/* To-Do Pin Migration */

db.all(
  "PRAGMA table_info(todos)",
  [],
  (err, columns) => {

    if (err) {
      console.error(
        "Failed to check todos table:",
        err.message
      );
      return;
    }

    const hasPinned = columns.some(
      (column) => column.name === "pinned"
    );

    if (!hasPinned) {
      db.run(
        `
        ALTER TABLE todos
        ADD COLUMN pinned INTEGER DEFAULT 0
        `,
        (alterErr) => {

          if (alterErr) {
            console.error(
              "Failed to add pinned:",
              alterErr.message
            );
          } else {
            console.log(
              "Added pinned column to todos."
            );
          }

        }
      );
    }

  }
);

module.exports = db;