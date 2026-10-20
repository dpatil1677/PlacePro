import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PlaceProLogo from '../components/PlaceProLogo';
import { authService } from '../services/authService';
import '../styles/auth.css';

export default function LoginPage() {
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
      {/* Left Side */}
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

      {/* Right Side */}
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

          {/* Demo Credentials */}
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
