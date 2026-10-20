import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import ResumePage from './pages/ResumePage';
import AptitudePage from './pages/AptitudePage';
import AptitudeTestPage from './pages/AptitudeTestPage';
import CodingPage from './pages/CodingPage';
import CodingProblemPage from './pages/CodingProblemPage';
import InterviewPage from './pages/InterviewPage';
import InterviewSimPage from './pages/InterviewSimPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import DriveDetailPage from './pages/DriveDetailPage';
import ProgressPage from './pages/ProgressPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminCompanies from './pages/AdminCompanies';
import AdminDrives from './pages/AdminDrives';
import AdminApplications from './pages/AdminApplications';
import AdminQuestionBank from './pages/AdminQuestionBank';
import AdminReports from './pages/AdminReports';
import AdminNotifications from './pages/AdminNotifications';
import AdminSettings from './pages/AdminSettings';
import ProtectedRoute from './components/ProtectedRoute';

function StudentRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="student">
      {children}
    </ProtectedRoute>
  );
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student routes */}
        <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/student/resume" element={<StudentRoute><ResumePage /></StudentRoute>} />
        <Route path="/student/aptitude" element={<StudentRoute><AptitudePage /></StudentRoute>} />
        <Route path="/student/aptitude/test/:id" element={<StudentRoute><AptitudeTestPage /></StudentRoute>} />
        <Route path="/student/coding" element={<StudentRoute><CodingPage /></StudentRoute>} />
        <Route path="/student/coding/:id" element={<StudentRoute><CodingProblemPage /></StudentRoute>} />
        <Route path="/student/interview" element={<StudentRoute><InterviewPage /></StudentRoute>} />
        <Route path="/student/interview/:topicId" element={<StudentRoute><InterviewSimPage /></StudentRoute>} />
        <Route path="/student/companies" element={<StudentRoute><CompaniesPage /></StudentRoute>} />
        <Route path="/student/companies/:id" element={<StudentRoute><CompanyDetailPage /></StudentRoute>} />
        <Route path="/student/drives/:id" element={<StudentRoute><DriveDetailPage /></StudentRoute>} />
        <Route path="/student/progress" element={<StudentRoute><ProgressPage /></StudentRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
        <Route path="/admin/companies" element={<AdminRoute><AdminCompanies /></AdminRoute>} />
        <Route path="/admin/drives" element={<AdminRoute><AdminDrives /></AdminRoute>} />
        <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
        <Route path="/admin/question-bank" element={<AdminRoute><AdminQuestionBank /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
        <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
