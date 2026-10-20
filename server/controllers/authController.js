import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';

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
      const backupUser = backupUsers.find((u) => u.email === email && u.password === password);
      if (backupUser) {
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

    if (!user || user.password !== password) {
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
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
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

    const newUserId = String(Date.now());
    const newUser = await prisma.user.create({
      data: {
        id: newUserId,
        email,
        password,
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
      password: newUser.password,
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
