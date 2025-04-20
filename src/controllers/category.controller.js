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
        return res.status(500).json({ err: err.message });
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
        return res.status(500).json({ err: err.message });
    }
};

module.exports = {
    getAllCategories,
    getCategoryByID,
}
