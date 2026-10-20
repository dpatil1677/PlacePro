import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit2, X, CheckCircle, Search,
  BookOpen, Code2, MessageSquare, ChevronDown, ChevronUp,
  Award, Download,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import {
  adminAptitudeApi,
  adminCodingApi,
  adminInterviewApi,
} from '../services/adminService';
import '../styles/admin.css';

/* ─── Shared helpers ─── */
function showToast(setFn, msg) {
  setFn(msg);
  setTimeout(() => setFn(''), 3000);
}

/* ════════════════════════════════════════
   APTITUDE TESTS TAB
════════════════════════════════════════ */
function AptitudeTestsTab() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = () => {
    setLoading(true);
    adminAptitudeApi.list()
      .then(d => setTests(d.tests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test?')) return;
    await adminAptitudeApi.remove(id);
    setTests(p => p.filter(t => t.id !== id));
    showToast(setToast, 'Test deleted.');
  };

  return (
    <div>
      {toast && <Toast msg={toast} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={14} /> New Test
        </button>
      </div>

      {loading ? (
        <div className="state-loading"><div className="state-icon">⏳</div><p>Loading...</p></div>
      ) : tests.length === 0 ? (
        <div className="state-empty">
          <div className="state-icon">📝</div>
          <h3>No aptitude tests yet</h3>
          <p>Create your first timed aptitude test for students.</p>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}>
            <Plus size={14} /> Create Test
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tests.map(t => (
            <div key={t.id} className="question-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className={`q-badge q-badge-${(t.category || 'aptitude').toLowerCase()}`}>{t.category}</span>
                    <span className={`q-badge q-badge-${(t.difficulty || 'medium').toLowerCase()}`}>{t.difficulty}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{t.duration} mins · {t.totalQuestions} Qs</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0B1224' }}>{t.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                  >
                    {expandedId === t.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button className="action-dots-btn" onClick={() => { setEditing(t); setShowModal(true); }}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn-icon-delete" onClick={() => handleDelete(t.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {expandedId === t.id && (
                <div style={{ marginTop: 12, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                  {(t.questionsData || []).map((q, i) => (
                    <div key={i} style={{ marginBottom: 10, padding: '8px 12px', background: '#f9fafb', borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 4 }}>
                        Q{i + 1}: {q.q}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(q.options || []).map((opt, j) => (
                          <span key={j} style={{
                            fontSize: 12, padding: '2px 10px', borderRadius: 20,
                            background: j === q.answer ? 'rgba(16,185,129,0.12)' : '#f3f4f6',
                            color: j === q.answer ? '#10b981' : '#6b7280',
                            fontWeight: j === q.answer ? 700 : 400,
                          }}>
                            {String.fromCharCode(65 + j)}. {opt}
                          </span>
                        ))}
                      </div>
                      {q.explanation && (
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>💡 {q.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AptitudeTestModal
          editing={editing}
          onClose={() => setShowModal(false)}
          onSave={(t) => {
            if (editing) setTests(p => p.map(x => x.id === t.id ? t : x));
            else setTests(p => [t, ...p]);
            showToast(setToast, editing ? 'Test updated!' : 'Test created!');
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function AptitudeTestModal({ editing, onClose, onSave }) {
  const [form, setForm] = useState({
    title: editing?.title || '',
    category: editing?.category || 'Quantitative',
    difficulty: editing?.difficulty || 'Medium',
    duration: editing?.duration || 15,
  });
  const [questions, setQuestions] = useState(
    editing?.questionsData || [{ id: 'q1', q: '', options: ['', '', '', ''], answer: 0, explanation: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const addQuestion = () => setQuestions(p => [
    ...p,
    { id: `q${Date.now()}`, q: '', options: ['', '', '', ''], answer: 0, explanation: '' }
  ]);

  const removeQuestion = (i) => setQuestions(p => p.filter((_, j) => j !== i));

  const updateQ = (i, field, val) => setQuestions(p => p.map((q, j) => j === i ? { ...q, [field]: val } : q));
  const updateOpt = (qi, oi, val) => setQuestions(p => p.map((q, j) => j === qi ? { ...q, options: q.options.map((o, k) => k === oi ? val : o) } : q));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || questions.length === 0) { setErr('Title and at least one question required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, duration: parseInt(form.duration), questionsData: questions };
      const res = editing
        ? await adminAptitudeApi.update(editing.id, payload)
        : await adminAptitudeApi.create(payload);
      onSave(res.test || { ...payload, id: Date.now().toString(), ...res });
    } catch (ex) {
      setErr(ex.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <span className="modal-title">{editing ? 'Edit' : 'Create'} Aptitude Test</span>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {err && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#ef4444', fontSize: 13 }}>{err}</div>}
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Quantitative Reasoning Test" />
              </div>
              <div className="form-row">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['Quantitative', 'Logical Reasoning', 'Verbal', 'Data Interpretation', 'Mixed'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Difficulty</label>
                <select className="form-select" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                  {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Duration (minutes)</label>
                <input className="form-input" type="number" value={form.duration} min={5} max={120} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: 8, marginBottom: 10, fontWeight: 700, fontSize: 13, color: '#374151' }}>
              Questions ({questions.length})
            </div>

            {questions.map((q, qi) => (
              <div key={qi} style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginBottom: 10, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>Question {qi + 1}</span>
                  {questions.length > 1 && (
                    <button type="button" className="btn-icon-delete" onClick={() => removeQuestion(qi)}><Trash2 size={12} /></button>
                  )}
                </div>
                <textarea className="form-input" value={q.q} onChange={e => updateQ(qi, 'q', e.target.value)} placeholder="Enter question text..." rows={2} style={{ marginBottom: 10 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: oi === q.answer ? '#10b981' : '#9ca3af', width: 16 }}>{String.fromCharCode(65 + oi)}.</span>
                      <input className="form-input" style={{ flex: 1, padding: '6px 10px' }} value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                      <input type="radio" name={`correct_${qi}`} checked={q.answer === oi} onChange={() => updateQ(qi, 'answer', oi)} title="Mark as correct" />
                    </div>
                  ))}
                </div>
                <input className="form-input" value={q.explanation || ''} onChange={e => updateQ(qi, 'explanation', e.target.value)} placeholder="Explanation (shown after test)..." style={{ fontSize: 12 }} />
              </div>
            ))}

            <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: 4 }} onClick={addQuestion}>
              <Plus size={14} /> Add Question
            </button>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Test'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   CODING PROBLEMS TAB
════════════════════════════════════════ */
function CodingProblemsTab() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');

  const load = () => {
    setLoading(true);
    adminCodingApi.list()
      .then(d => setProblems(d.problems || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem?')) return;
    await adminCodingApi.remove(id);
    setProblems(p => p.filter(x => x.id !== id));
    showToast(setToast, 'Problem deleted.');
  };

  const filtered = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === 'All' || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  return (
    <div>
      {toast && <Toast msg={toast} />}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} color="#9ca3af" />
          <input placeholder="Search problems..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Easy', 'Medium', 'Hard'].map(d => (
          <button key={d} className={`coding-filter-btn ${diffFilter === d ? 'active' : ''}`} onClick={() => setDiffFilter(d)}>{d}</button>
        ))}
        <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={14} /> New Problem
        </button>
      </div>

      {loading ? (
        <div className="state-loading"><div className="state-icon">⏳</div><p>Loading...</p></div>
      ) : filtered.length === 0 ? (
        <div className="state-empty">
          <div className="state-icon">💻</div>
          <h3>No problems yet</h3>
          <p>Add your first coding challenge.</p>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}><Plus size={14} /> Add Problem</button>
        </div>
      ) : (
        <div className="students-card">
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>TITLE</th>
                <th>DIFFICULTY</th>
                <th>CATEGORY</th>
                <th>TEST CASES</th>
                <th>SOLVED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0B1224' }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{(p.companies || []).slice(0, 3).join(', ')}</div>
                  </td>
                  <td><span className={`diff-badge ${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span></td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>{p.category}</td>
                  <td style={{ fontSize: 13 }}>{(p.testCases || []).length} cases</td>
                  <td style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>{p.solvedCount || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="action-dots-btn" onClick={() => { setEditing(p); setShowModal(true); }}><Edit2 size={14} /></button>
                      <button className="btn-icon-delete" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CodingProblemModal
          editing={editing}
          onClose={() => setShowModal(false)}
          onSave={(p) => {
            if (editing) setProblems(prev => prev.map(x => x.id === p.id ? p : x));
            else setProblems(prev => [p, ...prev]);
            showToast(setToast, editing ? 'Problem updated!' : 'Problem created!');
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function CodingProblemModal({ editing, onClose, onSave }) {
  const [form, setForm] = useState({
    title: editing?.title || '',
    difficulty: editing?.difficulty || 'Easy',
    category: editing?.category || 'Arrays',
    description: editing?.description || '',
    acceptance: editing?.acceptance || '',
    companies: (editing?.companies || []).join(', '),
  });
  const [testCases, setTestCases] = useState(
    editing?.testCases?.length ? editing.testCases : [{ input: '', expectedOutput: '' }]
  );
  const [starterJS, setStarterJS] = useState(editing?.starterCode?.javascript || '// Write your solution here\nfunction solution() {\n  \n}');
  const [starterPY, setStarterPY] = useState(editing?.starterCode?.python || '# Write your solution here\ndef solution():\n    pass');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const addTC = () => setTestCases(p => [...p, { input: '', expectedOutput: '' }]);
  const removeTC = (i) => setTestCases(p => p.filter((_, j) => j !== i));
  const updateTC = (i, field, val) => setTestCases(p => p.map((tc, j) => j === i ? { ...tc, [field]: val } : tc));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) { setErr('Title and description required.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        companies: form.companies.split(',').map(s => s.trim()).filter(Boolean),
        testCases,
        starterCode: { javascript: starterJS, python: starterPY },
        examples: [],
        constraints: [],
      };
      const res = editing
        ? await adminCodingApi.update(editing.id, payload)
        : await adminCodingApi.create(payload);
      onSave({ ...(res.problem || payload), id: res.problem?.id || editing?.id || Date.now().toString() });
    } catch (ex) {
      setErr(ex.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <span className="modal-title">{editing ? 'Edit' : 'Add'} Coding Problem</span>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {err && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#ef4444', fontSize: 13 }}>{err}</div>}
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Two Sum" />
              </div>
              <div className="form-row">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['Arrays', 'Strings', 'Dynamic Programming', 'Graphs', 'Trees', 'Math', 'Sorting', 'Linked List', 'Stack/Queue', 'Binary Search'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Difficulty</label>
                <select className="form-select" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                  {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Acceptance Rate</label>
                <input className="form-input" value={form.acceptance} onChange={e => setForm(f => ({ ...f, acceptance: e.target.value }))} placeholder="e.g. 65.3%" />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Companies (comma-separated)</label>
              <input className="form-input" value={form.companies} onChange={e => setForm(f => ({ ...f, companies: e.target.value }))} placeholder="e.g. Google, Amazon, Microsoft" />
            </div>
            <div className="form-row">
              <label className="form-label">Problem Description *</label>
              <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} placeholder="Describe the problem..." />
            </div>

            {/* Test Cases */}
            <div style={{ marginBottom: 10, fontWeight: 700, fontSize: 13, color: '#374151' }}>Test Cases ({testCases.length})</div>
            {testCases.map((tc, i) => (
              <div key={i} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px', marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 4 }}>Test Case {i + 1}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: '#6b7280' }}>Input</label>
                      <input className="form-input" style={{ marginTop: 3, padding: '6px 10px', fontSize: 12, fontFamily: 'monospace' }} value={tc.input} onChange={e => updateTC(i, 'input', e.target.value)} placeholder="e.g. nums = [2,7,11,15], target = 9" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: '#6b7280' }}>Expected Output</label>
                      <input className="form-input" style={{ marginTop: 3, padding: '6px 10px', fontSize: 12, fontFamily: 'monospace' }} value={tc.expectedOutput} onChange={e => updateTC(i, 'expectedOutput', e.target.value)} placeholder="e.g. [0,1]" />
                    </div>
                  </div>
                </div>
                {testCases.length > 1 && <button type="button" className="btn-icon-delete" onClick={() => removeTC(i)}><Trash2 size={12} /></button>}
              </div>
            ))}
            <button type="button" className="btn-secondary" style={{ marginBottom: 16 }} onClick={addTC}><Plus size={13} /> Add Test Case</button>

            {/* Starter Code */}
            <div style={{ marginBottom: 6, fontWeight: 700, fontSize: 13, color: '#374151' }}>Starter Code</div>
            <div className="form-row">
              <label className="form-label">JavaScript</label>
              <textarea className="form-input" style={{ fontFamily: 'monospace', fontSize: 12 }} value={starterJS} onChange={e => setStarterJS(e.target.value)} rows={4} />
            </div>
            <div className="form-row">
              <label className="form-label">Python</label>
              <textarea className="form-input" style={{ fontFamily: 'monospace', fontSize: 12 }} value={starterPY} onChange={e => setStarterPY(e.target.value)} rows={4} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Problem'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   INTERVIEW TOPICS TAB
════════════════════════════════════════ */
function InterviewTopicsTab() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = () => {
    setLoading(true);
    adminInterviewApi.list()
      .then(d => setTopics(d.topics || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this topic?')) return;
    await adminInterviewApi.remove(id);
    setTopics(p => p.filter(t => t.id !== id));
    showToast(setToast, 'Topic deleted.');
  };

  return (
    <div>
      {toast && <Toast msg={toast} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={14} /> New Topic
        </button>
      </div>

      {loading ? (
        <div className="state-loading"><div className="state-icon">⏳</div><p>Loading...</p></div>
      ) : topics.length === 0 ? (
        <div className="state-empty">
          <div className="state-icon">🎤</div>
          <h3>No interview topics yet</h3>
          <p>Create topics with questions for the interview simulator.</p>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}><Plus size={14} /> Create Topic</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topics.map(t => (
            <div key={t.id} className="question-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className={`q-badge q-badge-${t.category === 'Technical' ? 'technical' : t.category === 'Behavioral' ? 'behavioral' : 'hr'}`}>{t.category}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{(t.questions || []).length} questions · {t.sessionCount || 0} sessions</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0B1224' }}>{t.icon} {t.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }} onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                    {expandedId === t.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button className="action-dots-btn" onClick={() => { setEditing(t); setShowModal(true); }}><Edit2 size={14} /></button>
                  <button className="btn-icon-delete" onClick={() => handleDelete(t.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              {expandedId === t.id && (
                <div style={{ marginTop: 12, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                  {(t.questions || []).map((q, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: 8, marginBottom: 6, fontSize: 13, color: '#374151' }}>
                      <strong>{i + 1}.</strong> {typeof q === 'string' ? q : q.question || q.q || JSON.stringify(q)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <InterviewTopicModal
          editing={editing}
          onClose={() => setShowModal(false)}
          onSave={(t) => {
            if (editing) setTopics(p => p.map(x => x.id === t.id ? t : x));
            else setTopics(p => [t, ...p]);
            showToast(setToast, editing ? 'Topic updated!' : 'Topic created!');
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function InterviewTopicModal({ editing, onClose, onSave }) {
  const [form, setForm] = useState({
    title: editing?.title || '',
    category: editing?.category || 'Technical',
    icon: editing?.icon || '💻',
  });
  const [questions, setQuestions] = useState(
    (editing?.questions || []).map(q => typeof q === 'string' ? q : (q.question || q.q || ''))
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const addQ = () => setQuestions(p => [...p, '']);
  const removeQ = (i) => setQuestions(p => p.filter((_, j) => j !== i));
  const updateQ = (i, val) => setQuestions(p => p.map((q, j) => j === i ? val : q));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validQs = questions.filter(q => q.trim());
    if (!form.title || validQs.length === 0) { setErr('Title and at least one question required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, questions: validQs };
      const res = editing
        ? await adminInterviewApi.update(editing.id, payload)
        : await adminInterviewApi.create(payload);
      onSave({ ...(res.topic || payload), id: res.topic?.id || editing?.id || Date.now().toString(), questions: validQs });
    } catch (ex) {
      setErr(ex.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <span className="modal-title">{editing ? 'Edit' : 'Create'} Interview Topic</span>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {err && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#ef4444', fontSize: 13 }}>{err}</div>}
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. React & Frontend" />
              </div>
              <div className="form-row">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['Technical', 'HR & Culture', 'Behavioral'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Icon (emoji)</label>
                <input className="form-input" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="💻" />
              </div>
            </div>
            <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 13, color: '#374151' }}>Questions ({questions.length})</div>
            {questions.map((q, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#9ca3af', width: 20, flexShrink: 0 }}>{i + 1}.</span>
                <input className="form-input" style={{ flex: 1 }} value={q} onChange={e => updateQ(i, e.target.value)} placeholder="Enter interview question..." />
                {questions.length > 1 && <button type="button" className="btn-icon-delete" onClick={() => removeQ(i)}><Trash2 size={12} /></button>}
              </div>
            ))}
            <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: 4 }} onClick={addQ}><Plus size={14} /> Add Question</button>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Topic'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   TEST RESULTS & SUBMISSIONS TAB
════════════════════════════════════════ */
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

function TestResultsTab() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [selectedResult, setSelectedResult] = useState(null);

  const load = () => {
    setLoading(true);
    adminAptitudeApi.getResults()
      .then(d => setResults(d.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = results.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.studentEmail || '').toLowerCase().includes(q) ||
      (r.testTitle || '').toLowerCase().includes(q);
    const matchScore =
      scoreFilter === 'All' ? true :
      scoreFilter === 'Pass' ? r.score >= 70 :
      r.score < 70;
    return matchSearch && matchScore;
  });

  const handleDownload = () => {
    if (!results.length) return;
    const rows = results.map((r, i) => ({
      '#': i + 1,
      'Student Name': r.studentName,
      'Student Email': r.studentEmail,
      'Test Title': r.testTitle,
      'Score (%)': r.score + '%',
      'Correct': r.correct,
      'Total': r.total,
      'Date': new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }));
    downloadCSV(rows, 'PlacePro_Aptitude_Submissions.csv');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="sp-search-bar" style={{ width: 260 }}>
            <Search size={14} color="#9ca3af" />
            <input
              placeholder="Search by student or test..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['All', 'Pass', 'Needs Practice'].map(f => (
              <button
                key={f}
                onClick={() => setScoreFilter(f)}
                style={{
                  padding: '5px 12px', borderRadius: 6, border: '1px solid',
                  borderColor: scoreFilter === f ? '#0062ff' : '#e5e7eb',
                  background: scoreFilter === f ? '#0062ff' : '#fff',
                  color: scoreFilter === f ? '#fff' : '#6b7280',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-outline" onClick={handleDownload} disabled={!results.length} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={14} /> Export Results (CSV)
        </button>
      </div>

      {loading ? (
        <div className="state-loading"><div className="state-icon">⏳</div><p>Loading test submissions...</p></div>
      ) : filtered.length === 0 ? (
        <div className="state-empty">
          <div className="state-icon">📊</div>
          <h3>No test results yet</h3>
          <p>Student test attempts and scores will appear here in real time.</p>
        </div>
      ) : (
        <div className="students-card">
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>STUDENT</th>
                <th>TEST TITLE</th>
                <th>SCORE</th>
                <th>CORRECT / TOTAL</th>
                <th>DATE</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const scoreColor = r.score >= 70 ? '#10b981' : r.score >= 40 ? '#f59e0b' : '#ef4444';
                return (
                  <tr key={r.id || i}>
                    <td style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0B1224' }}>{r.studentName}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.studentEmail}</div>
                    </td>
                    <td style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{r.testTitle}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 12,
                        background: `${scoreColor}18`, color: scoreColor, fontWeight: 800, fontSize: 12,
                      }}>
                        {r.score}%
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>{r.correct} / {r.total}</td>
                    <td style={{ fontSize: 12, color: '#9ca3af' }}>
                      {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      {r.breakdown?.length > 0 && (
                        <button
                          className="btn-outline"
                          style={{ padding: '4px 10px', fontSize: 11 }}
                          onClick={() => setSelectedResult(r)}
                        >
                          View Breakdown
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedResult && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 640, maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <span className="modal-title">Test Breakdown — {selectedResult.studentName}</span>
              <button className="modal-close-btn" onClick={() => setSelectedResult(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, background: '#f9fafb', padding: '12px 16px', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Test</div>
                  <div style={{ fontWeight: 700, color: '#0B1224' }}>{selectedResult.testTitle}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Score</div>
                  <div style={{ fontWeight: 800, color: selectedResult.score >= 70 ? '#10b981' : '#ef4444' }}>{selectedResult.score}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Correct / Total</div>
                  <div style={{ fontWeight: 700 }}>{selectedResult.correct} / {selectedResult.total}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedResult.breakdown.map((b, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px', borderRadius: 8,
                      border: `1px solid ${b.isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                      background: b.isCorrect ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ color: '#374151' }}>Question #{idx + 1}</span>
                      <span style={{ color: b.isCorrect ? '#10b981' : '#ef4444' }}>
                        {b.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      Selected: <strong>{b.selected !== undefined ? `Option ${String.fromCharCode(65 + Number(b.selected))}` : 'None'}</strong> · Correct: <strong>Option {String.fromCharCode(65 + Number(b.correctAnswer))}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedResult(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ msg }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0062ff', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,98,255,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <CheckCircle size={15} /> {msg}
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE — 4 TABS
════════════════════════════════════════ */
const TABS = [
  { id: 'aptitude', label: 'Aptitude Tests', icon: <BookOpen size={15} /> },
  { id: 'coding', label: 'Coding Problems', icon: <Code2 size={15} /> },
  { id: 'interview', label: 'Interview Topics', icon: <MessageSquare size={15} /> },
  { id: 'results', label: 'Student Test Results', icon: <Award size={15} /> },
];

export default function AdminQuestionBank() {
  const [activeTab, setActiveTab] = useState('aptitude');

  return (
    <AdminLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Question Bank & Content</h1>
          <p>Manage aptitude tests, coding problems, interview topics, and monitor student test results.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f9fafb', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid #e5e7eb' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 13, transition: 'all 0.15s',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#0062ff' : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'aptitude' && <AptitudeTestsTab />}
      {activeTab === 'coding' && <CodingProblemsTab />}
      {activeTab === 'interview' && <InterviewTopicsTab />}
      {activeTab === 'results' && <TestResultsTab />}
    </AdminLayout>
  );
}

