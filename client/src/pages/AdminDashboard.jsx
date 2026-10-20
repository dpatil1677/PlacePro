import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, BarChart2, Search,
  Calendar, UserCog, Plus,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import AdminLayout from '../components/AdminLayout';
import '../styles/dashboard.css';

const placementData = [
  { month: 'Jan', placed: 12, target: 20 },
  { month: 'Feb', placed: 18, target: 30 },
  { month: 'Mar', placed: 28, target: 40 },
  { month: 'Apr', placed: 38, target: 55 },
  { month: 'May', placed: 32, target: 50 },
  { month: 'Jun', placed: 22, target: 45 },
];

const branchData = [
  { branch: 'CSE', placed: 85 },
  { branch: 'IT',  placed: 62 },
  { branch: 'ECE', placed: 35 },
  { branch: 'ME',  placed: 18 },
];

const recruiters = [
  { abbr: 'G', name: 'Google',    count: '12 hired' },
  { abbr: 'M', name: 'Microsoft', count: '18 hired' },
  { abbr: 'A', name: 'Amazon',    count: '24 hired' },
  { abbr: 'I', name: 'Infosys',   count: '45 hired' },
  { abbr: 'T', name: 'TCS',       count: '62 hired' },
];

const readinessDistribution = [
  { range: '0-20 Score',   count: 0 },
  { range: '21-40 Score',  count: 0 },
  { range: '41-60 Score',  count: 1 },
  { range: '61-80 Score',  count: 2 },
  { range: '81-100 Score', count: 0 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  return (
    <AdminLayout>
      {/* Page header with search */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0B1224', marginBottom: '4px' }}>Admin Overview</h1>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Platform metrics and placement performance.</p>
        </div>
        <div className="admin-search">
          <div className="admin-search-input">
            <Search size={15} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
          <button className="btn-all-students" onClick={() => navigate('/admin/students')}>
            All Students
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-stat-grid">
        {[
          { label: 'Total Students', value: '6',   sub: '+0 this month',       icon: <Users size={16} color="#0062ff" /> },
          { label: 'Placed Students', value: '0',  sub: '0% placement rate',   icon: <BarChart2 size={16} color="#22c55e" /> },
          { label: 'Avg Readiness',  value: '68%', sub: 'Across all branches', icon: <span style={{ fontSize:'14px',color:'#0062ff' }}>↗</span> },
          { label: 'Active Drives',  value: '4',   sub: 'Currently ongoing',   icon: <Briefcase size={16} color="#f97316" /> },
          { label: 'Companies',      value: '8',   sub: 'Partners registered',  icon: <span style={{ fontSize:'14px',color:'#f59e0b' }}>🏢</span> },
        ].map((s) => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-label">
              {s.label}
              <span>{s.icon}</span>
            </div>
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Placement Trend */}
        <div className="card">
          <div style={{ padding: '20px 22px 16px' }}>
            <div className="card-title">Placement Trend</div>
            <div className="card-subtitle">Number of students placed over time</div>
          </div>
          <div style={{ padding: '0 22px 20px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={placementData}>
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
                <Area type="monotone" dataKey="target" stroke="#e5e7eb" strokeWidth={1.5} strokeDasharray="5 5" fill="none" />
                <Area type="monotone" dataKey="placed" stroke="#0062ff" strokeWidth={2} fill="url(#placedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch-wise Placements */}
        <div className="card">
          <div style={{ padding: '20px 22px 16px' }}>
            <div className="card-title">Branch-wise Placements</div>
            <div className="card-subtitle">Placement count by engineering branch</div>
          </div>
          <div style={{ padding: '0 22px 20px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={branchData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis type="category" dataKey="branch" tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="placed" radius={[0, 4, 4, 0]} barSize={22}>
                  {branchData.map((_, i) => <Cell key={i} fill="#0062ff" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-grid">
        {/* Top Recruiters */}
        <div className="card">
          <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <div className="card-title">Top Recruiters</div>
            <div className="card-subtitle">By number of hires</div>
          </div>
          <div style={{ padding: '6px 22px 16px' }}>
            {recruiters.map((r) => (
              <div key={r.name} className="recruiter-item">
                <div className="recruiter-logo">{r.abbr}</div>
                <div className="recruiter-name">{r.name}</div>
                <div className="recruiter-badge">{r.count}</div>
              </div>
            ))}
            <button className="full-report-btn">Full Report</button>
          </div>
        </div>

        {/* Readiness Distribution */}
        <div className="card">
          <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <div className="card-title">Readiness Distribution</div>
            <div className="card-subtitle">Student scores breakdown</div>
          </div>
          <div style={{ padding: '6px 22px 16px' }}>
            {readinessDistribution.map((r) => (
              <div key={r.range} className="readiness-item">
                <span className="readiness-label">{r.range}</span>
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
            { label: 'Schedule New Drive',       icon: <Calendar size={15} />,  action: () => navigate('/admin/drives') },
            { label: 'Add Interview Questions',  icon: <BarChart2 size={15} />, action: () => navigate('/admin/question-bank') },
            { label: 'Manage Students',          icon: <UserCog size={15} />,   action: () => navigate('/admin/students') },
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
