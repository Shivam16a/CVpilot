const User = require("../models/users");
const bcrypt = require("bcryptjs");

const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");


// REGISTER

exports.register = async (req, res) => {
    try {
        const {
            username,
            email,
            phone,
            password
        } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const otp = generateOTP();

        const user = await User.create({
            username,
            email,
            phone,
            password: hashedPassword,
            otp,
            otpExpire:
                Date.now() + 5 * 60 * 1000,
        });

        await sendEmail(email, otp);

        res.status(201).json({
            success: true,
            message:
                "OTP sent to email. Verify account.",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


// VERIFY OTP

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user =
            await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({
                message: "OTP expired",
            });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpire = null;

        await user.save();

        res.status(200).json({
            success: true,
            message:
                "Email verified successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


// LOGIN

exports.login = async (req, res) => {
    try {
        const { email, password } =
            req.body;

        const user =
            await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (!user.isVerified) {
            return res.status(400).json({
                message:
                    "Verify email first",
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                message:
                    "Invalid credentials",
            });
        }

        const token =
            generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// FORGOT PASSWORD

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpire = Date.now() + 5 * 60 * 1000;

        await user.save();

        await sendEmail(email, otp);

        res.status(200).json({
            success: true,
            message: "OTP sent to email",
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// RESET PASSWORD

exports.resetPassword = async (req, res) => {
    try {

        const {
            email,
            otp,
            newPassword
        } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({
                message: "OTP Expired",
            });
        }

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        user.otp = null;
        user.otpExpire = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};