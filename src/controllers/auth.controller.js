const authService = require("../services/auth.service");
const axios = require("axios");
const querystring = require("querystring");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Account = require("../models/Account");

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
        const result = await authService.handleRegister(req.body);

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

const forgotPassword = async (req, res) => {
    const identifier = req.body?.identifier;
    if (!identifier) {
        return res.status(400).json({ code: 0, message: "missing identifier (username or email)" });
    }

    try {
        const result = await authService.requestPasswordReset(identifier);
        return res.status(200).json({ code: 1, message: result.message, user_name: result.user_name, email: result.email });
    } catch (err) {
        return res.status(400).json({ code: 0, message: err.message });
    }
};

const verifyOtp = async (req, res) => {
    const { identifier, code } = req.body;
    if (!identifier || !code) {
        return res.status(400).json({ code: 0, message: "missing input parameters" });
    }

    try {
        const result = await authService.verifyPasswordResetOtp({ identifier, code });
        return res.status(200).json({ code: 1, message: result.message, reset_token: result.reset_token });
    } catch (err) {
        return res.status(400).json({ code: 0, message: err.message });
    }
};

const resetPassword = async (req, res) => {
    const { reset_token, new_password } = req.body;
    if (!reset_token || !new_password) {
        return res.status(400).json({ code: 0, message: "missing input parameters" });
    }

    try {
        const result = await authService.resetPassword({ reset_token, new_password });
        return res.status(200).json({ code: 1, message: result.message });
    } catch (err) {
        return res.status(400).json({ code: 0, message: err.message });
    }
};

const googleRedirect = async (req, res) => {
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('Missing env GOOGLE_CLIENT_ID');
            return res.status(500).send('Server misconfiguration: missing GOOGLE_CLIENT_ID');
        }
        if (!process.env.GOOGLE_CALLBACK_URL) {
            console.error('Missing env GOOGLE_CALLBACK_URL');
            return res.status(500).send('Server misconfiguration: missing GOOGLE_CALLBACK_URL');
        }

        const returnTo = req.query.returnTo || process.env.FRONTEND_ORIGIN || 'http://localhost:4200';
        const state = crypto.randomBytes(20).toString('hex');

        if (!global.oauthStates) global.oauthStates = {};
        global.oauthStates[state] = { returnTo, createdAt: Date.now() };

        const params = {
            client_id: process.env.GOOGLE_CLIENT_ID,
            redirect_uri: process.env.GOOGLE_CALLBACK_URL,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent',
            state,
        };

        const url = `https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify(params)}`;
        return res.redirect(url);
    } catch (err) {
        console.error('googleRedirect error', err);
        return res.status(500).send('Internal error');
    }
};

const googleCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
            console.error('Missing one of GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL');
            return res.status(500).send('Server misconfiguration: missing Google OAuth environment variables');
        }
        const stored = (global.oauthStates && global.oauthStates[state]) || null;
        if (!stored) return res.status(400).send('Invalid or missing state');
        const returnTo = stored.returnTo || process.env.FRONTEND_ORIGIN || 'http://localhost:4200';
        delete global.oauthStates[state];

        if (!code) return res.status(400).send('Missing code');

        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', querystring.stringify({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_CALLBACK_URL,
            grant_type: 'authorization_code',
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const { access_token } = tokenRes.data;

        const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const profile = userInfoRes.data;

        let user = await User.findOne({ where: { email: profile.email } });
        if (!user) {
            const firstName = profile.given_name || (profile.name ? profile.name.split(' ')[0] : 'Google');
            const lastName = profile.family_name || (profile.name ? profile.name.split(' ').slice(1).join(' ') : 'User');
            user = await User.create({
                first_name: firstName,
                last_name: lastName,
                email: profile.email,
                phone_number: null,
                avatar: profile.picture || null,
                gender: null,
                birth_day: null,
                address: null,
            });
        }

        let account = await Account.findOne({ where: { user_id: user.id } });
        if (!account) {
            const rawPassword = crypto.randomBytes(12).toString('base64');
            const hashed = await bcrypt.hash(rawPassword, 10);

            const googleName = `google_${profile.id}`;
            let userName = googleName;

            const existing = await Account.findOne({ where: { user_name: userName } });
            if (existing) {
                userName = `${googleName}_${crypto.randomBytes(4).toString('hex')}`;
            }

            account = await Account.create({
                user_name: userName,
                password: hashed,
                role: 'customer',
                user_id: user.id,
            });
        }

        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
        const jwtPayload = { user_id: account.user_id, role: account.role };
        const accessToken = jwt.sign(jwtPayload, JWT_SECRET_KEY, { expiresIn: '14d' });

        const redirectUrl = new URL(`${returnTo.replace(/\/$/, '')}/auth/google/success`);
        redirectUrl.searchParams.set('access_token', accessToken);
        redirectUrl.searchParams.set('user_id', account.user_id);
        redirectUrl.searchParams.set('role', account.role);

        return res.redirect(redirectUrl.toString());
    } catch (err) {
        console.error('googleCallback error', err?.response?.data || err.message || err);
        return res.status(500).send('Google OAuth error');
    }
};

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
    googleRedirect,
    googleCallback,
};
