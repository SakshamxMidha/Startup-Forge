interface Mail {
  to: string;
  subject: string;
  html: string;
}

// Render's free tier blocks all outbound SMTP ports (25, 465, 587), so no SMTP-based sender
// (Gmail/Nodemailer included) can work there. Brevo's transactional email API sends over
// HTTPS instead, which isn't blocked.
async function sendBrevoEmail(mail: Mail): Promise<void> {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY as string,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'StartupForge AI', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: mail.to }],
      subject: mail.subject,
      htmlContent: mail.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo email send failed (${response.status}): ${body}`);
  }
}

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  await sendBrevoEmail({
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
  await sendBrevoEmail({
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
