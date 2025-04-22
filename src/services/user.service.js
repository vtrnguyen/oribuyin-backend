const Account = require("../models/Account");
const User = require("../models/User");

const getAllUsers = async () => {
    const users = await Account.findAll({
        attributes: {
            exclude: ["id", "password", "created_at", "updated_at", "user_id"],
        },
        include: [
            {
                model: User,
                as: "user",
            },
        ],
    });

    return users;
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
