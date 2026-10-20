import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getDashboard,
  listAptitudeTests, getAptitudeTest, submitAptitudeTest, getAptitudeResults,
  listCodingProblems, getCodingProblem, runCode, submitCode,
  listInterviewTopics, getInterviewQuestions, submitInterview, listInterviewSessions,
  getResume, updateResume, exportResume,
  listCompanies, getCompany,
  getProgress, getAchievements,
  listDrivesForStudent, getDrive, applyToDrive, getMyApplications,
  getStudentNotifications,
} from '../controllers/studentController.js';

const router = Router();

// All student routes require authentication
router.use(protect);

// Dashboard
router.get('/dashboard', getDashboard);

// Aptitude
router.get('/aptitude/tests', listAptitudeTests);
router.get('/aptitude/tests/:id', getAptitudeTest);
router.post('/aptitude/tests/:id/submit', submitAptitudeTest);
router.get('/aptitude/results', getAptitudeResults);

// Coding
router.get('/coding/problems', listCodingProblems);
router.get('/coding/problems/:id', getCodingProblem);
router.post('/coding/problems/:id/run', runCode);
router.post('/coding/problems/:id/submit', submitCode);

// Interview
router.get('/interview/topics', listInterviewTopics);
router.get('/interview/topics/:id/questions', getInterviewQuestions);
router.post('/interview/submit', submitInterview);
router.get('/interview/sessions', listInterviewSessions);

// Resume
router.get('/resume', getResume);
router.put('/resume', updateResume);
router.post('/resume/export', exportResume);

// Companies
router.get('/companies', listCompanies);
router.get('/companies/:id', getCompany);

// Drives (student-facing)
router.get('/drives', listDrivesForStudent);
router.get('/drives/:id', getDrive);
router.post('/drives/apply', applyToDrive);
router.get('/drives/applications', getMyApplications);

// Progress
router.get('/progress', getProgress);
router.get('/achievements', getAchievements);

// Notifications
router.get('/notifications', getStudentNotifications);

export default router;
