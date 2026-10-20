import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckSquare, ChevronRight } from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { aptitudeApi } from '../services/studentService';
import '../styles/student.css';

function diffClass(d) {
  return d === 'Easy' ? 'easy' : d === 'Medium' ? 'medium' : 'hard';
}

function catClass(c) {
  return c?.toLowerCase() || 'quantitative';
}

export default function AptitudePage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([aptitudeApi.listTests(), aptitudeApi.getResults()])
      .then(([t, r]) => { setTests(t); setResults(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)
    : 0;

  return (
    <StudentLayout>
      {/* Page Header */}
      <div className="page-header-row">
        <div className="page-header-left">
          <div className="page-section-label">PRACTICE</div>
          <h1 className="page-title">Aptitude Center</h1>
          <p className="page-subtitle">Sharpen your reasoning, logic, and quantitative skills.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="sp-stat-row">
        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">AVG SCORE</div>
            <div className={`sp-stat-value ${avgScore > 0 ? 'blue' : ''}`}>{avgScore}%</div>
          </div>
          <div className="sp-stat-icon" style={{ background: 'rgba(0,98,255,0.08)' }}>
            <CheckSquare size={24} color="#0062ff" />
          </div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">TESTS TAKEN</div>
            <div className="sp-stat-value">{results.length}</div>
          </div>
          <div className="sp-stat-icon" style={{ background: 'rgba(59,130,246,0.08)' }}>
            <BookOpen size={24} color="#3b82f6" />
          </div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">AVAILABLE</div>
            <div className="sp-stat-value">{tests.length}</div>
          </div>
          <div className="sp-stat-icon" style={{ background: 'rgba(16,185,129,0.08)' }}>
            <Clock size={24} color="#10b981" />
          </div>
        </div>
      </div>

      {/* Main two-col */}
      <div className="sp-two-col">
        {/* Left: Tests */}
        <div>
          <div className="sp-card">
            <div className="sp-card-header">
              <div>
                <div className="sp-card-title">Available Tests</div>
                <div className="sp-card-subtitle">{tests.length} tests</div>
              </div>
            </div>
            <div className="sp-card-body">
              {loading ? (
                <div className="sp-loading">Loading tests...</div>
              ) : tests.length === 0 ? (
                <div className="sp-empty">
                  <div className="sp-empty-title">No tests available.</div>
                </div>
              ) : (
                <div className="apt-tests-list">
                  {tests.map((test) => (
                    <div key={test.id} className="apt-test-row">
                      <div className="apt-test-info">
                        <div className="apt-test-title">{test.title}</div>
                        <div className="apt-test-meta">
                          <span className={`cat-badge ${catClass(test.category)}`}>
                            {test.category}
                          </span>
                          <span className={`diff-badge ${diffClass(test.difficulty)}`}>
                            {test.difficulty}
                          </span>
                          <span className="apt-test-meta-item">
                            <CheckSquare size={11} /> {test.questions} Qs
                          </span>
                          <span className="apt-test-meta-item">
                            <Clock size={11} /> {test.duration} mins
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '12.5px' }}
                        onClick={() => navigate(`/student/aptitude/test/${test.id}`)}
                      >
                        Start Test <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div>
          <div className="sp-card">
            <div className="sp-card-header">
              <div>
                <div className="sp-card-title">Recent Results</div>
              </div>
            </div>
            <div className="sp-card-body">
              {results.length === 0 ? (
                <div className="sp-empty">
                  <div className="sp-empty-icon">📊</div>
                  <div className="sp-empty-title">No results yet. Take your first test!</div>
                </div>
              ) : (
                results.slice(0, 10).map((r, i) => (
                  <div key={i} className="apt-recent-result">
                    <div className="apt-result-row">
                      <div>
                        <div className="apt-result-name">{r.testTitle}</div>
                        <div className="apt-result-date">
                          {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          &nbsp;·&nbsp; {r.correct}/{r.total} correct
                        </div>
                      </div>
                      <div className="apt-result-score">{r.score}%</div>
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
