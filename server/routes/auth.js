const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { authMiddleware, SECRET } = require("../middleware");

// POST /auth/login
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Usuario y contraseña requeridos" });

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, rows) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        if (!rows.length) return res.status(401).json({ message: "Credenciales incorrectas" });

        const user = rows[0]; //Primer resultado del arreglo
        if (!user.active) return res.status(403).json({ message: "Usuario inactivo" });
        if (user.failed_attempts >= 5)
            return res.status(403).json({ message: "Cuenta bloqueada por demasiados intentos" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            db.query("UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = ?", [user.id]);
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        db.query("UPDATE users SET failed_attempts = 0 WHERE id = ?", [user.id]);
        const token = jwt.sign({ id: user.id, username: user.username, rol: user.rol }, SECRET, { expiresIn: "24h" });

        res.json({ token, user: { id: user.id, name: user.name, last_name: user.last_name, username: user.username, email: user.email, rol: user.rol } });
    });
});

// GET /auth/profile
router.get("/profile", authMiddleware, (req, res) => {
    db.query(
        "SELECT id, name, last_name, username, email, rol, career_id, active, created_at FROM users WHERE id = ?",
        [req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: "Error interno" });
            if (!rows.length) return res.status(404).json({ message: "No encontrado" });
            res.json(rows[0]);
        }
    );
});

module.exports = router;
