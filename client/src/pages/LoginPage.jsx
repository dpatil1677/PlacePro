import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlaceProLogo from '../components/PlaceProLogo';
import { authService } from '../services/authService';
import '../styles/auth.css';

// Subtle metallic pull-chain click sound synthesized with Web Audio API
function playClickSound(isOn) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isOn ? 220 : 160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isOn ? 80 : 50, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Graceful fallback if audio context blocked
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Lamp state: starts OFF by default as requested
  const [isLampOn, setIsLampOn] = useState(false);

  const toggleLamp = () => {
    setIsLampOn(prev => {
      const next = !prev;
      playClickSound(next);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      authService.saveSession(data.token, data.user);

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lamp-login-page">
      {/* =========================================================================
          LEFT SIDE (50%): Solid black background with static lamp & welcome text
          ========================================================================= */}
      <div className="lamp-left-panel">
        {/* Top Header: PlacePro Logo & Lamp Status */}
        <div className="lamp-left-header">
          <PlaceProLogo size="md" variant="lamp" />
          <div className={`lamp-status-indicator ${isLampOn ? 'on' : 'off'}`}>
            <span className="lamp-status-dot" />
            <span>{isLampOn ? 'LIGHT ON' : 'LIGHT OFF'}</span>
          </div>
        </div>

        {/* Central Stage - Static Position Invariant to ON/OFF state */}
        <div className="lamp-stage">
          <div className="lamp-assembly">
            {/* Hanging Ceiling Wire */}
            <div className="lamp-ceiling-mount" />
            <div className="lamp-suspension-wire" />

            {/* Static Lamp Fixture & Pull String */}
            <div className="lamp-fixture-wrapper">
              {/* Lamp Shade & Inner Bulb */}
              <div
                className={`lamp-shade ${isLampOn ? 'on' : 'off'}`}
                onClick={toggleLamp}
                role="button"
                tabIndex={0}
                aria-label={isLampOn ? 'Turn lamp off' : 'Turn lamp on'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleLamp();
                  }
                }}
                title={isLampOn ? 'Click to turn OFF' : 'Click to turn ON'}
              >
                {/* Subtle Inner Bulb (Only subtle glow directly around bulb when ON) */}
                <div className={`lamp-inner-bulb ${isLampOn ? 'on' : 'off'}`} />
              </div>
              <div className="lamp-shade-rim" />
            </div>

            {/* Welcome Text placed cleanly underneath the lamp */}
            <div className="lamp-welcome-wrapper">
              <AnimatePresence>
                {isLampOn && (
                  <motion.div
                    key="welcome-text-active"
                    className="lamp-welcome-content"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="auth-label">WELCOME BACK</div>
                    <h1 className="auth-left-heading">
                      Your placement<br />journey continues.
                    </h1>
                    <p className="auth-left-desc">
                      Pick up right where you left off — your progress, scores, and upcoming
                      drives are waiting.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Left Side Footer */}
        <div className="lamp-left-footer">
          <div className="lamp-footer-text">
            <span>PlacePro Recruitment Portal</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE (50%): Empty when Lamp is OFF, Smoothly reveals Login Form when ON
          ========================================================================= */}
      <div className={`lamp-right-panel ${isLampOn ? 'lit' : 'dark'}`}>
        <AnimatePresence>
          {isLampOn && (
            /* Lamp ON: The clean, modern PlacePro Login Form slides & fades in smoothly */
            <motion.div
              key="login-form-active"
              className="auth-form-container"
              initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h2 className="auth-form-heading" style={{ margin: 0 }}>Sign in</h2>
                <span style={{ fontSize: 11.5, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                  <CheckCircle2 size={13} /> Lamp Active
                </span>
              </div>
              <p className="auth-form-subheading">
                Enter your credentials to access your account.
              </p>

              {error && <div className="form-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    className="form-input"
                    placeholder="········"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : <>Sign in <ArrowRight size={16} /></>}
                </button>
              </form>

              <p className="auth-footer-text">
                Don't have an account?{' '}
                <Link to="/register" className="auth-footer-link">Create one</Link>
              </p>

              {/* Demo Credentials Card */}
              <div className="demo-card">
                <div className="demo-card-title">DEMO CREDENTIALS</div>
                <div className="demo-card-text">
                  Student: student@placepro.com / Demo@1234<br />
                  Admin: admin@placepro.com / Demo@1234
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/*
========================================================================================
  PREVIOUS LOGIN PAGE DESIGN (PRESERVED AS REQUESTED — UNCOMMENT TO REVERT TO OLD UI)
========================================================================================

export function OriginalLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      authService.saveSession(data.token, data.user);

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/ * Left Side * /}
      <div className="auth-left">
        <div className="auth-left-logo">
          <PlaceProLogo size="md" dark />
        </div>

        <div className="auth-left-content">
          <div className="auth-label">WELCOME BACK</div>
          <h1 className="auth-left-heading">
            Your placement<br />journey continues.
          </h1>
          <p className="auth-left-desc">
            Pick up right where you left off — your progress, scores, and upcoming
            drives are waiting.
          </p>
        </div>

        <div className="auth-left-watermark">PlacePro</div>
      </div>

      {/ * Right Side * /}
      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-heading">Sign in</h2>
          <p className="auth-form-subheading">
            Enter your credentials to access your account.
          </p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="········"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing in...' : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-footer-link">Create one</Link>
          </p>

          <div className="demo-card">
            <div className="demo-card-title">DEMO CREDENTIALS</div>
            <div className="demo-card-text">
              Student: student@placepro.com / Demo@1234<br />
              Admin: admin@placepro.com / Demo@1234
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
========================================================================================
*/
