// server/controllers/authController.js
const User = require("../models/users");
const bcrypt = require("bcryptjs");

const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ success: false, message: "All required fields must be filled." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();

        await User.create({
            username: username.trim(),
            email: normalizedEmail,
            phone: phone ? phone.trim() : '',
            password: hashedPassword,
            otp,
            otpExpire: Date.now() + 5 * 60 * 1000,
        });

        await sendEmail(normalizedEmail, otp);

        return res.status(201).json({
            success: true,
            message: "OTP sent to email. Please verify your account.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again.",
        });
    }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpire = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now login.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Verification failed. Please try again.",
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found with this email",
            });
        }

        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is not verified. Please verify your email first.",
            });
        }

        // 🚫 1. CRITICAL BLOCK CHECK
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                isBlocked: true,
                message: "Your account has been suspended by Admin for security reasons.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password credentials.",
            });
        }

        const token = generateToken(user._id);

        // 🚀 2. CLEAN SANITIZED USER RESPONSE
        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin === true,
                isVerified: user.isVerified,
                isBlocked: user.isBlocked === true,
                subscription: user.subscription
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login service error. Please try again later.",
        });
    }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Please provide an email address." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found with this email.",
            });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpire = Date.now() + 5 * 60 * 1000;

        await user.save();
        await sendEmail(normalizedEmail, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send reset OTP.",
        });
    }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.otp = null;
        user.otpExpire = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Password reset failed.",
        });
    }
};