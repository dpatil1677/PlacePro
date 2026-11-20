import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, UserCheck, FileCheck, HelpCircle, ChevronRight } from 'lucide-react';
import PlaceProLogo from '../components/PlaceProLogo';
import '../styles/landing.css';

const sections = [
  {
    id: 'info-collected',
    icon: <Database size={20} color="#0062ff" />,
    iconBg: 'rgba(0,98,255,0.1)',
    title: '1. Information We Collect',
    content: [
      'Account Information: Name, university email address, graduation year, academic branch/discipline, and contact credentials provided upon registration.',
      'Academic & Placement Records: Resumes, GPA/CGPA, certifications, skills, and portfolio links uploaded for placement drives.',
      'Performance & Preparation Metrics: Scores and answers from aptitude practice, DSA coding submissions, AI interview practice recordings/transcripts, and ATS resume evaluations.',
      'Usage & Device Data: IP address, browser type, operating system, and system logs collected to maintain portal security and platform uptime.',
    ],
  },
  {
    id: 'how-we-use',
    icon: <Eye size={20} color="#7c3aed" />,
    iconBg: 'rgba(124,58,237,0.1)',
    title: '2. How We Use Your Data',
    content: [
      'Placement Drive Coordination: Enabling students to apply for job opportunities and campus recruitment drives posted by participating employers and partner institutions.',
      'AI Analysis & Preparation: Delivering real-time readiness scoring, mock interview feedback, and tailored practice problem recommendations.',
      'Institutional Reporting: Aggregating anonymized readiness statistics, drive participation, and department placement percentages for university administrators.',
      'Security & Authentication: Preventing fraudulent registrations, enforcing campus eligibility policies, and protecting platform integrity.',
    ],
  },
  {
    id: 'data-sharing',
    icon: <UserCheck size={20} color="#0d9488" />,
    iconBg: 'rgba(13,148,136,0.1)',
    title: '3. Data Sharing & Disclosure',
    content: [
      'Prospective Employers: When you apply for a placement drive, your profile, resume, and relevant readiness metrics are shared with that verified recruiter.',
      'University Placement Cells: Authorized administrators and placement officers can view candidate eligibility, drive application statuses, and assessment results.',
      'Infrastructure Service Providers: Cloud infrastructure and database services (e.g., cloud hosting, database clusters) that operate under strict non-disclosure and security commitments.',
      'We Never Sell Personal Data: PlacePro does not sell, trade, or monetize student personal information or student resumes to third-party marketing brokers.',
    ],
  },
  {
    id: 'data-security',
    icon: <Lock size={20} color="#ea580c" />,
    iconBg: 'rgba(234,88,12,0.1)',
    title: '4. Security & Protection',
    content: [
      'Encrypted Transmissions: All data transferred between your browser and our servers is encrypted in transit using industry-standard TLS/HTTPS protocols.',
      'Role-Based Access Controls: Access to administrative reports and student details is restricted by authenticated role permissions.',
      'Safe Authentication: Passwords are encrypted and securely hashed using standard cryptographic algorithms.',
      'Proactive Auditing: We regularly inspect database rules, API endpoints, and system logs to guard against unauthorized access and vulnerabilities.',
    ],
  },
  {
    id: 'student-rights',
    icon: <FileCheck size={20} color="#10b981" />,
    iconBg: 'rgba(16,185,129,0.1)',
    title: '5. Student Rights & Control',
    content: [
      'Profile Access & Updates: You can review and update your academic details, profile information, and resume revisions directly from your dashboard.',
      'Application History: You have full visibility into drives applied, assessment attempts, and your application statuses.',
      'Data Export & Erasure: Students may request an export of their submission records or request deletion of inactive accounts by contacting their university placement cell or PlacePro support.',
    ],
  },
  {
    id: 'contact-dpo',
    icon: <HelpCircle size={20} color="#6366f1" />,
    iconBg: 'rgba(99,102,241,0.1)',
    title: '6. Contact & Inquiries',
    content: [
      'If you have questions regarding this Privacy Policy, your personal data, or our data practices, please reach out to our privacy team.',
      'Email: privacy@placepro.com | support@placepro.com',
      'Address: PlacePro Campus Recruitment Platform, Bangalore, India.',
    ],
  },
];

export default function PrivacyPage() {
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
          <ShieldCheck size={14} /> PRIVACY POLICY
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#0b1224', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>
          PlacePro Privacy Policy
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.65, maxWidth: 640 }}>
          Your privacy and academic trust are central to everything we build. This policy outlines how PlacePro handles student data, placement credentials, and preparation records.
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

        {/* Policy Sections */}
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
              Questions about our security & data practices?
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Our team and institutional partners are here to assist you anytime.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/docs">
              <button style={{
                padding: '11px 22px', background: '#0062ff', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Explore Docs
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

