const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send("File Management System API is running!");
});


// ==========================================
// NOTES
// ==========================================


// READ - Get all notes

app.get("/api/notes", (req, res) => {
  const sql = `
    SELECT *
    FROM notes
    ORDER BY created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.json(rows);
  });
});


// CREATE - Add a new note

app.post("/api/notes", (req, res) => {
  const {
    title,
    content,
    folder_id
  } = req.body;

  if (!title || !title.trim() ||
      !content || !content.trim()) {

    return res.status(400).json({
      error: "Title and content are required"
    });
  }

  const sql = `
    INSERT INTO notes (
      title,
      content,
      folder_id
    )
    VALUES (?, ?, ?)
  `;

  db.run(
    sql,
    [
      title.trim(),
      content.trim(),
      folder_id || null
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.status(201).json({
        id: this.lastID,
        title: title.trim(),
        content: content.trim(),
        folder_id: folder_id || null,
        message: "Note created successfully"
      });
    }
  );
});


// UPDATE - Update an existing note

app.put("/api/notes/:id", (req, res) => {
  const { id } = req.params;

  const {
    title,
    content,
    folder_id
  } = req.body;

  if (!title || !title.trim() ||
      !content || !content.trim()) {

    return res.status(400).json({
      error: "Title and content are required"
    });
  }

  const sql = `
    UPDATE notes

    SET
      title = ?,
      content = ?,
      folder_id = ?,
      updated_at = CURRENT_TIMESTAMP

    WHERE id = ?
  `;

  db.run(
    sql,
    [
      title.trim(),
      content.trim(),
      folder_id || null,
      id
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: "Note not found"
        });
      }

      res.json({
        id,
        title: title.trim(),
        content: content.trim(),
        folder_id: folder_id || null,
        message: "Note updated successfully"
      });
    }
  );
});


// DELETE - Delete a note

app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM notes
    WHERE id = ?
  `;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: "Note not found"
      });
    }

    res.json({
      message: "Note deleted successfully"
    });
  });
});


// ==========================================
// FOLDERS
// ==========================================


// READ - Get all folders

app.get("/api/folders", (req, res) => {
  const sql = `
    SELECT *
    FROM folders
    ORDER BY name ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.json(rows);
  });
});


// CREATE - Create a folder

app.post("/api/folders", (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      error: "Folder name is required"
    });
  }

  const sql = `
    INSERT INTO folders (name)
    VALUES (?)
  `;

  db.run(
    sql,
    [name.trim()],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.status(201).json({
        id: this.lastID,
        name: name.trim(),
        message: "Folder created successfully"
      });
    }
  );
});


// UPDATE - Rename a folder

app.put("/api/folders/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      error: "Folder name is required"
    });
  }

  const sql = `
    UPDATE folders
    SET name = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [name.trim(), id],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: "Folder not found"
        });
      }

      res.json({
        id,
        name: name.trim(),
        message: "Folder renamed successfully"
      });
    }
  );
});


// DELETE - Delete a folder

app.delete("/api/folders/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM folders
    WHERE id = ?
  `;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: "Folder not found"
      });
    }

    res.json({
      message: "Folder deleted successfully"
    });
  });
});


// ==========================================
// TO-DOS
// ==========================================


// READ - Get all tasks

app.get("/api/todos", (req, res) => {
  const sql = `
    SELECT *
    FROM todos
    ORDER BY completed ASC, created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.json(rows);
  });
});


// CREATE - Create a task

app.post("/api/todos", (req, res) => {
  const {
    title,
    folder_id,
    due_date
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required"
    });
  }

  const sql = `
    INSERT INTO todos (
      title,
      folder_id,
      due_date
    )
    VALUES (?, ?, ?)
  `;

  db.run(
    sql,
    [
      title.trim(),
      folder_id || null,
      due_date || null
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.status(201).json({
        id: this.lastID,
        title: title.trim(),
        folder_id: folder_id || null,
        due_date: due_date || null,
        completed: 0,
        message: "Task created successfully"
      });
    }
  );
});


// UPDATE - Update a task

app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;

  const {
    title,
    folder_id,
    due_date,
    completed
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required"
    });
  }

  const sql = `
    UPDATE todos

    SET
      title = ?,
      folder_id = ?,
      due_date = ?,
      completed = ?,
      updated_at = CURRENT_TIMESTAMP

    WHERE id = ?
  `;

  db.run(
    sql,
    [
      title.trim(),
      folder_id || null,
      due_date || null,
      completed ? 1 : 0,
      id
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: "Task not found"
        });
      }

      res.json({
        id,
        title: title.trim(),
        folder_id: folder_id || null,
        due_date: due_date || null,
        completed: completed ? 1 : 0,
        message: "Task updated successfully"
      });
    }
  );
});

/* Pin / Unpin To-Do */

app.patch("/api/todos/:id/pin", (req, res) => {
  const { id } = req.params;
  const { pinned } = req.body;

  const pinnedValue = pinned ? 1 : 0;

  const sql = `
    UPDATE todos
    SET pinned = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    sql,
    [pinnedValue, id],
    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: "Task not found"
        });
      }

      res.json({
        id,
        pinned: pinnedValue,
        message: pinnedValue
          ? "Task pinned successfully"
          : "Task unpinned successfully"
      });
    }
  );
});

// DELETE - Delete a task

app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM todos
    WHERE id = ?
  `;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    res.json({
      message: "Task deleted successfully"
    });
  });
});




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});