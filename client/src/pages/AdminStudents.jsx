import { useState, useEffect, useRef } from 'react';
import {
  Search, MoreHorizontal, Eye, Edit2, UserX, UserCheck,
  ChevronLeft, ChevronRight, Plus, X, Check,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminStudentsApi } from '../services/adminService';
import '../styles/admin.css';

const PAGE_SIZE = 10;

function getReadinessColor(pct) {
  if (pct >= 70) return '#10b981';
  if (pct >= 40) return '#f59e0b';
  return '#ef4444';
}

/* ── Student Form Modal ─────────────────────────── */
function StudentModal({ student, onClose, onSaved }) {
  const isEdit = !!student;
  const [form, setForm] = useState({
    name: student?.name || '',
    email: student?.email || '',
    branch: student?.branch || '',
    gradYear: student?.gradYear || '',
    status: student?.status || 'Active',
    placed: student?.placed || false,
    package: student?.package || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.branch || !form.gradYear) {
      setErr('Name, email, branch and graduation year are required.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      let saved;
      if (isEdit) {
        const res = await adminStudentsApi.update(student.id, form);
        saved = res.student;
      } else {
        const res = await adminStudentsApi.create(form);
        saved = res.student;
      }
      onSaved(saved, isEdit);
      onClose();
    } catch (ex) {
      setErr(ex.message || 'Failed to save student.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Student' : 'Add New Student'}</span>
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
                <label className="form-label">Full Name *</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Student name" />
              </div>
              <div className="form-row">
                <label className="form-label">Email *</label>
                <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="student@example.com" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Branch *</label>
                <input className="form-input" name="branch" value={form.branch} onChange={handleChange} placeholder="e.g. Computer Science" />
              </div>
              <div className="form-row">
                <label className="form-label">Graduation Year *</label>
                <input className="form-input" name="gradYear" value={form.gradYear} onChange={handleChange} placeholder="e.g. 2025" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Placed">Placed</option>
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Package (LPA)</label>
                <input className="form-input" name="package" value={form.package} onChange={handleChange} placeholder="e.g. 12.5" />
              </div>
            </div>
            <div className="form-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" name="placed" checked={form.placed} onChange={handleChange} />
                <span className="form-label" style={{ margin: 0 }}>Mark as Placed</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── View Student Detail Modal ─────────────────── */
function ViewModal({ data, onClose, onEdit }) {
  if (!data) return null;
  const { student, progress, performance, applications } = data;
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <span className="modal-title">Student Details</span>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Identity */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <div className="student-avatar" style={{ width: 56, height: 56, fontSize: 20, borderRadius: 14, background: student.placed ? '#10b981' : '#0062ff' }}>
              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0B1224' }}>{student.name}</h3>
              <p style={{ color: '#6b7280', fontSize: 13 }}>{student.email}</p>
              <p style={{ color: '#6b7280', fontSize: 13 }}>{student.branch} · Class of {student.gradYear}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span className={`status-badge ${student.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                {student.placed ? 'Placed' : student.status}
              </span>
              {student.placed && student.package && (
                <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginTop: 4, textAlign: 'right' }}>
                  ✓ {student.package} LPA
                </div>
              )}
            </div>
          </div>

          {/* Progress bars */}
          {progress && (
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#374151', fontSize: 13 }}>Progress Overview</div>
              {[
                { label: 'Readiness', val: progress.readinessScore },
                { label: 'Resume', val: progress.resumeProgress },
                { label: 'Aptitude', val: progress.aptitudeProgress },
                { label: 'Coding', val: progress.codingProgress },
                { label: 'Interview', val: progress.interviewProgress },
              ].map(p => (
                <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#6b7280', width: 70 }}>{p.label}</span>
                  <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 4 }}>
                    <div style={{ width: `${p.val}%`, height: '100%', background: getReadinessColor(p.val), borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', width: 34 }}>{p.val}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Performance stats */}
          {performance && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#374151', fontSize: 13 }}>Performance Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Avg Aptitude', val: `${performance.avgAptitude}%`, color: '#0062ff' },
                  { label: 'Problems Solved', val: performance.solvedProblems, color: '#10b981' },
                  { label: 'Avg Interview', val: `${performance.avgInterview}%`, color: '#7c3aed' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent aptitude tests */}
              {performance.aptitudeResults?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Recent Aptitude Tests
                  </div>
                  {performance.aptitudeResults.slice(0, 4).map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>
                      <span style={{ color: '#374151' }}>{r.testTitle || 'Aptitude Test'}</span>
                      <span style={{ fontWeight: 700, color: r.score >= 70 ? '#10b981' : r.score >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {r.score}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent interview sessions */}
              {performance.interviewSessions?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Recent Interviews
                  </div>
                  {performance.interviewSessions.slice(0, 3).map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>
                      <span style={{ color: '#374151' }}>{s.topicTitle || 'Interview Session'}</span>
                      <span style={{ fontWeight: 700, color: s.score >= 70 ? '#10b981' : s.score >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {s.score}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applications */}
          {applications?.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#374151', fontSize: 13 }}>Applications ({applications.length})</div>
              {applications.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 13 }}>{a.drive?.company} — {a.drive?.title}</span>
                  <span className={`status-badge ${
                    a.status === 'Selected' ? 'status-active' :
                    a.status === 'Rejected' ? 'status-inactive' : ''
                  }`} style={{ fontSize: 11 }}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn-primary" onClick={onEdit}>Edit Student</button>
        </div>
      </div>
    </div>
  );
}

/* ── Action Menu ───────────────────────────────── */
function ActionMenu({ student, onAction }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="action-menu-wrapper" ref={ref}>
      <button className="action-dots-btn" onClick={() => setOpen(p => !p)}>
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="action-dropdown">
          <button onClick={() => { onAction('view', student); setOpen(false); }}>
            <Eye size={14} /> View Details
          </button>
          <button onClick={() => { onAction('edit', student); setOpen(false); }}>
            <Edit2 size={14} /> Edit Student
          </button>
          {student.placed ? (
            <button onClick={() => { onAction('unplace', student); setOpen(false); }}>
              <UserX size={14} /> Unmark Placed
            </button>
          ) : (
            <button onClick={() => { onAction('place', student); setOpen(false); }}>
              <Check size={14} /> Mark as Placed
            </button>
          )}
          {student.status === 'Active' ? (
            <button className="danger" onClick={() => { onAction('deactivate', student); setOpen(false); }}>
              <UserX size={14} /> Deactivate
            </button>
          ) : (
            <button onClick={() => { onAction('activate', student); setOpen(false); }}>
              <UserCheck size={14} /> Activate
            </button>
          )}
          <button className="danger" onClick={() => { onAction('delete', student); setOpen(false); }}>
            <UserX size={14} /> Delete Student
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────── */
export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchStudents = async (q = '', status = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await adminStudentsApi.list({ search: q, status });
      setStudents(data.students || []);
    } catch (err) {
      setError('Unable to load students. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(search, filterStatus);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterStatus]);

  const handleAction = async (type, student) => {
    try {
      if (type === 'view') {
        const data = await adminStudentsApi.get(student.id);
        setViewData(data);
      } else if (type === 'edit') {
        setEditStudent(student);
      } else if (type === 'deactivate') {
        if (window.confirm(`Deactivate ${student.name}?`)) {
          await adminStudentsApi.update(student.id, { status: 'Inactive' });
          fetchStudents(search, filterStatus);
          showToast(`${student.name} deactivated.`);
        }
      } else if (type === 'activate') {
        await adminStudentsApi.update(student.id, { status: 'Active' });
        fetchStudents(search, filterStatus);
        showToast(`${student.name} activated.`);
      } else if (type === 'place') {
        await adminStudentsApi.update(student.id, { placed: true, status: 'Placed' });
        fetchStudents(search, filterStatus);
        showToast(`${student.name} marked as placed.`);
      } else if (type === 'unplace') {
        await adminStudentsApi.update(student.id, { placed: false });
        fetchStudents(search, filterStatus);
        showToast(`${student.name} placement removed.`);
      } else if (type === 'delete') {
        if (window.confirm(`Permanently delete ${student.name}? This cannot be undone.`)) {
          await adminStudentsApi.remove(student.id);
          fetchStudents(search, filterStatus);
          showToast(`${student.name} deleted.`);
        }
      }
    } catch (ex) {
      alert(ex.message || 'Action failed.');
    }
  };

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setStudents(prev => prev.map(s => s.id === saved.id ? saved : s));
      showToast('Student updated successfully.');
    } else {
      fetchStudents(search, filterStatus);
      showToast('Student added successfully.');
    }
  };

  const totalPages = Math.ceil(students.length / PAGE_SIZE);
  const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = students.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, students.length);

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0062ff', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,98,255,0.3)' }}>
          <Check size={15} style={{ marginRight: 6 }} /> {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Students Directory</h1>
          <p>Manage and monitor student profiles. Total: <strong>{students.length}</strong></p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search by name, email, branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ minWidth: 140, padding: '8px 12px' }}
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Placed">Placed</option>
        </select>
      </div>

      {/* Table */}
      <div className="students-card">
        {loading ? (
          <div className="state-loading"><div className="state-icon">⏳</div><p>Loading students...</p></div>
        ) : error ? (
          <div className="state-error"><div className="state-icon">⚠️</div><h3>Something went wrong</h3><p>{error}</p></div>
        ) : students.length === 0 ? (
          <div className="state-empty">
            <div className="state-icon">🔍</div>
            <h3>No students found</h3>
            <p>{search ? `No results for "${search}".` : 'No students in the system yet.'}</p>
            <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setShowAddModal(true)}>
              <Plus size={14} /> Add First Student
            </button>
          </div>
        ) : (
          <>
            <div className="students-table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Branch / Year</th>
                    <th>Readiness</th>
                    <th>Placement</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar" style={{ background: s.placed ? '#10b981' : '#0062ff' }}>
                            {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div className="student-name">{s.name}</div>
                            <div className="student-email">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="branch-name">{s.branch}</div>
                        <div className="branch-year">Class of {s.gradYear}</div>
                      </td>
                      <td>
                        <div className="readiness-cell">
                          <div className="readiness-bar-track">
                            <div
                              className="readiness-bar-fill"
                              style={{ width: `${s.readiness}%`, background: getReadinessColor(s.readiness) }}
                            />
                          </div>
                          <span className="readiness-pct">{s.readiness}%</span>
                        </div>
                      </td>
                      <td>
                        {s.placed ? (
                          <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
                            ✓ {s.package ? `${s.package} LPA` : 'Placed'}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>Not placed</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${s.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                          {s.placed ? 'Placed' : s.status}
                        </span>
                      </td>
                      <td>
                        <ActionMenu student={s} onAction={handleAction} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination-row">
              <div className="pagination-info">
                Showing <strong>{start}</strong> to <strong>{end}</strong> of <strong>{students.length}</strong> students
              </div>
              <div className="pagination-btns">
                <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <ChevronLeft size={15} /> Previous
                </button>
                <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <StudentModal onClose={() => setShowAddModal(false)} onSaved={handleSaved} />
      )}

      {/* Edit Modal */}
      {editStudent && (
        <StudentModal student={editStudent} onClose={() => setEditStudent(null)} onSaved={handleSaved} />
      )}

      {/* View Modal */}
      {viewData && (
        <ViewModal
          data={viewData}
          onClose={() => setViewData(null)}
          onEdit={() => { setEditStudent(viewData.student); setViewData(null); }}
        />
      )}
    </AdminLayout>
  );
}
