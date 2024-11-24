const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configura SQLite
const db = new sqlite3.Database("./notas.db", (err) => {
  if (err) {
    console.error("Error al abrir la base de datos", err.message);
  } else {
    console.log("Conexión con SQLite exitosa");
    db.run(
      `CREATE TABLE IF NOT EXISTS notas (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         texto TEXT NOT NULL
       )`
    );
  }
});

// Ruta para insertar una nota
app.post("/api/notas", (req, res) => {
  const { texto } = req.body;
  db.run(`INSERT INTO notas (texto) VALUES (?)`, [texto], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Ruta para obtener todas las notas
app.get("/api/notas", (req, res) => {
  db.all(`SELECT * FROM notas`, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Ruta para editar una nota por ID
app.put("/api/notas/:id", (req, res) => {
  const { id } = req.params;
  const { texto } = req.body;

  if (!texto.trim()) {
    return res.status(400).json({ error: "El texto de la nota no puede estar vacío" });
  }

  db.run(`UPDATE notas SET texto = ? WHERE id = ?`, [texto, id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }
    res.json({ message: "Nota actualizada correctamente" });
  });
});

// Ruta para eliminar una nota por ID
app.delete("/api/notas/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM notas WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }
    res.json({ message: "Nota eliminada correctamente" });
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
