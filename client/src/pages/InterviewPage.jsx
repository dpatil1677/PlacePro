import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ChevronRight, Lightbulb, Video } from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { interviewApi } from '../services/studentService';
import '../styles/student.css';

const CATEGORIES = ['Technical', 'HR & Culture', 'Behavioral'];

export default function InterviewPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Technical');
  const [topics, setTopics] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      interviewApi.listTopics(activeCategory),
      interviewApi.getSessions(),
    ])
      .then(([t, s]) => { setTopics(t); setSessions(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    setLoading(true);
    interviewApi.listTopics(activeCategory)
      .then(setTopics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filteredTopics = topics.filter((t) => t.category === activeCategory);

  return (
    <StudentLayout>
      {/* Page Header */}
      <div className="page-header-row">
        <div className="page-header-left">
          <div className="page-section-label">AI-POWERED</div>
          <h1 className="page-title">Interview Simulator</h1>
          <p className="page-subtitle">Practice and get instant, detailed AI feedback.</p>
        </div>
        <div className="page-header-right">
          <button
            className="btn-primary"
            onClick={() => {
              const firstTopic = filteredTopics[0];
              if (firstTopic) navigate(`/student/interview/${firstTopic.id}`);
            }}
          >
            <Video size={15} /> Start Mock Interview
          </button>
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

          {/* Topic grid */}
          {loading ? (
            <div className="sp-loading">Loading topics...</div>
          ) : filteredTopics.length === 0 ? (
            <div className="sp-empty">
              <div className="sp-empty-icon">🎤</div>
              <div className="sp-empty-title">No topics available for this category.</div>
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
                      <div className="interview-topic-count">{topic.questions.length} questions</div>
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
              'Record your answer using audio or text.',
              'AI analyzes your response for content and clarity.',
              'Get a score, model answer, and feedback.',
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
                sessions.slice(0, 5).map((s, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0B1224', marginBottom: '2px' }}>
                      {s.topicTitle}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#9ca3af' }}>
                      Score: {s.feedback.score}/{s.feedback.maxScore} ·{' '}
                      {new Date(s.submittedAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
