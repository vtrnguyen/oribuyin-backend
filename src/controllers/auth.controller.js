const authService = require("../services/auth.service");

const register = async (req, res) => {
    if (!req.body || !req.body.user_name || !req.body.password) {
        return res.status(400).json({
            code: 0,
            message: "missing input parameters",
        });
    }

    const { user_name, password, first_name, last_name, email, phone_number } = req.body;

    if (!user_name || !password || !first_name || !last_name || !email || !phone_number) {
        return res.status(400).json({
            code: 0,
            message: "missing input parameters",
        });
    }

    try {
        const result = await authService.hanldeRegister(req.body);

        res.status(201).json({
            code: 1,
            message: result.message,
            data: result.account,
        });
    } catch (err) {
        res.status(400).json({
            code: 0,
            message: err.message,
        });
    }
};

const login = async (req, res) => {
    if (!req.body || !req.body.user_name || !req.body.password) {
        return res.status(400).json({
            code: 0,
            message: "missing input parameters",
        });
    }

    const { user_name, password } = req.body;

    try {
        const result = await authService.handleLogin({ user_name, password });

        return res.status(200).json({
            code: 1,
            message: result.message,
            access_token: result.access_token,
            user_id: result.user_id,
            account: result.account,
        });
    } catch (err) {
        return res.status(401).json({
            code: 0,
            message: err.message,
        });
    }
};

const logout = async (req, res) => {
    const accessToken = req.headers.authorization?.split(" ")[1] || req.body.access_token;

    try {
        const result = await authService.handleLogout(accessToken);

        return res.status(200).json({
            code: 1,
            message: result.message,
        });
    } catch (err) {
        return res.status(500).json({
            code: 0,
            message: err.message,
        });
    }
};

module.exports = {
    register,
    login,
    logout,
};
