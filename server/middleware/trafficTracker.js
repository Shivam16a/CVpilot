// server/middleware/trafficTracker.js
const { Visitor } = require('../models/SecurityLog');

const trackUniqueVisitor = async (req, res, next) => {
    try {
        // Extract real client IP (behind proxy or direct connection)
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.socket.remoteAddress ||
            req.ip ||
            '127.0.0.1';

        const userAgent = req.headers['user-agent'] || 'Unknown Device';

        // Upsert visitor: agar IP exist karti hai toh update hitCount, warna naya insert
        await Visitor.findOneAndUpdate(
            { ip },
            {
                $set: { userAgent, lastVisit: new Date() },
                $inc: { hitCount: 1 }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    } catch (err) {
        // Non-blocking catch
        console.error("Traffic Tracker Error:", err.message);
    }
    next();
};

module.exports = { trackUniqueVisitor };