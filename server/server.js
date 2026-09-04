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
const contactRoutes = require('./routes/contactRoutes');
const { firewallShield, refreshBlockedIpsCache } = require('./middleware/firewallMiddleware');

dotenv.config();
const app = express();

// 1. Trust Proxy Setup (Reverse-proxies jaise Render, Railway, Vercel ke liye zaroori)
app.set('trust proxy', 1);

// 2. Helmet Security Headers (Production Safe CSP)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. Dynamic CORS Configuration (Fixed crash & Trailing Slash bug)
const rawClientUrl = (process.env.CLIENT_URL || '').replace(/\/+$/, ''); // Remove trailing slash

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    rawClientUrl
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (curl, postman, mobile apps) or matched origins
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
            callback(null, true);
        } else {
            // Error throw karne ke bajaye safe rejection taaki server crash na ho
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4. Firewall Shield (Early check)
app.use(firewallShield);

// Body Parsing Setup
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 5. NoSQL Query Injection Protection
app.use((req, res, next) => {
    if (req.body) {
        req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    }
    if (req.params) {
        req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    }
    next();
});

// 🚀 6. UNIQUE DEVICE TRACKER (Sirf API calls par track hoga, non-blocking)
app.use('/api', async (req, res, next) => {
    try {
        if (req.method !== 'OPTIONS') {
            const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                req.socket?.remoteAddress ||
                req.ip ||
                '127.0.0.1';

            const cleanIp = rawIp.replace('::ffff:', '');
            const userAgent = req.headers['user-agent'] || 'Unknown Device';

            // Non-blocking asynchronous update
            Visitor.findOneAndUpdate(
                { ip: cleanIp },
                {
                    $set: { userAgent, lastVisit: new Date() },
                    $inc: { hitCount: 1 }
                },
                { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
            ).catch(() => { }); // Silent catch taaki API slow na ho
        }
    } catch (error) {
        // Non-blocking
    }
    next();
});

// 🚀 7. Rate Limiting Setup
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250,
    validate: { trustProxy: false },
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use("/api/", globalLimiter);

// Auth Specific Rate Limiter
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    validate: { trustProxy: false },
    message: { success: false, message: "Too many authentication attempts! Please wait 10 minutes." }
});
app.use("/api/auth/login", authLimiter);

// ==========================================
// 🚀 DUAL COMPATIBILITY API ROUTES MOUNT
// ==========================================
const mountAppRoutes = (prefix = '/api') => {
    app.use(`${prefix}/jobs`, jobRoutes);
    app.use(`${prefix}/auth`, authroute);
    app.use(`${prefix}/resume`, resumeroute);
    app.use(`${prefix}/ai`, aiRoutes);
    app.use(`${prefix}/admin`, adminRoutes);
    app.use(`${prefix}/payment`, paymentRoutes);
    app.use(`${prefix}/contact`, contactRoutes);
};

// Primary standard routes (/api/*)
mountAppRoutes('/api');

// Fallback direct routes (/admin, /resume, etc.)
mountAppRoutes('');

// Health Check Endpoint (Hosting platforms jaise Render/Railway ko check karne ke liye)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// 🛡️ 8. UNKNOWN API ROUTE QUARANTINE (API 404 Handler)
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: "Requested API endpoint is restricted or does not exist."
    });
});

// 🛡️ 9. GLOBAL EXCEPTION SHIELD (Prevents Stack Trace & Database Leaks)
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error("Internal Server Error:", err.message);
    }

    const statusCode = err.statusCode || err.status || 500;

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500
            ? "A secure internal server error occurred. Please try again later."
            : err.message
    });
});

const PORT = process.env.PORT || 6050;

// 🚀 Database Connection & Safe Firewall Cache Initialization
connectDb()
    .then(async () => {
        // Database connect hone ke baad hi firewall cache initialize karein
        await refreshBlockedIpsCache();

        app.listen(PORT, () => {
            console.log(`Server is running securely on port :${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database Connection Failed:", err.message);
    });