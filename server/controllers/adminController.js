import prisma from '../db.js';
import {
  getAllStudents as getBackupStudents,
  getStudentById as getBackupStudentById,
} from '../data/students.js';
import {
  getAllDrives as getBackupDrives,
} from '../data/drives.js';
import {
  getAllQuestions as getBackupQuestions,
} from '../data/questions.js';
import { getReports as getBackupReports } from '../data/reports.js';

/* ─────────────── STUDENTS ─────────────── */

export const listStudents = async (req, res) => {
  const { search } = req.query;
  try {
    const students = await prisma.student.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { branch: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ students });
  } catch (e) {
    console.error('listStudents error:', e);
    res.json({ students: getBackupStudents(search || '') });
  }
};

export const getStudent = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
    });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json({ student });
  } catch (e) {
    console.error('getStudent error:', e);
    const student = getBackupStudentById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json({ student });
  }
};

export const editStudent = async (req, res) => {
  try {
    const updated = await prisma.student.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ student: updated });
  } catch (e) {
    console.error('editStudent error:', e);
    res.status(404).json({ message: 'Student not found or update failed.' });
  }
};

export const removeStudent = async (req, res) => {
  try {
    await prisma.student.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Student removed.' });
  } catch (e) {
    console.error('removeStudent error:', e);
    res.status(404).json({ message: 'Student not found.' });
  }
};

/* ─────────────── DRIVES ─────────────── */

export const listDrives = async (req, res) => {
  try {
    const drives = await prisma.drive.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ drives });
  } catch (e) {
    console.error('listDrives error:', e);
    res.json({ drives: getBackupDrives() });
  }
};

export const getDrive = async (req, res) => {
  try {
    const drive = await prisma.drive.findUnique({
      where: { id: req.params.id },
    });
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    res.json({ drive });
  } catch (e) {
    console.error('getDrive error:', e);
    res.status(404).json({ message: 'Drive not found.' });
  }
};

export const addDrive = async (req, res) => {
  const { company, title, date, eligibility, package: pkg, status } = req.body;
  if (!company || !title || !date) {
    return res.status(400).json({ message: 'Company, title and date are required.' });
  }
  const abbr = company.slice(0, 2).toUpperCase();
  try {
    const drive = await prisma.drive.create({
      data: {
        id: `d${Date.now()}`,
        company,
        abbr,
        title,
        date,
        eligibility,
        package: pkg,
        status: status || 'Upcoming',
        registered: 0,
      },
    });
    res.status(201).json({ drive });
  } catch (e) {
    console.error('addDrive error:', e);
    res.status(500).json({ message: 'Failed to create drive.' });
  }
};

export const editDrive = async (req, res) => {
  try {
    const updated = await prisma.drive.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ drive: updated });
  } catch (e) {
    console.error('editDrive error:', e);
    res.status(404).json({ message: 'Drive not found.' });
  }
};

export const removeDrive = async (req, res) => {
  try {
    await prisma.drive.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Drive deleted.' });
  } catch (e) {
    console.error('removeDrive error:', e);
    res.status(404).json({ message: 'Drive not found.' });
  }
};

/* ─────────────── QUESTIONS ─────────────── */

export const listQuestions = async (req, res) => {
  const { search } = req.query;
  try {
    const questions = await prisma.question.findMany({
      where: search
        ? {
            OR: [
              { question: { contains: search } },
              { category: { contains: search } },
              { difficulty: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ questions });
  } catch (e) {
    console.error('listQuestions error:', e);
    res.json({ questions: getBackupQuestions(search || '') });
  }
};

export const getQuestion = async (req, res) => {
  try {
    const q = await prisma.question.findUnique({
      where: { id: req.params.id },
    });
    if (!q) return res.status(404).json({ message: 'Question not found.' });
    res.json({ question: q });
  } catch (e) {
    console.error('getQuestion error:', e);
    res.status(404).json({ message: 'Question not found.' });
  }
};

export const addQuestion = async (req, res) => {
  const { category, difficulty, question } = req.body;
  if (!category || !difficulty || !question) {
    return res.status(400).json({ message: 'Category, difficulty and question are required.' });
  }
  try {
    const created = await prisma.question.create({
      data: {
        id: `q${Date.now()}`,
        category,
        difficulty,
        question,
      },
    });
    res.status(201).json({ question: created });
  } catch (e) {
    console.error('addQuestion error:', e);
    res.status(500).json({ message: 'Failed to create question.' });
  }
};

export const editQuestion = async (req, res) => {
  try {
    const updated = await prisma.question.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ question: updated });
  } catch (e) {
    console.error('editQuestion error:', e);
    res.status(404).json({ message: 'Question not found.' });
  }
};

export const removeQuestion = async (req, res) => {
  try {
    await prisma.question.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Question deleted.' });
  } catch (e) {
    console.error('removeQuestion error:', e);
    res.status(404).json({ message: 'Question not found.' });
  }
};

/* ─────────────── REPORTS ─────────────── */

export const fetchReports = async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();
    const totalDrives = await prisma.drive.count();
    const totalQuestions = await prisma.question.count();
    const activeDrives = await prisma.drive.count({ where: { status: 'Ongoing' } });
    const upcomingDrives = await prisma.drive.count({ where: { status: 'Upcoming' } });

    res.json({
      summary: {
        totalStudents,
        totalDrives,
        totalQuestions,
        activeDrives,
        upcomingDrives,
        placementRate: '78.5%',
        averagePackage: '6.4 LPA',
      },
    });
  } catch (e) {
    console.error('fetchReports error:', e);
    res.json(getBackupReports());
  }
};
