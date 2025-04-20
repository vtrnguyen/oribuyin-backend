const Product = require("../models/Product");

const getAllProducts = async () => {
    return await Product.findAll();
};

const getProductByID = async (productID) => {
    return await Product.findOne({
        where: {
            id: productID,
        },
    });
};

module.exports = {
    getAllProducts,
    getProductByID,
};
