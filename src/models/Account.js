const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Account = sequelize.define("Account", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_name: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM("admin", "staff", "customer") },
}, {
    tableName: "accounts",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// 1 - 1
Account.belongsTo(User, { 
    foreignKey: "user_id",
    as: "user",
});

module.exports = Account;
