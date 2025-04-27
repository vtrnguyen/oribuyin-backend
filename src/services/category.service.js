const Category = require("../models/Category");

const isExistingCategory = async (categoryName) => {
    const existingCategory = await Category.findOne({
        where: {
            name: categoryName,
        },
    });

    if (existingCategory) return true;

    return false;
};

const getAllCategories = async () => {
    return await Category.findAll();
};

const getCategoryByID = async (categoryID) => {
    return await Category.findOne({
        where: {
            id: categoryID,
        },
    });
};

const getCategoryValue = async () => {
    return await Category.findAll({
        attributes: {
            exclude: ["description", "image", "created_at", "updated_at"],
        },
    });
};

const createCategory = async (categoryInfo) => {
    if (await isExistingCategory(categoryInfo.name)) {
        const error = new Error("Category name already exists");
        error.subcode = 1;
        throw error;
    }

    const newCategory = await Category.create(categoryInfo);

    return {
        new_category: newCategory,
    };
};

const updateCategory = async (categoryID, updatingCategoryInfo) => {
    const updatingCategory = await Category.findByPk(categoryID);

    if (!updatingCategory) throw new Error("Category not found");

    if (updatingCategoryInfo.name !== updatingCategory.name) {
        const existingCategory = await Category.findOne({
            where: {
                name: updatingCategoryInfo.name,
            },
        });

        if (existingCategory) {
            const error = new Error("Category name already exists");
            error.subcode = 1;
            throw error;
        }
    }

    await updatingCategory.update(updatingCategoryInfo);

    return {
        updated_category: updatingCategory,
    };
};

const deleteCategory = async (categoryID) => {
    return Category.destroy({ where: { id: categoryID } });
}

module.exports = {
    getAllCategories,
    getCategoryByID,
    getCategoryValue,
    createCategory,
    updateCategory,
    deleteCategory,
};
