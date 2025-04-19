const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Order = sequelize.define("Order", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled") },
    total_amount: { type: DataTypes.FLOAT },
    shipping_address: { type: DataTypes.TEXT },
    payment_method: { type: DataTypes.ENUM("cod", "online") },
    payment_status: { type: DataTypes.ENUM("unpaid", "paid", "failed") },
}, {
    tableName: "orders",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// n - 1
Order.belongsTo(User, { foreignKey: "user_id" });

module.exports = Order;
