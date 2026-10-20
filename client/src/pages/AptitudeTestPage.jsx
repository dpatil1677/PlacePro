import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { aptitudeApi } from '../services/studentService';
import '../styles/student.css';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function AptitudeTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    aptitudeApi.getTest(id)
      .then((t) => {
        setTest(t);
        setTimeLeft(t.duration * 60);
      })
      .catch(() => setError('Unable to load test.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(async (currentAnswers) => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const r = await aptitudeApi.submitTest(id, currentAnswers);
      setResult(r);
      setSubmitted(true);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [id]);

  useEffect(() => {
    if (!test || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(answers);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [test, submitted, handleSubmit, answers]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const timerClass =
    timeLeft < 60 ? 'danger' : timeLeft < 120 ? 'warning' : '';

  if (loading) return <StudentLayout><div className="sp-loading">Loading test...</div></StudentLayout>;
  if (error) return <StudentLayout><div className="sp-empty"><div className="sp-empty-title">{error}</div></div></StudentLayout>;

  if (submitted && result) {
    const scoreColor = result.score >= 70 ? '#10b981' : result.score >= 40 ? '#f59e0b' : '#ef4444';
    const scoreLabel = result.score >= 70 ? '🎉 Great job!' : result.score >= 40 ? '👍 Good effort!' : '💪 Keep practicing!';
    return (
      <StudentLayout>
        <div className="test-page" style={{ maxWidth: 740 }}>
          {/* Score summary */}
          <div className="test-result-card" style={{ background: `linear-gradient(135deg, ${scoreColor}15 0%, #fff 100%)`, border: `1.5px solid ${scoreColor}30`, marginBottom: 20 }}>
            <div className="test-result-score-circle" style={{ borderColor: scoreColor }}>
              <div className="test-result-pct" style={{ color: scoreColor }}>{result.score}%</div>
              <div className="test-result-label">SCORE</div>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0B1224', marginBottom: '6px' }}>{scoreLabel}</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
              You got <strong style={{ color: '#10b981' }}>{result.correct}</strong> out of <strong>{result.total}</strong> questions correct.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{result.correct}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>CORRECT</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{result.total - result.correct}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>WRONG</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#9ca3af' }}>{result.total - Object.keys(answers).length}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>SKIPPED</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => navigate('/student/aptitude')}>
                Back to Aptitude
              </button>
              <button className="btn-outline" onClick={() => { setSubmitted(false); setResult(null); setAnswers({}); setCurrentQ(0); setTimeLeft(test.duration * 60); }}>
                Retake Test
              </button>
            </div>
          </div>

          {/* Question-by-question breakdown */}
          {(result.breakdown || []).length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0B1224', marginBottom: 12 }}>
                Question Breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.breakdown.map((b, idx) => {
                  const question = test.questions.find(q => q.id === b.id);
                  if (!question) return null;
                  return (
                    <div key={b.id} style={{
                      background: '#fff', borderRadius: 10, padding: '14px 16px',
                      border: `1.5px solid ${b.isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>Q{idx + 1}</span>
                        <span style={{
                          fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                          background: b.isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                          color: b.isCorrect ? '#10b981' : '#ef4444',
                        }}>
                          {b.isCorrect ? '✓ Correct' : b.selected !== undefined ? '✗ Wrong' : '— Skipped'}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1224', marginBottom: 10 }}>
                        {question.q}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(question.options || []).map((opt, i) => {
                          const isCorrect = i === b.correctAnswer;
                          const isSelected = i === b.selected;
                          return (
                            <span key={i} style={{
                              fontSize: 12, padding: '4px 12px', borderRadius: 20,
                              background: isCorrect ? 'rgba(16,185,129,0.1)' : isSelected && !isCorrect ? 'rgba(239,68,68,0.08)' : '#f9fafb',
                              border: `1px solid ${isCorrect ? '#10b981' : isSelected && !isCorrect ? '#ef4444' : '#e5e7eb'}`,
                              color: isCorrect ? '#10b981' : isSelected && !isCorrect ? '#ef4444' : '#6b7280',
                              fontWeight: isCorrect || isSelected ? 700 : 400,
                            }}>
                              {String.fromCharCode(65 + i)}. {opt}
                              {isCorrect ? ' ✓' : ''}{isSelected && !isCorrect ? ' ✗' : ''}
                            </span>
                          );
                        })}
                      </div>
                      {question.explanation && (
                        <div style={{ marginTop: 10, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151' }}>
                          💡 <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </StudentLayout>
    );
  }


  if (!test) return null;
  const q = test.questions[currentQ];
  const totalQ = test.questions.length;

  return (
    <StudentLayout>
      <div className="test-page">
        {/* Header */}
        <div className="test-header-bar">
          <div className="test-title-block">
            <div className="page-section-label">APTITUDE TEST</div>
            <h1 className="page-title" style={{ fontSize: '22px', marginBottom: 0 }}>{test.title}</h1>
          </div>
          <div className={`test-timer ${timerClass}`}>
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question */}
        <div className="test-question-card">
          <div className="test-q-num">Question {currentQ + 1} of {totalQ}</div>
          <div className="test-q-text">{q.q}</div>
          <div className="test-options">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`test-option ${answers[q.id] === i ? 'selected' : ''}`}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
              >
                <span className="test-option-letter">{OPTION_LETTERS[i]}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="test-nav-row">
          <button
            className="btn-outline"
            onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
            disabled={currentQ === 0}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <div className="test-q-dots">
            {test.questions.map((_, i) => (
              <div
                key={i}
                className={`test-q-dot ${i === currentQ ? 'current' : answers[test.questions[i].id] !== undefined ? 'answered' : ''}`}
                onClick={() => setCurrentQ(i)}
                title={`Q${i + 1}`}
              />
            ))}
          </div>

          {currentQ < totalQ - 1 ? (
            <button
              className="btn-primary"
              onClick={() => setCurrentQ((c) => Math.min(totalQ - 1, c + 1))}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => handleSubmit(answers)}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          )}
        </div>

        {/* Warning */}
        {Object.keys(answers).length < totalQ && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '13px', color: '#f97316' }}>
            <AlertTriangle size={15} />
            {totalQ - Object.keys(answers).length} question(s) unanswered. You can still submit.
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
