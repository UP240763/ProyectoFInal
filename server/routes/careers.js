const router = require("express").Router();
const db = require("../db");
const { authMiddleware } = require("../middleware");

router.get("/", (req, res) => {
    db.query("SELECT * FROM careers", (err, rows) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        res.json(rows);
    });
});

router.get("/filter", (req, res) => {
    const { name, active } = req.query;
    let sql = "SELECT * FROM careers WHERE 1=1";
    const params = [];
    if (name) { sql += " AND name LIKE ?"; params.push(`%${name}%`); }
    if (active !== undefined) { sql += " AND active = ?"; params.push(active); }
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        res.json(rows);
    });
});

router.post("/", authMiddleware, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Nombre requerido" });
    db.query("INSERT INTO careers (name) VALUES (?)", [name], (err, result) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        res.status(201).json({ message: "Carrera creada", id: result.insertId });
    });
});

router.put("/:id", authMiddleware, (req, res) => {
    const { name, active } = req.body;
    db.query("UPDATE careers SET name = ?, active = ? WHERE id = ?", [name, active, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        if (!result.affectedRows) return res.status(404).json({ message: "No encontrada" });
        res.json({ message: "Carrera actualizada" });
    });
});

router.delete("/:id", authMiddleware, (req, res) => {
    db.query("DELETE FROM careers WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        if (!result.affectedRows) return res.status(404).json({ message: "No encontrada" });
        res.json({ message: "Carrera eliminada" });
    });
});

module.exports = router;
