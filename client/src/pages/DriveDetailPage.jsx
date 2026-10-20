import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Building2, Calendar, Clock, DollarSign, MapPin,
  CheckCircle, AlertCircle, Users, Award, ShieldCheck, ArrowRight,
  ExternalLink, Briefcase, FileText
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { studentDrivesApi } from '../services/studentService';
import '../styles/student.css';

export default function DriveDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [msg, setMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    studentDrivesApi.get(id)
      .then(setDrive)
      .catch((err) => {
        setErrorMsg(err.message || 'Drive not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!drive || drive.applied || drive.status === 'Closed' || drive.status === 'Completed') return;
    setApplying(true);
    setMsg(null);
    setErrorMsg(null);
    try {
      const res = await studentDrivesApi.apply(drive.id);
      setMsg(res.message || `Successfully applied to ${drive.company}!`);
      setDrive(prev => ({
        ...prev,
        applied: true,
        applicationStatus: 'Applied',
        registered: (prev.registered || 0) + 1,
        appliedAt: new Date().toISOString(),
      }));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="sp-loading">Loading placement drive details...</div>
      </StudentLayout>
    );
  }

  if (!drive) {
    return (
      <StudentLayout>
        <div className="sp-empty">
          <div className="sp-empty-title">{errorMsg || 'Placement drive not found.'}</div>
          <button className="btn-primary" onClick={() => navigate('/student/dashboard')} style={{ marginTop: 12 }}>
            Back to Dashboard
          </button>
        </div>
      </StudentLayout>
    );
  }

  const isExpired = drive.deadline && !isNaN(new Date(drive.deadline).getTime()) && new Date(drive.deadline) < new Date();
  const isClosed = drive.status === 'Closed' || drive.status === 'Completed' || isExpired;

  return (
    <StudentLayout>
      {/* Toast Alert */}
      {msg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#0062ff', color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontWeight: 600, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CheckCircle size={18} />
          {msg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#ef4444', color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontWeight: 600, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="btn-outline" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} /> Back
        </button>
        {drive.companyId && (
          <button
            className="btn-outline"
            onClick={() => navigate(`/student/companies/${drive.companyId}`)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Building2 size={15} color="#0062ff" /> View Company Profile <ExternalLink size={14} />
          </button>
        )}
      </div>

      {/* Hero Header */}
      <div className="company-detail-header" style={{ marginBottom: 24 }}>
        <div className="company-detail-logo" style={{ background: '#0B1224', color: '#fff', fontSize: 24, fontWeight: 800 }}>
          {drive.companyLogo || (drive.company ? drive.company.slice(0, 2).toUpperCase() : 'PP')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
            <h1 className="page-title" style={{ fontSize: 26, margin: 0 }}>{drive.title}</h1>
            <span style={{
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              background: drive.applied ? 'rgba(16,185,129,0.1)' : isClosed ? 'rgba(239,68,68,0.1)' : 'rgba(0,98,255,0.1)',
              color: drive.applied ? '#10b981' : isClosed ? '#ef4444' : '#0062ff',
            }}>
              {drive.applied ? `Applied (${drive.applicationStatus || 'In Review'})` : isClosed ? 'Closed' : drive.status}
            </span>
          </div>

          <div style={{ fontSize: 15, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span>
              Company:{' '}
              {drive.companyId ? (
                <Link
                  to={`/student/companies/${drive.companyId}`}
                  style={{ color: '#0062ff', fontWeight: 700, textDecoration: 'none' }}
                >
                  {drive.company}
                </Link>
              ) : (
                <strong style={{ color: '#111827' }}>{drive.company}</strong>
              )}
            </span>
            {drive.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={15} color="#9ca3af" /> {drive.location}
              </span>
            )}
            {drive.date && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={15} color="#9ca3af" /> Drive Date: {drive.date}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="sp-stat-row" style={{ marginBottom: 24 }}>
        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">Salary / CTC Package</div>
            <div className="sp-stat-value" style={{ color: '#0062ff', fontSize: 26 }}>
              {drive.package || 'Competitive'}
            </div>
            <div className="sp-stat-sub">Annual compensation</div>
          </div>
          <div className="sp-stat-icon" style={{ background: 'rgba(0,98,255,0.1)', color: '#0062ff' }}>
            <DollarSign size={22} />
          </div>
        </div>

        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">Application Deadline</div>
            <div className="sp-stat-value" style={{ fontSize: 20, color: isExpired ? '#ef4444' : '#111827' }}>
              {drive.deadline || 'Rolling basis'}
            </div>
            <div className="sp-stat-sub">{isExpired ? 'Deadline passed' : 'Apply before cut-off'}</div>
          </div>
          <div className="sp-stat-icon" style={{ background: isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)', color: isExpired ? '#ef4444' : '#f97316' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="sp-stat-card">
          <div className="sp-stat-info">
            <div className="sp-stat-label">Registered Candidates</div>
            <div className="sp-stat-value" style={{ fontSize: 26 }}>
              {drive.registered || 0}
            </div>
            <div className="sp-stat-sub">Total applicants so far</div>
          </div>
          <div className="sp-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Left info & Right Action panel */}
      <div className="company-detail-grid">
        {/* Left Section */}
        <div>
          {/* Eligibility Criteria */}
          <div className="sp-card">
            <div className="sp-card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#0062ff" />
              <div className="sp-card-title">Eligibility Criteria</div>
            </div>
            <div className="sp-card-body">
              <div style={{
                padding: '14px 16px', background: '#f8fafc',
                borderRadius: 8, border: '1px solid #e2e8f0',
                fontSize: 14, color: '#334155', lineHeight: 1.6
              }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Academic & Graduation Requirements:
                </div>
                {drive.eligibility || 'Open to all eligible graduating students meeting standard placement cell criteria.'}
              </div>
            </div>
          </div>

          {/* Job Description & Details */}
          <div className="sp-card">
            <div className="sp-card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={18} color="#0062ff" />
              <div className="sp-card-title">Job Role & Responsibilities</div>
            </div>
            <div className="sp-card-body">
              <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                {drive.description || `Exciting career opportunity at ${drive.company} for the role of ${drive.title}. Selected candidates will collaborate with industry mentors, work on scalable real-world products, and advance their professional expertise.`}
              </p>
            </div>
          </div>

          {/* Hiring Process & Rounds Pipeline */}
          <div className="sp-card">
            <div className="sp-card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} color="#0062ff" />
              <div className="sp-card-title">Hiring Process & Evaluation Rounds</div>
            </div>
            <div className="sp-card-body">
              {drive.rounds && drive.rounds.length > 0 ? (
                <ul className="company-detail-list">
                  {drive.rounds.map((round, idx) => (
                    <li key={idx}>
                      <span className="company-detail-list-num">{idx + 1}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0B1224', fontSize: 14.5 }}>
                          {typeof round === 'string' ? round : round.name || round.title || `Round ${idx + 1}`}
                        </div>
                        {typeof round === 'object' && round.desc && (
                          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{round.desc}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="company-detail-list">
                  <li>
                    <span className="company-detail-list-num">1</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0B1224', fontSize: 14.5 }}>Online Aptitude & Technical Assessment</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Quantitative, logical reasoning, and basic coding problem solving.</div>
                    </div>
                  </li>
                  <li>
                    <span className="company-detail-list-num">2</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0B1224', fontSize: 14.5 }}>Technical Interview (Data Structures & System Concepts)</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Hands-on coding, computer science fundamentals, and project discussions.</div>
                    </div>
                  </li>
                  <li>
                    <span className="company-detail-list-num">3</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0B1224', fontSize: 14.5 }}>Managerial & HR Discussion</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Behavioral assessment, team fit, and compensation offering.</div>
                    </div>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Section / Action Card */}
        <div>
          {/* Application Card */}
          <div className="sp-card" style={{ border: '2px solid #0062ff' }}>
            <div className="sp-card-header" style={{ background: '#0062ff', color: '#fff' }}>
              <div className="sp-card-title" style={{ color: '#fff' }}>Apply for Drive</div>
            </div>
            <div className="sp-card-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
              {drive.applied ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(16,185,129,0.1)', color: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <CheckCircle size={32} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: 18, color: '#0B1224' }}>Application Submitted</h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                      Status: <strong style={{ color: '#10b981' }}>{drive.applicationStatus || 'Applied'}</strong>
                    </p>
                    {drive.appliedAt && (
                      <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#9ca3af' }}>
                        Submitted on: {new Date(drive.appliedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div style={{
                    fontSize: 12, color: '#374151', background: '#f3f4f6',
                    padding: '10px 14px', borderRadius: 8, width: '100%', textAlign: 'left', lineHeight: 1.5
                  }}>
                    Keep preparing with our Aptitude and Coding tests while the recruitment team reviews applications.
                  </div>
                </div>
              ) : isClosed ? (
                <div>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto'
                  }}>
                    <Clock size={28} />
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 17, color: '#111827' }}>Applications Closed</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                    This drive is no longer accepting new candidate registrations.
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 13.5, color: '#4b5563', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    Click below to apply with your registered profile and verified resume credentials.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={handleApply}
                    disabled={applying}
                    style={{
                      width: '100%', padding: '12px', fontSize: 15, fontWeight: 700,
                      borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    {applying ? 'Submitting Application...' : 'Apply Now'}
                    {!applying && <ArrowRight size={16} />}
                  </button>
                  <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 12 }}>
                    Duplicate applications are prevented. Your latest resume will be submitted.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Company Brief Card */}
          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-title">About {drive.company}</div>
            </div>
            <div className="sp-card-body">
              <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                {drive.companyAbout || `Learn more about interview preparation and historical questions asked at ${drive.company}.`}
              </p>
              {drive.companyId && (
                <button
                  className="btn-outline"
                  onClick={() => navigate(`/student/companies/${drive.companyId}`)}
                  style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                >
                  <Building2 size={14} /> Full Company Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
