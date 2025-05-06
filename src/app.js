const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const cartRoutes = require("./routes/cart.routes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

sequelize.authenticate()
    .then(() => console.log("Database has connected..."))
    .catch((err) => console.log("Connection error:", err));

app.get("/", (req, res) => {
    res.send("welcome to OriBuyin server!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);

module.exports = app;
