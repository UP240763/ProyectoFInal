const router = require("express").Router();
const db = require("../db");
const { authMiddleware } = require("../middleware");

// POST /tickets
router.post("/", authMiddleware, (req, res) => {
    const { title, description, type_id, priority } = req.body;
    if (!title) return res.status(400).json({ message: "Título requerido" });
    db.query(
        "INSERT INTO tickets (title, description, type_id, priority, created_by) VALUES (?,?,?,?,?)",
        [title, description, type_id, priority || "medium", req.user.id],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error interno" });
            res.status(201).json({ message: "Ticket creado", id: result.insertId });
        }
    );
});

// POST /tickets/assign
router.post("/assign", authMiddleware, (req, res) => {
    const { id_ticket, id_user } = req.body;
    if (!id_ticket || !id_user) return res.status(400).json({ message: "id_ticket e id_user requeridos" });
    db.query("INSERT INTO tickets_devs (id_ticket, id_user) VALUES (?,?)", [id_ticket, id_user], (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Ya asignado" });
            return res.status(500).json({ message: "Error interno" });
        }
        db.query("UPDATE tickets SET status = 'in_progress' WHERE id = ?", [id_ticket]);
        res.status(201).json({ message: "Ticket asignado" });
    });
});

// GET /tickets/filter
router.get("/filter", authMiddleware, (req, res) => {
    const { status, priority, type_id, usuario } = req.query;
    let sql = "SELECT t.*, u.name AS creator_name FROM tickets t LEFT JOIN users u ON t.created_by = u.id WHERE 1=1";
    const params = [];
    if (status) { sql += " AND t.status = ?"; params.push(status); }
    if (priority) { sql += " AND t.priority = ?"; params.push(priority); }
    if (type_id) { sql += " AND t.type_id = ?"; params.push(type_id); }
    if (usuario) { sql += " AND t.created_by = ?"; params.push(usuario); }
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        res.json(rows);
    })

// GET /tickets/user/:id
router.get("/user/:id", authMiddleware, (req, res) => {
        db.query("SELECT * FROM tickets WHERE created_by = ? ORDER BY created_at DESC", [req.params.id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Error interno" });
            res.json(rows);
        });
    });

    // GET /tickets
    router.get("/", authMiddleware, (req, res) => {
        const { status, priority, type_id, created_by } = req.query;
        let sql = "SELECT t.*, u.name AS creator_name, ty.type AS type_name FROM tickets t LEFT JOIN users u ON t.created_by = u.id LEFT JOIN types ty ON t.type_id = ty.id WHERE 1=1";
        const params = [];
        if (status) { sql += " AND t.status = ?"; params.push(status); }
        if (priority) { sql += " AND t.priority = ?"; params.push(priority); }
        if (type_id) { sql += " AND t.type_id = ?"; params.push(type_id); }
        if (created_by) { sql += " AND t.created_by = ?"; params.push(created_by); }
        sql += " ORDER BY t.created_at DESC";
        db.query(sql, params, (err, rows) => {
            if (err) return res.status(500).json({ message: "Error interno" });
            res.json(rows);
        });
    });

    ;
});



// GET /tickets/:id
router.get("/:id", authMiddleware, (req, res) => {
    db.query(
        "SELECT t.*, u.name AS creator_name, ty.type AS type_name FROM tickets t LEFT JOIN users u ON t.created_by = u.id LEFT JOIN types ty ON t.type_id = ty.id WHERE t.id = ?",
        [req.params.id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: "Error interno" });
            if (!rows.length) return res.status(404).json({ message: "No encontrado" });
            res.json(rows[0]);
        }
    );
});

// PUT /tickets/:id
router.put("/:id", authMiddleware, (req, res) => {
    const { title, description, type_id, priority } = req.body;
    db.query("UPDATE tickets SET title=?, description=?, type_id=?, priority=? WHERE id=?",
        [title, description, type_id, priority, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error interno" });
            if (!result.affectedRows) return res.status(404).json({ message: "No encontrado" });
            res.json({ message: "Ticket actualizado" });
        }
    );
});

// PATCH /tickets/:id/status
router.patch("/:id/status", authMiddleware, (req, res) => {
    const { status } = req.body;
    if (!["open", "in_progress", "closed"].includes(status))
        return res.status(400).json({ message: "Estado inválido" });
    db.query("UPDATE tickets SET status = ? WHERE id = ?", [status, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        if (!result.affectedRows) return res.status(404).json({ message: "No encontrado" });
        res.json({ message: "Estado actualizado" });
    });
});

// DELETE /tickets/:id
router.delete("/:id", authMiddleware, (req, res) => {
    db.query("DELETE FROM tickets WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        if (!result.affectedRows) return res.status(404).json({ message: "No encontrado" });
        res.json({ message: "Ticket eliminado" });
    });
});

module.exports = router;
