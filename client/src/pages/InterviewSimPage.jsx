import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Send, CheckCircle,
  Mic, MicOff, Volume2, BarChart2, RotateCcw, Download,
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { interviewApi } from '../services/studentService';
import '../styles/student.css';

const STEPS = { INTRO: 'intro', ANSWERING: 'answering', RESULTS: 'results' };

export default function InterviewSimPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(STEPS.INTRO);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(120); // 2 mins per question
  const [timerActive, setTimerActive] = useState(false);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    interviewApi.getQuestions(topicId)
      .then(t => {
        setTopic(t);
        setAnswers(Array((t.questions || []).length).fill(''));
      })
      .catch(() => navigate('/student/interview'))
      .finally(() => setLoading(false));
  }, [topicId]);

  // Timer countdown
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => setTimer(p => p - 1), 1000);
    } else if (timer === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timer]);

  const startSession = () => {
    setStep(STEPS.ANSWERING);
    setCurrentQ(0);
    setTimer(120);
    setTimerActive(true);
  };

  const handleNextQuestion = () => {
    clearInterval(timerRef.current);
    const updated = [...answers];
    updated[currentQ] = currentAnswer;
    setAnswers(updated);
    setCurrentAnswer('');

    if (currentQ < (topic?.questions?.length || 0) - 1) {
      setCurrentQ(p => p + 1);
      setTimer(120);
    } else {
      setTimerActive(false);
      submitSession(updated);
    }
  };

  const submitSession = async (finalAnswers) => {
    setSubmitting(true);
    try {
      const questions = topic.questions || [];
      const answersPayload = questions.map((q, i) => ({
        question: typeof q === 'string' ? q : (q.question || q),
        answer: finalAnswers[i] || '',
      }));

      const result = await interviewApi.submitAnswer(
        topicId,
        topic.title,
        answersPayload,
        null,
        null,
        topic.category
      );
      setSessionResult(result);
      setStep(STEPS.RESULTS);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Text-to-speech for interview questions
  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadReport = () => {
    if (!sessionResult) return;
    const headers = ['Question #', 'Question', 'Your Answer', 'Score', 'Feedback'];
    const rows = (sessionResult.answers || []).map((a, i) => [
      i + 1,
      JSON.stringify(a.question || ''),
      JSON.stringify(a.answer || ''),
      JSON.stringify(`${a.feedback?.score || 0}/14`),
      JSON.stringify(a.feedback?.strength || ''),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(topic?.title || 'Interview_Session').replace(/\s+/g, '_')}_Results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Speech-to-text
  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Use Chrome.');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
        setCurrentAnswer(transcript);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const timerPct = (timer / 120) * 100;
  const timerColor = timer > 60 ? '#10b981' : timer > 30 ? '#f59e0b' : '#ef4444';

  if (loading) return <StudentLayout><div className="sp-loading">Loading topic...</div></StudentLayout>;
  if (!topic) return <StudentLayout><div className="sp-empty"><div className="sp-empty-title">Topic not found.</div></div></StudentLayout>;

  const questions = topic.questions || [];

  /* ─── INTRO ─── */
  if (step === STEPS.INTRO) {
    return (
      <StudentLayout>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <button className="btn-outline" style={{ marginBottom: 20, padding: '6px 14px', fontSize: 12 }} onClick={() => navigate('/student/interview')}>
            <ChevronLeft size={14} /> Back
          </button>
          <div className="sp-card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{topic.icon || '🎤'}</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0B1224', marginBottom: 8 }}>{topic.title}</h1>
            <p style={{ color: '#6b7280', marginBottom: 4 }}>{topic.category}</p>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 32 }}>
              {questions.length} questions · 2 minutes per question
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
              {[
                { icon: '🎯', title: 'AI Scoring', desc: 'Instant AI-generated feedback on each answer' },
                { icon: '🎤', title: 'Voice Input', desc: 'Answer by speaking or typing' },
                { icon: '📊', title: 'Detailed Report', desc: 'Score breakdown across content, clarity, structure' },
              ].map((f, i) => (
                <div key={i} style={{ background: '#f9fafb', borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0B1224', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{f.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 20px', marginBottom: 28, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0062ff', marginBottom: 8 }}>📋 Questions you'll be asked:</div>
              {questions.slice(0, 3).map((q, i) => (
                <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
                  {i + 1}. {typeof q === 'string' ? q : (q.question || q)}
                </div>
              ))}
              {questions.length > 3 && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>...and {questions.length - 3} more questions</div>}
            </div>

            <button className="btn-primary" style={{ padding: '14px 40px', fontSize: 15 }} onClick={startSession}>
              Start Interview
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  /* ─── ANSWERING ─── */
  if (step === STEPS.ANSWERING) {
    const question = questions[currentQ];
    const questionText = typeof question === 'string' ? question : (question?.question || question);
    return (
      <StudentLayout>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {/* Progress header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
              Question {currentQ + 1} of {questions.length}
            </div>
            {/* Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 60, height: 60, position: 'relative' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={timerColor} strokeWidth="3"
                    strokeDasharray={`${timerPct} 100`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: timerColor }}>
                  {formatTime(timer)}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#0062ff', borderRadius: 2, width: `${((currentQ) / questions.length) * 100}%`, transition: 'width 0.3s ease' }} />
          </div>

          <div className="sp-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0062ff', textTransform: 'uppercase', letterSpacing: 1 }}>
                {topic.category} · Question {currentQ + 1}
              </div>
              <button
                type="button"
                onClick={() => speakQuestion(questionText)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 6,
                  border: '1px solid #d1d5db', background: '#fff',
                  color: '#0062ff', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Volume2 size={14} /> Listen to Question
              </button>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B1224', lineHeight: 1.4, marginBottom: 24 }}>
              {questionText}
            </h2>

            {/* Answer area */}
            <textarea
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here... Be specific and use examples from your experience. Aim for 50–120 words."
              rows={7}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'Inter, sans-serif', resize: 'vertical', color: '#0B1224',
                background: '#f9fafb', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#0062ff'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Voice input */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                    borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: isRecording ? 'rgba(239,68,68,0.08)' : '#f9fafb',
                    borderColor: isRecording ? '#ef4444' : '#e5e7eb',
                    color: isRecording ? '#ef4444' : '#6b7280',
                    animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  }}
                >
                  {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                  {isRecording ? 'Stop Recording' : 'Voice Input'}
                </button>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  {currentAnswer.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <button
                className="btn-primary"
                onClick={handleNextQuestion}
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
              >
                {submitting ? 'Submitting...' : currentQ === questions.length - 1 ? (
                  <><Send size={14} /> Finish Interview</>
                ) : (
                  <>Next Question <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>

          {/* Skip */}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button onClick={handleNextQuestion} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 12, cursor: 'pointer' }}>
              Skip this question →
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  /* ─── RESULTS ─── */
  if (step === STEPS.RESULTS && sessionResult) {
    const fb = sessionResult.feedback || {};
    const overallScore = fb.overallScore || sessionResult.score || 0;
    const scoredAnswers = sessionResult.answers || [];

    const scoreColor = overallScore >= 75 ? '#10b981' : overallScore >= 50 ? '#f59e0b' : '#ef4444';
    const scoreLabel = overallScore >= 75 ? 'Excellent' : overallScore >= 50 ? 'Good' : overallScore >= 30 ? 'Fair' : 'Needs Work';

    return (
      <StudentLayout>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0B1224' }}>Interview Results</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-outline" style={{ fontSize: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 4 }} onClick={handleDownloadReport}>
                <Download size={13} /> Download Report
              </button>
              <button className="btn-outline" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => { setStep(STEPS.INTRO); setCurrentQ(0); setAnswers([]); setCurrentAnswer(''); }}>
                <RotateCcw size={13} /> Retry
              </button>
              <button className="btn-outline" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => navigate('/student/interview')}>
                <ChevronLeft size={13} /> All Topics
              </button>
            </div>
          </div>

          {/* Score card */}
          <div className="sp-card" style={{ background: 'linear-gradient(135deg, #0062ff 0%, #003dc4 100%)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>OVERALL SCORE</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{overallScore}<span style={{ fontSize: 20 }}>%</span></div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{scoreLabel}</div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {fb.breakdown ? Object.values(fb.breakdown || {}).map((b, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{b.score}/{b.max}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{b.label}</div>
                  </div>
                )) : null}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{scoredAnswers.length}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Questions</div>
                </div>
              </div>
            </div>

            {/* Strength */}
            {fb.strength && (
              <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff' }}>
                💡 {fb.strength}
              </div>
            )}

            {/* Tips */}
            {(fb.topTips || []).length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>KEY IMPROVEMENT TIPS:</div>
                {fb.topTips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#fbbf24', fontSize: 13 }}>→</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Individual Q&A feedback */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {scoredAnswers.map((a, i) => {
              const qFb = a.feedback || {};
              const qScore = qFb.percentage || 0;
              const qColor = qScore >= 75 ? '#10b981' : qScore >= 50 ? '#f59e0b' : '#ef4444';
              return (
                <div key={i} className="sp-card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>Q{i + 1}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        border: `3px solid ${qColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, color: qColor,
                      }}>
                        {qScore}%
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1224', marginBottom: 10, lineHeight: 1.4 }}>
                    {a.question}
                  </div>

                  {a.answer ? (
                    <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                      <strong style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' }}>Your answer: </strong>
                      {a.answer}
                    </div>
                  ) : (
                    <div style={{ background: '#fef2f2', borderRadius: 8, padding: '8px 14px', marginBottom: 12, fontSize: 13, color: '#ef4444' }}>
                      No answer provided.
                    </div>
                  )}

                  {qFb.strength && (
                    <div style={{ fontSize: 12, color: '#10b981', marginBottom: 8 }}>✅ {qFb.strength}</div>
                  )}

                  {(qFb.tips || []).length > 0 && (
                    <div>
                      {qFb.tips.map((tip, j) => (
                        <div key={j} style={{ fontSize: 12, color: '#f59e0b', marginBottom: 4 }}>⚡ {tip}</div>
                      ))}
                    </div>
                  )}

                  {/* Breakdown */}
                  {qFb.breakdown && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                      {Object.values(qFb.breakdown).map((b, j) => (
                        <div key={j} style={{ flex: 1, minWidth: 80, background: '#f9fafb', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#0B1224' }}>{b.score}/{b.max}</div>
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{b.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button className="btn-primary" onClick={() => navigate('/student/interview')}>
              <BarChart2 size={14} /> Back to Interview Center
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return <StudentLayout><div className="sp-loading">Loading...</div></StudentLayout>;
}
