import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listStudents, getStudent, editStudent, removeStudent,
  listDrives, getDrive, addDrive, editDrive, removeDrive,
  listQuestions, getQuestion, addQuestion, editQuestion, removeQuestion,
  fetchReports,
} from '../controllers/adminController.js';

const router = Router();

// All admin routes require authentication
router.use(protect);

// Admin role guard middleware
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only.' });
  }
  next();
};
router.use(requireAdmin);

/* ── Students ── */
router.get('/students', listStudents);
router.get('/students/:id', getStudent);
router.put('/students/:id', editStudent);
router.delete('/students/:id', removeStudent);

/* ── Drives ── */
router.get('/drives', listDrives);
router.get('/drives/:id', getDrive);
router.post('/drives', addDrive);
router.put('/drives/:id', editDrive);
router.delete('/drives/:id', removeDrive);

/* ── Question Bank ── */
router.get('/questions', listQuestions);
router.get('/questions/:id', getQuestion);
router.post('/questions', addQuestion);
router.put('/questions/:id', editQuestion);
router.delete('/questions/:id', removeQuestion);

/* ── Reports ── */
router.get('/reports', fetchReports);

export default router;
