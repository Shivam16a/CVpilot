// server/utils/emailService.js
const axios = require('axios');

const CLIENT_BASE = (process.env.CLIENT_URL || 'https://cvpilot-n525.onrender.com').replace(/\/+$/, '');

const emailLayout = (headline, badgeText, badgeColor, contentHtml) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${headline}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070a12; padding: 35px 15px;">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                    <tr>
                        <td style="padding: 28px 32px; background: linear-gradient(180deg, #111827 0%, #0f172a 100%); border-bottom: 1px solid #1e293b;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td><span style="font-size: 20px; font-weight: 800; color: #ffffff;">CV<span style="color: #38bdf8;">Pilot</span></span></td>
                                    <td align="right">
                                        <span style="background-color: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}40; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${badgeText}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr><td style="padding: 32px;">${contentHtml}</td></tr>
                    <tr>
                        <td style="padding: 24px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">© 2026 CVPilot Inc. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

const AUTOMATED_TEMPLATES = {
    PLAN_UPGRADE_REMINDER: (userName) => ({
        subject: "⚡ Unlock CVPilot Pro: Your 30-Day Free Trial Has Concluded",
        html: emailLayout(
            "Upgrade Plan",
            "Subscription Notice",
            "#0ea5e9",
            `
            <h2 style="margin: 0 0 14px; font-size: 22px; font-weight: 700; color: #ffffff;">Hello ${userName || 'Candidate'},</h2>
            <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">Your 30-day initial access period on <strong>CVPilot</strong> has concluded.</p>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 14px;">
                <tr>
                    <td align="center">
                        <a href="${CLIENT_BASE}/upgrade-plan" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #020617; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; display: inline-block;">Upgrade to Pro →</a>
                    </td>
                </tr>
            </table>
            `
        )
    }),

    SUSPICIOUS_ACTIVITY_ALERT: (userName, ip, attemptedRoute = 'Protected Resource') => ({
        subject: "🚨 SECURITY ALERT: Unauthorized Route Probe Detected",
        html: emailLayout(
            "Security Incident",
            "Urgent Action",
            "#ef4444",
            `
            <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #f87171;">Suspicious Navigation Detected</h2>
            <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">Dear ${userName || 'User'}, an unauthorized access probe was detected.</p>
            <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 18px; margin: 20px 0; color: #cbd5e1;">
                IP: ${ip || '127.0.0.1'} | Target: ${attemptedRoute}
            </div>
            `
        )
    })
};

const sendMail = async ({ to, subject, html }) => {
    const senderEmail = process.env.SENDER_EMAIL || "support@cvpilot.in";

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { name: "CVPilot Sentinel", email: senderEmail },
                to: [{ email: to }],
                subject,
                htmlContent: html
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Brevo Dispatch Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to dispatch email");
    }
};

module.exports = { sendMail, AUTOMATED_TEMPLATES, emailLayout };