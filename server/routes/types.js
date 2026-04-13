const router = require("express").Router();
const db     = require("../config/db");
const { authMiddleware } = require("../middleware");

// GET /categories (dentro del mismo módulo)
router.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, rows) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    res.json(rows);
  });
});

router.get("/",       (req, res) => {
  db.query("SELECT * FROM types", (err, rows) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    res.json(rows);
  });
});

router.post("/",      authMiddleware, (req, res) => {
  const { type, description, area } = req.body;
  if (!type) return res.status(400).json({ message: "Campo 'type' requerido" });
  db.query("INSERT INTO types (type, description, area) VALUES (?,?,?)", [type, description, area], (err, result) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    res.status(201).json({ message: "Tipo creado", id: result.insertId });
  });
});

router.put("/:id",    authMiddleware, (req, res) => {
  const { type, description, area } = req.body;
  db.query("UPDATE types SET type=?, description=?, area=? WHERE id=?", [type, description, area, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    if (!result.affectedRows) return res.status(404).json({ message: "No encontrado" });
    res.json({ message: "Tipo actualizado" });
  });
});

router.delete("/:id", authMiddleware, (req, res) => {
  db.query("DELETE FROM types WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    if (!result.affectedRows) return res.status(404).json({ message: "No encontrado" });
    res.json({ message: "Tipo eliminado" });
  });
});



module.exports = router;
