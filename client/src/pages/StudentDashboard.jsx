import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, BookOpen, Code2, MessageSquare, ChevronRight,
  Zap, AlertTriangle, ArrowUpRight, Flame, Trophy, Target
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import StudentLayout from '../components/StudentLayout';
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

const companies = [
  'Flipkart', 'Infosys', 'TCS', 'Wipro', 'Accenture',
  'Deloitte', 'Goldman Sachs', 'Morgan Stanley', 'Google', 'Microsoft', 'Amazon',
];

const drives = [
  {
    abbr: 'GO', company: 'Google', desc: 'Campus Recruitment Drive 2025 - Google STEP Intern',
    date: '25 Jul', pkg: '2.5 LPM stipend',
  },
  {
    abbr: 'IN', company: 'Infosys', desc: 'Mass Hiring Drive - Infosys InfyTQ',
    date: '18 Jul', pkg: '3.6 LPA',
  },
  {
    abbr: 'FL', company: 'Flipkart', desc: 'SDE Hiring - Flipkart',
    date: '5 Aug', pkg: '15-20 LPA',
  },
  {
    abbr: 'MI', company: 'Microsoft', desc: 'Microsoft University Recruitment',
    date: '15 Aug', pkg: '20-30 LPA',
  },
];

const progressItems = [
  { label: 'Resume', pct: 14, color: '#f97316', icon: <FileText size={16} color="#f97316" />, path: '/student/resume' },
  { label: 'Aptitude', pct: 0, color: '#8b5cf6', icon: <Zap size={16} color="#8b5cf6" />, path: '/student/aptitude' },
  { label: 'Coding', pct: 5, color: '#3b82f6', icon: <Code2 size={16} color="#3b82f6" />, path: '/student/coding' },
  { label: 'Interview', pct: 0, color: '#14b8a6', icon: <MessageSquare size={16} color="#14b8a6" />, path: '/student/interview' },
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  const insights = [
    {
      icon: <AlertTriangle size={15} />,
      iconBg: 'rgba(0,98,255,0.1)',
      iconColor: '#0062ff',
      title: 'Strengthen Data Structures',
      desc: 'You have solved fewer Array and Tree problems. Focus here to boost your coding score.',
      btnLabel: 'Practice Now →',
      path: '/student/coding',
    },
    {
      icon: <AlertTriangle size={15} />,
      iconBg: 'rgba(249,115,22,0.1)',
      iconColor: '#f97316',
      title: 'Take a Mock Aptitude Test',
      desc: 'Consistent aptitude practice correlates with 40% better placement outcomes.',
      btnLabel: 'Start Test →',
      path: '/student/aptitude',
    },
    {
      icon: <Zap size={15} />,
      iconBg: 'rgba(234,179,8,0.1)',
      iconColor: '#ca8a04',
      title: 'Complete Your Resume',
      desc: 'A complete resume gets 3x more recruiter attention. Add your projects section.',
      btnLabel: 'Update Resume →',
      path: '/student/resume',
    },
  ];

  return (
    <StudentLayout>
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
              <div className="stat-card-value stat-red">5%</div>
              <div className="stat-card-sub">Overall placement readiness</div>
            </div>

            <div className="stat-card" onClick={() => navigate('/student/progress')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-label">
                <Flame size={15} className="stat-orange" /> DAY STREAK
              </div>
              <div className="stat-card-value stat-orange">14</div>
              <div className="stat-card-sub">Consecutive days of practice</div>
            </div>

            <div className="stat-card" onClick={() => navigate('/student/progress')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-label">
                <Trophy size={15} className="stat-green" /> TOTAL POINTS
              </div>
              <div className="stat-card-value stat-green">100</div>
              <div className="stat-card-sub">Top 15% in your branch</div>
            </div>

            <div className="stat-card" onClick={() => navigate('/student/coding')} style={{ cursor: 'pointer' }}>
              <div className="stat-card-label">
                <Code2 size={15} className="stat-blue" /> PROBLEMS SOLVED
              </div>
              <div className="stat-card-value stat-blue">1</div>
              <div className="stat-card-sub">Coding challenges completed</div>
            </div>
          </div>

          {/* Company Strip */}
          <div className="company-strip">
            <div className="company-strip-label">
              COMPANIES<br />HIRING
            </div>
            <div className="company-strip-list" onClick={() => navigate('/student/companies')} style={{ cursor: 'pointer' }}>
              {companies.map((c, i) => (
                <span key={i} className="company-strip-item">{c}</span>
              ))}
            </div>
          </div>

          {/* Preparation Progress */}
          <div className="card dashboard-card">
            <div className="card-header-flex">
              <div>
                <div className="card-title">Preparation Progress</div>
                <div className="card-subtitle">Your performance across core modules.</div>
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
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#0062ff"
                    strokeWidth={2.5}
                    fill="url(#weeklyGrad)"
                    dot={{ r: 4, fill: '#0062ff', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#0062ff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Drives */}
          <div className="card dashboard-card">
            <div className="card-header-flex">
              <div>
                <div className="card-title">Upcoming Drives</div>
                <div className="card-subtitle">Companies visiting campus soon</div>
              </div>
              <button className="card-header-link" onClick={() => navigate('/student/companies')}>
                View all <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="card-body">
              {drives.map((d) => (
                <div key={d.company} className="drive-item" onClick={() => navigate('/student/companies')} style={{ cursor: 'pointer' }}>
                  <div className="drive-logo">{d.abbr}</div>
                  <div className="drive-info">
                    <div className="drive-company">{d.company}</div>
                    <div className="drive-desc">{d.desc}</div>
                  </div>
                  <div className="drive-meta">
                    <div className="drive-date">{d.date}</div>
                    <div className="drive-package">{d.pkg}</div>
                  </div>
                  <span className="badge badge-upcoming">UPCOMING</span>
                  <ChevronRight size={16} className="drive-chevron" />
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
              {insights.map((ins) => (
                <div key={ins.title} className="insight-card">
                  <div className="insight-card-header">
                    <div
                      className="insight-icon"
                      style={{ background: ins.iconBg, color: ins.iconColor }}
                    >
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

          {/* Recent Activity */}
          <div className="card dashboard-card">
            <div className="activity-header">
              <div className="card-title">Recent Activity</div>
            </div>
            <div className="activity-body">
              {[
                { title: 'Challenge Solved', sub: 'Solution accepted · 8 Jul, 11:30', points: '+100' },
                { title: 'Challenge Attempted', sub: 'Keep trying! · 8 Jul, 14:07', points: null },
              ].map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-icon">
                    <Code2 size={14} />
                  </div>
                  <div className="activity-info">
                    <div className="activity-title">{a.title}</div>
                    <div className="activity-time">{a.sub}</div>
                  </div>
                  {a.points && (
                    <div className="activity-points">{a.points}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
