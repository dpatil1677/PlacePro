import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Shield, Briefcase, Award, Scale, ChevronRight } from 'lucide-react';
import PlaceProLogo from '../components/PlaceProLogo';
import '../styles/landing.css';

const sections = [
  {
    id: 'acceptance',
    icon: <CheckCircle size={20} color="#0062ff" />,
    iconBg: 'rgba(0,98,255,0.1)',
    title: '1. Acceptance of Terms',
    content: [
      'By creating an account, accessing, or using the PlacePro portal, you agree to comply with and be bound by these Terms of Service.',
      'If you are using the platform on behalf of an educational institution or recruiting organization, you affirm that you have the authority to bind that entity to these Terms.',
      'PlacePro reserves the right to update these terms as platform capabilities expand. Material changes will be communicated via the notification portal or email.',
    ],
  },
  {
    id: 'accounts',
    icon: <Shield size={20} color="#7c3aed" />,
    iconBg: 'rgba(124,58,237,0.1)',
    title: '2. User Accounts & Academic Authenticity',
    content: [
      'Student Accounts: You agree to provide true, accurate, and current information regarding your academic branch, graduation year, GPA, and personal credentials.',
      'Account Security: You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.',
      'Non-Transferability: Accounts are personal and non-transferable. Sharing credentials across students or simulating mock tests for others is prohibited.',
    ],
  },
  {
    id: 'conduct',
    icon: <AlertCircle size={20} color="#ea580c" />,
    iconBg: 'rgba(234,88,12,0.1)',
    title: '3. Platform Conduct & Fair Use',
    content: [
      'Assessment Integrity: Plagiarism, unauthorized automation, script-driven problem solving, or leaking proprietary question bank materials is strictly forbidden.',
      'Recruitment Interaction: Communication with campus recruiters and application submissions must remain professional and adhere to your university placement cell code of conduct.',
      'Platform Integrity: You agree not to probe, scan, or reverse-engineer API endpoints, security mechanisms, or administrative functionality.',
    ],
  },
  {
    id: 'applications',
    icon: <Briefcase size={20} color="#0d9488" />,
    iconBg: 'rgba(13,148,136,0.1)',
    title: '4. Placement Drives & Hiring Disclaimers',
    content: [
      'Independent Hiring Decisions: Recruitment drives, interview shortlists, and job offers are made solely at the discretion of participating employer companies.',
      'PlacePro as Facilitator: PlacePro provides assessment engines, application tracking, and readiness analytics. We do not guarantee employment, offer letters, or minimum compensation packages.',
      'Institutional Rules: Participation in placement drives is subject to the specific eligibility thresholds and placement policies defined by your college or university.',
    ],
  },
  {
    id: 'intellectual-property',
    icon: <Award size={20} color="#10b981" />,
    iconBg: 'rgba(16,185,129,0.1)',
    title: '5. Intellectual Property & AI Content',
    content: [
      'PlacePro Content: All proprietary software, algorithmic tests, question banks, ATS grading engines, and branding belong to PlacePro.',
      'Student Submissions: Students retain ownership of their resumes and uploaded code. You grant PlacePro a limited license to evaluate, format, and generate readiness insights for your applications.',
      'AI Feedback & Tools: AI-generated interview ratings, suggested answers, and ATS tips are provided as educational aids to improve placement preparation.',
    ],
  },
  {
    id: 'termination',
    icon: <Scale size={20} color="#6366f1" />,
    iconBg: 'rgba(99,102,241,0.1)',
    title: '6. Account Termination & Governing Law',
    content: [
      'Account Suspension: PlacePro and authorized college administrators reserve the right to suspend accounts found engaging in academic dishonesty or policy violations.',
      'Dispute Resolution: These Terms are governed by and construed in accordance with the laws of India. Any legal dispute shall be subject to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka.',
      'Contact: Inquiries concerning terms enforcement or compliance can be sent to legal@placepro.com.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="landing-page" style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/" aria-label="PlacePro Home">
            <PlaceProLogo size="md" color="#0062ff" />
          </Link>
        </div>
        <ul className="navbar-nav">
          <li><a href="/#features">Features</a></li>
          <li><a href="/#companies">Companies</a></li>
          <li><a href="/#universities">For Universities</a></li>
          <li><Link to="/docs">Docs</Link></li>
        </ul>
        <div className="navbar-actions">
          <Link to="/login">
            <button className="btn-nav-secondary">Sign in</button>
          </Link>
          <Link to="/register">
            <button className="btn-nav-primary">
              Start Preparing <ChevronRight size={15} />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <div style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '48px 52px 40px',
      }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 20, fontWeight: 500 }}
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,98,255,0.08)', border: '1px solid rgba(0,98,255,0.15)', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, color: '#0062ff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16, width: 'fit-content' }}>
          <FileText size={14} /> TERMS OF SERVICE
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#0b1224', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>
          PlacePro Terms of Service
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.65, maxWidth: 640 }}>
          Please review these terms governing the use of PlacePro services, campus drives, aptitude testing modules, coding engines, and administrative portals.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 52px 80px' }}>
        {/* Quick Nav / Table of Contents */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 48,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 14 }}>
            ON THIS PAGE
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{ fontSize: 13.5, color: '#0062ff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <ChevronRight size={12} /> {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Terms Sections */}
        {sections.map((s, idx) => (
          <div
            key={s.id}
            id={s.id}
            style={{
              marginBottom: idx === sections.length - 1 ? 0 : 48,
              paddingBottom: 48,
              borderBottom: idx === sections.length - 1 ? 'none' : '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: s.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0b1224', letterSpacing: '-0.02em' }}>
                {s.title}
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {s.content.map((para, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#0062ff', flexShrink: 0, marginTop: 8,
                  }} />
                  <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7 }}>{para}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CTA Card */}
        <div style={{
          marginTop: 56,
          background: '#0b1224',
          borderRadius: 16,
          padding: '36px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              Have questions regarding placement terms?
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Check out our documentation or reach out directly to support.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/docs">
              <button style={{
                padding: '11px 22px', background: '#0062ff', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Browse Docs
              </button>
            </Link>
            <Link to="/login">
              <button style={{
                padding: '11px 22px', background: 'transparent', color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Sign in
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <PlaceProLogo size="sm" />
        <ul className="footer-nav">
          <li><a href="/#features">Features</a></li>
          <li><a href="/#companies">Companies</a></li>
          <li><a href="/#universities">Universities</a></li>
          <li><Link to="/docs">Docs</Link></li>
          <li><Link to="/privacy">Privacy</Link></li>
          <li><Link to="/terms">Terms</Link></li>
        </ul>
        <span className="footer-copy">© 2026 PlacePro. All rights reserved.</span>
      </footer>
    </div>
  );
}

