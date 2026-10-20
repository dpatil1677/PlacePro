import { useState, useEffect } from 'react';
import { Shield, Key, User, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminSettingsApi, adminActivityApi } from '../services/adminService';
import { authService } from '../services/authService';
import '../styles/admin.css';

export default function AdminSettings() {
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });
  const [savingPw, setSavingPw] = useState(false);

  const user = authService.getUser();

  useEffect(() => {
    adminSettingsApi.getProfile()
      .then(data => setProfile(data.user))
      .catch(() => {})
      .finally(() => setLoadingProfile(false));

    adminActivityApi.get()
      .then(data => setLogs(data.logs || []))
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  }, []);

  const handlePwChange = (e) => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    setSavingPw(true);
    setPwMsg({ text: '', type: '' });
    try {
      await adminSettingsApi.updatePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ text: 'Password updated successfully!', type: 'success' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (ex) {
      setPwMsg({ text: ex.message || 'Failed to update password.', type: 'error' });
    } finally {
      setSavingPw(false);
    }
  };

  const actionColor = (action) => {
    if (action === 'DELETE') return '#ef4444';
    if (action === 'CREATE') return '#10b981';
    return '#0062ff';
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Admin Settings</h1>
          <p>Manage your account, security, and view activity logs.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Admin Profile */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 14, alignItems: 'center' }}>
            <User size={18} color="#0062ff" />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#0B1224' }}>Admin Profile</span>
          </div>
          <div style={{ padding: '20px 24px' }}>
            {loadingProfile ? (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Loading...</p>
            ) : profile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #0062ff, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 20,
                  }}>
                    {profile.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: '#0B1224' }}>{profile.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Administrator</div>
                  </div>
                </div>
                {[
                  { label: 'Email', value: profile.email },
                  { label: 'Role', value: profile.role?.toUpperCase() },
                  { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString() },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>{f.label}</span>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{f.value}</span>
                  </div>
                ))}
                <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 8, padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <Shield size={14} color="#10b981" />
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Admin — Full Access</span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Could not load profile.</p>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 14, alignItems: 'center' }}>
            <Key size={18} color="#0062ff" />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#0B1224' }}>Change Password</span>
          </div>
          <form onSubmit={handlePwSubmit} style={{ padding: '20px 24px' }}>
            {pwMsg.text && (
              <div style={{
                background: pwMsg.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${pwMsg.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                color: pwMsg.type === 'success' ? '#10b981' : '#ef4444', fontSize: 13,
                display: 'flex', gap: 8, alignItems: 'center',
              }}>
                {pwMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                {pwMsg.text}
              </div>
            )}
            <div className="form-row">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" name="currentPassword" value={pwForm.currentPassword} onChange={handlePwChange} placeholder="Current password" />
            </div>
            <div className="form-row">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} placeholder="New password (min 6 chars)" />
            </div>
            <div className="form-row">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" name="confirmPassword" value={pwForm.confirmPassword} onChange={handlePwChange} placeholder="Repeat new password" />
            </div>
            <button type="submit" className="btn-primary" disabled={savingPw} style={{ marginTop: 8, width: '100%' }}>
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="card" style={{ padding: 0, marginTop: 24 }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 14, alignItems: 'center' }}>
          <Clock size={18} color="#0062ff" />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0B1224' }}>Activity Log</span>
          <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>Last 100 actions</span>
        </div>
        <div style={{ padding: '8px 24px 20px', maxHeight: 400, overflowY: 'auto' }}>
          {loadingLogs ? (
            <p style={{ color: '#9ca3af', fontSize: 13, padding: '12px 0' }}>Loading logs...</p>
          ) : logs.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 13, padding: '12px 0' }}>No activity recorded yet.</p>
          ) : logs.map(log => (
            <div key={log.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
              <span style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 700, flexShrink: 0,
                background: `${actionColor(log.action)}18`, color: actionColor(log.action),
              }}>
                {log.action}
              </span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, color: '#374151' }}>
                  <strong>{log.entity}</strong>
                  {log.details && ` — ${log.details}`}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
