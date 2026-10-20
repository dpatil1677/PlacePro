import { useState, useEffect } from 'react';
import { Award, CheckCircle, Lock, BookOpen, Code2, MessageSquare, FileText, Zap, TrendingUp, Calendar } from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { progressApi, aptitudeApi, codingApi, interviewApi } from '../services/studentService';
import '../styles/student.css';

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [aptitudeHistory, setAptitudeHistory] = useState([]);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      progressApi.get(),
      progressApi.getAchievements(),
      aptitudeApi.getResults().catch(() => []),
      interviewApi.getSessions().catch(() => []),
    ])
      .then(([p, a, apt, intv]) => {
        setProgress(p);
        setAchievements(a);
        setAptitudeHistory(Array.isArray(apt) ? apt : []);
        setInterviewHistory(Array.isArray(intv) ? intv : []);
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

      {/* Main Grid: Roadmap & Recent Activity (70%) on Left, Achievements (30%) on Right */}
      <div className="progress-layout">
        {/* Left Column (70%): Preparation Roadmap followed by Recent Activity */}
        <div className="progress-left-col">
          {/* Placement Preparation Roadmap Card */}
          <div className="sp-card" style={{ marginBottom: '24px' }}>
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

          {/* Recent Activity Card (Directly below Roadmap in the left column) */}
          {(aptitudeHistory.length > 0 || interviewHistory.length > 0) && (
            <div className="sp-card">
              <div className="sp-card-header">
                <div>
                  <div className="sp-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={16} color="#0062ff" /> Recent Activity
                  </div>
                  <div className="sp-card-subtitle">Your latest test attempts and interview sessions</div>
                </div>
              </div>
              <div className="sp-card-body" style={{ padding: '0 16px 16px' }}>
                {/* Aptitude history */}
                {aptitudeHistory.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, paddingTop: 16 }}>
                      Aptitude Test History
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {aptitudeHistory.slice(0, 6).map((r, i) => {
                        const scoreColor = r.score >= 70 ? '#10b981' : r.score >= 40 ? '#f59e0b' : '#ef4444';
                        const date = r.date ? new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 8, gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                              <BookOpen size={15} color="#0062ff" style={{ flexShrink: 0 }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1224', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.testTitle || 'Aptitude Test'}</div>
                                {date && <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Calendar size={10} /> {date}</div>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <span style={{ fontSize: 12, color: '#9ca3af' }}>{r.correct}/{r.total} correct</span>
                              <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor, background: `${scoreColor}12`, padding: '3px 10px', borderRadius: 20 }}>
                                {r.score}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Interview history */}
                {interviewHistory.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, paddingTop: aptitudeHistory.length > 0 ? 0 : 16 }}>
                      Interview Practice History
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {interviewHistory.slice(0, 5).map((s, i) => {
                        const fb = s.feedback || {};
                        const score = fb.overallScore || s.score || 0;
                        const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
                        const date = s.completedAt ? new Date(s.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 8, gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                              <MessageSquare size={15} color="#7c3aed" style={{ flexShrink: 0 }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1224', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.topicTitle || 'Interview Session'}</div>
                                {date && <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Calendar size={10} /> {date}</div>}
                              </div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor, background: `${scoreColor}12`, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>
                              {score}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (30%): Achievements */}
        <div className="progress-right-col">
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
