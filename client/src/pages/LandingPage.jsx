import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ChevronRight, ArrowRight } from 'lucide-react';
import PlaceProLogo from '../components/PlaceProLogo';
import heroStudentImg from '../assets/hero-student.jpg';
import '../styles/landing.css';

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Flipkart',
  'Infosys', 'TCS', 'Adobe', 'Accenture', 'Deloitte', 'Morgan Stanley', 'Wipro',
];

const features = [
  {
    icon: '⚡',
    iconBg: 'rgba(139,92,246,0.1)',
    iconColor: '#7c3aed',
    title: 'Aptitude Engine',
    desc: 'Adaptive quantitative, logical, and verbal reasoning matched to your target companies.',
    stat: '300+ TESTS',
  },
  {
    icon: '</>',
    iconBg: 'rgba(0,98,255,0.1)',
    iconColor: '#0062ff',
    title: 'Coding Challenges',
    desc: 'Company-specific DSA problems with test cases, editorials, and multi-language support.',
    stat: '1,200+ PROBLEMS',
  },
  {
    icon: '🖥',
    iconBg: 'rgba(20,184,166,0.1)',
    iconColor: '#0d9488',
    title: 'AI Interviews',
    desc: 'Real-time AI practice rounds. Get scored on communication, clarity, and relevance instantly.',
    stat: '500+ QUESTIONS',
  },
  {
    icon: '📄',
    iconBg: 'rgba(249,115,22,0.1)',
    iconColor: '#ea580c',
    title: 'ATS Resume Builder',
    desc: 'Craft data-driven resumes that bypass automated screening — live ATS score with instant AI suggestions.',
    stat: '97% ATS SCORE',
  },
];

