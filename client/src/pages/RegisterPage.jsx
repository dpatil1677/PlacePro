import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlaceProLogo from '../components/PlaceProLogo';
import { authService } from '../services/authService';
import '../styles/auth.css';

// Subtle metallic click sound synthesized with Web Audio API
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    branch: '',
    gradYear: '',
  });
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.register(form);
      authService.saveSession(data.token, data.user);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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

            {/* Static Lamp Fixture */}
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
                    key="reg-welcome-text-active"
                    className="lamp-welcome-content"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="auth-label">GET STARTED</div>
                    <h1 className="auth-left-heading">
                      Your dream job<br />starts here.
                    </h1>
                    <p className="auth-left-desc">
                      Join 50,000+ students who have already cracked top product companies with
                      PlacePro's AI-powered prep stack.
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
          RIGHT SIDE (50%): Empty when Lamp is OFF, Smoothly reveals Form when ON
          ========================================================================= */}
      <div className={`lamp-right-panel ${isLampOn ? 'lit' : 'dark'}`}>
        <AnimatePresence>
          {isLampOn && (
            /* Lamp ON: The clean, modern PlacePro Register Form slides & fades in smoothly */
            <motion.div
              key="register-form-active"
              className="auth-form-container"
              style={{ maxWidth: '380px' }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h2 className="auth-form-heading" style={{ margin: 0 }}>Create account</h2>
                <span style={{ fontSize: 11.5, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                  <CheckCircle2 size={13} /> Lamp Active
                </span>
              </div>
              <p className="auth-form-subheading" style={{ marginBottom: 16 }}>
                Join your university's placement portal.
              </p>

              {error && <div className="form-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: 11 }}>
                  <label className="form-label" htmlFor="reg-name" style={{ marginBottom: 4, fontSize: 12 }}>Full Name</label>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="Arjun Sharma"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    style={{ padding: '8px 12px', fontSize: 13 }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 11 }}>
                  <label className="form-label" htmlFor="reg-email" style={{ marginBottom: 4, fontSize: 12 }}>Email</label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="name@university.edu"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    style={{ padding: '8px 12px', fontSize: 13 }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 11 }}>
                  <label className="form-label" htmlFor="reg-password" style={{ marginBottom: 4, fontSize: 12 }}>Password</label>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    className="form-input"
                    placeholder="········"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    style={{ padding: '8px 12px', fontSize: 13 }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 11 }}>
                  <label className="form-label" htmlFor="reg-college" style={{ marginBottom: 4, fontSize: 12 }}>College / University</label>
                  <input
                    id="reg-college"
                    name="college"
                    type="text"
                    className="form-input"
                    placeholder="IIT Delhi"
                    value={form.college}
                    onChange={handleChange}
                    required
                    style={{ padding: '8px 12px', fontSize: 13 }}
                  />
                </div>

                <div className="form-row" style={{ gap: 10, marginBottom: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="reg-branch" style={{ marginBottom: 4, fontSize: 12 }}>Branch</label>
                    <input
                      id="reg-branch"
                      name="branch"
                      type="text"
                      className="form-input"
                      placeholder="Computer Science"
                      value={form.branch}
                      onChange={handleChange}
                      required
                      style={{ padding: '8px 12px', fontSize: 13 }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="reg-gradYear" style={{ marginBottom: 4, fontSize: 12 }}>Grad Year</label>
                    <input
                      id="reg-gradYear"
                      name="gradYear"
                      type="text"
                      className="form-input"
                      placeholder="2027"
                      value={form.gradYear}
                      onChange={handleChange}
                      required
                      style={{ padding: '8px 12px', fontSize: 13 }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ marginTop: 8 }}
                >
                  {loading ? 'Creating account...' : <>Create account <ArrowRight size={15} /></>}
                </button>
              </form>

              <p className="auth-footer-text">
                Already have an account?{' '}
                <Link to="/login" className="auth-footer-link">Sign In</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/*
========================================================================================
  PREVIOUS REGISTER PAGE DESIGN (PRESERVED AS REQUESTED — UNCOMMENT TO REVERT TO OLD UI)
========================================================================================

export function OriginalRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    branch: '',
    gradYear: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.register(form);
      authService.saveSession(data.token, data.user);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">
          <PlaceProLogo size="md" dark />
        </div>
        <div className="auth-left-content">
          <div className="auth-label">GET STARTED</div>
          <h1 className="auth-left-heading">
            Your dream job<br />starts here.
          </h1>
          <p className="auth-left-desc">
            Join 50,000+ students who have already cracked top product companies with
            PlacePro's AI-powered prep stack.
          </p>
        </div>
        <div className="auth-left-watermark">PlacePro</div>
      </div>
      <div className="auth-right">
        <div className="auth-form-container" style={{ maxWidth: '420px' }}>
          <h2 className="auth-form-heading">Create account</h2>
          <p className="auth-form-subheading">
            Join your university's placement portal.
          </p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="orig-reg-name">Full Name</label>
              <input
                id="orig-reg-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Arjun Sharma"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="orig-reg-email">Email</label>
              <input
                id="orig-reg-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="name@university.edu"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="orig-reg-password">Password</label>
              <input
                id="orig-reg-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="········"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="orig-reg-college">College / University</label>
              <input
                id="orig-reg-college"
                name="college"
                type="text"
                className="form-input"
                placeholder="IIT Delhi"
                value={form.college}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="orig-reg-branch">Branch</label>
                <input
                  id="orig-reg-branch"
                  name="branch"
                  type="text"
                  className="form-input"
                  placeholder="Computer Science"
                  value={form.branch}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="orig-reg-gradYear">Grad Year</label>
                <input
                  id="orig-reg-gradYear"
                  name="gradYear"
                  type="text"
                  className="form-input"
                  placeholder="2027"
                  value={form.gradYear}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              {loading ? 'Creating account...' : <>Create account <ArrowRight size={16} /></>}
            </button>
          </form>
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
========================================================================================
*/
