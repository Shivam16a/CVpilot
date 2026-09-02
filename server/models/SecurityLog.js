// server/models/SecurityLog.js
const mongoose = require('mongoose');

// Unique IP / Device Visitor Schema
const visitorSchema = new mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    userAgent: { type: String, default: '' },
    firstVisit: { type: Date, default: Date.now },
    lastVisit: { type: Date, default: Date.now },
    hitCount: { type: Number, default: 1 }
});

// Suspicious Route / 404 Intrusion Log Schema
const suspiciousLogSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    attemptedRoute: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: 'Guest Visitor' },
    email: { type: String, default: 'Unauthenticated' },
    userAgent: { type: String, default: '' },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    timestamp: { type: Date, default: Date.now }
});

const Visitor = mongoose.model('Visitor', visitorSchema);
const SuspiciousLog = mongoose.model('SuspiciousLog', suspiciousLogSchema);

module.exports = { Visitor, SuspiciousLog };