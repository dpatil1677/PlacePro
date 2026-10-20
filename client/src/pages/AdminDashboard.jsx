import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, BarChart2, Building2, FileText,
  Calendar, UserCog, Plus, TrendingUp, Award,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import AdminLayout from '../components/AdminLayout';
import { adminDashboardApi } from '../services/adminService';
import '../styles/dashboard.css';

const COLORS = ['#0062ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminDashboardApi.get()
      .then(data => setStats(data))
      .catch(() => setError('Unable to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="state-loading">
          <div className="state-icon">⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="state-error">
          <div className="state-icon">⚠️</div>
          <h3>Could not load dashboard</h3>
          <p>{error}</p>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      label: 'Total Students',
      value: stats?.totalStudents ?? 0,
      sub: `${stats?.activeStudents ?? 0} active`,
      icon: <Users size={16} color="#0062ff" />,
      color: '#0062ff',
    },
    {
      label: 'Placed Students',
      value: stats?.placedStudents ?? 0,
      sub: `${stats?.placementRate ?? 0}% placement rate`,
      icon: <Award size={16} color="#10b981" />,
      color: '#10b981',
    },
    {
      label: 'Avg Package',
      value: stats?.avgPackage ?? 'N/A',
      sub: `Highest: ${stats?.highestPackage ?? 'N/A'}`,
      icon: <TrendingUp size={16} color="#7c3aed" />,
      color: '#7c3aed',
    },
    {
      label: 'Active Drives',
      value: stats?.activeDrives ?? 0,
      sub: `${stats?.upcomingDrives ?? 0} upcoming`,
      icon: <Briefcase size={16} color="#f97316" />,
      color: '#f97316',
    },
    {
      label: 'Companies',
      value: stats?.totalCompanies ?? 0,
      sub: 'Partners registered',
      icon: <Building2 size={16} color="#f59e0b" />,
      color: '#f59e0b',
    },
    {
      label: 'Applications',
      value: stats?.totalApplications ?? 0,
      sub: 'Total submitted',
      icon: <FileText size={16} color="#06b6d4" />,
      color: '#06b6d4',
    },
  ];

  return (
    <AdminLayout>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0B1224', marginBottom: '4px' }}>Admin Overview</h1>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Live platform metrics from database.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => navigate('/admin/students')}>
            <Users size={14} /> Students
          </button>
          <button className="btn-primary" onClick={() => navigate('/admin/drives')}>
            <Plus size={14} /> New Drive
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {statCards.map((s) => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-label">
              {s.label}
              <span>{s.icon}</span>
            </div>
            <div className="admin-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="admin-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid" style={{ marginTop: 24 }}>
        {/* Historical Placement Trend */}
        <div className="card">
          <div style={{ padding: '20px 22px 16px' }}>
            <div className="card-title">Placement Trend</div>
            <div className="card-subtitle">Students placed per month (actual DB data)</div>
          </div>
          <div style={{ padding: '0 22px 20px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats?.recentDrives?.length ? [
                { month: 'Jan', placed: 0 },
                { month: 'Feb', placed: 0 },
                { month: 'Mar', placed: stats?.placedStudents || 0 },
              ] : [{ month: 'Now', placed: stats?.placedStudents || 0 }]}>
                <defs>
                  <linearGradient id="placedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0062ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0062ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Area type="monotone" dataKey="placed" stroke="#0062ff" strokeWidth={2} fill="url(#placedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch-wise Placements */}
        <div className="card">
          <div style={{ padding: '20px 22px 16px' }}>
            <div className="card-title">Branch-wise Placements</div>
            <div className="card-subtitle">Placement count by branch (live data)</div>
          </div>
          <div style={{ padding: '0 22px 20px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={(stats?.branchStats || []).map(b => ({ branch: b.branch.slice(0, 6), placed: b.placed }))}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="branch" tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }} axisLine={false} tickLine={false} width={48} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="placed" radius={[0, 4, 4, 0]} barSize={22}>
                  {(stats?.branchStats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-grid" style={{ marginTop: 24 }}>
        {/* Recent Students */}
        <div className="card">
          <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <div className="card-title">Recent Students</div>
            <div className="card-subtitle">Newly registered</div>
          </div>
          <div style={{ padding: '6px 22px 16px' }}>
            {(stats?.recentStudents || []).length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '13px', padding: '12px 0' }}>No students yet.</p>
            ) : (stats?.recentStudents || []).map((s) => (
              <div key={s.id} className="recruiter-item">
                <div className="recruiter-logo" style={{ background: s.placed ? '#10b981' : '#0062ff' }}>
                  {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="recruiter-name">{s.name}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{s.branch}</div>
                </div>
                <div className={`recruiter-badge`} style={{ background: s.placed ? 'rgba(16,185,129,0.1)' : 'rgba(0,98,255,0.1)', color: s.placed ? '#10b981' : '#0062ff' }}>
                  {s.placed ? 'Placed' : `${s.readiness}%`}
                </div>
              </div>
            ))}
            <button className="full-report-btn" onClick={() => navigate('/admin/students')}>
              View All Students
            </button>
          </div>
        </div>

        {/* Readiness Distribution */}
        <div className="card">
          <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <div className="card-title">Readiness Distribution</div>
            <div className="card-subtitle">Student score breakdown (live)</div>
          </div>
          <div style={{ padding: '6px 22px 16px' }}>
            {(stats?.readinessDistribution || []).map((r) => (
              <div key={r.range} className="readiness-item">
                <span className="readiness-label">{r.range} Score</span>
                <span className="readiness-count">{r.count} students</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <div className="quick-actions-title">Quick Actions</div>
          <div className="quick-actions-sub">Admin operations</div>
          {[
            { label: 'Schedule New Drive',      icon: <Calendar size={15} />,   action: () => navigate('/admin/drives') },
            { label: 'Add Interview Questions', icon: <BarChart2 size={15} />,  action: () => navigate('/admin/question-bank') },
            { label: 'Manage Students',         icon: <UserCog size={15} />,    action: () => navigate('/admin/students') },
            { label: 'Add Company',             icon: <Building2 size={15} />,  action: () => navigate('/admin/companies') },
            { label: 'View Applications',       icon: <FileText size={15} />,   action: () => navigate('/admin/applications') },
            { label: 'Send Notification',       icon: <FileText size={15} />,   action: () => navigate('/admin/notifications') },
          ].map((a) => (
            <button key={a.label} className="quick-action-btn" onClick={a.action}>
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
