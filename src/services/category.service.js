const Category = require("../models/Category");

const getAllCategories = async () => {
    return await Category.findAll();
};

const getCategoryByID = async (categoryID) => {
    return await Category.findOne({
        where: {
            id: categoryID,
        },
    });
}

module.exports = {
    getAllCategories,
    getCategoryByID,
};
