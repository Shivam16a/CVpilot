// server/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false, // 587 uses STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const sender = process.env.SENDER_EMAIL || process.env.EMAIL_USER;

    const otpHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #070a12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 35px 15px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden;">
                        <tr>
                            <td style="padding: 24px 30px; border-bottom: 1px solid #1e293b; text-align: center;">
                                <span style="font-size: 22px; font-weight: 800; color: #ffffff;">CV<span style="color: #38bdf8;">Pilot</span></span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 32px 30px; text-align: center;">
                                <h2 style="margin: 0 0 10px; color: #ffffff; font-size: 20px;">Email Verification Code</h2>
                                <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px;">Use the verification code below to authorize your CVPilot account.</p>
                                
                                <div style="display: inline-block; background-color: #1e293b; border: 1px solid #38bdf8; border-radius: 12px; padding: 14px 36px; margin-bottom: 24px;">
                                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #38bdf8; font-family: monospace;">${otp}</span>
                                </div>
                                
                                <p style="margin: 0; color: #64748b; font-size: 12px;">Valid for <strong>5 minutes</strong>. If you did not request this, please ignore.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 18px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
                                <p style="margin: 0; color: #475569; font-size: 11px;">© 2026 CVPilot Sentinel Security Dispatch.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    return transporter.sendMail({
        from: `"CVPilot Verification" <${sender}>`,
        to: email,
        subject: "CVPilot Verification Code",
        html: otpHtml,
    });
};

module.exports = sendEmail;