// server/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const connectDb = require("./config/DB");

// Routes Imports
const authroute = require("./routes/authRoutes");
const resumeroute = require("./routes/resumeRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const jobRoutes = require('./routes/jobRoutes');

dotenv.config();
const app = express();

//  1. Helmet HTTP Security Headers
app.use(helmet());

// Body Parsing Setup
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//  2. FIXED: NoSQL Query Injection Protection
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

//  3. Rate Limiting Setup
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Increased limit for smooth development testing
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use("/api/", globalLimiter);

// Auth Rate Limiter
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 15, // Increased limit to prevent accidental login lockouts
    message: { success: false, message: "Too many authentication attempts! Please wait 10 minutes." }
});
app.use("/api/auth/login", authLimiter);

//  API Routes Endpoint Mounts
app.use('/api/jobs', jobRoutes);
app.use("/api/auth", authroute);
app.use("/api/resume", resumeroute);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 6050;

// Database Connection & Server Listener
connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running securely on port :${PORT}`);
    });
}).catch((err) => {
    console.error("Database Connection Failed:", err);
});