// server/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/users');

// 🚀 Safe Lazy Razorpay Loader (Prevents top-level crash when ENV is unconfigured)
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error("Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env");
    }

    return new Razorpay({
        key_id,
        key_secret
    });
};

// 1. Create Razorpay Order
const createOrder = async (req, res) => {
    try {
        const { planType } = req.body; // 'PRO_MONTHLY' (₹199) or 'PRO_YEARLY' (₹1499)
        const razorpay = getRazorpayInstance();

        let amount = 19900; // in paise (₹199)
        if (planType === 'PRO_YEARLY') {
            amount = 149900; // ₹1499
        }

        const options = {
            amount,
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-4)}`
        };

        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error.message || error);
        return res.status(500).json({
            success: false,
            message: error.message || "Payment initialization failed."
        });
    }
};

// 2. Verify Payment Signature & Activate Plan
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;
        const secret = process.env.RAZORPAY_KEY_SECRET;

        if (!secret) {
            return res.status(500).json({
                success: false,
                message: "RAZORPAY_KEY_SECRET is not configured on the server."
            });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature verification failed."
            });
        }

        // Add 30 Days (Monthly) or 365 Days (Annual)
        const extensionDays = planType === 'PRO_YEARLY' ? 365 : 30;
        const newPeriodEnd = new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000);

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    'subscription.plan': planType,
                    'subscription.status': 'ACTIVE',
                    'subscription.currentPeriodEnd': newPeriodEnd,
                    'subscription.razorpayPaymentId': razorpay_payment_id,
                    'subscription.razorpayOrderId': razorpay_order_id
                }
            },
            { returnDocument: 'after' }
        ).select('-password');

        return res.status(200).json({
            success: true,
            message: `Payment successful! Upgraded to ${planType === 'PRO_YEARLY' ? 'Annual Pro' : 'Monthly Pro'}.`,
            user: updatedUser
        });
    } catch (error) {
        console.error("Payment Verification Error:", error.message || error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed: " + (error.message || "Server error")
        });
    }
};

module.exports = { createOrder, verifyPayment };