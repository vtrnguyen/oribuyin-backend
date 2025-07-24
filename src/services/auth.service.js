const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Account = require("../models/Account");
const userService = require("./user.service");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const handleRegister = async (newAccountInfo) => {
    const { user_name, password, first_name, last_name, email, phone_number } = newAccountInfo;

    if (await userService.isExistingAccount(user_name)) throw new Error("Username already existed!");

    if (await userService.isExistingEmail(email)) throw new Error("Email already existed!");

    if (await userService.isExistingPhoneNumber(phone_number)) throw new Error("Phonenumber already existed!");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone_number: phone_number,
    });

    const newAccount = await Account.create({
        user_name: user_name,
        password: hashedPassword,
        role: "customer",
        user_id: newUser.id,
    });

    return {
        message: "register new account successful",
        account: {
            id: newAccount.id,
            user_name: newAccount.user_name,
            role: newAccount.role,
        },
    }
};

const handleLogin = async ({ user_name, password }) => {
    const account = await Account.findOne({
        where: {
            user_name: user_name,
        },
        include: [{
            model: User,
            as: "user"
        }],
    });

    if (!account) throw new Error("Account is not found!");

    const isPasswordValid = await bcrypt.compare(password, account.password);

    if (!isPasswordValid) throw new Error("Invalid password!");

    const accessToken = jwt.sign(
        {
            user_id: account.user_id,
            role: account.role,
        },
        JWT_SECRET_KEY,
        { expiresIn: "14d" },
    );

    return {
        message: "login successful",
        access_token: accessToken,
        user_id: account.user_id,
        account: {
            id: account.id,
            user_name: account.user_name,
            role: account.role,
        },
    }
};

const handleLogout = async (accessToken) => {
    if (!accessToken) throw new Error("Access token not provicded");

    try {
        return { message: "logout successful" };
    } catch (err) {
        throw new Error("internal server error during logout");
    }
}

module.exports = {
    handleRegister,
    handleLogin,
    handleLogout,
};
