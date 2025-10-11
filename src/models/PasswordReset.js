const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Account = require("./Account");
const User = require("./User");

const PasswordReset = sequelize.define("PasswordReset", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    account_id: { type: DataTypes.INTEGER, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    code: { type: DataTypes.STRING, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    tableName: "password_resets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
}
);

PasswordReset.belongsTo(User, { foreignKey: "user_id", as: "user" });
PasswordReset.belongsTo(Account, { foreignKey: "account_id", as: "account" });

module.exports = PasswordReset;