import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  listStudents, getStudent, addStudent, editStudent, removeStudent,
  listDrives, getDrive, addDrive, editDrive, removeDrive,
  listApplications, updateApplication, bulkUpdateApplications,
  listCompanies, getCompany, addCompany, editCompany, removeCompany,
  listQuestions, getQuestion, addQuestion, editQuestion, removeQuestion,
  listNotifications, createNotification, removeNotification,
  fetchReports,
  getActivityLogs,
  getAdminProfile, updateAdminPassword,
  // Aptitude test management
  listAptitudeTests, createAptitudeTest, updateAptitudeTest, deleteAptitudeTest, getAptitudeTestResults,
  // Coding problem management
  listCodingProblems, createCodingProblem, updateCodingProblem, deleteCodingProblem,
  // Interview topic management
  listInterviewTopics, createInterviewTopic, updateInterviewTopic, deleteInterviewTopic,
  // Student performance
  getStudentPerformance,
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

/* ── Dashboard ── */
router.get('/dashboard', getDashboardStats);

/* ── Students ── */
router.get('/students', listStudents);
router.get('/students/:id', getStudent);
router.get('/students/:studentId/performance', getStudentPerformance);
router.post('/students', addStudent);
router.put('/students/:id', editStudent);
router.delete('/students/:id', removeStudent);

/* ── Drives ── */
router.get('/drives', listDrives);
router.get('/drives/:id', getDrive);
router.post('/drives', addDrive);
router.put('/drives/:id', editDrive);
router.delete('/drives/:id', removeDrive);

/* ── Applications ── */
router.get('/applications', listApplications);
router.put('/applications/:id', updateApplication);
router.put('/applications/bulk/update', bulkUpdateApplications);

/* ── Companies ── */
router.get('/companies', listCompanies);
router.get('/companies/:id', getCompany);
router.post('/companies', addCompany);
router.put('/companies/:id', editCompany);
router.delete('/companies/:id', removeCompany);

/* ── Question Bank (interview-style Qs for admin view) ── */
router.get('/questions', listQuestions);
router.get('/questions/:id', getQuestion);
router.post('/questions', addQuestion);
router.put('/questions/:id', editQuestion);
router.delete('/questions/:id', removeQuestion);

/* ── Aptitude Tests (full content management) ── */
router.get('/aptitude-tests', listAptitudeTests);
router.post('/aptitude-tests', createAptitudeTest);
router.put('/aptitude-tests/:id', updateAptitudeTest);
router.delete('/aptitude-tests/:id', deleteAptitudeTest);
router.get('/aptitude-tests/results', getAptitudeTestResults);
router.get('/aptitude-tests/:testId/results', getAptitudeTestResults);

/* ── Coding Problems (full content management) ── */
router.get('/coding-problems', listCodingProblems);
router.post('/coding-problems', createCodingProblem);
router.put('/coding-problems/:id', updateCodingProblem);
router.delete('/coding-problems/:id', deleteCodingProblem);

/* ── Interview Topics (full content management) ── */
router.get('/interview-topics', listInterviewTopics);
router.post('/interview-topics', createInterviewTopic);
router.put('/interview-topics/:id', updateInterviewTopic);
router.delete('/interview-topics/:id', deleteInterviewTopic);

/* ── Notifications ── */
router.get('/notifications', listNotifications);
router.post('/notifications', createNotification);
router.delete('/notifications/:id', removeNotification);

/* ── Reports ── */
router.get('/reports', fetchReports);

/* ── Activity Logs ── */
router.get('/activity-logs', getActivityLogs);

/* ── Admin Settings ── */
router.get('/profile', getAdminProfile);
router.put('/password', updateAdminPassword);

export default router;
