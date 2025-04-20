const userService = require("../services/user.service");

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        if (!users || users.length === 0) {
            return res.status(200).json({
                code: 0,
                message: "there are no users in the system.",
                data: [],
            });
        }
 
        return res.status(200).json({
            code: 1,
            message: "get all users successful.",
            data: users,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUserByID = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userService.getUserByID(id);

        if (!user || user.length === 0) {
            return res.status(404).json({
                code: 0,
                message: "user not found",
            });
        }

        return res.status(200).json({
            code: 1,
            message: "get user successful",
            data: user,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllUsers,
    getUserByID,
}
