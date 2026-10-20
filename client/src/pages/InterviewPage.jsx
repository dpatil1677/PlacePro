import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ChevronRight, Lightbulb, Video, Search, Download, Award, CheckCircle, MessageSquare } from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { interviewApi } from '../services/studentService';
import '../styles/student.css';

const CATEGORIES = ['Technical', 'HR & Culture', 'Behavioral'];

function downloadCSV(data, filename) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function InterviewPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Technical');
  const [topics, setTopics] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      interviewApi.listTopics(activeCategory),
      interviewApi.getSessions(),
    ])
      .then(([t, s]) => {
        setTopics(t || []);
        setSessions(Array.isArray(s) ? s : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filteredTopics = topics.filter((t) => {
    const matchCat = t.category === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const avgScore = sessions.length
    ? Math.round(
        sessions.reduce((acc, s) => {
          const score = s.feedback?.overallScore ?? s.score ?? 0;
          return acc + score;
        }, 0) / sessions.length
      )
    : 0;

  const handleDownloadSessions = () => {
    if (!sessions.length) {
      alert('No interview sessions to export.');
      return;
    }
    const reportData = sessions.map((s, idx) => ({
      '#': idx + 1,
      'Topic': s.topicTitle || 'Interview Session',
      'Score (%)': (s.feedback?.overallScore ?? s.score ?? 0) + '%',
      'Questions Answered': s.feedback?.questionsAnswered ?? (Array.isArray(s.answers) ? s.answers.length : 1),
      'Evaluation': s.feedback?.strength || 'Completed',
      'Date': new Date(s.completedAt || s.submittedAt || Date.now()).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }));
    downloadCSV(reportData, 'PlacePro_Interview_Sessions.csv');
  };

  return (
    <StudentLayout>
      {/* Page Header */}
      <div className="page-header-row">
        <div className="page-header-left">
          <div className="page-section-label">AI-POWERED SIMULATOR</div>
          <h1 className="page-title">Interview Simulator</h1>
          <p className="page-subtitle">Practice realistic interview questions with audio/text answers and instant AI evaluations.</p>
        </div>
        <div className="page-header-right" style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-outline"
            onClick={handleDownloadSessions}
            disabled={!sessions.length}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> Download Sessions
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              const firstTopic = filteredTopics[0] || topics[0];
              if (firstTopic) navigate(`/student/interview/${firstTopic.id}`);
            }}
          >
            <Video size={15} /> Start Mock Interview
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="sp-stat-row" style={{ marginBottom: 24 }}>
        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">SESSIONS COMPLETED</div>
            <div className="sp-stat-value blue">{sessions.length}</div>
          </div>
          <div className="sp-stat-icon" style={{ background: 'rgba(0,98,255,0.08)' }}>
            <MessageSquare size={24} color="#0062ff" />
          </div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">AVERAGE INTERVIEW SCORE</div>
            <div className="sp-stat-value green">{avgScore}%</div>
          </div>
          <div className="sp-stat-icon" style={{ background: 'rgba(16,185,129,0.08)' }}>
            <Award size={24} color="#10b981" />
          </div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">AVAILABLE TOPICS</div>
            <div className="sp-stat-value">{topics.length}</div>
          </div>
          <div className="sp-stat-icon" style={{ background: 'rgba(59,130,246,0.08)' }}>
            <Code2 size={24} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* Main two-col layout */}
      <div className="sp-two-col wide-right">
        {/* Left: tabs + topic grid */}
        <div>
          {/* Category tabs */}
          <div className="interview-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`interview-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="sp-search-bar" style={{ marginBottom: 16 }}>
            <Search size={14} color="#9ca3af" />
            <input
              type="text"
              placeholder={`Search ${activeCategory} interview topics...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Topic grid */}
          {loading ? (
            <div className="sp-loading">Loading topics...</div>
          ) : filteredTopics.length === 0 ? (
            <div className="sp-empty">
              <div className="sp-empty-icon">🎤</div>
              <div className="sp-empty-title">No topics match your selection.</div>
            </div>
          ) : (
            <div className="interview-topic-grid">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  className="interview-topic-card"
                  onClick={() => navigate(`/student/interview/${topic.id}`)}
                >
                  <div className="interview-topic-left">
                    <div className="interview-topic-icon">
                      <Code2 size={16} />
                    </div>
                    <div>
                      <div className="interview-topic-title">{topic.title}</div>
                      <div className="interview-topic-count">{(topic.questions || []).length} questions</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#9ca3af" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div>
          {/* How it works */}
          <div className="interview-how-card">
            <div className="interview-how-title">
              <div className="interview-how-icon">
                <Lightbulb size={16} color="#0062ff" />
              </div>
              How it works
            </div>
            {[
              'Select a topic and question to practice.',
              'Answer via voice microphone or by typing.',
              'AI analyzes content depth, structure, and clarity.',
              'Receive actionable strengths and improvement tips.',
            ].map((step, i) => (
              <div key={i} className="interview-how-step">
                <div className="interview-how-num">{i + 1}</div>
                <div className="interview-how-text">{step}</div>
              </div>
            ))}
          </div>

          {/* Recent Sessions */}
          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-title">Recent Sessions</div>
            </div>
            <div className="sp-card-body">
              {sessions.length === 0 ? (
                <div className="sp-empty">
                  <div className="sp-empty-title">No sessions yet. Start practicing!</div>
                </div>
              ) : (
                sessions.slice(0, 6).map((s, i) => {
                  const fb = s.feedback || {};
                  const score = fb.overallScore ?? s.score ?? 0;
                  const sessionDate = s.completedAt || s.submittedAt;
                  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0B1224', marginBottom: '2px' }}>
                          {s.topicTitle || 'Interview Session'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#9ca3af' }}>
                          {sessionDate ? new Date(sessionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently'}
                          {fb.questionsAnswered ? ` · ${fb.questionsAnswered} Qs answered` : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>
                        {score}%
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
