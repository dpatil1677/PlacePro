import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, X, CheckCircle, Building2, MapPin, Briefcase } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminCompaniesApi } from '../services/adminService';
import '../styles/admin.css';

const TYPES = ['Product', 'Service', 'Startup', 'MNC', 'Consulting', 'Other'];

function CompanyModal({ company, onClose, onSaved }) {
  const isEdit = !!company;
  const [form, setForm] = useState({
    name: company?.name || '',
    role: company?.role || '',
    package: company?.package || '',
    location: company?.location || '',
    type: company?.type || 'Product',
    about: company?.about || '',
    website: company?.website || '',
    eligible: company?.eligible !== false,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.role || !form.package || !form.location) {
      setErr('Name, role, package, and location are required.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      let saved;
      if (isEdit) {
        const res = await adminCompaniesApi.update(company.id, form);
        saved = res.company;
      } else {
        const res = await adminCompaniesApi.create(form);
        saved = res.company;
      }
      onSaved(saved, isEdit);
      onClose();
    } catch (ex) {
      setErr(ex.message || 'Failed to save company.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Company' : 'Add Company'}</span>
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
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Google" />
              </div>
              <div className="form-row">
                <label className="form-label">Type</label>
                <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Job Role *</label>
                <input className="form-input" name="role" value={form.role} onChange={handleChange} placeholder="e.g. Software Engineer" />
              </div>
              <div className="form-row">
                <label className="form-label">Package *</label>
                <input className="form-input" name="package" value={form.package} onChange={handleChange} placeholder="e.g. 12-18 LPA" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Location *</label>
                <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore, India" />
              </div>
              <div className="form-row">
                <label className="form-label">Website</label>
                <input className="form-input" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">About the Company</label>
              <textarea className="form-input" name="about" value={form.about} onChange={handleChange} rows={3} placeholder="Company description..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" name="eligible" checked={form.eligible} onChange={handleChange} />
                <span className="form-label" style={{ margin: 0 }}>Eligible for student applications</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Company' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCo, setEditCo] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchCompanies = async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await adminCompaniesApi.list(q);
      setCompanies(data.companies || []);
    } catch {
      setError('Unable to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => fetchCompanies(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await adminCompaniesApi.remove(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      showToast(`${name} deleted.`);
    } catch (ex) {
      alert(ex.message || 'Failed to delete company.');
    }
  };

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setCompanies(prev => prev.map(c => c.id === saved.id ? saved : c));
      showToast('Company updated.');
    } else {
      setCompanies(prev => [saved, ...prev]);
      showToast('Company added.');
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
          <h1>Company Management</h1>
          <p>Manage partner companies visible to students. Total: <strong>{companies.length}</strong></p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Company
        </button>
      </div>

      <div className="search-bar" style={{ marginBottom: 20 }}>
        <Search size={16} color="#9ca3af" />
        <input
          type="text"
          placeholder="Search companies by name, role, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="state-loading"><div className="state-icon">⏳</div><p>Loading companies...</p></div>
      ) : error ? (
        <div className="state-error"><div className="state-icon">⚠️</div><h3>Something went wrong</h3><p>{error}</p></div>
      ) : companies.length === 0 ? (
        <div className="state-empty">
          <div className="state-icon"><Building2 size={40} color="#d1d5db" /></div>
          <h3>No companies yet</h3>
          <p>Add company profiles so students can explore opportunities.</p>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add First Company
          </button>
        </div>
      ) : (
        <div className="drives-grid">
          {companies.map((co) => (
            <div key={co.id} className="drive-card">
              <div className="drive-card-top">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #0062ff, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0,
                  }}>
                    {co.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: 16, color: '#0B1224', marginBottom: 2 }}>{co.name}</h3>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{co.type}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                  background: co.eligible ? 'rgba(16,185,129,0.1)' : 'rgba(156,163,175,0.1)',
                  color: co.eligible ? '#10b981' : '#9ca3af',
                }}>
                  {co.eligible ? 'Eligible' : 'Not Eligible'}
                </span>
              </div>

              <div className="drive-card-details">
                <div className="drive-detail-row">
                  <Briefcase size={14} />
                  <span><span className="drive-detail-label">Role:</span> {co.role}</span>
                </div>
                <div className="drive-detail-row">
                  <span style={{ fontWeight: 700, color: '#0062ff', fontSize: 14 }}>₹</span>
                  <span><span className="drive-detail-label">Package:</span> <strong className="drive-package-value">{co.package}</strong></span>
                </div>
                <div className="drive-detail-row">
                  <MapPin size={14} />
                  <span><span className="drive-detail-label">Location:</span> {co.location}</span>
                </div>
                {co.about && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>
                    {co.about.slice(0, 100)}{co.about.length > 100 ? '...' : ''}
                  </div>
                )}
              </div>

              <div className="drive-card-footer">
                <span className="drive-registered" style={{ color: co.website ? '#0062ff' : '#9ca3af' }}>
                  {co.website ? '🌐 Has website' : 'No website'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn-icon-delete"
                    title="Edit"
                    onClick={() => setEditCo(co)}
                    style={{ color: '#0062ff', background: 'rgba(0,98,255,0.08)' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn-icon-delete"
                    title="Delete"
                    onClick={() => handleDelete(co.id, co.name)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CompanyModal onClose={() => setShowModal(false)} onSaved={handleSaved} />}
      {editCo && <CompanyModal company={editCo} onClose={() => setEditCo(null)} onSaved={handleSaved} />}
    </AdminLayout>
  );
}
