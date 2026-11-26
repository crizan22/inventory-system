import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database("inventory.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0
  )
`);

// READ: get all items
app.get("/api/items", (req, res) => {
  const items = db.prepare("SELECT * FROM items ORDER BY id DESC").all();
  res.json(items);
});

// CREATE: add an item
app.post("/api/items", (req, res) => {
  const { name, quantity, price } = req.body;
  db.prepare("INSERT INTO items (name, quantity, price) VALUES (?, ?, ?)")
    .run(name, Number(quantity) || 0, Number(price) || 0);
  res.status(201).json({ success: true });
});

// UPDATE: edit an item
app.put("/api/items/:id", (req, res) => {
  const { name, quantity, price } = req.body;
  db.prepare("UPDATE items SET name = ?, quantity = ?, price = ? WHERE id = ?")
    .run(name, Number(quantity) || 0, Number(price) || 0, req.params.id);
  res.json({ success: true });
});

// DELETE: remove an item
app.delete("/api/items/:id", (req, res) => {
  db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));