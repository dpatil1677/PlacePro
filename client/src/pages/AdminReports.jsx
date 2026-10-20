import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminReportsApi } from '../services/adminService';
import '../styles/admin.css';

const COLORS = ['#0062ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#8b5cf6'];

function downloadCSV(data, filename) {
  const headers = Object.keys(data[0] || {});
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = () => {
    setLoading(true);
    adminReportsApi.get()
      .then(data => setReport(data))
      .catch(() => setError('Unable to load report data. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReport(); }, []);

  const handleDownload = () => {
    if (!report) return;
    const summary = [{
      'Total Students': report.totalEligible,
      'Placed Students': report.totalPlaced,
      'Average Package': report.averagePackage,
      'Highest Package': report.highestPackage,
      'Placement Rate': report.summary?.placementRate || '—',
    }];
    downloadCSV(summary, 'placepro_report_summary.csv');
  };

  const handleDownloadBranch = () => {
    if (!report?.branchWisePlacementRate) return;
    const rows = report.branchWisePlacementRate.map(b => ({
      Branch: b.branch,
      'Total Students': b.total,
      'Placed Students': b.placed,
      'Placement Rate': b.total > 0 ? Math.round((b.placed / b.total) * 100) + '%' : '0%',
    }));
    downloadCSV(rows, 'placepro_branch_report.csv');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="state-loading"><div className="state-icon">⏳</div><p>Loading reports...</p></div>
      </AdminLayout>
    );
  }

  if (error || !report) {
    return (
      <AdminLayout>
        <div className="state-error">
          <div className="state-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error || 'No data available.'}</p>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={loadReport}>Retry</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reports & Analytics</h1>
          <p>Live placement analytics calculated from actual database records.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={loadReport}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn-primary" onClick={handleDownload}>
            <Download size={14} /> Download Report
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="reports-stat-grid">
        <div className="report-stat-card">
          <div className="report-stat-label label-blue">Total Students</div>
          <div className="report-stat-value">{report.totalEligible}</div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-label label-green">Total Placed</div>
          <div className="report-stat-value" style={{ color: '#10b981' }}>{report.totalPlaced}</div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-label label-teal">Placement Rate</div>
          <div className="report-stat-value" style={{ color: '#0d9488' }}>{report.summary?.placementRate || '0%'}</div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-label label-teal">Average Package</div>
          <div className="report-stat-value" style={{ color: '#0d9488' }}>{report.averagePackage}</div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-label label-blue">Highest Package</div>
          <div className="report-stat-value" style={{ color: '#0062ff' }}>{report.highestPackage}</div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-label label-blue">Active Drives</div>
          <div className="report-stat-value">{report.summary?.activeDrives ?? '—'}</div>
        </div>
      </div>

      {/* Historical Trend — full width */}
      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <div className="chart-card-title">Monthly Placement Trend</div>
        <div className="chart-card-sub">Placements made each month (from DB)</div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={report.historicalTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0062ff" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0062ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
            <Area type="monotone" dataKey="placed" stroke="#0062ff" strokeWidth={2.5} fill="url(#trendGrad)" dot={false} activeDot={{ r: 5, fill: '#0062ff', strokeWidth: 2, stroke: '#fff' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: bar chart + branch rates */}
      <div className="reports-chart-row">
        {/* Company wise bar chart */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="chart-card-title">Company Wise Offers</div>
          </div>
          <div className="chart-card-sub" style={{ marginBottom: '12px' }}>Selected applications per company</div>
          {report.companyWiseOffers?.length > 0 && report.companyWiseOffers[0].company !== 'No Data' ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={report.companyWiseOffers} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="company" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="offers" radius={[4, 4, 0, 0]}>
                  {report.companyWiseOffers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>No selections recorded yet.</p>
            </div>
          )}
        </div>

        {/* Branch wise placement rate */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="chart-card-title">Branch Placement Rate</div>
            <button
              onClick={handleDownloadBranch}
              style={{ fontSize: 11, color: '#0062ff', background: 'rgba(0,98,255,0.08)', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Download size={11} /> CSV
            </button>
          </div>
          <div className="chart-card-sub" style={{ marginBottom: '24px' }}>Placed vs. total per branch</div>
          {(report.branchWisePlacementRate || []).length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 13 }}>No branch data available.</p>
          ) : (report.branchWisePlacementRate || []).map((b) => {
            const pct = b.total > 0 ? Math.round((b.placed / b.total) * 100) : 0;
            return (
              <div key={b.branch} className="branch-rate-item">
                <div className="branch-rate-header">
                  <span className="branch-rate-label">{b.branch}</span>
                  <span className="branch-rate-fraction">{b.placed} / {b.total} ({pct}%)</span>
                </div>
                <div className="branch-rate-track">
                  <div className="branch-rate-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
