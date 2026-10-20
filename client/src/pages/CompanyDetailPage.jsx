import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Building2, HelpCircle, Briefcase, CheckCircle,
  Lightbulb, Calendar, Clock, DollarSign, ArrowRight, AlertCircle, ShieldCheck
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { companiesApi, studentDrivesApi } from '../services/studentService';
import '../styles/student.css';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastError, setToastError] = useState(null);

  useEffect(() => {
    companiesApi.get(id)
      .then(setCompany)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleApplyDrive = async (e, driveId) => {
    e.stopPropagation();
    setApplyingId(driveId);
    setToastMsg(null);
    setToastError(null);
    try {
      const res = await studentDrivesApi.apply(driveId);
      setToastMsg(res.message || 'Applied successfully!');
      setCompany(prev => ({
        ...prev,
        drives: (prev.drives || []).map(d =>
          d.id === driveId ? { ...d, applied: true, applicationStatus: 'Applied' } : d
        ),
      }));
    } catch (err) {
      setToastError(err.message || 'Failed to submit application');
    } finally {
      setApplyingId(null);
    }
  };

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
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#0062ff', color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontWeight: 600, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CheckCircle size={18} />
          {toastMsg}
        </div>
      )}

      {toastError && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#ef4444', color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontWeight: 600, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle size={18} />
          {toastError}
        </div>
      )}

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
          {/* Active Placement Drives */}
          <div className="sp-card" style={{ border: '1.5px solid #0062ff' }}>
            <div className="sp-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="sp-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={18} color="#0062ff" /> Active Placement Drives
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0062ff', background: 'rgba(0,98,255,0.1)', padding: '2px 8px', borderRadius: 12 }}>
                {company.drives?.length || 0} Drives
              </span>
            </div>
            <div className="sp-card-body" style={{ padding: '16px' }}>
              {!company.drives || company.drives.length === 0 ? (
                <div style={{ padding: '12px 0', textAlign: 'center', color: '#6b7280', fontSize: 13.5 }}>
                  No placement drives currently scheduled for {company.name}.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {company.drives.map(d => {
                    const isExp = d.deadline && !isNaN(new Date(d.deadline).getTime()) && new Date(d.deadline) < new Date();
                    const isClosed = d.status === 'Closed' || d.status === 'Completed' || isExp;
                    return (
                      <div
                        key={d.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: 10,
                          padding: '14px 16px',
                          background: '#fcfcfd',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/student/drives/${d.id}`)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: '#0B1224', display: 'flex', alignItems: 'center', gap: 8 }}>
                              {d.title}
                              <span style={{
                                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                                background: d.applied ? 'rgba(16,185,129,0.1)' : isClosed ? 'rgba(239,68,68,0.1)' : 'rgba(0,98,255,0.1)',
                                color: d.applied ? '#10b981' : isClosed ? '#ef4444' : '#0062ff',
                              }}>
                                {d.applied ? `Applied (${d.applicationStatus || 'Applied'})` : isClosed ? 'Closed' : d.status}
                              </span>
                            </div>
                            <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 3 }}>
                              Package: <strong style={{ color: '#0062ff' }}>{d.package || 'Competitive'}</strong>
                              {d.location && ` • ${d.location}`}
                              {d.date && ` • Drive Date: ${d.date}`}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {d.applied ? (
                              <span style={{
                                fontSize: 12, fontWeight: 700, color: '#10b981',
                                background: 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: 6,
                                display: 'flex', alignItems: 'center', gap: 4
                              }}>
                                <CheckCircle size={14} /> Applied
                              </span>
                            ) : isClosed ? (
                              <span style={{
                                fontSize: 12, fontWeight: 600, color: '#9ca3af',
                                background: '#f3f4f6', padding: '6px 12px', borderRadius: 6
                              }}>
                                Closed
                              </span>
                            ) : (
                              <button
                                className="btn-primary"
                                style={{ padding: '6px 14px', fontSize: 12, borderRadius: 6 }}
                                disabled={applyingId === d.id}
                                onClick={(e) => handleApplyDrive(e, d.id)}
                              >
                                {applyingId === d.id ? 'Applying...' : 'Apply'}
                              </button>
                            )}
                            <button
                              className="btn-outline"
                              style={{ padding: '6px 10px', fontSize: 12, borderRadius: 6 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/student/drives/${d.id}`);
                              }}
                            >
                              Details →
                            </button>
                          </div>
                        </div>

                        {(d.eligibility || d.deadline) && (
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6',
                            fontSize: 12, color: '#6b7280'
                          }}>
                            {d.eligibility && (
                              <span><strong>Eligibility:</strong> {d.eligibility}</span>
                            )}
                            {d.deadline && (
                              <span style={{ color: isExp ? '#ef4444' : '#6b7280' }}>
                                <strong>Deadline:</strong> {d.deadline}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
