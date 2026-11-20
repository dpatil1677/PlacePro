import { useState, useEffect, useRef } from 'react';
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
  const wrap = useRef(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const update = () => {
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      el.style.setProperty('--p', p.toFixed(4));
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Duplicate for seamless scroll loop
  const allCompanies = [...companies, ...companies];

  return (
    <div className="landing-page">
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

      {/* Hero Section — Pinned Scroll-Driven Animation */}
      <section className="hero-wrap" ref={wrap}>
        <div className="hero-stick">
          <div className="hero-art">
            <svg
              className="hero-mountains"
              viewBox="0 0 1440 520"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="0,520 0,300 180,180 330,280 520,120 760,300 980,150 1180,290 1440,200 1440,520" fill="#E3EBFF" />
              <polygon points="0,520 0,380 220,260 420,360 640,230 900,380 1120,280 1440,400 1440,520" fill="#BFD0FB" />
              <polygon points="0,520 0,450 300,360 560,450 820,340 1100,450 1440,380 1440,520" fill="#8FAEF7" />
            </svg>

            <h1 className="hero-title landing-hero-title" aria-label="PLACEPRO">
              <span className="l" aria-hidden="true">PLACE</span>
              <span className="r" aria-hidden="true">PRO</span>
            </h1>

            <svg
              className="hero-person"
              viewBox="0 0 400 560"
              role="img"
              aria-label="Illustration of a smiling student wearing glasses and a blue jacket"
            >
              <path d="M40 560 L70 340 Q200 290 330 340 L360 560 Z" fill="#2557F6" />
              <path d="M160 322 L200 430 L240 322 Z" fill="#FFFFFF" />
              <rect x="180" y="262" width="40" height="70" fill="#D9A27C" />
              <ellipse cx="200" cy="205" rx="62" ry="72" fill="#E8B48E" />
              <circle cx="148" cy="148" r="24" fill="#1B1B22" />
              <circle cx="182" cy="124" r="26" fill="#1B1B22" />
              <circle cx="222" cy="124" r="26" fill="#1B1B22" />
              <circle cx="256" cy="148" r="24" fill="#1B1B22" />
              <path d="M138 190 Q150 150 200 150 Q250 150 262 190 Q240 168 200 168 Q160 168 138 190 Z" fill="#1B1B22" />
              <circle cx="172" cy="210" r="17" fill="none" stroke="#1B1B22" strokeWidth="4" />
              <circle cx="228" cy="210" r="17" fill="none" stroke="#1B1B22" strokeWidth="4" />
              <path d="M189 210 L211 210" stroke="#1B1B22" strokeWidth="4" />
              <path d="M178 242 Q200 262 222 242" fill="none" stroke="#8A4B3A" strokeWidth="4" strokeLinecap="round" />
              <path d="M120 360 L140 560 M280 360 L260 560" stroke="#1B2A5C" strokeWidth="14" strokeLinecap="round" />
            </svg>
          </div>

          <div className="hero-tiles">
            <div className="hero-tile">
              <span className="hero-tile-val">50K+</span>
              <span className="hero-tile-label">Students Placed</span>
            </div>
            <div className="hero-tile">
              <span className="hero-tile-val">300+</span>
              <span className="hero-tile-label">Partner Companies</span>
            </div>
            <div className="hero-tile">
              <span className="hero-tile-val">4.9 ★</span>
              <span className="hero-tile-label">Student Rating</span>
            </div>
          </div>

          <div className="hero-cta">
            <div className="hero-tagline">The complete stack for campus success.</div>
            <div className="hero-subtext">
              Master aptitude, coding, interviews and resume building, and land your dream job at ridiculous speed.
            </div>
            <div className="hero-buttons">
              <Link className="bt" to="/register">Start Preparing for Free</Link>
              <Link className="b2" to="/login">University Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Company Strip — Animated Ticker */}
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
          <li><Link to="/docs">Docs</Link></li>
          <li><Link to="/privacy">Privacy</Link></li>
          <li><Link to="/terms">Terms</Link></li>
        </ul>
        <span className="footer-copy">© 2026 PlacePro. All rights reserved.</span>
      </footer>
    </div>
  );
}
