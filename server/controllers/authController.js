import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { sendOtpEmail } from '../utils/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USERS_FILE = join(__dirname, '../data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'placepro_dev_secret_2026';

function readUsersBackup() {
  try {
    return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeUsersBackup(users) {
  try {
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Failed to write users backup', e);
  }
}

/**
 * Compare password handling both bcrypt hashed and legacy plaintext.
 */
async function verifyPassword(inputPassword, storedPassword) {
  if (!storedPassword || !inputPassword) return false;
  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
    try {
      return await bcrypt.compare(inputPassword, storedPassword);
    } catch {
      return false;
    }
  }
  return inputPassword === storedPassword;
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // 1. Try to find user in Prisma database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. Fallback to users.json if not yet in DB
    if (!user) {
      const backupUsers = readUsersBackup();
      const backupUser = backupUsers.find((u) => u.email === email);
      if (backupUser) {
        const isMatch = await verifyPassword(password, backupUser.password);
        if (isMatch) {
          // Sync to database
          user = await prisma.user.create({
            data: {
              id: String(backupUser.id),
              email: backupUser.email,
              password: backupUser.password,
              role: backupUser.role || 'student',
              name: backupUser.name,
              college: backupUser.college,
              branch: backupUser.branch,
              gradYear: backupUser.gradYear,
            },
          });
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        college: user.college,
        branch: user.branch,
        gradYear: user.gradYear,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    // Offline backup fallback
    const users = readUsersBackup();
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        college: user.college,
        branch: user.branch,
        gradYear: user.gradYear,
      },
    });
  }
};

export const register = async (req, res) => {
  const { name, email, password, college, branch, gradYear } = req.body;

  if (!name || !email || !password || !college || !branch || !gradYear) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash password with bcrypt for new registrations
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = String(Date.now());
    const newUser = await prisma.user.create({
      data: {
        id: newUserId,
        email,
        password: hashedPassword,
        role: 'student',
        name,
        college,
        branch,
        gradYear,
      },
    });

    // Create initial student directory entry
    await prisma.student.create({
      data: {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        branch: newUser.branch || 'General',
        gradYear: newUser.gradYear || '2026',
        readiness: 0,
        status: 'Active',
        avatar: newUser.name[0]?.toUpperCase() || 'S',
      },
    }).catch(() => {});

    // Create initial progress entry
    await prisma.progress.create({
      data: {
        userId: newUser.id,
        readinessScore: 0,
        resumeProgress: 0,
        aptitudeProgress: 0,
        codingProgress: 0,
        interviewProgress: 0,
      },
    }).catch(() => {});

    // Sync to backup JSON
    const users = readUsersBackup();
    users.push({
      id: newUser.id,
      email: newUser.email,
      password: hashedPassword,
      role: newUser.role,
      name: newUser.name,
      college: newUser.college,
      branch: newUser.branch,
      gradYear: newUser.gradYear,
    });
    writeUsersBackup(users);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        college: newUser.college,
        branch: newUser.branch,
        gradYear: newUser.gradYear,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Failed to create account.' });
  }
};

/**
 * Step 1: Send a 6-digit OTP to the registered user's email.
 */
export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Verify user exists in database or backup
    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      const backupUsers = readUsersBackup();
      user = backupUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({
        message: 'No registered account found with this institutional email.',
      });
    }

    // 2. Check rate limit / cooldown (60 seconds between resends)
    const existingOtp = await prisma.passwordResetOtp.findUnique({
      where: { email: cleanEmail },
    });

    if (existingOtp && existingOtp.updatedAt) {
      const msSinceLastSend = Date.now() - new Date(existingOtp.updatedAt).getTime();
      const COOLDOWN_MS = 60 * 1000;
      if (msSinceLastSend < COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((COOLDOWN_MS - msSinceLastSend) / 1000);
        return res.status(429).json({
          message: `Please wait ${remainingSeconds}s before requesting a new code.`,
          retryAfter: remainingSeconds,
        });
      }
    }

    // 3. Generate cryptographically secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();

    // 4. Send OTP via Nodemailer before saving cooldown record
    await sendOtpEmail(cleanEmail, rawOtp);

    // 5. Hash the OTP and save/upsert OTP record in SQLite only after email succeeds
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    await prisma.passwordResetOtp.upsert({
      where: { email: cleanEmail },
      update: {
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
        resetToken: null,
        updatedAt: new Date(),
      },
      create: {
        email: cleanEmail,
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
        resetToken: null,
      },
    });

    // 6. Security: never return raw OTP in response
    return res.json({
      success: true,
      message: 'Verification code sent to your email.',
      email: cleanEmail,
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({
      message: err.message?.includes('Email delivery failed')
        ? 'Failed to deliver verification email. Please check your email address or contact support.'
        : 'Server error processing password recovery. Please try again later.',
    });
  }
};

