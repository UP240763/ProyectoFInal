const jwt = require("jsonwebtoken");
const SECRET = "pokemonGO"; //estatica

function authMiddleware(req, res, next) { // Verificar token JWT
    const header = req.headers["authorization"];
    if (!header) return res.status(401).json({ message: "Token requerido" });
    const token = header.split(" ")[1];
    try {
        req.user = jwt.verify(token, SECRET); //
        next();
    } catch {
        return res.status(401).json({ message: "Token inválido" });
    }
}

module.exports = { authMiddleware, SECRET };
