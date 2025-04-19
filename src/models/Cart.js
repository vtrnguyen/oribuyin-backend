const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Cart = sequelize.define("Cart", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, {
    tableName: "carts",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

Cart.belongsTo(User, { foreignKey: "user_id" });

module.exports = Cart;
