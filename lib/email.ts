import nodemailer from 'nodemailer';

// ─── Email Configuration ───────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = `"${process.env.SMTP_FROM_NAME || 'Polaris Pilot'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@polarisone.com'}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ─── Base Send Function ───────────────────────────────────────────────────────

async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function baseTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f14; margin: 0; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,75,110,0.2); }
    .logo { font-size: 24px; font-weight: 800; color: #ff4b6e; margin-bottom: 32px; letter-spacing: -0.5px; }
    .logo span { color: #a78bfa; }
    h1 { color: #f8fafc; font-size: 22px; margin: 0 0 16px; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #ff4b6e, #a78bfa); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .code { background: #0f0f14; border: 1px solid rgba(255,75,110,0.3); border-radius: 8px; padding: 16px; font-family: monospace; color: #ff4b6e; font-size: 18px; letter-spacing: 4px; text-align: center; margin: 16px 0; }
    .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); color: #475569; font-size: 13px; }
    .url { color: #64748b; font-size: 12px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Polaris<span>Pilot</span></div>
    ${content}
    <div class="footer">
      <p>This email was sent by Polaris Pilot. If you didn't request this, please ignore it.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ─── Verification Email ───────────────────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const html = baseTemplate(
    'Verify your email - Polaris Pilot',
    `
    <h1>Verify your email address</h1>
    <p>Hey <strong style="color:#f8fafc">${username}</strong>, thanks for signing up for Polaris Pilot.</p>
    <p>Click the button below to verify your email address and activate your account.</p>
    <a href="${verifyUrl}" class="btn">Verify Email Address</a>
    <p>Or paste this URL into your browser:</p>
    <p class="url">${verifyUrl}</p>
    <p>This link expires in 6 hours.</p>
    `
  );

  await sendEmail({
    to: email,
    subject: 'Verify your email - Polaris Pilot',
    html,
    text: `Verify your email: ${verifyUrl}`,
  });
}

// ─── Password Reset Email ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const html = baseTemplate(
    'Reset your password - Polaris Pilot',
    `
    <h1>Reset your password</h1>
    <p>Hey <strong style="color:#f8fafc">${username}</strong>, we received a request to reset your password.</p>
    <p>Click the button below to choose a new password. This link expires in 1 hour.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p>Or paste this URL into your browser:</p>
    <p class="url">${resetUrl}</p>
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
    `
  );

  await sendEmail({
    to: email,
    subject: 'Reset your password - Polaris Pilot',
    html,
    text: `Reset your password: ${resetUrl}`,
  });
}

// ─── Welcome Email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  email: string,
  username: string
): Promise<void> {
  const html = baseTemplate(
    'Welcome to Polaris Pilot!',
    `
    <h1>Welcome to Polaris Pilot! 🚀</h1>
    <p>Hey <strong style="color:#f8fafc">${username}</strong>, your account is now active and ready to use.</p>
    <p>Here's what you can do with Polaris Pilot:</p>
    <ul style="color:#94a3b8; padding-left:20px; margin:16px 0; line-height:2">
      <li>Build custom application forms for your Roblox group</li>
      <li>Manage rank centers with gamepass integration</li>
      <li>Generate AI-powered application questions</li>
      <li>Auto-promote users who pass your applications</li>
    </ul>
    <a href="${APP_URL}/dashboard" class="btn">Go to Dashboard</a>
    `
  );

  await sendEmail({
    to: email,
    subject: 'Welcome to Polaris Pilot! 🚀',
    html,
    text: `Welcome to Polaris Pilot! Visit ${APP_URL}/dashboard to get started.`,
  });
}
