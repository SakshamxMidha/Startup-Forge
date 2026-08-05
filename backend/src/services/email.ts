import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // Render's containers don't support outbound IPv6; without this, Node can resolve Gmail's
  // SMTP host to an IPv6 address first and fail with ENETUNREACH. `family` is a real,
  // supported connection option (nodemailer forwards it to the underlying tls.connect call)
  // that @types/nodemailer just doesn't model — hence the cast.
  family: 4,
} as nodemailer.TransportOptions);

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: `"StartupForge AI" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify your StartupForge AI account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f4f4f8; border-radius: 8px; text-align: center;">
          ${code}
        </div>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: `"StartupForge AI" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your StartupForge AI password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Your password reset code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f4f4f8; border-radius: 8px; text-align: center;">
          ${code}
        </div>
        <p>This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}