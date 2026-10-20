import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, ChevronRight, HelpCircle } from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { companiesApi } from '../services/studentService';
import '../styles/student.css';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi.list()
      .then(setCompanies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase());
    const matchesDiff =
      selectedDifficulty === 'ALL' || c.difficulty.toUpperCase() === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <StudentLayout>
      <div className="page-header-row">
        <div className="page-header-left">
          <div className="page-section-label">RECRUITERS & PATTERNS</div>
          <h1 className="page-title">Company Profiles</h1>
          <p className="page-subtitle">Analyze interview patterns, hiring process, and recurring questions.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="coding-search-row" style={{ marginBottom: '24px' }}>
        <div className="sp-search-bar" style={{ flex: 1, maxWidth: '400px' }}>
          <Search size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search companies (e.g. Amazon, Google, TCS)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              className={`coding-filter-btn ${selectedDifficulty === diff ? 'active' : ''}`}
              style={{ width: 'auto', padding: '6px 14px', borderRadius: '20px', fontSize: '12px' }}
              onClick={() => setSelectedDifficulty(diff)}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Company Cards */}
      {loading ? (
        <div className="sp-loading">Loading company profiles...</div>
      ) : filteredCompanies.length === 0 ? (
        <div className="sp-empty">
          <div className="sp-empty-icon">🏢</div>
          <div className="sp-empty-title">No companies found matching your criteria.</div>
        </div>
      ) : (
        <div className="companies-grid">
          {filteredCompanies.map((comp) => (
            <div
              key={comp.id}
              className="company-card"
              onClick={() => navigate(`/student/companies/${comp.id}`)}
            >
              <div className="company-card-logo-area">
                <div className="company-card-logo" style={{ fontWeight: 800, fontSize: '18px', color: '#0B1224' }}>
                  {comp.logo || comp.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="company-card-diff-badge">
                  <span className={`diff-badge ${comp.difficulty.toLowerCase()}`}>
                    {comp.difficulty}
                  </span>
                </div>
              </div>

              <div className="company-card-body">
                <div className="company-card-name">{comp.name}</div>
                <div className="company-card-category">{comp.category}</div>

                <div className="company-card-stats">
                  <div className="company-card-stat-row">
                    <span className="company-card-stat-label">Package Range</span>
                    <span className="company-card-stat-value" style={{ color: '#0062ff' }}>
                      {comp.package}
                    </span>
                  </div>
                  <div className="company-card-stat-row">
                    <span className="company-card-stat-label">Questions</span>
                    <span className="company-card-stat-value">
                      <HelpCircle size={13} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                      {comp.questions} Qs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
