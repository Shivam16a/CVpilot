// server/utils/emailService.js
const axios = require('axios');

const CLIENT_BASE = (process.env.CLIENT_URL || 'https://cvpilot-n525.onrender.com').replace(/\/+$/, '');

// 2. Cross-Client Compatible Responsive Layout Engine
const emailLayout = (headline, badgeText, badgeColor, contentHtml) => `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark only">
    <title>${headline}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        :root { color-scheme: dark only; }
        body { margin: 0 !important; padding: 0 !important; -webkit-text-size-adjust: 100% !important; -ms-text-size-adjust: 100% !important; }
        table { border-collapse: collapse !important; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
        a { text-decoration: none !important; }
        @media only screen and (max-width: 600px) {
            .wrapper-table { width: 100% !important; padding: 12px !important; }
            .content-cell { padding: 24px 20px !important; }
            .header-cell { padding: 20px !important; }
            .cta-button { display: block !important; width: 100% !important; text-align: center !important; }
        }
    </style>
</head>
<body style="background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; margin: 0; padding: 0;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" class="wrapper-table" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #0b0f19; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);">
                    <!-- Brand Top Bar -->
                    <tr>
                        <td class="header-cell" style="padding: 24px 32px; background: linear-gradient(180deg, #111827 0%, #0b0f19 100%); border-bottom: 1px solid #1e293b;">
                            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td valign="middle">
                                        <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                                            CV<span style="color: #38bdf8;">Pilot</span>
                                            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; background-color: #1e293b; padding: 3px 8px; border-radius: 6px; margin-left: 8px; text-transform: uppercase; letter-spacing: 0.5px;">PRO PLATFORM</span>
                                        </div>
                                    </td>
                                    <td align="right" valign="middle">
                                        <span style="display: inline-block; background-color: ${badgeColor}15; color: ${badgeColor}; border: 1px solid ${badgeColor}35; padding: 5px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.75px;">
                                            ${badgeText}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Primary Content Matrix -->
                    <tr>
                        <td class="content-cell" style="padding: 36px 32px;">
                            ${contentHtml}
                        </td>
                    </tr>

                    <!-- Enterprise Security Footer -->
                    <tr>
                        <td style="padding: 28px 32px; background-color: #030712; border-top: 1px solid #1e293b; text-align: center;">
                            <p style="margin: 0 0 10px; color: #94a3b8; font-size: 12px; font-weight: 500;">
                                © 2026 CVPilot Inc. All rights reserved. Automated Career Suite & Cloud Sentinel.
                            </p>
                            <p style="margin: 0 0 14px; color: #4b5563; font-size: 11px; line-height: 1.5;">
                                This is an automated operational transmission dispatched to your verified security address. Replies to this inbox are screened via security quarantine.
                            </p>
                            <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding: 0 8px;"><a href="${CLIENT_BASE}" style="color: #64748b; font-size: 11px;">Workspace</a></td>
                                    <td style="color: #334155; font-size: 11px;">•</td>
                                    <td style="padding: 0 8px;"><a href="${CLIENT_BASE}/privacy" style="color: #64748b; font-size: 11px;">Data Protection</a></td>
                                    <td style="color: #334155; font-size: 11px;">•</td>
                                    <td style="padding: 0 8px;"><a href="${CLIENT_BASE}/support" style="color: #64748b; font-size: 11px;">Direct Helpdesk</a></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// 3. Automated Executive Dispatch Templates
const AUTOMATED_TEMPLATES = {
    // Template 1: Plan Upgrade Notice
    PLAN_UPGRADE_REMINDER: (userName) => ({
        subject: "⚡ Unlock CVPilot Pro: Your 30-Day Free Trial Has Concluded",
        html: emailLayout(
            "Subscription Notice",
            "Action Required",
            "#0ea5e9",
            `
            <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
                Hello ${userName || 'Candidate'},
            </h1>
            <p style="margin: 0 0 20px; color: #94a3b8; font-size: 14.5px; line-height: 1.65;">
                Your complimentary 30-day trial of <strong>CVPilot</strong> has concluded. To ensure uninterrupted access to automated ATS layout compiling, live vacancy pairing, and AI document audits, please transition to a Pro subscription.
            </p>

            <div style="background-color: #111827; border-radius: 12px; padding: 22px; margin: 24px 0; border: 1px solid #1f2937;">
                <p style="margin: 0 0 14px; font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.8px;">
                    Enterprise Suite Capabilities Included:
                </p>
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="padding: 6px 0; color: #e2e8f0; font-size: 13.5px; line-height: 1.5;">
                            <span style="color: #10b981; font-weight: 800; margin-right: 8px;">✓</span> Unlimited ATS-Compliant PDF Exports with Dynamic Headshots
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #e2e8f0; font-size: 13.5px; line-height: 1.5;">
                            <span style="color: #10b981; font-weight: 800; margin-right: 8px;">✓</span> Gemini AI Real-Time Job Description (JD) Gap Analysis
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #e2e8f0; font-size: 13.5px; line-height: 1.5;">
                            <span style="color: #10b981; font-weight: 800; margin-right: 8px;">✓</span> Auto-Targeted Executive Cover Letters formatted directly to Letterhead
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #e2e8f0; font-size: 13.5px; line-height: 1.5;">
                            <span style="color: #10b981; font-weight: 800; margin-right: 8px;">✓</span> Direct Pipeline Cloud Backups & Version Control Restoration
                        </td>
                    </tr>
                </table>
            </div>

            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 16px;">
                <tr>
                    <td align="center">
                        <a href="${CLIENT_BASE}/upgrade-plan" class="cta-button" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #020617; text-decoration: none; padding: 15px 36px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 20px rgba(14, 165, 233, 0.35);">
                            Upgrade Workspace to Pro (Starting ₹199) →
                        </a>
                    </td>
                </tr>
            </table>
            <p style="margin: 16px 0 0; color: #64748b; font-size: 12px; text-align: center;">
                Instant provisioning. Secure 256-bit encrypted checkout handled via Razorpay.
            </p>
            `
        )
    }),

    // Template 2: Real-time Firewall & Threat Alert
    SUSPICIOUS_ACTIVITY_ALERT: (userName, ip, attemptedRoute = 'Protected Core Resource') => ({
        subject: "🚨 SECURITY INCIDENT: Unauthorized Route Access Quarantined",
        html: emailLayout(
            "Security Sentinel",
            "Urgent Action",
            "#ef4444",
            `
            <h1 style="margin: 0 0 14px; font-size: 20px; font-weight: 700; color: #f87171; letter-spacing: -0.3px;">
                Security Perimeter Probe Quarantined
            </h1>
            <p style="margin: 0 0 18px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                Dear ${userName || 'User'}, our real-time behavioral intrusion system intercepted an unauthorized access attempt to a restricted endpoint utilizing your active token credentials.
            </p>

            <div style="background-color: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; padding: 20px; margin: 22px 0;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                    <tr>
                        <td style="padding: 5px 0; color: #94a3b8; width: 140px;">Remote Client IP:</td>
                        <td style="padding: 5px 0; font-family: ui-monospace, SFMono-Regular, monospace; font-weight: 700; color: #fca5a5;">${ip || '127.0.0.1 (Dynamic NAT)'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; color: #94a3b8;">Target Endpoint:</td>
                        <td style="padding: 5px 0; font-family: ui-monospace, SFMono-Regular, monospace; font-weight: 700; color: #f87171;">${attemptedRoute}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; color: #94a3b8;">Firewall Action:</td>
                        <td style="padding: 5px 0; font-weight: 700; color: #fbbf24;">Request Trapped & Handled (404/Quarantine)</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; color: #94a3b8;">System Timestamp:</td>
                        <td style="padding: 5px 0; color: #cbd5e1;">${new Date().toUTCString()}</td>
                    </tr>
                </table>
            </div>

            <p style="margin: 0 0 20px; color: #94a3b8; font-size: 13.5px; line-height: 1.6;">
                If this action was initiated by a misconfigured local browser tab, navigate back to your workspace. If you did not initiate this request, invalidate your token immediately.
            </p>

            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px;">
                <tr>
                    <td align="center">
                        <a href="${CLIENT_BASE}/login" class="cta-button" style="background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">
                            Terminate Session & Re-Authenticate →
                        </a>
                    </td>
                </tr>
            </table>
            `
        )
    }),

    // Template 3: Feature Announcement & Release Notes
    NEW_FEATURE_ANNOUNCEMENT: (userName) => ({
        subject: "🚀 CVPilot Release: Gemini AI Cover Letter Suite & Real-Time Job Feed",
        html: emailLayout(
            "Product Dispatch",
            "Platform Update",
            "#10b981",
            `
            <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
                Welcome to the Next Evolution, ${userName || 'Developer'}
            </h1>
            <p style="margin: 0 0 20px; color: #94a3b8; font-size: 14.5px; line-height: 1.65;">
                We have deployed core upgrades to CVPilot's pipeline to optimize your application-to-interview ratio across enterprise ATS systems:
            </p>

            <div style="margin: 24px 0;">
                <div style="background-color: #111827; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px 20px; margin-bottom: 14px; border-top: 1px solid #1f2937; border-right: 1px solid #1f2937; border-bottom: 1px solid #1f2937;">
                    <p style="margin: 0 0 6px; font-size: 14.5px; font-weight: 700; color: #34d399;">
                        1. Automated Executive Cover Letter Composer
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.55;">
                        Transforms your verified resume milestones into concise, targeted letters formatted directly to formal executive letterheads.
                    </p>
                </div>

                <div style="background-color: #111827; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 16px 20px; margin-bottom: 14px; border-top: 1px solid #1f2937; border-right: 1px solid #1f2937; border-bottom: 1px solid #1f2937;">
                    <p style="margin: 0 0 6px; font-size: 14.5px; font-weight: 700; color: #38bdf8;">
                        2. Integrated Real-Time Vacancy Scanner
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.55;">
                        Query open developer and engineering roles directly within the resume canvas with one-click keyword injection for ATS compatibility.
                    </p>
                </div>
            </div>

            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 14px;">
                <tr>
                    <td align="center">
                        <a href="${CLIENT_BASE}/build-resume" class="cta-button" style="background-color: #10b981; color: #020617; text-decoration: none; padding: 14px 34px; border-radius: 9px; font-weight: 700; font-size: 14px; display: inline-block;">
                            Launch Resume Studio Workspace →
                        </a>
                    </td>
                </tr>
            </table>
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