export default function LandingPage() {
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const navigate = useNavigate();

  const allCompanies = [...companies, ...companies]; // for seamless scroll

  return (
    <div className="landing-page">
      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="announcement-bar">
          <div className="announcement-bar-text">
            <span className="announcement-glow-dot" aria-hidden="true"></span>
            <span>Placement Season 2026 is Live —</span>
            <span className="announcement-bar-link">View upcoming drives →</span>
          </div>
          <button
            className="announcement-bar-close"
            onClick={() => setAnnouncementVisible(false)}
            aria-label="Close announcement"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/" aria-label="PlacePro Home">
            <PlaceProLogo size="md" color="#0062ff" />
          </Link>
        </div>
        <ul className="navbar-nav">
          <li><a href="#features">Features</a></li>
          <li><a href="#companies">Companies</a></li>
          <li><a href="#universities">For Universities</a></li>
          <li><a href="#docs">Docs</a></li>
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

      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="hero">
          {/* Left Column */}
          <div className="hero-left">
            <h1 className="hero-heading">
              The complete stack<br />
              for campus success.
            </h1>
            <p className="hero-desc">
              PlacePro is batteries-included so every student can master aptitude, coding,
              interviews, and resume building — and land their dream job at ridiculous speed.
            </p>
            <div className="hero-buttons">
              <Link to="/register">
                <button className="btn-hero-primary">
                  Start Preparing for Free <ArrowRight size={16} />
                </button>
              </Link>
              <Link to="/login">
                <button className="btn-hero-secondary">
                  University Login
                </button>
              </Link>
            </div>
            {/* Rating strip */}
            <div className="hero-rating">
              <div className="hero-rating-avatars">
                {['#ef4444', '#7c3aed', '#0062ff', '#10b981', '#ea580c'].map((color, i) => (
                  <div key={i} className="rating-avatar" style={{ background: color }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="hero-rating-info">
                <div className="hero-rating-stars">★★★★★</div>
                <div className="hero-rating-text">
                  <strong>4.9</strong> rated by 12,000+ students
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Large Student with Laptop */}
          <div className="hero-visual">
            <div className="hero-visual-backdrop" aria-hidden="true"></div>
            {/* Playful blue doodle accents matching reference */}
            <div className="hero-doodle-sparks" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <line x1="8" y1="26" x2="14" y2="17" stroke="#0062ff" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="21" y1="21" x2="23" y2="9" stroke="#0062ff" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="31" y1="21" x2="25" y2="14" stroke="#0062ff" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="hero-doodle-swoosh" aria-hidden="true">
              <svg width="90" height="60" viewBox="0 0 90 60" fill="none">
                <path d="M4 48C30 32 60 16 88 12" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="hero-student-wrapper">
              <img
                src={heroStudentImg}
                alt="Student learning on PlacePro with laptop"
                className="hero-student-img"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Strip */}
      <div className="landing-company-strip" id="companies">
        <div className="landing-company-strip-inner">
          <div className="landing-strip-label">
            <div className="landing-strip-label-text">COMPANIES HIRING</div>
          </div>
          <div className="landing-strip-scroll">
            <div className="landing-strip-track">
              {allCompanies.map((c, i) => (
                <span key={i} className="landing-strip-item">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <section className="whats-included" id="features">
        <div className="section-pill">WHAT'S INCLUDED</div>
        <h2 className="section-heading">
          Ship your placement prep<br />
          with the AI-powered toolkit.
        </h2>
        <p className="section-desc">
          Stop bouncing between platforms. PlacePro brings coding, aptitude, interviews, and
          resume building into one cohesive, intelligent workflow.
        </p>
        <div className="feature-cards-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div
                className="feature-card-icon"
                style={{ background: f.iconBg, color: f.iconColor, fontSize: '20px' }}
              >
                {f.icon}
              </div>
              <div className="feature-card-title">{f.title}</div>
              <div className="feature-card-desc">{f.desc}</div>
              <div className="feature-card-stat">{f.stat}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dark Trust Section */}
      <section className="trust-section" id="universities">
        <div className="trust-stats">
          {[
            { value: '50K+', label: 'STUDENTS PLACED' },
            { value: '300+', label: 'PARTNER COMPANIES' },
            { value: '98%', label: 'INTERVIEW ACCURACY' },
            { value: '4.9★', label: 'STUDENT RATING' },
          ].map((s) => (
            <div key={s.label} className="trust-stat">
              <div className="trust-stat-value">{s.value}</div>
              <div className="trust-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="trust-colleges">
          <div>
            <div className="trust-colleges-badge">TRUSTED BY UNIVERSITIES</div>
            <h2 className="trust-colleges-heading">
              Built for top-tier<br />engineering colleges.
            </h2>
            {[
              'Real-time analytics for college admins',
              'Company-wise preparation roadmaps',
              'Placement drive management & scheduling',
              'Branch-wise readiness scoring',
            ].map((b) => (
              <div key={b} className="trust-bullet">
                <span className="trust-bullet-dot"></span>
                <span>{b}</span>
              </div>
            ))}
            <Link to="/register">
              <button className="btn-trust-cta">
                Get started free →
              </button>
            </Link>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="testimonial-avatar">A</div>
                <div>
                  <div className="testimonial-name">Arjun Sharma</div>
                  <div className="testimonial-role">SDE Intern — Google · IIT Delhi, 2024</div>
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '20px' }}>›</div>
            </div>
            <p className="testimonial-text">
              "PlacePro's company-specific coding tests and AI interview feedback gave me
              exactly what I needed to crack Google's final rounds. The ATS resume builder
              alone got me 3x more callbacks."
            </p>
            <div className="testimonial-stars">★★★★★</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="final-cta-pill">🎯 Free for students · No credit card</div>
        <h2 className="final-cta-heading">
          Ready to secure<br />your dream job?
        </h2>
        <p className="final-cta-desc">
          Join 50,000+ students who have already cracked top product companies using
          PlacePro's AI-powered preparation stack.
        </p>
        <div className="final-cta-buttons">
          <Link to="/register">
            <button className="btn-hero-primary">
              Create your free account <ArrowRight size={16} />
            </button>
          </Link>
          <Link to="/login">
            <button className="btn-hero-secondary">
              University portal →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <PlaceProLogo size="sm" />
        <ul className="footer-nav">
          <li><a href="#features">Features</a></li>
          <li><a href="#companies">Companies</a></li>
          <li><a href="#universities">Universities</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
        </ul>
        <span className="footer-copy">© 2026 PlacePro. All rights reserved.</span>
      </footer>
    </div>
  );
}
