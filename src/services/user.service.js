const User = require("../models/User");

const getAllUsers = async () => {
    return await User.findAll();
};

const getUserByID = async (userID) => {
    return await User.findAll({
        where: {
            id: userID,
        }
    });
};

const createUser = async (userInfo) => {
    return await User.create(userInfo);
};

module.exports = {
    getAllUsers,
    getUserByID,
    createUser,
};
