const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op, pr } = require("sequelize");
const User = require("../models/User");
const Account = require("../models/Account");
const userService = require("./user.service");
const mailer = require("../services/mailer.service");
const { EmailTemplateType } = require("../utils/constants.util");
const PasswordReset = require("../models/PasswordReset");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const OTP_EXPIRATION_MINUTES = parseInt(process.env.OTP_EXPIRATION_MINUTES || "15", 10);

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

    const accessToken = jwt.sign(
        {
            user_id: newAccount.user_id,
            role: newAccount.role,
        },
        JWT_SECRET_KEY,
        { expiresIn: "14d" }
    );

    try {
        await mailer.sendMail(EmailTemplateType.WELCOME, newUser.email, {
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            user_name: newAccount.user_name,
        });
    } catch (error) {
        console.error("Failed to send welcome email:", error);
    }

    return {
        message: "register new account successful",
        access_token: accessToken,
        user_id: newAccount.id,
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
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const requestPasswordReset = async (identifier) => {
    let user = null;
    let account = null;

    if (!identifier) throw new Error("missing identifier");

    if (identifier.includes("@")) {
        user = await User.findOne({ where: { email: identifier } });
        if (!user) throw new Error("user not found");
        account = await Account.findOne({ where: { user_id: user.id } });
    } else {
        account = await Account.findOne({
            where: { user_name: identifier },
            include: [{ model: User, as: "user" }],
        });
        if (!account) throw new Error("account not found");
        user = account.user;
    }

    const email = user?.email;
    if (!email) throw new Error("no email associated with this account");

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    const passwordReset = await PasswordReset.create({
        user_id: user?.id || null,
        account_id: account?.id || null,
        email: email,
        code: code,
        expires_at: expiresAt,
        used: false,
    });

    const resetToken = jwt.sign(
        {
            reset_id: passwordReset.id,
        },
        JWT_SECRET_KEY,
        {
            expiresIn: `${OTP_EXPIRATION_MINUTES}m`,
        }
    );

    try {
        const resetLink = `localhost:4200/reset-password?token=${resetToken}`;
        await mailer.sendMail(EmailTemplateType.RESET_PASSWORD, email, {
            first_name: user?.first_name || "",
            code,
            reset_link: resetLink,
        });
    } catch (error) {
        console.error("failed to send reset email:", error);
    }

    return { message: "OTP has been sent to the registered email", user_name: account.user_name, email: email };
};

const verifyPasswordResetOtp = async ({ identifier, code }) => {
    if (!identifier || !code) throw new Error("missing input parameters");

    let user = null;
    let account = null;

    if (identifier.includes("@")) {
        user = await User.findOne({ where: { email: identifier } });
        if (!user) throw new Error("user not found");
    } else {
        account = await Account.findOne({
            where: { user_name: identifier },
            include: [{ model: User, as: "user" }],
        });
        if (!account) throw new Error("account not found");
        user = account.user;
    }

    const now = new Date();
    const pr = await PasswordReset.findOne({
        where: {
            user_id: user?.id || null,
            code,
            used: false,
            expires_at: { [Op.gt]: now },
        },
        order: [["created_at", "DESC"]],
    });

    if (!pr) throw new Error("invalid or expired OTP");

    const resetToken = jwt.sign({ reset_id: pr.id }, JWT_SECRET_KEY, { expiresIn: `${OTP_EXPIRATION_MINUTES}m` });

    return { message: "OTP verified", reset_token: resetToken };
};

const resetPassword = async ({ reset_token, new_password }) => {
    if (!reset_token || !new_password) throw new Error("missing input parameters");

    let payload;
    try {
        payload = jwt.verify(reset_token, JWT_SECRET_KEY);
    } catch (error) {
        throw new Error("invalid or expired reset token");
    }

    const resetId = payload.reset_id;
    const pr = await PasswordReset.findOne({ where: { id: resetId } });
    if (!pr) throw new Error("Invalid reset request");
    if (pr.used) throw new Error("This reset request has already been used");
    if (new Date(pr.expires_at) < new Date()) throw new Error("Reset request expired");

    let account = null;
    if (pr.account_id) {
        account = await Account.findOne({ where: { id: pr.account_id } });
    } else if (pr.user_id) {
        account = await Account.findOne({ where: { user_id: pr.user_id } });
    }

    if (!account) throw new Error("associated account not found");

    const hashed = await bcrypt.hash(new_password, 10);
    account.password = hashed;
    await account.save();

    pr.used = true;
    await pr.save();

    return { message: "password has been reset successfully" };
};

module.exports = {
    handleRegister,
    handleLogin,
    handleLogout,
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword,
};
