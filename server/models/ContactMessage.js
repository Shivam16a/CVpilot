// server/models/ContactMessage.js
const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subjectType: {
        type: String,
        enum: ['GENERAL', 'BUG_REPORT', 'FEATURE_SUGGESTION', 'BILLING', 'OTHER'],
        default: 'GENERAL'
    },
    message: { type: String, required: true },
    ip: { type: String, default: '127.0.0.1' },
    isResolved: { type: Boolean, default: false },
    adminReply: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);