/**
 * Step 2: Verify the 6-digit OTP.
 */
export const verifyPasswordResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and verification code are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = String(otp).trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).json({ message: 'Please enter a valid 6-digit numeric code.' });
  }

  try {
    const record = await prisma.passwordResetOtp.findUnique({
      where: { email: cleanEmail },
    });

    if (!record) {
      return res.status(400).json({
        message: 'No active recovery request found. Please request a new verification code.',
      });
    }

    // Check expiration (5 minutes)
    if (new Date() > new Date(record.expiresAt)) {
      return res.status(400).json({
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Check maximum attempts (max 5 attempts to protect against brute force)
    if (record.attempts >= 5) {
      return res.status(429).json({
        message: 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

    // Verify OTP against hashed record
    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
    if (!isMatch) {
      const newAttempts = record.attempts + 1;
      await prisma.passwordResetOtp.update({
        where: { email: cleanEmail },
        data: { attempts: newAttempts },
      });

      const remaining = Math.max(0, 5 - newAttempts);
      return res.status(400).json({
        message:
          remaining > 0
            ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            : 'Too many incorrect attempts. Please request a new verification code.',
        remainingAttempts: remaining,
      });
    }

    // Verified! Generate single-use signed reset token valid for 15 minutes
    const resetToken = jwt.sign(
      { email: cleanEmail, purpose: 'placepro_password_reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    await prisma.passwordResetOtp.update({
      where: { email: cleanEmail },
      data: {
        verified: true,
        resetToken,
      },
    });

    return res.json({
      success: true,
      message: 'Code verified successfully.',
      resetToken,
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ message: 'Server error verifying code. Please try again.' });
  }
};

/**
 * Step 3: Reset password using the verified reset token.
 */
export const resetPasswordWithOtp = async (req, res) => {
  const { email, resetToken, newPassword, confirmPassword } = req.body;

  if (!email || !resetToken || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    // 1. Verify reset token JWT
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
      if (decoded.email !== cleanEmail || decoded.purpose !== 'placepro_password_reset') {
        throw new Error('Token payload mismatch');
      }
    } catch {
      return res.status(401).json({
        message: 'Invalid or expired password reset session. Please request a new verification code.',
      });
    }

    // 2. Verify against database record
    const record = await prisma.passwordResetOtp.findUnique({
      where: { email: cleanEmail },
    });

    if (!record || !record.verified || record.resetToken !== resetToken) {
      return res.status(401).json({
        message: 'Unauthorized password reset request. Please verify your email again.',
      });
    }

    // 3. Hash new password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update in Prisma SQLite database
    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (user) {
      await prisma.user.update({
        where: { email: cleanEmail },
        data: { password: hashedPassword },
      });
    }

    // 5. Sync to backup users.json
    const backupUsers = readUsersBackup();
    const backupIndex = backupUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (backupIndex !== -1) {
      backupUsers[backupIndex].password = hashedPassword;
      writeUsersBackup(backupUsers);
    }

    // 6. Delete OTP session so it cannot be reused
    await prisma.passwordResetOtp.delete({
      where: { email: cleanEmail },
    }).catch(() => {});

    return res.json({
      success: true,
      message: 'Your password has been successfully updated.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
};

/**
 * Legacy alias for /forgot-password
 */
export const forgotPassword = sendPasswordResetOtp;
