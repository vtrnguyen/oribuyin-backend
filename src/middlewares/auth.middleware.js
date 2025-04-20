const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            code: 0,
            message: "unauthorized: no token provided",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            code: 0,
            message: "invalid token",
        });
    }
};

const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                code: 0,
                message: "forbiden: you don't have access to this resource",
            });
        }

        next();
    }
}

module.exports = {
    authenticate,
    authorize,
};
