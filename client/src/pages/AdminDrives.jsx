import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Calendar, Users, Briefcase, X, AlertTriangle,
  Edit2, MapPin, Clock, CheckCircle,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminDrivesApi, adminCompaniesApi } from '../services/adminService';
import '../styles/admin.css';

function DriveStatusBadge({ status }) {
  const cls =
    status === 'Upcoming' ? 'status-upcoming' :
    status === 'Ongoing'  ? 'status-ongoing'  :
    status === 'Closed'   ? 'status-closed'   :
    'status-completed';
  return <span className={`drive-status-badge ${cls}`}>{status}</span>;
}

function ConfirmDialog({ title, desc, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="confirm-box">
        <div className="confirm-icon"><AlertTriangle size={22} color="#ef4444" /></div>
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
  company: '', companyId: '', title: '', date: '', deadline: '', eligibility: '',
  package: '', status: 'Upcoming', location: '', description: '',
};

function DriveModal({ drive, onClose, onSaved }) {
  const isEdit = !!drive;
  const [form, setForm] = useState({
    company: drive?.company || '',
    companyId: drive?.companyId || '',
    title: drive?.title || '',
    date: drive?.date || '',
    deadline: drive?.deadline || '',
    eligibility: drive?.eligibility || '',
    package: drive?.package || '',
    status: drive?.status || 'Upcoming',
    location: drive?.location || '',
    description: drive?.description || '',
  });
  const [companies, setCompanies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    adminCompaniesApi.list().then(res => {
      setCompanies(res.companies || []);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'company') {
      const match = companies.find(c => c.name.toLowerCase() === value.trim().toLowerCase());
      setForm(f => ({
        ...f,
        company: value,
        companyId: match ? match.id : '',
        package: !f.package && match ? match.package : f.package,
        location: !f.location && match ? match.location : f.location,
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
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
      let saved;
      if (isEdit) {
        const res = await adminDrivesApi.update(drive.id, form);
        saved = res.drive;
      } else {
        const res = await adminDrivesApi.create(form);
        saved = res.drive;
      }
      onSaved(saved, isEdit);
      onClose();
    } catch (ex) {
      setErr(ex.message || 'Failed to save drive.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Drive' : 'New Placement Drive'}</span>
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
                <input
                  className="form-input"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Select or enter company..."
                  list="admin-company-options"
                />
                <datalist id="admin-company-options">
                  {companies.map(c => (
                    <option key={c.id} value={c.name}>{c.role} • {c.package}</option>
                  ))}
                </datalist>
              </div>
              <div className="form-row">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Closed">Closed</option>
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
                <label className="form-label">Drive Date *</label>
                <input className="form-input" name="date" type="date" value={form.date} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label className="form-label">Application Deadline</label>
                <input className="form-input" name="deadline" type="date" value={form.deadline} onChange={handleChange} />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Package Offered</label>
                <input className="form-input" name="package" value={form.package} onChange={handleChange} placeholder="e.g. 12-15 LPA" />
              </div>
              <div className="form-row">
                <label className="form-label">Location</label>
                <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore" />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Eligibility</label>
              <input className="form-input" name="eligibility" value={form.eligibility} onChange={handleChange} placeholder="e.g. CSE/IT - 7.5 CGPA+, 2025 batch" />
            </div>
            <div className="form-row">
              <label className="form-label">Description</label>
              <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Job description..." style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Drive' : 'Create Drive'}
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
  const [editDrive, setEditDrive] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

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
      setDrives(prev => prev.filter(d => d.id !== confirmId));
      showToast('Drive deleted successfully.');
    } catch {
      alert('Failed to delete drive.');
    } finally {
      setConfirmId(null);
    }
  };

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setDrives(prev => prev.map(d => d.id === saved.id ? { ...saved, applicationCounts: d.applicationCounts, totalApplications: d.totalApplications } : d));
      showToast('Drive updated successfully.');
    } else {
      setDrives(prev => [{ ...saved, applicationCounts: {}, totalApplications: 0 }, ...prev]);
      showToast('Drive created successfully.');
    }
  };

  return (
    <AdminLayout>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0062ff', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,98,255,0.3)' }}>
          <CheckCircle size={15} style={{ marginRight: 6 }} /> {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Placement Drives</h1>
          <p>Manage campus recruitment schedules. Total: <strong>{drives.length}</strong></p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Drive
        </button>
      </div>

      {loading ? (
        <div className="state-loading"><div className="state-icon">⏳</div><p>Loading drives...</p></div>
      ) : error ? (
        <div className="state-error"><div className="state-icon">⚠️</div><h3>Something went wrong</h3><p>{error}</p></div>
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
                  <div className="drive-card-company-icon">
                    <Briefcase size={20} color="#9ca3af" />
                  </div>
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
                {drive.deadline && (
                  <div className="drive-detail-row">
                    <Clock size={14} />
                    <span><span className="drive-detail-label">Deadline:</span> {drive.deadline}</span>
                  </div>
                )}
                {drive.location && (
                  <div className="drive-detail-row">
                    <MapPin size={14} />
                    <span><span className="drive-detail-label">Location:</span> {drive.location}</span>
                  </div>
                )}
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

              {/* Application stats */}
              {drive.totalApplications > 0 && (
                <div style={{ padding: '8px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(drive.applicationCounts || {}).map(([st, cnt]) => (
                    <span key={st} style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                      background: st === 'Selected' ? 'rgba(16,185,129,0.1)' : st === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(0,98,255,0.1)',
                      color: st === 'Selected' ? '#10b981' : st === 'Rejected' ? '#ef4444' : '#0062ff',
                    }}>{st}: {cnt}</span>
                  ))}
                </div>
              )}

              <div className="drive-card-footer">
                <span className="drive-registered">{drive.registered ?? 0} Registered · {drive.totalApplications ?? 0} Applied</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn-icon-delete"
                    title="Edit drive"
                    onClick={() => setEditDrive(drive)}
                    style={{ color: '#0062ff', background: 'rgba(0,98,255,0.08)' }}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className="btn-icon-delete"
                    title="Delete drive"
                    onClick={() => setConfirmId(drive.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <DriveModal onClose={() => setShowModal(false)} onSaved={handleSaved} />
      )}

      {/* Edit Modal */}
      {editDrive && (
        <DriveModal drive={editDrive} onClose={() => setEditDrive(null)} onSaved={handleSaved} />
      )}

      {/* Confirm Delete */}
      {confirmId && (
        <ConfirmDialog
          title="Delete Drive?"
          desc="This will permanently remove the drive and all its applications."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </AdminLayout>
  );
}
