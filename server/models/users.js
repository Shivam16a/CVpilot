const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        phone: {
            type: String,
            required: true,
        },

        password: {
            type: String,
            required: true,
        },

        otp: String,

        otpExpire: Date,

        isVerified: {
            type: Boolean,
            default: false,
        },

        isAdmin: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        // server/models/users.js ke schema me ye fields add karein:
        subscription: {
            plan: {
                type: String,
                enum: ['TRIAL', 'PRO_MONTHLY', 'PRO_YEARLY', 'EXPIRED'],
                default: 'TRIAL'
            },
            status: {
                type: String,
                enum: ['ACTIVE', 'EXPIRED'],
                default: 'ACTIVE'
            },
            trialEndsAt: {
                type: Date,
                default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 Days Free Trial from signup
            },
            currentPeriodEnd: {
                type: Date,
                default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            razorpayPaymentId: { type: String, default: null },
            razorpayOrderId: { type: String, default: null }
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);