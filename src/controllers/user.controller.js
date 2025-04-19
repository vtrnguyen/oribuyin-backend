const userService = require("../services/user.service");

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        if (!users || users.length === 0) {
            return res.status(200).json({
                code: 1,
                message: "There are no users in the system.",
                data: [],
            });
        }
 
        return res.status(200).json({
            code: 0,
            message: "Get all users successful.",
            data: users,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllUsers,
}
