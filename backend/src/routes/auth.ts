import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { signAccessToken, signRefreshToken, hashToken, verifyToken } from '../lib/jwt';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email';

const router = Router();

async function issueTokens(userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  const fifteenDaysFromNow = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt: fifteenDaysFromNow,
    },
  });

  return { accessToken, refreshToken };
}

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser && existingUser.emailVerified) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: { passwordHash, verificationCode, verificationCodeExpiresAt },
      })
    : await prisma.user.create({
        data: { email, passwordHash, verificationCode, verificationCodeExpiresAt },
      });

  try {
    await sendVerificationEmail(email, verificationCode);
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }

  res.status(201).json({
    message: 'Account created. Please check your email for a verification code.',
    userId: user.id,
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.emailVerified) {
    return res.status(403).json({ error: 'Please verify your email before logging in' });
  }

  const tokens = await issueTokens(user.id);
  res.json(tokens);
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  let decoded;
  try {
    decoded = verifyToken(refreshToken);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!storedToken) {
    return res.status(401).json({ error: 'Refresh token no longer valid' });
  }

  if (storedToken.revoked) {
    await prisma.refreshToken.updateMany({
      where: { userId: storedToken.userId, revoked: false },
      data: { revoked: true },
    });
    return res.status(401).json({ error: 'Refresh token reuse detected — all sessions revoked' });
  }

  if (storedToken.expiresAt < new Date()) {
    return res.status(401).json({ error: 'Refresh token no longer valid' });
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  const tokens = await issueTokens(decoded.userId);
  res.json(tokens);
});

router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.verificationCode || !user.verificationCodeExpiresAt) {
    return res.status(400).json({ error: 'No pending verification for this email' });
  }

  if (user.verificationCodeExpiresAt < new Date()) {
    return res.status(400).json({ error: 'Verification code expired' });
  }

  if (user.verificationCode !== code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationCode: null, verificationCodeExpiresAt: null },
  });

  const tokens = await issueTokens(user.id);
  res.json({ message: 'Email verified successfully', ...tokens });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const resetCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode, resetCodeExpiresAt },
    });

    try {
      await sendPasswordResetEmail(email, resetCode);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }

  res.json({ message: 'If an account exists for this email, a reset code has been sent.' });
});

router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, code, and new password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.resetCode || !user.resetCodeExpiresAt) {
    return res.status(400).json({ error: 'No pending reset for this email' });
  }

  if (user.resetCodeExpiresAt < new Date()) {
    return res.status(400).json({ error: 'Reset code expired' });
  }

  if (user.resetCode !== code) {
    return res.status(400).json({ error: 'Invalid reset code' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetCode: null, resetCodeExpiresAt: null },
  });

  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revoked: false },
    data: { revoked: true },
  });

  res.json({ message: 'Password reset successfully. Please log in with your new password.' });
});

export default router;  