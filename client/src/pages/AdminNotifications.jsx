import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, X, CheckCircle, Send } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminNotificationsApi } from '../services/adminService';
import '../styles/admin.css';

const NOTIF_TYPES = [
  { value: 'general', label: '📢 General', desc: 'General announcements' },
  { value: 'drive', label: '💼 Drive', desc: 'Placement drive updates' },
  { value: 'result', label: '🏆 Result', desc: 'Placement results' },
  { value: 'alert', label: '⚠️ Alert', desc: 'Urgent alerts' },
];

function typeStyle(type) {
  const map = {
    general: { bg: 'rgba(0,98,255,0.1)', color: '#0062ff', icon: '📢' },
    drive:   { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', icon: '💼' },
    result:  { bg: 'rgba(16,185,129,0.1)', color: '#10b981', icon: '🏆' },
    alert:   { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', icon: '⚠️' },
  };
  return map[type] || map.general;
}

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', message: '', type: 'general', target: 'all' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setErr('Title and message are required.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const res = await adminNotificationsApi.create(form);
      onCreate(res.notification);
      onClose();
    } catch (ex) {
      setErr(ex.message || 'Failed to send notification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Send Notification</span>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {err && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#ef4444', fontSize: '13px' }}>
                {err}
              </div>
            )}
            <div className="form-row">
              <label className="form-label">Notification Title *</label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Google Drive Scheduled" />
            </div>
            <div className="form-row">
              <label className="form-label">Message *</label>
              <textarea className="form-input" name="message" value={form.message} onChange={handleChange} rows={4} placeholder="Write the announcement..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Type</label>
                <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                  {NOTIF_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Target Audience</label>
                <select className="form-select" name="target" value={form.target} onChange={handleChange}>
                  <option value="all">All Students</option>
                  <option value="CSE">CSE Branch</option>
                  <option value="IT">IT Branch</option>
                  <option value="ECE">ECE Branch</option>
                  <option value="ME">ME Branch</option>
                  <option value="2025">Batch 2025</option>
                  <option value="2026">Batch 2026</option>
                  <option value="2027">Batch 2027</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Sending...' : <><Send size={14} /> Send Notification</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    adminNotificationsApi.list()
      .then(data => setNotifications(data.notifications || []))
      .catch(() => setError('Unable to load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await adminNotificationsApi.remove(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('Notification deleted.');
    } catch {
      alert('Failed to delete.');
    }
  };

  return (
    <AdminLayout>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0062ff', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,98,255,0.3)' }}>
          <CheckCircle size={15} style={{ marginRight: 6 }} /> {toast}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1>Notifications & Announcements</h1>
          <p>Broadcast messages to students. Saved and shown in real-time.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Notification
        </button>
      </div>

      {loading ? (
        <div className="state-loading"><div className="state-icon">⏳</div><p>Loading...</p></div>
      ) : error ? (
        <div className="state-error"><div className="state-icon">⚠️</div><h3>Error</h3><p>{error}</p></div>
      ) : notifications.length === 0 ? (
        <div className="state-empty">
          <div className="state-icon"><Bell size={40} color="#d1d5db" /></div>
          <h3>No notifications sent</h3>
          <p>Send your first announcement to students.</p>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}>
            <Plus size={14} /> Send Notification
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map(n => {
            const { bg, color, icon } = typeStyle(n.type);
            return (
              <div key={n.id} className="question-card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0B1224' }}>{n.title}</h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: bg, color, fontWeight: 600 }}>
                        {n.type}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>→ {n.target}</span>
                      <button className="btn-icon-delete" onClick={() => handleDelete(n.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{n.message}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={(n) => { setNotifications(prev => [n, ...prev]); showToast('Notification sent!'); }}
        />
      )}
    </AdminLayout>
  );
}
