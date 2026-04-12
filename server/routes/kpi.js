const router = require("express").Router();
const db = require("../db");
const { authMiddleware } = require("../middleware");

// GET /kpi/tickets/status
router.get("/tickets/status", authMiddleware, (req, res) => {
    db.query("SELECT status, COUNT(*) AS total FROM tickets GROUP BY status", (err, rows) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        res.json(rows);
    });
});

// GET /kpi/tickets/user
router.get("/tickets/user", authMiddleware, (req, res) => {
    db.query(
        "SELECT u.id, u.name, u.last_name, COUNT(t.id) AS total_tickets FROM users u LEFT JOIN tickets t ON u.id = t.created_by GROUP BY u.id ORDER BY total_tickets DESC",
        (err, rows) => {
            if (err) return res.status(500).json({ message: "Error interno" });
            res.json(rows);
        }
    );
});

// GET /kpi/tickets/avg-time  (opcional)
router.get("/tickets/avg-time", authMiddleware, (req, res) => {
    db.query(
        "SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) AS avg_hours FROM tickets WHERE status = 'closed'",
        (err, rows) => {
            if (err) return res.status(500).json({ message: "Error interno" });
            res.json({ avg_hours: rows[0].avg_hours || 0 });
        }
    );
});

module.exports = router;
