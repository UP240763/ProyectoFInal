const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const careerRoutes = require("./routes/careers");
const typeRoutes = require("./routes/types");
const ticketRoutes = require("./routes/tickets");
const kpiRoutes = require("./routes/kpi");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => { //Registro de cada solicitud
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use("/auth", authRoutes); // Rutas
app.use("/users", userRoutes);
app.use("/careers", careerRoutes);
app.use("/types", typeRoutes);
app.use("/tickets", ticketRoutes);
app.use("/kpi", kpiRoutes);
app.use("/register", userRoutes);

app.listen(PORT, () => console.log(` Servidor en http://localhost:${PORT}`)); 
