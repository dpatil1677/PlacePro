import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Code2, MessageSquare, FileText, Building2, TrendingUp, ChevronRight } from 'lucide-react';
import PlaceProLogo from '../components/PlaceProLogo';
import '../styles/landing.css';

const sections = [
  {
    id: 'student-dashboard',
    icon: <TrendingUp size={20} color="#0062ff" />,
    iconBg: 'rgba(0,98,255,0.1)',
    title: 'Student Dashboard',
    content: [
      'Your central hub for tracking placement readiness across all modules.',
      'The dashboard shows your Readiness Score, Aptitude Score, Interview Score, and Coding Score — all computed live from your activity.',
      'Use the Weekly Activity chart to track how consistently you practice.',
      'The Placement Drives section shows live drives from the database — apply directly with one click.',
      'AI Insights give personalised action points based on your weakest areas.',
    ],
  },
  {
    id: 'placement-drives',
    icon: <Building2 size={20} color="#7c3aed" />,
    iconBg: 'rgba(124,58,237,0.1)',
    title: 'Placement Drives',
    content: [
      "Browse all upcoming and ongoing placement drives posted by your institution's admin.",
      'Each drive shows the company, role title, eligibility criteria, package, and deadline.',
      'Click "Apply" on any eligible drive to submit your application instantly.',
      'Track your application status (Applied → Shortlisted → Interview → Selected/Rejected) under "My Applications".',
      'Drive details page shows the full job description, company info, and eligibility breakdown.',
    ],
  },
  {
    id: 'aptitude',
    icon: <BookOpen size={20} color="#8b5cf6" />,
    iconBg: 'rgba(139,92,246,0.1)',
    title: 'Aptitude Preparation',
    content: [
      'Access 300+ adaptive aptitude tests covering Quantitative, Logical, and Verbal Reasoning.',
      'Tests are categorised by company type (Product, Service, Banking, Consulting) and difficulty.',
      'Each test is timed and auto-scored. After submission, see your answers with detailed explanations.',
      'Your best score per test is tracked toward your Aptitude Score on the dashboard.',
      'Retake tests as many times as needed — only your highest score is saved.',
    ],
  },
  {
    id: 'coding',
    icon: <Code2 size={20} color="#0062ff" />,
    iconBg: 'rgba(0,98,255,0.1)',
    title: 'Coding Practice',
    content: [
      '1,200+ company-specific DSA problems ranging from Easy to Hard.',
      'Problems are tagged by topic (Arrays, Trees, Graphs, DP, etc.) and company.',
      'An in-browser code editor supports multiple languages including Python, Java, C++, and JavaScript.',
      'Run your code against hidden test cases and see detailed output.',
      'Each solved problem contributes to your Coding Score and progress bar.',
    ],
  },
  {
    id: 'interviews',
    icon: <MessageSquare size={20} color="#0d9488" />,
    iconBg: 'rgba(13,148,136,0.1)',
    title: 'AI Interview Practice',
    content: [
      '500+ interview questions across HR, Technical, and Behavioural categories.',
      'Choose a topic (e.g., "System Design" or "STAR Method") and start a mock interview session.',
      'Your spoken or typed responses are scored in real-time on Communication, Clarity, and Relevance.',
      'Receive instant AI feedback with example ideal answers after each question.',
      'Repeat sessions as many times as needed — scores improve as you practice.',
    ],
  },
  {
    id: 'resume',
    icon: <FileText size={20} color="#ea580c" />,
    iconBg: 'rgba(234,88,12,0.1)',
    title: 'ATS Resume Builder',
    content: [
      'Build a professional, ATS-optimised resume directly in the browser.',
      'Fill in your Education, Work Experience, Projects, Skills, and Certifications.',
      'Get a live ATS score (out of 100) with instant suggestions to improve your resume.',
      'Export your resume as a clean PDF, ready to submit to companies.',
      'AI suggestions highlight missing keywords for your target companies and roles.',
    ],
  },
];

export default function DocsPage() {
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
          <li><Link to="/docs" style={{ color: '#0062ff', fontWeight: 600 }}>Docs</Link></li>
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

      {/* Docs Hero */}
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,98,255,0.08)', border: '1px solid rgba(0,98,255,0.15)', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, color: '#0062ff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', width: 'fit-content' }}>
          DOCUMENTATION
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#0b1224', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>
          PlacePro Guide
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.65, maxWidth: 560 }}>
          Everything you need to know about using PlacePro — from your student dashboard to placement drives, aptitude tests, coding challenges, mock interviews, and resume building.
        </p>
      </div>

      {/* Docs Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 52px 80px' }}>
        {/* Quick nav */}
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

        {/* Sections */}
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
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0b1224', letterSpacing: '-0.02em' }}>
                {s.title}
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

        {/* CTA */}
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
              Ready to start preparing?
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Join 50,000+ students who have already cracked top companies.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register">
              <button style={{
                padding: '11px 22px', background: '#0062ff', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Get started free
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
        </ul>
        <span className="footer-copy">© 2026 PlacePro. All rights reserved.</span>
      </footer>
    </div>
  );
}
