const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./Category");
const Review = require("./Review");

const Product = sequelize.define("Product", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.FLOAT },
    discount: { type: DataTypes.FLOAT, defaultValue: 0 },
    stock_quantity: { type: DataTypes.INTEGER },
    image: { type: DataTypes.STRING },
}, {
    tableName: "products",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// n - 1
Product.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category",
});
// 1 - n
Product.hasMany(Review, {
    foreignKey: "product_id",
    as: "review",
});

module.exports = Product;
