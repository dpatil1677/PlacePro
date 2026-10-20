import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Upload, CheckCircle, XCircle } from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { codingApi } from '../services/studentService';
import Editor from '@monaco-editor/react';
import '../styles/student.css';

const LANGUAGES = ['javascript', 'python', 'java'];

function diffClass(d) {
  return d === 'Easy' ? 'easy' : d === 'Medium' ? 'medium' : 'hard';
}

export default function CodingProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('description');
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    codingApi.getProblem(id)
      .then((p) => {
        setProblem(p);
        setCode(p.starterCode?.[lang] || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (problem) setCode(problem.starterCode?.[lang] || '');
  }, [lang, problem]);

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const r = await codingApi.runCode(id, code, lang);
      setOutput({ type: 'success', text: r.output, runtime: r.runtime, memory: r.memory });
    } catch {
      setOutput({ type: 'error', text: 'Error running code.' });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionResult(null);
    try {
      const r = await codingApi.submitCode(id, code, lang);
      setSubmissionResult(r);
    } catch {
      setSubmissionResult({ status: 'Error', runtime: null });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <StudentLayout><div className="sp-loading">Loading problem...</div></StudentLayout>;
  if (!problem) return <StudentLayout><div className="sp-empty"><div className="sp-empty-title">Problem not found.</div></div></StudentLayout>;

  return (
    <StudentLayout>
      {/* Back nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <button
          className="btn-outline"
          style={{ padding: '6px 12px', fontSize: '12px' }}
          onClick={() => navigate('/student/coding')}
        >
          <ChevronLeft size={14} /> Back to Problems
        </button>
        <span className={`diff-badge ${diffClass(problem.difficulty)}`}>{problem.difficulty}</span>
        {problem.companies?.map((c) => (
          <span key={c} className="coding-prob-tag company">{c}</span>
        ))}
      </div>

      <div className="problem-page-layout">
        {/* Left: problem statement */}
        <div className="problem-panel">
          <div className="problem-panel-header">
            <div className="problem-panel-tabs">
              {['description', 'examples', 'constraints'].map((t) => (
                <button
                  key={t}
                  className={`problem-panel-tab ${tab === t ? 'active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="problem-panel-body">
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0B1224', marginBottom: '16px' }}>
              {problem.title}
            </h2>

            {tab === 'description' && (
              <div className="problem-description">
                {problem.description?.split('\n').map((line, i) => (
                  <p key={i}
                    dangerouslySetInnerHTML={{
                      __html: line.replace(/`([^`]+)`/g, '<code>$1</code>')
                    }}
                  />
                ))}
              </div>
            )}

            {tab === 'examples' && (
              <div>
                {problem.examples?.map((ex, i) => (
                  <div key={i} className="problem-example">
                    <div className="problem-example-label">Example {i + 1}</div>
                    <pre><strong>Input:</strong> {ex.input}</pre>
                    <pre><strong>Output:</strong> {ex.output}</pre>
                    {ex.explanation && (
                      <pre><strong>Explanation:</strong> {ex.explanation}</pre>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'constraints' && (
              <div className="problem-constraints">
                <div className="problem-constraints-title">Constraints</div>
                <ul>
                  {problem.constraints?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: code editor */}
        <div className="problem-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="problem-panel-header">
            <div className="code-editor-top" style={{ width: '100%' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0B1224' }}>Code Editor</div>
              <select
                className="lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="problem-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ flex: 1, minHeight: '400px', width: '100%', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
              <Editor
                height="100%"
                language={lang === 'c++' ? 'cpp' : lang}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  automaticLayout: true,
                  fontSize: 14,
                  wordWrap: 'on',
                  smoothScrolling: true,
                  padding: { top: 16, bottom: 16 },
                  tabSize: lang === 'python' ? 4 : 2,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>

            {/* Output */}
            {output && (
              <div className={`code-output ${output.type}`}>
                {output.text}
                {output.runtime && (
                  <div style={{ marginTop: '8px', opacity: 0.6 }}>
                    Runtime: {output.runtime} | Memory: {output.memory}
                  </div>
                )}
              </div>
            )}

            {/* Submission result */}
            {submissionResult && (
              <div
                className="code-output"
                style={{
                  borderLeft: `4px solid ${submissionResult.status === 'Accepted' ? '#4ade80' : '#f87171'}`,
                  color: submissionResult.status === 'Accepted' ? '#4ade80' : '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {submissionResult.status === 'Accepted'
                  ? <CheckCircle size={16} />
                  : <XCircle size={16} />}
                {submissionResult.status}
                {submissionResult.runtime && ` · ${submissionResult.runtime}`}
                {submissionResult.memory && ` · ${submissionResult.memory}`}
              </div>
            )}

            {/* Actions */}
            <div className="code-action-row">
              <button
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={handleRun}
                disabled={running}
              >
                <Play size={14} /> {running ? 'Running...' : 'Run Code'}
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                <Upload size={14} /> {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
