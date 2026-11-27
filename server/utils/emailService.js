import nodemailer from 'nodemailer';

/**
 * Creates and configures Nodemailer transporter using environment variables.
 * Never hardcodes credentials.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: { user, pass: pass.replace(/\s+/g, '') },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

/**
 * Sends a 6-digit OTP verification code to the user's institutional email.
 * @param {string} email - Destination email address
 * @param {string} otp - 6-digit OTP code
 */
export async function sendOtpEmail(email, otp) {
  const transporter = createTransporter();
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const from = process.env.EMAIL_FROM || (user ? `"PlacePro" <${user}>` : '"PlacePro" <no-reply@placepro.site>');

  // Branded HTML email template matching PlacePro design tokens
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PlacePro Password Recovery</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0b1224; }
        .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05); }
        .logo-row { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .logo-box { width: 32px; height: 32px; background: #0062ff; border-radius: 7px; color: #ffffff; font-weight: 900; font-size: 17px; display: inline-flex; align-items: center; justify-content: center; text-align: center; line-height: 32px; }
        .brand-name { font-size: 18px; font-weight: 800; color: #0b1224; letter-spacing: -0.3px; margin-left: 8px; vertical-align: middle; }
        h1 { font-size: 22px; font-weight: 800; color: #0b1224; margin: 0 0 12px 0; letter-spacing: -0.02em; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
        .otp-box { background: #f1f5f9; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 18px 24px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0062ff; }
        .notice { font-size: 12.5px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px; }
        .footer { font-size: 11.5px; color: #94a3b8; text-align: center; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-row">
          <span class="logo-box">P</span>
          <span class="brand-name">PlacePro</span>
        </div>
        <h1>Password Recovery Code</h1>
        <p>You requested to reset your password for your PlacePro university account. Use the 6-digit verification code below to complete the reset process:</p>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>

        <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
          ⏱ This code will expire in <strong>5 minutes</strong> and can only be used once.
        </p>

        <div class="notice">
          <strong>Security Note:</strong> If you did not request this code, someone may have entered your email address by mistake. Your account is still secure — you can safely ignore this email or contact your university placement cell if you have concerns.
        </div>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} PlacePro Campus Recruitment Platform. All rights reserved.
      </div>
    </body>
    </html>
  `;

  const textContent = `PlacePro Password Recovery\n\nYour 6-digit verification code is: ${otp}\n\nThis code expires in 5 minutes. If you did not request this code, please ignore this email.`;

  // 1. Prefer HTTPS-based email APIs when configured (never blocked by Render free tier)
  if (process.env.BREVO_API_KEY) {
    const senderEmail = process.env.SMTP_USER || process.env.GMAIL_USER || 'placepro16@gmail.com';
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'PlacePro', email: senderEmail },
        to: [{ email }],
        subject: 'Your PlacePro Password Recovery Code',
        htmlContent,
        textContent,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[EMAIL ERROR] Brevo API failed:', res.status, data);
      throw new Error(`Email delivery failed: ${data.message || res.statusText}`);
    }
    console.log('[EMAIL SUCCESS] Sent OTP via Brevo to:', email, 'MessageId:', data.messageId);
    return { delivered: true, messageId: data.messageId };
  }

  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'PlacePro <onboarding@resend.dev>',
        to: [email],
        subject: 'Your PlacePro Password Recovery Code',
        html: htmlContent,
        text: textContent,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[EMAIL ERROR] Resend API failed:', res.status, data);
      throw new Error(`Email delivery failed: ${data.message || res.statusText}`);
    }
    console.log('[EMAIL SUCCESS] Sent OTP via Resend to:', email, 'MessageId:', data.id);
    return { delivered: true, messageId: data.id };
  }

  if (!transporter) {
    // If SMTP credentials are not yet configured in .env, log clearly for development
    console.warn('[EMAIL WARNING] SMTP credentials not configured in environment variables (SMTP_USER/SMTP_PASS).');
    console.log(`[DEVELOPMENT OTP DISPATCH] To: ${email} | OTP: ${otp}`);
    return {
      delivered: false,
      devMode: true,
      message: 'SMTP credentials not configured. In development, OTP is logged to console.',
    };
  }

  try {
    // Verify connection before sending
    await transporter.verify();
    console.log('[EMAIL] SMTP connection verified OK');

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: `Your PlacePro Password Recovery Code`,
      text: textContent,
      html: htmlContent,
    });
    console.log('[EMAIL SUCCESS] Sent OTP to:', email, 'MessageId:', info.messageId);
    return { delivered: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL ERROR] Full error:', error);
    console.error('[EMAIL ERROR] Code:', error.code);
    console.error('[EMAIL ERROR] Response:', error.response);
    console.error('[EMAIL ERROR] SMTP_USER:', process.env.SMTP_USER);
    console.error('[EMAIL ERROR] SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
    console.error('[EMAIL ERROR] SMTP_PORT:', process.env.SMTP_PORT || '465');
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

