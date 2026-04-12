const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const careerRoutes = require("./routes/careers");
const typeRoutes = require("./routes/types");
const ticketRoutes = require("./routes/tickets");
const kpiRoutes = require("./routes/kpi");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/careers", careerRoutes);
app.use("/types", typeRoutes);
app.use("/tickets", ticketRoutes);
app.use("/kpi", kpiRoutes);

// Rutas legacy para no romper el frontend actual
app.post("/register", (req, res) => {
    req.url = "/";
    userRoutes(req, res, () => { });
});
app.post("/login", (req, res) => {
    req.url = "/login";
    authRoutes(req, res, () => { });
});

app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
