import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, BookOpen, Code2, MessageSquare, ChevronRight,
  Zap, AlertTriangle, ArrowUpRight, Flame, Trophy, Target,
  Bell, Briefcase, CheckCircle, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import StudentLayout from '../components/StudentLayout';
import { studentDashboardApi, studentDrivesApi, notificationsApi } from '../services/studentService';
import { authService } from '../services/authService';
import '../styles/dashboard.css';

const weeklyData = [
  { day: 'Mon', score: 45 },
  { day: 'Tue', score: 62 },
  { day: 'Wed', score: 38 },
  { day: 'Thu', score: 75 },
  { day: 'Fri', score: 68 },
  { day: 'Sat', score: 90 },
  { day: 'Sun', score: 85 },
];

function DriveStatusBadge({ status, applied }) {
  if (applied) return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>APPLIED</span>;
  return <span className={`badge ${status === 'Upcoming' ? 'badge-upcoming' : status === 'Ongoing' ? 'badge-active' : 'badge-past'}`}>{status?.toUpperCase()}</span>;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = authService.getUser();

  const [dashData, setDashData] = useState(null);
  const [drives, setDrives] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [applyMsg, setApplyMsg] = useState('');

  useEffect(() => {
    Promise.allSettled([
      studentDashboardApi.get(),
      studentDrivesApi.list(),
      notificationsApi.get(),
    ]).then(([dashRes, drivesRes, notifsRes]) => {
      if (dashRes.status === 'fulfilled') setDashData(dashRes.value);
      if (drivesRes.status === 'fulfilled') setDrives(drivesRes.value || []);
      if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value?.notifications || []);
      setLoading(false);
    });
  }, []);

  const handleApply = async (driveId, companyName) => {
    setApplyingId(driveId);
    setApplyMsg('');
    try {
      await studentDrivesApi.apply(driveId);
      setDrives(prev => prev.map(d => d.id === driveId ? { ...d, applied: true, applicationStatus: 'Applied' } : d));
      setApplyMsg(`Successfully applied to ${companyName}!`);
      setTimeout(() => setApplyMsg(''), 3000);
    } catch (ex) {
      setApplyMsg(ex.message || 'Could not apply.');
      setTimeout(() => setApplyMsg(''), 4000);
    } finally {
      setApplyingId(null);
    }
  };

  const progress = dashData ? {
    readinessScore: dashData.readinessScore || 0,
    resumeProgress: dashData.resumeProgress || 0,
    aptitudeProgress: dashData.aptitudeProgress || 0,
    codingProgress: dashData.codingProgress || 0,
    interviewProgress: dashData.interviewProgress || 0,
  } : null;

  const progressItems = [
    { label: 'Resume', pct: progress?.resumeProgress || 0, color: '#f97316', icon: <FileText size={16} color="#f97316" />, path: '/student/resume' },
    { label: 'Aptitude', pct: progress?.aptitudeProgress || 0, color: '#8b5cf6', icon: <Zap size={16} color="#8b5cf6" />, path: '/student/aptitude' },
    { label: 'Coding', pct: progress?.codingProgress || 0, color: '#3b82f6', icon: <Code2 size={16} color="#3b82f6" />, path: '/student/coding' },
    { label: 'Interview', pct: progress?.interviewProgress || 0, color: '#14b8a6', icon: <MessageSquare size={16} color="#14b8a6" />, path: '/student/interview' },
  ];

  const insights = [
    {
      icon: <AlertTriangle size={15} />, iconBg: 'rgba(0,98,255,0.1)', iconColor: '#0062ff',
      title: 'Strengthen Data Structures',
      desc: 'You have solved fewer Array and Tree problems. Focus here to boost your coding score.',
      btnLabel: 'Practice Now →', path: '/student/coding',
      show: (progress?.codingProgress || 0) < 50,
    },
    {
      icon: <AlertTriangle size={15} />, iconBg: 'rgba(249,115,22,0.1)', iconColor: '#f97316',
      title: 'Take a Mock Aptitude Test',
      desc: 'Consistent aptitude practice correlates with 40% better placement outcomes.',
      btnLabel: 'Start Test →', path: '/student/aptitude',
      show: (progress?.aptitudeProgress || 0) < 60,
    },
    {
      icon: <Zap size={15} />, iconBg: 'rgba(234,179,8,0.1)', iconColor: '#ca8a04',
      title: 'Complete Your Resume',
      desc: 'A complete resume gets 3x more recruiter attention. Add your projects section.',
      btnLabel: 'Update Resume →', path: '/student/resume',
      show: (progress?.resumeProgress || 0) < 80,
    },
  ].filter(i => i.show).slice(0, 3);

  const activeDrives = drives.filter(d => d.status === 'Upcoming' || d.status === 'Ongoing').slice(0, 4);
  const companyNames = [...new Set(drives.map(d => d.company))].slice(0, 12);

  return (
    <StudentLayout>
      {/* Toast */}
      {applyMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: applyMsg.includes('Successfully') ? '#0062ff' : '#ef4444',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontWeight: 600, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {applyMsg.includes('Successfully') ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {applyMsg}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left-col">
          {/* Hero Section */}
          <div className="dashboard-hero">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Placement Season 2025 is Live
            </div>
            <h1 className="hero-title">
              The smartest way to<br />
              <span className="text-red">secure your dream job.</span>
            </h1>
            <p className="hero-subtitle">
              Your AI-powered preparation hub — master aptitude, ace coding rounds,
              and nail every interview. Let's get you placed.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="stat-cards-grid">
            <div className="stat-card" onClick={() => navigate('/student/progress')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-label">
                <Target size={15} className="stat-red" /> READINESS SCORE
              </div>
              <div className="stat-card-value stat-red">
                {loading ? '...' : `${progress?.readinessScore || 0}%`}
              </div>
              <div className="stat-card-sub">Overall placement readiness</div>
            </div>

            <div className="stat-card" onClick={() => navigate('/student/progress')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-label">
                <Flame size={15} className="stat-orange" /> APTITUDE SCORE
              </div>
              <div className="stat-card-value stat-orange">
                {loading ? '...' : `${progress?.aptitudeProgress || 0}%`}
              </div>
              <div className="stat-card-sub">Best aptitude test score</div>
            </div>

            <div className="stat-card" onClick={() => navigate('/student/progress')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-label">
                <Trophy size={15} className="stat-green" /> INTERVIEW SCORE
              </div>
              <div className="stat-card-value stat-green">
                {loading ? '...' : `${progress?.interviewProgress || 0}%`}
              </div>
              <div className="stat-card-sub">Mock interview performance</div>
            </div>

            <div className="stat-card" onClick={() => navigate('/student/coding')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-label">
                <Code2 size={15} className="stat-blue" /> CODING SCORE
              </div>
              <div className="stat-card-value stat-blue">
                {loading ? '...' : `${progress?.codingProgress || 0}%`}
              </div>
              <div className="stat-card-sub">Problems solved progress</div>
            </div>
          </div>

          {/* Company Strip */}
          <div className="company-strip">
            <div className="company-strip-label">
              COMPANIES<br />HIRING
            </div>
            <div className="company-strip-list" onClick={() => navigate('/student/companies')} style={{ cursor: 'pointer' }}>
              {(companyNames.length > 0 ? companyNames : ['Flipkart', 'Infosys', 'TCS', 'Wipro', 'Accenture', 'Google', 'Microsoft', 'Amazon']).map((c, i) => (
                <span key={i} className="company-strip-item">{c}</span>
              ))}
            </div>
          </div>

          {/* Preparation Progress */}
          <div className="card dashboard-card">
            <div className="card-header-flex">
              <div>
                <div className="card-title">Preparation Progress</div>
                <div className="card-subtitle">Your performance across core modules (live from DB).</div>
              </div>
              <button className="card-header-link" onClick={() => navigate('/student/progress')}>
                Full report <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="card-body">
              {progressItems.map((p) => (
                <div
                  key={p.label}
                  className="progress-item"
                  onClick={() => navigate(p.path)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="progress-item-header">
                    <div className="progress-item-label">
                      <span className="progress-icon-wrapper">{p.icon}</span>
                      {p.label}
                    </div>
                    <div className="progress-item-pct">{p.pct}%</div>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${p.pct}%`, background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="card dashboard-card">
            <div className="card-header">
              <div className="card-title">Weekly Activity</div>
              <div className="card-subtitle">Practice intensity over the past 7 days</div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0062ff" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0062ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="score" stroke="#0062ff" strokeWidth={2.5} fill="url(#weeklyGrad)" dot={{ r: 4, fill: '#0062ff', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#0062ff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Drives from DB */}
          <div className="card dashboard-card">
            <div className="card-header-flex">
              <div>
                <div className="card-title">Placement Drives</div>
                <div className="card-subtitle">Live drives from database — apply directly</div>
              </div>
              <button className="card-header-link" onClick={() => navigate('/student/companies')}>
                View all <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="card-body">
              {loading ? (
                <p style={{ color: '#9ca3af', fontSize: 13, padding: '8px 0' }}>Loading drives...</p>
              ) : activeDrives.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 13, padding: '8px 0' }}>No active drives right now.</p>
              ) : activeDrives.map((d) => (
                <div
                  key={d.id}
                  className="drive-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/student/drives/${d.id}`)}
                >
                  <div className="drive-logo">
                    {(d.abbr || d.company?.slice(0, 2) || '??').toUpperCase()}
                  </div>
                  <div className="drive-info" style={{ flex: 1 }}>
                    <div className="drive-company" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {d.company}
                    </div>
                    <div className="drive-desc">{d.title}</div>
                    {d.eligibility && (
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Eligibility: {d.eligibility}</div>
                    )}
                  </div>
                  <div className="drive-meta">
                    <div className="drive-date">{d.date}</div>
                    <div className="drive-package">{d.package || 'TBD'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <DriveStatusBadge status={d.status} applied={d.applied} />
                    {!d.applied && d.status !== 'Completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(d.id, d.company);
                        }}
                        disabled={applyingId === d.id}
                        style={{
                          fontSize: 11, padding: '4px 10px', borderRadius: 20,
                          background: '#0062ff', color: '#fff', border: 'none',
                          cursor: 'pointer', fontWeight: 600,
                          opacity: applyingId === d.id ? 0.6 : 1,
                        }}
                      >
                        {applyingId === d.id ? '...' : 'Apply'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right-col">
          {/* AI Insights */}
          <div className="card dashboard-card">
            <div className="insights-header">
              <div className="insights-header-icon">
                <Zap size={15} color="#0062ff" />
              </div>
              <div>
                <div className="insights-header-title">AI Insights</div>
                <div className="insights-header-sub">Smart next steps for you</div>
              </div>
            </div>
            <div className="insights-body">
              {(insights.length > 0 ? insights : [{
                icon: <CheckCircle size={15} />, iconBg: 'rgba(16,185,129,0.1)', iconColor: '#10b981',
                title: 'Great Progress!',
                desc: 'You\'re well-prepared. Keep practicing to stay sharp.',
                btnLabel: 'Practice More →', path: '/student/progress',
              }]).map((ins) => (
                <div key={ins.title} className="insight-card">
                  <div className="insight-card-header">
                    <div className="insight-icon" style={{ background: ins.iconBg, color: ins.iconColor }}>
                      {ins.icon}
                    </div>
                    <div>
                      <div className="insight-title">{ins.title}</div>
                      <div className="insight-desc">{ins.desc}</div>
                    </div>
                  </div>
                  <button className="insight-btn" onClick={() => navigate(ins.path)}>
                    {ins.btnLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications from DB */}
          {notifications.length > 0 && (
            <div className="card dashboard-card">
              <div className="card-header-flex">
                <div>
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={15} color="#0062ff" /> Announcements
                  </div>
                  <div className="card-subtitle">Latest from admin</div>
                </div>
              </div>
              <div className="card-body" style={{ maxHeight: 280, overflowY: 'auto' }}>
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0062ff', background: 'rgba(0,98,255,0.1)', padding: '1px 6px', borderRadius: 20 }}>
                        {n.type}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0B1224', marginBottom: 3 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Applications */}
          {drives.filter(d => d.applied).length > 0 && (
            <div className="card dashboard-card">
              <div className="card-header-flex">
                <div>
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Briefcase size={15} color="#0062ff" /> My Applications
                  </div>
                  <div className="card-subtitle">Track your application status</div>
                </div>
              </div>
              <div className="card-body">
                {drives.filter(d => d.applied).map(d => {
                  const statusColor = {
                    Applied: '#0062ff', Shortlisted: '#f59e0b',
                    Interview: '#7c3aed', Selected: '#10b981', Rejected: '#ef4444',
                  }[d.applicationStatus] || '#6b7280';
                  return (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: '#f0f4ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, color: '#0062ff', flexShrink: 0,
                      }}>
                        {d.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1224' }}>{d.company}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{d.title?.slice(0, 30)}</div>
                      </div>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                        background: `${statusColor}18`, color: statusColor,
                      }}>
                        {d.applicationStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ready to Practice */}
          <div className="practice-card">
            <div className="practice-card-title">Ready to practice?</div>
            <div className="practice-card-sub">Jump straight into a timed session.</div>
            {[
              { label: 'Aptitude Test', icon: <BookOpen size={14} />, path: '/student/aptitude' },
              { label: 'Coding Challenge', icon: <Code2 size={14} />, path: '/student/coding' },
              { label: 'Mock Interview', icon: <MessageSquare size={14} />, path: '/student/interview' },
            ].map((p) => (
              <button key={p.label} className="practice-btn" onClick={() => navigate(p.path)}>
                <span className="practice-btn-icon">
                  {p.icon} {p.label}
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
