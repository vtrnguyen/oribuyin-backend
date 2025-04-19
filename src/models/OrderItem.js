const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Order = require("./Order");
const Product = require("./Product");

const OrderItem = sequelize.define("OrderItem", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    price_at_order_time: { type: DataTypes.FLOAT },
    quantity: { type: DataTypes.INTEGER },
}, {
    tableName: "order_items",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// n - 1
OrderItem.belongsTo(Order, { foreignKey: "order_id" });
// 1 - n
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

module.exports = OrderItem;
