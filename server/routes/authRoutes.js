const express = require("express");
const { authLimiter } = require('../middleware/rateLimiter');

const {
    register,
    verifyOTP,
    login,
    forgotPassword,
    resetPassword,
} = require(
    "../controllers/authController"
);

const router = express.Router();

router.post("/register", register);

router.post("/verify-otp", authLimiter, verifyOTP);

router.post("/login", authLimiter, login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);


module.exports = router;