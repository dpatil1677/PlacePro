import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Lock, Eye, EyeOff, Clock, RotateCcw } from 'lucide-react';
import PlaceProLogo from '../components/PlaceProLogo';
import { authService } from '../services/authService';
import '../styles/auth.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Steps: 'email' | 'otp' | 'password' | 'success'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & loaders
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Timers
  const [otpExpiresIn, setOtpExpiresIn] = useState(300); // 5 minutes (300 seconds)
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds

  // Input refs for the 6 OTP input boxes
  const inputRefs = useRef([]);

  // Timer countdown effect for OTP expiration
  useEffect(() => {
    let timer;
    if (step === 'otp' && otpExpiresIn > 0) {
      timer = setInterval(() => {
        setOtpExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpExpiresIn]);

  // Timer countdown effect for Resend Cooldown
  useEffect(() => {
    let timer;
    if (step === 'otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Focus the first OTP box when entering the OTP step
  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Format seconds to mm:ss
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // STEP 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;

    setError('');
    setSuccessNotice('');
    setLoading(true);

    try {
      await authService.sendPasswordResetOtp(email);
      setStep('otp');
      setOtp(['', '', '', '', '', '']);
      setOtpExpiresIn(300); // Reset 5 min timer
      setResendCooldown(60); // 60s cooldown
      setSuccessNotice('A 6-digit verification code has been dispatched to your email.');
    } catch (err) {
      setError(err.message || 'Unable to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;

    setError('');
    setSuccessNotice('');
    setLoading(true);

    try {
      await authService.sendPasswordResetOtp(email);
      setOtp(['', '', '', '', '', '']);
      setOtpExpiresIn(300);
      setResendCooldown(60);
      setSuccessNotice('New verification code sent to your email.');
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle single OTP digit change
  const handleOtpChange = (index, value) => {
    // Only accept numeric characters
    const cleanValue = value.replace(/\D/g, '');

    const newOtp = [...otp];

    if (cleanValue.length > 1) {
      // If user typed multiple digits or browser autofilled
      const chars = cleanValue.slice(0, 6).split('');
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextFocus = Math.min(index + chars.length, 5);
      if (inputRefs.current[nextFocus]) {
        inputRefs.current[nextFocus].focus();
      }
      return;
    }

    newOtp[index] = cleanValue;
    setOtp(newOtp);

    // Auto-advance to next input box if digit entered
    if (cleanValue && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace navigation and Arrow keys
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Paste event across all boxes
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    const cleanDigits = pasteData.replace(/\D/g, '').slice(0, 6);
    if (!cleanDigits) return;

    const newOtp = [...otp];
    cleanDigits.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus last filled box or verify
    const focusTarget = Math.min(cleanDigits.length, 5);
    if (inputRefs.current[focusTarget]) {
      inputRefs.current[focusTarget].focus();
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (otpExpiresIn <= 0) {
      setError('This verification code has expired. Please click "Resend code".');
      return;
    }

    setError('');
    setSuccessNotice('');
    setLoading(true);

    try {
      const response = await authService.verifyPasswordResetOtp(email, fullCode);
      setResetToken(response.resetToken);
      setStep('password');
      setSuccessNotice('Code verified. Set your new password below.');
    } catch (err) {
      setError(err.message || 'Incorrect verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setError('');
    setSuccessNotice('');
    setLoading(true);

    try {
      await authService.resetPasswordWithOtp(email, resetToken, newPassword, confirmPassword);
      setStep('success');
      // Auto-redirect to login after 3.5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3500);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lamp-login-page" style={{ justifyContent: 'center', alignItems: 'center', background: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      <div
        className="auth-form-container"
        style={{
          width: '100%',
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

        {/* Global Error Banner */}
        {error && (
          <div className="form-error" style={{ marginBottom: 18, lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {/* Global Info / Success Banner */}
        {successNotice && !error && step !== 'success' && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '13px',
              marginBottom: 18,
              lineHeight: 1.5,
            }}
          >
            {successNotice}
          </div>
        )}

        {/* STEP 1: EMAIL ENTRY */}
        {step === 'email' && (
          <div>
            <h2 className="auth-form-heading" style={{ fontSize: 26, marginBottom: 8 }}>Forgot password?</h2>
            <p className="auth-form-subheading" style={{ marginBottom: 24, lineHeight: 1.5 }}>
              Enter your registered university email address to receive a 6-digit password recovery code.
            </p>

            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Institutional Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !email.trim()}
                style={{ marginTop: 12 }}
              >
                {loading ? 'Sending code...' : (
                  <>
                    Send recovery link <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link to="/login" className="auth-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5 }}>
                <ArrowLeft size={14} /> Back to Sign in
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === 'otp' && (
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(0, 98, 255, 0.08)',
                color: '#0062ff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <KeyRound size={22} />
            </div>

            <h2 className="auth-form-heading" style={{ fontSize: 24, marginBottom: 8 }}>Verify your code</h2>
            <p className="auth-form-subheading" style={{ marginBottom: 20, lineHeight: 1.5 }}>
              We sent a 6-digit verification code to <strong>{email}</strong>.{' '}
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); setSuccessNotice(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0062ff',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  textDecoration: 'underline',
                }}
              >
                Change
              </button>
            </p>

            <form onSubmit={handleVerifyOtp}>
              {/* 6 Individual OTP Boxes */}
              <div className="otp-inputs-grid" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className="otp-box-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={loading}
                    autoComplete="off"
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Countdown Timer & Resend Option */}
              <div className="otp-meta-row">
                <span className="otp-timer-badge">
                  <Clock size={13} />
                  {otpExpiresIn > 0 ? (
                    <span>Expires in <strong>{formatTimer(otpExpiresIn)}</strong></span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>Code expired</span>
                  )}
                </span>

                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                >
                  {resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <RotateCcw size={12} /> Resend OTP
                    </span>
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || otp.join('').length !== 6 || otpExpiresIn <= 0}
                style={{ marginTop: 8 }}
              >
                {loading ? 'Verifying...' : (
                  <>
                    Verify OTP <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); setSuccessNotice(''); }}
                className="auth-footer-link"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13.5,
                  padding: 0,
                }}
              >
                <ArrowLeft size={14} /> Back to email entry
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 'password' && (
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(0, 98, 255, 0.08)',
                color: '#0062ff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Lock size={22} />
            </div>

            <h2 className="auth-form-heading" style={{ fontSize: 24, marginBottom: 8 }}>Set new password</h2>
            <p className="auth-form-subheading" style={{ marginBottom: 24, lineHeight: 1.5 }}>
              Choose a secure password for your account (minimum 6 characters).
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !newPassword || !confirmPassword}
                style={{ marginTop: 12 }}
              >
                {loading ? 'Updating password...' : (
                  <>
                    Reset password <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS & REDIRECT */}
        {step === 'success' && (
          <div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <CheckCircle2 size={30} />
            </div>
            <h2 className="auth-form-heading" style={{ fontSize: 24, marginBottom: 8 }}>Password updated!</h2>
            <p className="auth-form-subheading" style={{ marginBottom: 28, lineHeight: 1.6 }}>
              Your PlacePro account password has been successfully reset. You will now be redirected to the sign-in page.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{ width: '100%', textDecoration: 'none' }}
            >
              Sign in now <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
