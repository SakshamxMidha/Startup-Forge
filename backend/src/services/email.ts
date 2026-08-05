import nodemailer from 'nodemailer';
import { resolve4 } from 'dns/promises';

const GMAIL_SMTP_HOST = 'smtp.gmail.com';

interface Mail {
  to: string;
  subject: string;
  html: string;
}

// Render's containers have no outbound IPv6 route. Letting Nodemailer connect to
// smtp.gmail.com by hostname leaves DNS resolution (and IPv6-vs-IPv4 selection) up to the
// OS/Node's resolver, which was still landing on an IPv6 address and failing with
// ENETUNREACH even with `family: 4` set. Resolving to a concrete IPv4 address ourselves and
// connecting directly to it sidesteps that entirely.
//
// The address is re-resolved on every send rather than cached — Google's IPs rotate, and a
// long-lived cached IP would just reintroduce the same class of failure later.
async function sendGmail(mail: Mail): Promise<void> {
  const addresses = await resolve4(GMAIL_SMTP_HOST);
  if (addresses.length === 0) {
    throw new Error(`DNS resolution for ${GMAIL_SMTP_HOST} returned no IPv4 addresses`);
  }

  const transporter = nodemailer.createTransport({
    host: addresses[0],
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    // Connecting by raw IP gives TLS nothing to check the certificate against by default —
    // servername pins verification back to the real hostname (the cert is issued for
    // smtp.gmail.com, not the IP), so certificate validation still works correctly.
    tls: { servername: GMAIL_SMTP_HOST },
  });

  await transporter.sendMail({
    from: `"StartupForge AI" <${process.env.GMAIL_USER}>`,
    ...mail,
  });
}

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  await sendGmail({
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
  await sendGmail({
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
