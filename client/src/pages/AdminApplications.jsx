import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, Award, ChevronDown, Filter, RefreshCw } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminApplicationsApi, adminDrivesApi } from '../services/adminService';
import '../styles/admin.css';

const STATUS_OPTIONS = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

function statusStyle(status) {
  const map = {
    Applied:     { bg: 'rgba(0,98,255,0.1)',   color: '#0062ff' },
    Shortlisted: { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
    Interview:   { bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed' },
    Selected:    { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
    Rejected:    { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  };
  return map[status] || { bg: '#f3f4f6', color: '#6b7280' };
}

function StatusSelect({ appId, current, onChange }) {
  const [open, setOpen] = useState(false);
  const { bg, color } = statusStyle(current);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: bg, color, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        {current} <ChevronDown size={11} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, background: '#fff', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb',
          zIndex: 100, minWidth: 130, overflow: 'hidden',
        }}>
          {STATUS_OPTIONS.map(s => {
            const { bg: sbg, color: sc } = statusStyle(s);
            return (
              <button
                key={s}
                onClick={() => { onChange(appId, s); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px',
                  fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: s === current ? sbg : '#fff', color: sc,
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterDrive, setFilterDrive] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [toast, setToast] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appsRes, drivesRes] = await Promise.all([
        adminApplicationsApi.list({ search, driveId: filterDrive, status: filterStatus }),
        adminDrivesApi.list(),
      ]);
      setApplications(appsRes.applications || []);
      setDrives(drivesRes.drives || []);
    } catch {
      setError('Unable to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [search, filterDrive, filterStatus]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const res = await adminApplicationsApi.update(appId, { status: newStatus });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      showToast(`Application status updated to ${newStatus}.`);
    } catch (ex) {
      alert(ex.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkAction = async (newStatus) => {
    if (!selected.length) return;
    if (!window.confirm(`Mark ${selected.length} applications as "${newStatus}"?`)) return;
    try {
      await adminApplicationsApi.bulkUpdate(selected, newStatus);
      setApplications(prev => prev.map(a => selected.includes(a.id) ? { ...a, status: newStatus } : a));
      setSelected([]);
      showToast(`${selected.length} applications marked as ${newStatus}.`);
    } catch (ex) {
      alert(ex.message || 'Bulk update failed.');
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelected(selected.length === applications.length ? [] : applications.map(a => a.id));
  };

  // Stats
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    interview: applications.filter(a => a.status === 'Interview').length,
    selected: applications.filter(a => a.status === 'Selected').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
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
          <h1>Applications & Selections</h1>
          <p>Track and manage student applications across all placement drives.</p>
        </div>
        <button className="btn-secondary" onClick={fetchData}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', marginBottom: 20 }}>
        {[
          { label: 'Total', value: stats.total, color: '#6b7280' },
          { label: 'Applied', value: stats.applied, color: '#0062ff' },
          { label: 'Shortlisted', value: stats.shortlisted, color: '#f59e0b' },
          { label: 'Interview', value: stats.interview, color: '#7c3aed' },
          { label: 'Selected', value: stats.selected, color: '#10b981' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-label">{s.label}</div>
            <div className="admin-stat-value" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={filterDrive} onChange={e => setFilterDrive(e.target.value)} style={{ minWidth: 180 }}>
          <option value="">All Drives</option>
          {drives.map(d => <option key={d.id} value={d.id}>{d.company} — {d.title?.slice(0, 20)}</option>)}
        </select>
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ minWidth: 130 }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div style={{ background: '#f0f4ff', border: '1px solid #c7d7ff', borderRadius: 10, padding: '10px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0062ff' }}>{selected.length} selected</span>
          {['Shortlisted', 'Interview', 'Selected', 'Rejected'].map(s => (
            <button
              key={s}
              onClick={() => handleBulkAction(s)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: 'none', cursor: 'pointer', ...statusStyle(s),
                background: statusStyle(s).bg,
              }}
            >
              Mark {s}
            </button>
          ))}
          <button onClick={() => setSelected([])} style={{ fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="students-card">
        {loading ? (
          <div className="state-loading"><div className="state-icon">⏳</div><p>Loading applications...</p></div>
        ) : error ? (
          <div className="state-error"><div className="state-icon">⚠️</div><h3>Error</h3><p>{error}</p></div>
        ) : applications.length === 0 ? (
          <div className="state-empty">
            <div className="state-icon">📋</div>
            <h3>No applications found</h3>
            <p>{filterStatus || filterDrive || search ? 'Try clearing filters.' : 'Students haven\'t applied to any drives yet.'}</p>
          </div>
        ) : (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input type="checkbox" onChange={selectAll} checked={selected.length === applications.length && applications.length > 0} />
                  </th>
                  <th>Student</th>
                  <th>Drive / Company</th>
                  <th>Package</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Round</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id} style={{ opacity: updatingId === a.id ? 0.5 : 1 }}>
                    <td>
                      <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} />
                    </td>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar" style={{ background: '#7c3aed', width: 32, height: 32, fontSize: 12 }}>
                          {a.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="student-name" style={{ fontSize: 13 }}>{a.user?.name || 'Unknown'}</div>
                          <div className="student-email">{a.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.drive?.company || '—'}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{a.drive?.title?.slice(0, 30)}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0062ff' }}>
                        {a.drive?.package || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td>
                      <StatusSelect appId={a.id} current={a.status} onChange={handleStatusChange} />
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>{a.round || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
