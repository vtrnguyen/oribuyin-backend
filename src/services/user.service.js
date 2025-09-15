const bcrypt = require("bcryptjs");
const Account = require("../models/Account");
const User = require("../models/User");

const isExistingAccount = async (userName) => {
    const existingAccount = await Account.findOne({
        where: {
            user_name: userName,
        },
    });

    if (existingAccount) return true;

    return false;
};

const isExistingEmail = async (email) => {
    const existingEmail = await User.findOne({
        where: {
            email: email,
        },
    });

    if (existingEmail) return true;

    return false;
};

const isExistingPhoneNumber = async (phoneNumber) => {
    const existingPhoneNumber = await User.findOne({
        where: {
            phone_number: phoneNumber,
        },
    });

    if (existingPhoneNumber) return true;

    return false;
};

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

const getNumberOfUsers = async () => {
    try {
        const userCounter = await User.count();
        return userCounter;
    } catch (error) {
        throw new Error("Unable to count users:", error).message;
    }
};

const createUser = async (userInfo, accountInfo) => {
    if (await isExistingAccount(accountInfo.user_name)) {
        const error = new Error("Username already exists");
        error.subcode = 1; // Existed user_name
        throw error;
    }

    if (await isExistingEmail(userInfo.email)) {
        const error = new Error("Email already exists");
        error.subcode = 2; // Existed email
        throw error;
    }

    if (await isExistingPhoneNumber(userInfo.phone_number)) {
        const error = new Error("Phone number already exists");
        error.subcode = 3; // Existed phone_number
        throw error;
    }

    const hashedPassword = await bcrypt.hash(accountInfo.password, 10);

    const newUser = await User.create(userInfo);

    const newAccount = await Account.create({
        ...accountInfo,
        password: hashedPassword,
        user_id: newUser.id,
    });

    return {
        new_user: newUser,
        new_account: {
            id: newAccount.id,
            user_name: newAccount.user_name,
            role: newAccount.role,
        },
    };
};

const updateUser = async (userID, updatingUserInfo, updatingAccountInfo) => {
    const updatingUser = await User.findByPk(userID);

    if (!updatingUser) throw new Error("User not found");

    if (updatingUserInfo.email && updatingUserInfo.email !== updatingUser.email) {
        const existingEmail = await User.findOne({
            where: {
                email: updatingUserInfo.email,
            },
        });

        if (existingEmail) {
            const error = new Error("Email already exists");
            error.subcode = 2;
            throw error;
        }
    }

    if (updatingUserInfo.phone_number && updatingUserInfo.phone_number !== updatingUser.phone_number) {
        const existingPhoneNumber = await User.findOne({
            where: {
                phone_number: updatingUserInfo.phone_number,
            },
        });

        if (existingPhoneNumber) {
            const error = new Error("Phone number already exists");
            error.subcode = 3;
            throw error;
        }
    }

    await updatingUser.update(updatingUserInfo);

    const updatingAccount = await Account.findOne({
        where: {
            user_id: userID,
        },
    });

    if (!updatingAccount) throw new Error("Account not found");

    if (updatingAccountInfo.password) {
        updatingAccountInfo.password = await bcrypt.hash(updatingAccountInfo.password, 10);
    }

    await updatingAccount.update(updatingAccountInfo);

    return {
        updated_user: updatingUser,
        updated_account: {
            id: updatingAccount.id,
            user_name: updatingAccount.user_name,
            role: updatingAccount.role,
        },
    };
};

const updateUserProfile = async (userID, updatingUserInfo) => {
    const updatingUser = await User.findByPk(userID);

    if (!updatingUser) throw new Error("User not found");

    if (updatingUserInfo.email && updatingUserInfo.email !== updatingUser.email) {
        const existingEmail = await User.findOne({
            where: {
                email: updatingUserInfo.email,
            },
        });

        if (existingEmail) {
            const error = new Error("Email already exists");
            error.subcode = 2;
            throw error;
        }
    }

    if (updatingUserInfo.phone_number && updatingUserInfo.phone_number !== updatingUser.phone_number) {
        const existingPhoneNumber = await User.findOne({
            where: {
                phone_number: updatingUserInfo.phone_number,
            },
        });

        if (existingPhoneNumber) {
            const error = new Error("Phone number already exists");
            error.subcode = 3;
            throw error;
        }
    }

    await updatingUser.update(updatingUserInfo);

    return {
        user_info: updatingUser,
    };
}

const deleteUser = async (userID) => {
    await Account.destroy({ where: { user_id: userID } });
    return await User.destroy({ where: { id: userID } });
};

module.exports = {
    getAllUsers,
    getUserByID,
    getNumberOfUsers,
    createUser,
    updateUser,
    updateUserProfile,
    deleteUser,
    isExistingAccount,
    isExistingEmail,
    isExistingPhoneNumber,
};
