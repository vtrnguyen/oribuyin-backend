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
        res.status(500).json(
            {
                code: 0,
                message: `error when fetching all users: ${err.message}`,
            }
        );
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
        return res.status(500).json(
            {
                code: 0,
                message: `error when fetching all user: ${err.message}`,
            }
        );
    }
};

const createUser = async (req, res) => {
    const { newUser, newAccount } = req.body;

    if (!newUser || !newUser.first_name || !newUser.last_name || !newUser.email 
        || !newUser.phone_number || !newUser.gender || !newUser.birth_day || !newUser.address
        || !newAccount || !newAccount.user_name || !newAccount.password || !newAccount.role) {
        return res.status(400).json({
            code: 0,
            message: "missing input parameters",
        });
    }
    
    try {
        const result = await userService.createUser(newUser, newAccount);

        return res.status(201).json({
            code: 1,
            message: "create user successful",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            code: 0,
            message: `error when creating new user: ${error.message}`,
            subcode: error.subcode,
        });
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUserCount = await userService.deleteUser(id);

        if (deletedUserCount === 0) {
            return res.status(404).json({
                code: 0,
                message: "user not found",
            });
        }

        return res.status(200).json({
            code: 1,
            message: "delete user successful",
        });
    } catch (err) {
        return res.status(500).json({
            code: 0,
            message: `error when deleting user info: ${err.message}`,
        });
    }
}

module.exports = {
    getAllUsers,
    getUserByID,
    createUser,
    deleteUser,
}
