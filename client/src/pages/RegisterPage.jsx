import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PlaceProLogo from '../components/PlaceProLogo';
import { authService } from '../services/authService';
import '../styles/auth.css';

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
      {/* Left Side */}
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

      {/* Right Side */}
      <div className="auth-right">
        <div className="auth-form-container" style={{ maxWidth: '420px' }}>
          <h2 className="auth-form-heading">Create account</h2>
          <p className="auth-form-subheading">
            Join your university's placement portal.
          </p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
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
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
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
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
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
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-college">College / University</label>
              <input
                id="reg-college"
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
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="reg-branch">Branch</label>
                <input
                  id="reg-branch"
                  name="branch"
                  type="text"
                  className="form-input"
                  placeholder="Computer Science"
                  value={form.branch}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="reg-gradYear">Grad Year</label>
                <input
                  id="reg-gradYear"
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
