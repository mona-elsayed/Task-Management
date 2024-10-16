const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database("./my_database.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create Tasks Table if not exists
db.run(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  desc TEXT,
  category TEXT,
  priority TEXT,
  dueDate TEXT,
  status TEXT
)`);

// API routes
app.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post("/tasks", (req, res) => {
  const { name, desc, category, priority, dueDate, status } = req.body;
  db.run(
    `INSERT INTO tasks (name, desc, category, priority, dueDate, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, desc, category, priority, dueDate, status],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          id: this.lastID,
          name,
          desc,
          category,
          priority,
          dueDate,
          status,
        });
      }
    }
  );
});

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { name, desc, category, priority, dueDate, status } = req.body;
  db.run(
    `UPDATE tasks SET name = ?, desc = ?, category = ?, priority = ?, dueDate = ?, status = ? WHERE id = ?`,
    [name, desc, category, priority, dueDate, status, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, name, desc, category, priority, dueDate, status });
      }
    }
  );
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM tasks WHERE id = ?`, id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Task deleted", id });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
