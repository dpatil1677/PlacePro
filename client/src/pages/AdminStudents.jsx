import { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, Eye, Edit2, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminStudentsApi } from '../services/adminService';
import '../styles/admin.css';

const PAGE_SIZE = 10;

function getReadinessColor(pct) {
  if (pct >= 70) return '#10b981'; // green
  if (pct >= 40) return '#f59e0b'; // orange
  return '#ef4444';                // red
}

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
      <button className="action-dots-btn" onClick={() => setOpen((p) => !p)}>
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="action-dropdown">
          <button onClick={() => { onAction('view', student); setOpen(false); }}>
            <Eye size={14} /> View Student
          </button>
          <button onClick={() => { onAction('edit', student); setOpen(false); }}>
            <Edit2 size={14} /> Edit Student
          </button>
          <button className="danger" onClick={() => { onAction('deactivate', student); setOpen(false); }}>
            <UserX size={14} /> Deactivate Student
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const fetchStudents = async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await adminStudentsApi.list(q);
      setStudents(data.students || []);
    } catch (err) {
      setError('Unable to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAction = (type, student) => {
    if (type === 'deactivate') {
      if (window.confirm(`Deactivate ${student.name}?`)) {
        adminStudentsApi.update(student.id, { status: 'Inactive' }).then(() => fetchStudents(search));
      }
    }
    // View/Edit: extend later
  };

  // Pagination
  const totalPages = Math.ceil(students.length / PAGE_SIZE);
  const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = students.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, students.length);

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Students Directory</h1>
          <p>Manage and monitor student progress.</p>
        </div>
        <div className="search-bar">
          <Search size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search by name, email, branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="students-card">
        {loading ? (
          <div className="state-loading">
            <div className="state-icon">⏳</div>
            <p>Loading students...</p>
          </div>
        ) : error ? (
          <div className="state-error">
            <div className="state-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="state-empty">
            <div className="state-icon">🔍</div>
            <h3>No students found</h3>
            <p>{search ? `No results for "${search}".` : 'No students in the system yet.'}</p>
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
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">
                            {s.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
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
                              style={{
                                width: `${s.readiness}%`,
                                background: getReadinessColor(s.readiness),
                              }}
                            />
                          </div>
                          <span className="readiness-pct">{s.readiness}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${s.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                          {s.status}
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
                <button
                  className="pagination-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
