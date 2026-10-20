import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Users, Briefcase, X, AlertTriangle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminDrivesApi } from '../services/adminService';
import '../styles/admin.css';

function DriveStatusBadge({ status }) {
  const cls =
    status === 'Upcoming' ? 'status-upcoming' :
    status === 'Ongoing'  ? 'status-ongoing'  :
    'status-completed';
  return <span className={`drive-status-badge ${cls}`}>{status}</span>;
}

function CompanyIcon() {
  return (
    <div className="drive-card-company-icon">
      <Briefcase size={20} color="#9ca3af" />
    </div>
  );
}

function ConfirmDialog({ title, desc, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="confirm-box">
        <div className="confirm-icon">
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-desc">{desc}</div>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  company: '', title: '', date: '', eligibility: '', package: '', status: 'Upcoming',
};

function NewDriveModal({ onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.title || !form.date) {
      setErr('Company name, drive title and date are required.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const data = await adminDrivesApi.create(form);
      onCreate(data.drive);
      onClose();
    } catch (ex) {
      setErr(ex.message || 'Failed to create drive.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">New Placement Drive</span>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {err && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#ef4444', fontSize: '13px' }}>
                {err}
              </div>
            )}
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Company Name *</label>
                <input className="form-input" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google" />
              </div>
              <div className="form-row">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Drive Title *</label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Campus Recruitment Drive 2025" />
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Date *</label>
                <input className="form-input" name="date" value={form.date} onChange={handleChange} placeholder="DD/MM/YYYY" />
              </div>
              <div className="form-row">
                <label className="form-label">Package</label>
                <input className="form-input" name="package" value={form.package} onChange={handleChange} placeholder="e.g. 12-15 LPA" />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Eligibility</label>
              <input className="form-input" name="eligibility" value={form.eligibility} onChange={handleChange} placeholder="e.g. CSE/IT - 7.5 CGPA+, 2025 batch" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const fetchDrives = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminDrivesApi.list();
      setDrives(data.drives || []);
    } catch {
      setError('Unable to load drives. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrives(); }, []);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await adminDrivesApi.remove(confirmId);
      setDrives((prev) => prev.filter((d) => d.id !== confirmId));
    } catch {
      alert('Failed to delete drive.');
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Placement Drives</h1>
          <p>Manage campus recruitment schedules.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Drive
        </button>
      </div>

      {loading ? (
        <div className="state-loading">
          <div className="state-icon">⏳</div>
          <p>Loading drives...</p>
        </div>
      ) : error ? (
        <div className="state-error">
          <div className="state-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      ) : drives.length === 0 ? (
        <div className="state-empty">
          <div className="state-icon">📋</div>
          <h3>No drives yet</h3>
          <p>Create your first placement drive using the button above.</p>
        </div>
      ) : (
        <div className="drives-grid">
          {drives.map((drive) => (
            <div key={drive.id} className="drive-card">
              <div className="drive-card-top">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                  <CompanyIcon />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0B1224', marginBottom: '3px' }}>{drive.company}</h3>
                    <div className="drive-card-title">{drive.title}</div>
                  </div>
                </div>
                <DriveStatusBadge status={drive.status} />
              </div>

              <div className="drive-card-details">
                <div className="drive-detail-row">
                  <Calendar size={14} />
                  <span><span className="drive-detail-label">Date:</span> {drive.date}</span>
                </div>
                {drive.eligibility && (
                  <div className="drive-detail-row">
                    <Users size={14} />
                    <span><span className="drive-detail-label">Eligibility:</span> {drive.eligibility}</span>
                  </div>
                )}
                {drive.package && (
                  <div className="drive-detail-row">
                    <Briefcase size={14} />
                    <span>
                      <span className="drive-detail-label">Package:</span>{' '}
                      <span className="drive-package-value">{drive.package}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="drive-card-footer">
                <span className="drive-registered">{drive.registered ?? 0} Registered</span>
                <button
                  className="btn-icon-delete"
                  title="Delete drive"
                  onClick={() => setConfirmId(drive.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewDriveModal
          onClose={() => setShowModal(false)}
          onCreate={(newDrive) => setDrives((prev) => [...prev, newDrive])}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete Drive?"
          desc="This action cannot be undone. The drive will be permanently removed."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </AdminLayout>
  );
}
