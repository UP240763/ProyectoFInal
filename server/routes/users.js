const router = require("express").Router();
const bcrypt = require("bcrypt");
const db     = require("../config/db");
const { authMiddleware } = require("../middleware");

// POST /users  (también cubre /register legacy)
router.post("/", async (req, res) => {
  const { name, last_name, username, email, career_id, password, rol } = req.body;
  if (!name || !last_name || !username || !email || !password || !rol)
    return res.status(400).json({ message: "Faltan campos obligatorios" });

  const hashed = await bcrypt.hash(password, 10);
  db.query(
    "INSERT INTO users (name, last_name, username, email, career_id, password, rol) VALUES (?,?,?,?,?,?,?)",
    [name, last_name, username, email, career_id || null, hashed, rol],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ message: "Email o username ya en uso" });
        return res.status(500).json({ message: "Error al crear usuario" });
      }
      res.status(201).json({ message: "Usuario creado", id: result.insertId });
    }
  );
});

// GET /users
router.get("/", authMiddleware, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  db.query(
    "SELECT id, name, last_name, username, email, rol, active, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Error interno" });
      db.query("SELECT COUNT(*) AS total FROM users", (e2, count) => {
        if (e2) return res.status(500).json({ message: "Error interno" });
        res.json({ data: rows, total: count[0].total, page, limit });
      });
    }
  );
});

// GET /users/filter
router.get("/filter", authMiddleware, (req, res) => {
  const { name, email, career, rol } = req.query;
  let sql = "SELECT u.id, u.name, u.last_name, u.username, u.email, u.rol, u.active, c.name AS career FROM users u LEFT JOIN careers c ON u.career_id = c.id WHERE 1=1";
  const params = [];
  if (name)   { sql += " AND u.name LIKE ?";  params.push(`%${name}%`); }
  if (email)  { sql += " AND u.email LIKE ?"; params.push(`%${email}%`); }
  if (career) { sql += " AND c.name LIKE ?";  params.push(`%${career}%`); }
  if (rol)    { sql += " AND u.rol = ?";      params.push(rol); }
  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    res.json(rows);
  });
});

// GET /users/:id
router.get("/:id", authMiddleware, (req, res) => {
  db.query(
    "SELECT id, name, last_name, username, email, rol, career_id, active, created_at FROM users WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Error interno" });
      if (!rows.length) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json(rows[0]);
    }
  );
});

// PUT /users/:id
router.put("/:id", authMiddleware, (req, res) => {
  const allowed = ["name", "last_name", "username", "email", "career_id"];
  const fields  = Object.keys(req.body).filter(k => allowed.includes(k));
  if (!fields.length) return res.status(400).json({ message: "Sin campos válidos" });
  if (fields.length > 5) return res.status(400).json({ message: "Máximo 5 campos" });

  const sql = `UPDATE users SET ${fields.map(f => `${f} = ?`).join(", ")} WHERE id = ?`;
  db.query(sql, [...fields.map(f => req.body[f]), req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    if (!result.affectedRows) return res.status(404).json({ message: "No encontrado" });
    res.json({ message: "Usuario actualizado" });
  });
});

// PATCH /users/:id/status
router.patch("/:id/status", authMiddleware, (req, res) => {
  const { active } = req.body;
  if (active === undefined) return res.status(400).json({ message: "Campo 'active' requerido" });
  db.query("UPDATE users SET active = ? WHERE id = ?", [active, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    if (!result.affectedRows) return res.status(404).json({ message: "No encontrado" });
    res.json({ message: `Usuario ${active ? "activado" : "desactivado"}` });
  });
});

// DELETE /users/:id  (lógico)
router.delete("/:id", authMiddleware, (req, res) => {
  db.query("UPDATE users SET active = false WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    if (!result.affectedRows) return res.status(404).json({ message: "No encontrado" });
    res.json({ message: "Usuario eliminado" });
  });
});

module.exports = router;
