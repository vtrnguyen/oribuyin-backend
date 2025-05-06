const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cart = require("./Cart");
const Product = require("./Product");

const CartItem = sequelize.define("CartItem", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER },
}, {
    tableName: "cart_items",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// 1 - 1 
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });
// n - 1
CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

module.exports = CartItem;
