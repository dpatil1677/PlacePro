import { useState, useEffect } from 'react';
import { Award, CheckCircle, Lock, BookOpen, Code2, MessageSquare, FileText, Zap } from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { progressApi } from '../services/studentService';
import '../styles/student.css';

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      progressApi.get(),
      progressApi.getAchievements(),
    ])
      .then(([p, a]) => {
        setProgress(p);
        setAchievements(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StudentLayout><div className="sp-loading">Loading progress dashboard...</div></StudentLayout>;

  const readinessScore = progress?.readinessScore || 0;
  const resumeScore = progress?.resumeProgress || 0;
  const aptitudeScore = progress?.aptitudeProgress || 0;
  const codingScore = progress?.codingProgress || 0;
  const interviewScore = progress?.interviewProgress || 0;

  // SVG Circular progress math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <StudentLayout>
      <div className="page-header-row">
        <div className="page-header-left">
          <div className="page-section-label">ANALYTICS & GOALS</div>
          <h1 className="page-title">Learning Progress</h1>
          <p className="page-subtitle">Track your placement readiness score, preparation roadmap, and achievements.</p>
        </div>
      </div>

      {/* Readiness Overview Card */}
      <div className="readiness-card">
        <div className="readiness-circle">
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#0062ff"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="readiness-circle-text">
            <div className="readiness-circle-pct">{readinessScore}%</div>
            <div className="readiness-circle-label">READY</div>
          </div>
        </div>

        <div className="readiness-info">
          <div className="readiness-title">Placement Readiness Breakdown</div>
          <div className="readiness-desc">
            Your readiness score is dynamically calculated across all four core placement preparation areas.
          </div>

          <div className="readiness-modules">
            {/* Resume */}
            <div className="readiness-module">
              <div className="readiness-module-row">
                <span className="readiness-module-label">Resume Completion (20%)</span>
                <span className="readiness-module-pct">{resumeScore}%</span>
              </div>
              <div className="readiness-bar-track">
                <div className="readiness-bar-fill" style={{ width: `${resumeScore}%` }} />
              </div>
            </div>

            {/* Aptitude */}
            <div className="readiness-module">
              <div className="readiness-module-row">
                <span className="readiness-module-label">Aptitude Score (30%)</span>
                <span className="readiness-module-pct">{aptitudeScore}%</span>
              </div>
              <div className="readiness-bar-track">
                <div className="readiness-bar-fill" style={{ width: `${aptitudeScore}%` }} />
              </div>
            </div>

            {/* Coding */}
            <div className="readiness-module">
              <div className="readiness-module-row">
                <span className="readiness-module-label">Coding Proficiency (30%)</span>
                <span className="readiness-module-pct">{codingScore}%</span>
              </div>
              <div className="readiness-bar-track">
                <div className="readiness-bar-fill" style={{ width: `${codingScore}%` }} />
              </div>
            </div>

            {/* Interview */}
            <div className="readiness-module">
              <div className="readiness-module-row">
                <span className="readiness-module-label">Interview Practice (20%)</span>
                <span className="readiness-module-pct">{interviewScore}%</span>
              </div>
              <div className="readiness-bar-track">
                <div className="readiness-bar-fill" style={{ width: `${interviewScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Roadmap & Achievements */}
      <div className="progress-layout">
        {/* Left Column: Preparation Roadmap */}
        <div>
          <div className="sp-card" style={{ marginBottom: '20px' }}>
            <div className="sp-card-header">
              <div>
                <div className="sp-card-title">Placement Preparation Roadmap</div>
                <div className="sp-card-subtitle">Recommended step-by-step path to crack placement drives.</div>
              </div>
            </div>
            <div className="sp-card-body" style={{ padding: '16px' }}>
              {progress?.roadmap?.map((item) => (
                <div
                  key={item.id}
                  className={`roadmap-item ${item.status === 'active' ? 'active' : ''}`}
                >
                  <div className="roadmap-icon">
                    {item.status === 'active' ? (
                      <Zap size={16} color="#0062ff" />
                    ) : item.status === 'completed' ? (
                      <CheckCircle size={16} color="#16a34a" />
                    ) : (
                      <Lock size={16} />
                    )}
                  </div>
                  <div className="roadmap-info">
                    <div className="roadmap-category">{item.category}</div>
                    <div className="roadmap-title">{item.title}</div>
                  </div>
                  <div className="roadmap-hours">{item.hours}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Achievements */}
        <div>
          <div className="achievements-panel">
            <div className="achievements-title">
              <Award size={18} color="#0062ff" /> Achievements
            </div>
            <div className="achievements-grid">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`achievement-card ${ach.unlocked ? 'unlocked' : ''}`}
                  title={ach.desc}
                >
                  <div className="achievement-icon">{ach.icon}</div>
                  <div className="achievement-title">{ach.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
