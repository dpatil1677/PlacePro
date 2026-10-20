import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, HelpCircle, Briefcase, CheckCircle, Lightbulb } from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { companiesApi } from '../services/studentService';
import '../styles/student.css';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi.get(id)
      .then(setCompany)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <StudentLayout><div className="sp-loading">Loading company info...</div></StudentLayout>;
  if (!company) {
    return (
      <StudentLayout>
        <div className="sp-empty">
          <div className="sp-empty-title">Company profile not found.</div>
          <button className="btn-primary" onClick={() => navigate('/student/companies')} style={{ marginTop: 12 }}>
            Back to Companies
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <button className="btn-outline" onClick={() => navigate('/student/companies')} style={{ marginBottom: '20px' }}>
        <ChevronLeft size={16} /> Back to Companies
      </button>

      <div className="company-detail-header">
        <div className="company-detail-logo">
          {company.logo || company.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 className="page-title" style={{ fontSize: '26px', margin: 0 }}>{company.name}</h1>
            <span className={`diff-badge ${company.difficulty.toLowerCase()}`}>{company.difficulty}</span>
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {company.industry || company.category} • CTC Package: <strong style={{ color: '#0062ff' }}>{company.package}</strong>
          </div>
        </div>
      </div>

      <div className="company-detail-grid">
        {/* Main Info */}
        <div>
          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-title">About {company.name}</div>
            </div>
            <div className="sp-card-body">
              <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                {company.description}
              </p>
            </div>
          </div>

          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-title">Hiring Process & Rounds</div>
            </div>
            <div className="sp-card-body">
              <ul className="company-detail-list">
                {company.hiringProcess?.map((step, i) => (
                  <li key={i}>
                    <span className="company-detail-list-num">{i + 1}</span>
                    <span style={{ fontWeight: 600, color: '#0B1224' }}>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-title">Frequently Asked Interview Questions</div>
            </div>
            <div className="sp-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {company.interviewQuestions?.map((q, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13.5px', fontWeight: 600, color: '#0B1224', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HelpCircle size={16} color="#0062ff" style={{ flexShrink: 0 }} />
                    {q}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Topics & Preparation Tips */}
        <div>
          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-title">Key Topics Asked</div>
            </div>
            <div className="sp-card-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {company.commonTopics?.map((topic, i) => (
                  <span key={i} className="company-topic-chip">{topic}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={16} color="#0062ff" /> Preparation Strategy
              </div>
            </div>
            <div className="sp-card-body">
              <ul style={{ paddingLeft: '18px', margin: 0 }}>
                {company.preparationTips?.map((tip, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#374151', marginBottom: '8px', lineHeight: 1.5 }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
