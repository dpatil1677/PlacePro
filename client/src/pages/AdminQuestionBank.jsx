import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminQuestionsApi } from '../services/adminService';
import '../styles/admin.css';

function categoryClass(cat) {
  const map = {
    Behavioral: 'q-badge-behavioral',
    Technical:  'q-badge-technical',
    HR:         'q-badge-hr',
    Aptitude:   'q-badge-aptitude',
  };
  return map[cat] || 'q-badge-technical';
}

function difficultyClass(diff) {
  const map = {
    Easy:   'q-badge-easy',
    Medium: 'q-badge-medium',
    Hard:   'q-badge-hard',
  };
  return map[diff] || 'q-badge-medium';
}

export default function AdminQuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuestions = async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await adminQuestionsApi.list(q);
      setQuestions(data.questions || []);
    } catch {
      setError('Unable to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchQuestions(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Question Bank</h1>
          <p>Manage aptitude and interview questions.</p>
        </div>
      </div>

      {/* Search */}
      <div className="question-search-bar">
        <Search size={18} color="#9ca3af" />
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="state-loading">
          <div className="state-icon">⏳</div>
          <p>Loading questions...</p>
        </div>
      ) : error ? (
        <div className="state-error">
          <div className="state-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="state-empty">
          <div className="state-icon">🔍</div>
          <h3>No questions found</h3>
          <p>{search ? `No results for "${search}".` : 'No questions in the bank yet.'}</p>
        </div>
      ) : (
        <div>
          {questions.map((q) => (
            <div key={q.id} className="question-card">
              <div className="question-badges">
                <span className={`q-badge ${categoryClass(q.category)}`}>
                  {q.category.toUpperCase()}
                </span>
                <span className={`q-badge ${difficultyClass(q.difficulty)}`}>
                  {q.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="question-text">{q.question}</div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
