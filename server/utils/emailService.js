// server/utils/emailService.js
const nodemailer = require('nodemailer');

const getTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // 587 uses STARTTLS
        family: 4,     // 🚀 Force IPv4 to prevent Render ENETUNREACH crash
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Dynamic Client URL with safe fallback
const CLIENT_BASE = (process.env.CLIENT_URL || 'https://cvpilot-n525.onrender.com').replace(/\/+$/, '');

// 🎨 Clean Base Email Wrapper for Corporate Delivery
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
                    <!-- Brand Header -->
                    <tr>
                        <td style="padding: 28px 32px; background: linear-gradient(180deg, #111827 0%, #0f172a 100%); border-bottom: 1px solid #1e293b;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">CV<span style="color: #38bdf8;">Pilot</span></span>
                                    </td>
                                    <td align="right">
                                        <span style="background-color: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}40; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                                            ${badgeText}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Main Body -->
                    <tr>
                        <td style="padding: 32px;">
                            ${contentHtml}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">© 2026 CVPilot Inc. All rights reserved. Automated Career Suite & Cloud Sentinel.</p>
                            <p style="margin: 0; color: #64748b; font-size: 11px;">You received this critical system dispatch related to your registered CVPilot account.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// 🚀 Predefined Automated Email Templates
const AUTOMATED_TEMPLATES = {
    PLAN_UPGRADE_REMINDER: (userName) => ({
        subject: "⚡ Unlock CVPilot Pro: Your 30-Day Free Trial Has Concluded",
        html: emailLayout(
            "Upgrade Plan",
            "Subscription Notice",
            "#0ea5e9",
            `
            <h2 style="margin: 0 0 14px; font-size: 22px; font-weight: 700; color: #ffffff;">Hello ${userName || 'Candidate'},</h2>
            <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Your 30-day initial access period on <strong>CVPilot</strong> has concluded. We hope our AI ATS audits and tailored layout generators gave your job search a decisive advantage.
            </p>
            <div style="background-color: #1e293b; border-radius: 12px; padding: 18px 20px; margin: 20px 0; border: 1px solid #334155;">
                <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Included in CVPilot Pro:</p>
                <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.7;">
                    <li>Unlimited ATS-Compliant PDF Exports with Embedded Headshots</li>
                    <li>Gemini AI Job Description (JD) Gap Matcher</li>
                    <li>Instant Targeted AI Cover Letters formatted to Letterhead</li>
                    <li>Live Job Board matching and priority cloud backup</li>
                </ul>
            </div>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 14px;">
                <tr>
                    <td align="center">
                        <a href="${CLIENT_BASE}/upgrade-plan" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #020617; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);">
                            Upgrade to Pro (Starting ₹199) →
                        </a>
                    </td>
                </tr>
            </table>
            <p style="margin: 20px 0 0; color: #64748b; font-size: 12px; text-align: center;">
                Zero commitment. Instant access upon successful transaction via Razorpay.
            </p>
            `
        )
    }),

    SUSPICIOUS_ACTIVITY_ALERT: (userName, ip, attemptedRoute = 'Protected Resource') => ({
        subject: "🚨 SECURITY ALERT: Unauthorized Route Probe Detected on Your Account",
        html: emailLayout(
            "Security Incident",
            "Urgent Action",
            "#ef4444",
            `
            <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #f87171;">Suspicious Navigation Detected</h2>
            <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Dear ${userName || 'User'}, our automated security firewall flagged an unauthorized probing attempt or access to an unrecognized system endpoint from your credentials.
            </p>
            <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 18px; margin: 20px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #e2e8f0;">
                    <tr>
                        <td style="padding: 4px 0; color: #94a3b8; width: 140px;">Client IP Address:</td>
                        <td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #fca5a5;">${ip || '127.0.0.1 (Dynamic NAT)'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #94a3b8;">Target Endpoint:</td>
                        <td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #f87171;">${attemptedRoute}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #94a3b8;">Incident Action:</td>
                        <td style="padding: 4px 0; font-weight: 600; color: #fbbf24;">Trapped & Quarantined</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #94a3b8;">Timestamp:</td>
                        <td style="padding: 4px 0; color: #cbd5e1;">${new Date().toUTCString()}</td>
                    </tr>
                </table>
            </div>
            <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 13.5px; line-height: 1.6;">
                If you were attempting legitimate navigation, please return to standard dashboard links. If you did not initiate this request, someone may be misusing your network session.
            </p>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0 12px;">
                <tr>
                    <td align="center">
                        <a href="${CLIENT_BASE}/login" style="background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">
                            Re-Authenticate Account
                        </a>
                    </td>
                </tr>
            </table>
            `
        )
    }),

    NEW_FEATURE_ANNOUNCEMENT: (userName) => ({
        subject: "🚀 Big Updates on CVPilot: Gemini AI Cover Letters & Live Job Matching",
        html: emailLayout(
            "Product Updates",
            "What's New",
            "#10b981",
            `
            <h2 style="margin: 0 0 14px; font-size: 22px; font-weight: 700; color: #ffffff;">Hi ${userName || 'Developer'},</h2>
            <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                We've deployed major upgrades to help you pass enterprise ATS filters and accelerate interview callbacks:
            </p>
            <div style="margin: 20px 0;">
                <div style="background-color: #1e293b; border-left: 4px solid #10b981; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px;">
                    <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #34d399;">1. Formatted AI Cover Letter Suite</p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12.5px;">Generates executive 3-paragraph letters with candidate contact headers and instant PDF downloads.</p>
                </div>
                <div style="background-color: #1e293b; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px;">
                    <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #38bdf8;">2. Real-Time Job Feed Matching</p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12.5px;">Search live engineering openings directly inside the resume builder with one-click keyword injection.</p>
                </div>
            </div>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px;">
                <tr>
                    <td align="center">
                        <a href="${CLIENT_BASE}/build-resume" style="background-color: #10b981; color: #020617; text-decoration: none; padding: 13px 30px; border-radius: 9px; font-weight: 700; font-size: 14px; display: inline-block;">
                            Test Features in Workspace →
                        </a>
                    </td>
                </tr>
            </table>
            `
        )
    })
};

const sendMail = async ({ to, subject, html }) => {
    const transporter = getTransporter();
    return transporter.sendMail({
        from: `"CVPilot Security" <${process.env.EMAIL}>`,
        to,
        subject,
        html
    });
};

module.exports = { sendMail, AUTOMATED_TEMPLATES, emailLayout };