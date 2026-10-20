import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code2, Flame, BarChart2, CheckCircle2 } from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { codingApi } from '../services/studentService';
import '../styles/student.css';

function diffClass(d) {
  return d === 'Easy' ? 'easy' : d === 'Medium' ? 'medium' : 'hard';
}

const TOPICS = ['All', 'Arrays', 'Strings', 'Dynamic Programming', 'Graphs', 'Trees', 'Math', 'Sorting'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export default function CodingPage() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');

  useEffect(() => {
    codingApi.listProblems()
      .then(setProblems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = problems.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.topic.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === 'All' || p.difficulty === diffFilter;
    const matchTopic = topicFilter === 'All' || p.topic === topicFilter;
    return matchSearch && matchDiff && matchTopic;
  });

  const solved = problems.filter((p) => p.solved);
  const easy   = solved.filter((p) => p.difficulty === 'Easy').length;
  const medium = solved.filter((p) => p.difficulty === 'Medium').length;
  const hard   = solved.filter((p) => p.difficulty === 'Hard').length;

  return (
    <StudentLayout>
      {/* Page Header */}
      <div className="page-header-row">
        <div className="page-header-left">
          <div className="page-section-label">DSA PRACTICE</div>
          <h1 className="page-title">Coding Challenges</h1>
          <p className="page-subtitle">Master Data Structures & Algorithms for technical interviews.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="sp-stat-row" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '24px' }}>
        {/* Total Solved */}
        <div className="sp-stat-card dark" style={{ alignItems: 'flex-start' }}>
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div className="sp-stat-label" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 0 }}>TOTAL SOLVED</div>
              <Code2 size={20} color="#0062ff" />
            </div>
            <div className="sp-stat-value" style={{ color: '#fff', fontSize: '40px', marginBottom: '6px' }}>
              {solved.length}
            </div>
            <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '10px' }}>
              <span style={{ color: '#4ade80' }}>E:{easy}</span>
              <span style={{ color: '#fbbf24' }}>M:{medium}</span>
              <span style={{ color: '#f87171' }}>H:{hard}</span>
            </div>
          </div>
        </div>
        {/* Streak */}
        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">STREAK</div>
            <div className="sp-stat-value orange">5 <span style={{ fontSize: '20px', fontWeight: 400 }}>days</span></div>
          </div>
          <Flame size={28} color="#f97316" style={{ opacity: 0.8 }} />
        </div>
        {/* Global Rank */}
        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">GLOBAL RANK</div>
            <div className="sp-stat-value">#990</div>
          </div>
          <BarChart2 size={28} color="#3b82f6" style={{ opacity: 0.8 }} />
        </div>
      </div>

      {/* Main: filter + table */}
      <div className="coding-layout">
        {/* Filter panel */}
        <div className="coding-filter-panel">
          <div className="coding-filter-section">
            <div className="coding-filter-label">DIFFICULTY</div>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                className={`coding-filter-btn ${diffFilter === d ? 'active' : ''}`}
                onClick={() => setDiffFilter(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="coding-filter-section">
            <div className="coding-filter-label">TOPICS</div>
            <div>
              {TOPICS.map((t) => (
                <span
                  key={t}
                  className={`coding-topic-chip ${topicFilter === t ? 'active' : ''}`}
                  onClick={() => setTopicFilter(t)}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Problem list */}
        <div className="coding-main-panel">
          <div className="coding-search-row">
            <div className="coding-search-wrap">
              <div className="sp-search-bar">
                <Search size={15} color="#9ca3af" />
                <input
                  placeholder="Search challenges..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="coding-count">{filtered.length} problems</div>
          </div>

          <div className="coding-table">
            <div className="coding-table-head">
              <div className="coding-table-head-cell">STATUS</div>
              <div className="coding-table-head-cell">TITLE</div>
              <div className="coding-table-head-cell">ACCEPTANCE</div>
              <div className="coding-table-head-cell">DIFFICULTY</div>
              <div className="coding-table-head-cell">ACTION</div>
            </div>

            {loading ? (
              <div className="sp-loading">Loading problems...</div>
            ) : filtered.length === 0 ? (
              <div className="sp-empty">
                <div className="sp-empty-title">No problems match your filters.</div>
              </div>
            ) : (
              filtered.map((p, idx) => (
                <div
                  key={p.id}
                  className="coding-table-row"
                  onClick={() => navigate(`/student/coding/${p.id}`)}
                >
                  {/* Status */}
                  <div>
                    <div className={`coding-status-icon ${p.solved ? 'solved' : ''}`}>
                      {p.solved && <CheckCircle2 size={12} />}
                    </div>
                  </div>
                  {/* Title */}
                  <div>
                    <div className="coding-prob-title">{idx + 1}. {p.title}</div>
                    <div className="coding-prob-tags">
                      <span className="coding-prob-tag">{p.topic}</span>
                      {p.companies?.map((c) => (
                        <span key={c} className="coding-prob-tag company">{c}</span>
                      ))}
                    </div>
                  </div>
                  {/* Acceptance */}
                  <div className="coding-acceptance">{p.acceptance}</div>
                  {/* Difficulty */}
                  <div>
                    <span className={`diff-badge ${diffClass(p.difficulty)}`}>{p.difficulty}</span>
                  </div>
                  {/* Action */}
                  <div>
                    <button
                      className="coding-action-btn"
                      onClick={(e) => { e.stopPropagation(); navigate(`/student/coding/${p.id}`); }}
                    >
                      {p.solved ? 'Redo' : 'Solve'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
