// server/middleware/subscriptionMiddleware.js
const checkSubscription = async (req, res, next) => {
    try {
        const user = req.user;

        // 1. ADMIN BYPASS RULE (Admin can access everything without paying)
        if (user && user.isAdmin) {
            return next();
        }

        const now = new Date();
        const trialEnd = new Date(user.subscription?.trialEndsAt || user.createdAt);
        const periodEnd = new Date(user.subscription?.currentPeriodEnd || trialEnd);

        // 2. Check if active plan or trial has expired
        const isTrialActive = user.subscription?.plan === 'TRIAL' && now <= trialEnd;
        const isPaidActive = ['PRO_MONTHLY', 'PRO_YEARLY'].includes(user.subscription?.plan) && now <= periodEnd;

        if (!isTrialActive && !isPaidActive) {
            return res.status(403).json({
                success: false,
                isSubscriptionExpired: true,
                message: "Your 1-month free trial or subscription has expired. Please upgrade your plan to continue using CVPilot services."
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Subscription validation failed: " + error.message });
    }
};

module.exports = { checkSubscription };