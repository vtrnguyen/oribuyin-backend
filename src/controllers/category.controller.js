const categoryService = require("../services/category.service");

const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();

        if (!categories || categories.length === 0) {
            return res.status(200).json({
                code: 0,
                message: "there are no categories in the system",
                data: [],
            });
        }

        return res.status(200).json({
            code: 1,
            message: "get all categories successful",
            data: categories,
        });
    } catch (err) {
        return res.status(500).json({
            code: 0,
            message: `error when fetching all categories: ${err.message}`,
        });
    }
};

const getCategoryByID = async (req, res) => {
    const { id } = req.params;
    
    try {
        const category = await categoryService.getCategoryByID(id);

        if (!category || category.length === 0) {
            return res.status(404).json({
                code: 0,
                message: "category not found",
            });
        }

        return res.status(200).json({
            code: 1,
            message: "get category successful",
            data: category,
        });
    } catch (err) {
        return res.status(500).json({
            code: 0,
            message: `error when fetching category: ${err.message}`,
        });
    }
};

const getCategoryValue = async (req, res) => {
    try {
        const categoryValues = await categoryService.getCategoryValue();

        if (!categoryValues || categoryValues.length === 0) {
            return res.status(200).json({
                code: 0,
                message: "there are no category in the system",
                data: [],
            });
        }

        return res.status(200).json({
            code: 1,
            message: "get all category values successful",
            data: categoryValues,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: "error when fetching category value!",
        });
    }
};

const createCategory = async (req, res) => {
    const { newCategory } = req.body;

    if (!newCategory || !newCategory.name) {
        return res.status(400).json({
            code: 0,
            message: "missing input parameters",
        });
    }

    try {
        const result = await categoryService.createCategory(newCategory);

        return res.status(201).json({
            code: 1,
            message: "create category success",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when creating new category: ${error}`,
            subcode: error.subcode,
        });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { updatingCategory } = req.body;

    if (!updatingCategory) {
        return res.status(400).json({
            code: 0,
            message: "missing inputs parameters",
        });
    }

    try {
        const result = await categoryService.updateCategory(id, updatingCategory);

        return res.status(200).json({
            code: 1,
            message: "updating category successful",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when updating category info: ${error.message}`,
            subcode: error.subcode,
        });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCategoryCount = await categoryService.deleteCategory(id);

        if (deletedCategoryCount === 0) {
            return res.status(404).json({
                code: 0,
                message: "category not found",
            });
        }

        return res.status(200).json({
            code: 1,
            message: "delele category successful",
        });
    } catch (error) {
        return res.status(500).json({
            code: -1,
            message: `error when deleting category info: ${error.message}`
        });
    }
}

module.exports = {
    getAllCategories,
    getCategoryByID,
    getCategoryValue,
    createCategory,
    updateCategory,
    deleteCategory,
}
