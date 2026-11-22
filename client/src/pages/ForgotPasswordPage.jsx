import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import PlaceProLogo from '../components/PlaceProLogo';
import { authService } from '../services/authService';
import '../styles/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus({ loading: true, success: false, error: '' });
    try {
      await authService.forgotPassword(email);
      setStatus({ loading: false, success: true, error: '' });
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        error: err.message || 'Unable to submit recovery request. Please try again.',
      });
    }
  };

  return (
    <div className="lamp-login-page" style={{ justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
      <div
        className="auth-form-container"
        style={{
          maxWidth: 440,
          background: '#ffffff',
          padding: '40px 36px',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08)',
          border: '1px solid #e2e8f0',
          margin: 20,
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <Link to="/" aria-label="PlacePro Home">
            <PlaceProLogo size="md" color="#0062ff" variant="auth" />
          </Link>
        </div>

        {status.success ? (
          <div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <CheckCircle2 size={26} />
            </div>
            <h2 className="auth-form-heading" style={{ fontSize: 24, marginBottom: 8 }}>Check your inbox</h2>
            <p className="auth-form-subheading" style={{ marginBottom: 24, lineHeight: 1.6 }}>
              Recovery instructions have been dispatched to <strong>{email}</strong>. Please follow the instructions to regain access, or contact your university placement cell if you need immediate assistance.
            </p>
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Return to Sign in
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="auth-form-heading" style={{ fontSize: 26, marginBottom: 8 }}>Forgot password?</h2>
            <p className="auth-form-subheading" style={{ marginBottom: 24, lineHeight: 1.5 }}>
              Enter your registered university email address to receive password recovery instructions.
            </p>

            {status.error && <div className="form-error" style={{ marginBottom: 18 }}>{status.error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Institutional Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-input"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={status.loading}
                style={{ marginTop: 12 }}
              >
                {status.loading ? 'Sending instructions...' : <>Send recovery link <ArrowRight size={16} /></>}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link to="/login" className="auth-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5 }}>
                <ArrowLeft size={14} /> Back to Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

