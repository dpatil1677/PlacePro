import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckSquare, ChevronRight, Search, Download, TrendingUp, BarChart2, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StudentLayout from '../components/StudentLayout';
import { aptitudeApi } from '../services/studentService';
import '../styles/student.css';

function diffClass(d) {
  return d === 'Easy' ? 'easy' : d === 'Medium' ? 'medium' : 'hard';
}

function catClass(c) {
  return c?.toLowerCase() || 'quantitative';
}

const CATEGORIES = ['All', 'Quantitative', 'Logical Reasoning', 'Verbal', 'Technical'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

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

export default function AptitudePage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedDiff, setSelectedDiff] = useState('All');

  useEffect(() => {
    Promise.all([aptitudeApi.listTests(), aptitudeApi.getResults()])
      .then(([t, r]) => {
        setTests(t || []);
        setResults(Array.isArray(r) ? r : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)
    : 0;

  const highestScore = results.length
    ? Math.max(...results.map(r => r.score))
    : 0;

  // Filtered tests
  const filteredTests = tests.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(search.toLowerCase()));
    const matchCat =
      selectedCat === 'All' ||
      (t.category && t.category.toLowerCase().includes(selectedCat.toLowerCase()));
    const matchDiff =
      selectedDiff === 'All' ||
      (t.difficulty && t.difficulty.toLowerCase() === selectedDiff.toLowerCase());
    return matchSearch && matchCat && matchDiff;
  });

  // Chart data: chronological order (oldest to newest)
  const chartData = [...results]
    .reverse()
    .map((r, i) => ({
      index: i + 1,
      name: `Test ${i + 1}`,
      title: r.testTitle || 'Aptitude Test',
      score: r.score,
      date: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    }));

  const handleDownloadReport = () => {
    if (!results.length) {
      alert('No test attempts to download yet.');
      return;
    }
    const reportData = results.map((r, i) => ({
      '#': i + 1,
      'Test Title': r.testTitle || 'Aptitude Test',
      'Score (%)': r.score + '%',
      'Correct Answers': r.correct,
      'Total Questions': r.total,
      'Date': new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }));
    downloadCSV(reportData, 'PlacePro_Aptitude_Results.csv');
  };

  return (
    <StudentLayout>
      {/* Page Header */}
      <div className="page-header-row">
        <div className="page-header-left">
          <div className="page-section-label">PRACTICE</div>
          <h1 className="page-title">Aptitude Center</h1>
          <p className="page-subtitle">Sharpen your reasoning, quantitative, and logical problem-solving skills.</p>
        </div>
        <div className="page-header-right">
          <button
            className="btn-outline"
            onClick={handleDownloadReport}
            disabled={!results.length}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Download Test Report
          </button>
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
            <div className="sp-stat-label">HIGHEST SCORE</div>
            <div className="sp-stat-value green">{highestScore}%</div>
          </div>
          <div className="sp-stat-icon" style={{ background: 'rgba(16,185,129,0.08)' }}>
            <Award size={24} color="#10b981" />
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
            <div className="sp-stat-label">AVAILABLE TESTS</div>
            <div className="sp-stat-value">{tests.length}</div>
          </div>
          <div className="sp-stat-icon" style={{ background: 'rgba(245,158,11,0.08)' }}>
            <Clock size={24} color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* Progress Chart (if user has taken tests) */}
      {results.length > 0 && (
        <div className="sp-card" style={{ marginBottom: 24, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0B1224', display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={16} color="#0062ff" /> Aptitude Performance Progress
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Score progression across your test attempts</div>
            </div>
            <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
              Latest: {results[0]?.score}%
            </div>
          </div>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0062ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0062ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Score']}
                  labelFormatter={(lbl, p) => p?.[0]?.payload?.title || lbl}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="score" stroke="#0062ff" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main two-col */}
      <div className="sp-two-col">
        {/* Left: Tests with Filters */}
        <div>
          <div className="sp-card">
            <div className="sp-card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="sp-card-title">Available Tests</div>
                  <div className="sp-card-subtitle">{filteredTests.length} of {tests.length} tests matching</div>
                </div>
              </div>

              {/* Search input */}
              <div className="sp-search-bar" style={{ width: '100%' }}>
                <Search size={14} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search tests by title or topic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Category pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      border: '1.5px solid',
                      borderColor: selectedCat === cat ? '#0062ff' : '#e5e7eb',
                      background: selectedCat === cat ? 'rgba(0,98,255,0.08)' : '#fff',
                      color: selectedCat === cat ? '#0062ff' : '#6b7280',
                      fontSize: 12,
                      fontWeight: selectedCat === cat ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Difficulty pills */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Difficulty:</span>
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDiff(diff)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 14,
                      border: '1px solid',
                      borderColor: selectedDiff === diff ? '#374151' : '#e5e7eb',
                      background: selectedDiff === diff ? '#374151' : '#fff',
                      color: selectedDiff === diff ? '#fff' : '#6b7280',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="sp-card-body">
              {loading ? (
                <div className="sp-loading">Loading tests...</div>
              ) : filteredTests.length === 0 ? (
                <div className="sp-empty">
                  <div className="sp-empty-title">No tests match your filters.</div>
                  <button
                    className="btn-outline"
                    style={{ marginTop: 8, fontSize: 12 }}
                    onClick={() => { setSearch(''); setSelectedCat('All'); setSelectedDiff('All'); }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="apt-tests-list">
                  {filteredTests.map((test) => (
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

        {/* Right: Test History */}
        <div>
          <div className="sp-card">
            <div className="sp-card-header">
              <div>
                <div className="sp-card-title">Test History</div>
                <div className="sp-card-subtitle">{results.length} total completed tests</div>
              </div>
            </div>
            <div className="sp-card-body">
              {results.length === 0 ? (
                <div className="sp-empty">
                  <div className="sp-empty-icon">📊</div>
                  <div className="sp-empty-title">No results yet. Take your first test!</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.slice(0, 15).map((r, i) => {
                    const scoreColor = r.score >= 70 ? '#10b981' : r.score >= 40 ? '#f59e0b' : '#ef4444';
                    return (
                      <div
                        key={i}
                        className="apt-recent-result"
                        style={{ borderLeft: `3.5px solid ${scoreColor}` }}
                      >
                        <div className="apt-result-row">
                          <div>
                            <div className="apt-result-name">{r.testTitle}</div>
                            <div className="apt-result-date">
                              {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              &nbsp;·&nbsp; {r.correct}/{r.total} correct
                            </div>
                          </div>
                          <div
                            className="apt-result-score"
                            style={{ color: scoreColor, fontWeight: 800 }}
                          >
                            {r.score}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
