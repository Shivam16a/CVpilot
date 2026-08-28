const jwt = require('jsonwebtoken');
const User = require('../models/users');

// Protect Middleware (Checks Token + Check if User is Blocked)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ success: false, message: "User account no longer exists." });
            }

            //  Blocked User Security Check
            if (user.isBlocked) {
                return res.status(403).json({
                    success: false,
                    isBlocked: true,
                    message: "Your account has been blocked by Admin due to suspicious activity."
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("Auth Token Error:", error);
            return res.status(401).json({ success: false, message: "Not authorized, token failed." });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token provided." });
    }
};

// 🔒 Admin Only Guard Middleware (Checks isAdmin field)
const adminOnly = (req, res, next) => {
    if (req.user && req.user.isAdmin === true) {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Access denied. Admin privileges required." });
    }
};

module.exports = { protect, adminOnly };