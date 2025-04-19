const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth.routes"); 
const userRoutes = require("./routes/user.routes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

sequelize.authenticate()
    .then(() => console.log("Database has connected..."))
    .catch((err) => console.log("Connection error:", err));

app.get("/", (req, res) => {
    res.send("Welcome to OriBuyin Backend!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

module.exports = app;
