// server/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const connectDb = require("./config/DB");
const { Visitor } = require("./models/SecurityLog");

// Routes Imports
const authroute = require("./routes/authRoutes");
const resumeroute = require("./routes/resumeRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const jobRoutes = require('./routes/jobRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();
const app = express();

// 1. FIXED: Set trust proxy to 1 (1 hop behind reverse-proxy / local)
app.set('trust proxy', 1);

// 2. Helmet Security Headers
app.use(helmet());

// Body Parsing Setup
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 3. NoSQL Query Injection Protection
app.use((req, res, next) => {
    if (req.body) {
        req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    }
    if (req.params) {
        req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    }
    next();
});

// CORS Setup
app.use(cors({
    origin: "*",
    credentials: true
}));

// 🚀 4. UNIQUE DEVICE & IP TRAFFIC TRACKER (Mongoose warning fixed)
app.use(async (req, res, next) => {
    try {
        const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.socket?.remoteAddress ||
            req.ip ||
            '127.0.0.1';

        const cleanIp = rawIp.replace('::ffff:', '');
        const userAgent = req.headers['user-agent'] || 'Unknown Device';

        // FIXED: replaced { new: true } with { returnDocument: 'after' }
        await Visitor.findOneAndUpdate(
            { ip: cleanIp },
            {
                $set: { userAgent, lastVisit: new Date() },
                $inc: { hitCount: 1 }
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
    } catch (error) {
        // Non-blocking background log
    }
    next();
});

// 🚀 5. Rate Limiting Setup (with validate config to suppress permissive proxy validation crash)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    validate: { trustProxy: false }, // Disables express-rate-limit strict validation warning
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use("/api/", globalLimiter);

// Auth Rate Limiter
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 15,
    validate: { trustProxy: false },
    message: { success: false, message: "Too many authentication attempts! Please wait 10 minutes." }
});
app.use("/api/auth/login", authLimiter);

// API Routes Endpoint Mounts
app.use('/api/jobs', jobRoutes);
app.use("/api/auth", authroute);
app.use("/api/resume", resumeroute);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 6050;

// Database Connection & Server Listener
connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running securely on port :${PORT}`);
    });
}).catch((err) => {
    console.error("Database Connection Failed:", err);
});