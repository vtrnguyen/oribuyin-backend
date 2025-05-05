const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");

const Review = sequelize.define("Review", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT },
}, {
    tableName: "reviews",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// n - 1
Review.belongsTo(User, {
    foreignKey: "user_id",
    as: "user"
});
// n - 1
Review.belongsTo(Product, { foreignKey: "product_id" });

module.exports = Review;
