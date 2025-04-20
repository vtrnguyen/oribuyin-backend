const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Account = require("../models/Account");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

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

const hanldeRegister = async (newAccountInfo) => {
    const { user_name, password, first_name, last_name, email, phone_number } = newAccountInfo;

    if (await isExistingAccount(user_name)) throw new Error("Username already existed!");

    if (await isExistingEmail(email)) throw new Error("Email already existed!");
    
    if (await isExistingPhoneNumber(phone_number)) throw new Error("Phonenumber already existed!");

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
        { expiresIn: "1h" },
    );

    return {
        message: "handleLogin successful",
        access_token: accessToken,
        account: {
            id: account.id,
            user_name: account.user_name,
            role: account.role,
        },
    }
};

module.exports = {
    hanldeRegister,
    handleLogin,
};
