// server/controllers/contactController.js
const ContactMessage = require('../models/ContactMessage');
const { SuspiciousLog } = require('../models/SecurityLog'); // 🚀 Ensure IP can be resolved from security logs
const User = require('../models/users');
const { sendMail, AUTOMATED_TEMPLATES } = require('../utils/emailService');

// 1. User submits "Get In Touch With Us" Form
const submitContactMessage = async (req, res) => {
    try {
        const { name, email, subjectType, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Name, email and message are required." });
        }

        const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || req.ip || '127.0.0.1';
        const cleanIp = rawIp.replace('::ffff:', '');

        await ContactMessage.create({
            name,
            email,
            subjectType: subjectType || 'GENERAL',
            message,
            ip: cleanIp
        });

        // Send Email Notification to Admin
        try {
            await sendMail({
                to: process.env.EMAIL,
                subject: `📬 New User Message [${subjectType || 'GENERAL'}]: ${name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; background: #0f172a; color: #fff; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
                        <h3 style="color: #38bdf8; margin-top: 0;">New Inquiry Received on CVPilot</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Category:</strong> ${subjectType}</p>
                        <p><strong>Sender IP:</strong> <code style="color: #f59e0b;">${cleanIp}</code></p>
                        <p><strong>Message:</strong></p>
                        <blockquote style="background: #1e293b; padding: 14px; border-left: 4px solid #38bdf8; color: #e2e8f0; margin: 0; border-radius: 6px;">
                            ${message}
                        </blockquote>
                    </div>
                `
            });
        } catch (mailErr) {
            console.warn("Notification email to admin failed:", mailErr.message);
        }

        return res.status(201).json({
            success: true,
            message: "Your message has been received! Our team will get back to you shortly."
        });
    } catch (error) {
        console.error("Contact Submit Error:", error);
        return res.status(500).json({ success: false, message: "Failed to submit message: " + error.message });
    }
};

// 2. Admin: Get all received messages
const getAllContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: messages.length, messages });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🚀 3. Admin: Send Automated / Custom Email to User (WITH AUTOMATIC IP RESOLUTION)
const sendAdminEmailToUser = async (req, res) => {
    try {
        const { targetEmail, targetName, templateType, customSubject, customBody, targetIp } = req.body;

        if (!targetEmail) {
            return res.status(400).json({ success: false, message: "Target user email is required." });
        }

        let mailPayload = { to: targetEmail };

        if (templateType === 'UPGRADE_PLAN') {
            mailPayload = { ...mailPayload, ...AUTOMATED_TEMPLATES.PLAN_UPGRADE_REMINDER(targetName) };
        } else if (templateType === 'SUSPICIOUS_ALERT') {
            // 🔍 SMART IP RESOLUTION:
            // 1. Agar frontend se targetIp aaya hai toh wahi use karein.
            // 2. Agar empty hai, toh SuspiciousLog database se target email/userId ki latest probe IP find karein.
            let resolvedIp = targetIp?.trim();
            let attemptedRoute = 'Protected Endpoint';

            if (!resolvedIp) {
                const latestLog = await SuspiciousLog.findOne({
                    $or: [{ email: targetEmail }, { username: targetName }]
                }).sort({ timestamp: -1 });

                if (latestLog) {
                    resolvedIp = latestLog.ip;
                    attemptedRoute = latestLog.attemptedRoute || attemptedRoute;
                }
            }

            mailPayload = {
                ...mailPayload,
                ...AUTOMATED_TEMPLATES.SUSPICIOUS_ACTIVITY_ALERT(targetName, resolvedIp || '127.0.0.1 (Logged IP)', attemptedRoute)
            };
        } else if (templateType === 'NEW_FEATURE') {
            mailPayload = { ...mailPayload, ...AUTOMATED_TEMPLATES.NEW_FEATURE_ANNOUNCEMENT(targetName) };
        } else {
            if (!customSubject || !customBody) {
                return res.status(400).json({ success: false, message: "Subject and Body required for custom email." });
            }
            mailPayload.subject = customSubject;
            mailPayload.html = `
                <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #1e293b;">
                    <h3 style="color: #38bdf8; margin-top: 0;">Message from CVPilot Administration</h3>
                    <p style="color: #cbd5e1; font-size: 14px;">Dear ${targetName || 'User'},</p>
                    <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 18px 0;">
                        ${customBody.replace(/\n/g, '<br/>')}
                    </div>
                    <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 11.5px; margin: 0;">CVPilot Support & Governance Operations Team</p>
                </div>
            `;
        }

        await sendMail(mailPayload);

        return res.status(200).json({
            success: true,
            message: `Email successfully dispatched to ${targetEmail}`
        });
    } catch (error) {
        console.error("Admin Email Send Error:", error);
        return res.status(500).json({ success: false, message: "Failed to send email: " + error.message });
    }
};

module.exports = {
    submitContactMessage,
    getAllContactMessages,
    sendAdminEmailToUser
};