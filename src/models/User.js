const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phone_number: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
    gender: { type: DataTypes.ENUM("male", "female", "other") },
    birth_day: { type: DataTypes.DATE },
    address: { type: DataTypes.TEXT },
}, {
    tableName: "users",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = User;
