import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import AdminLayout from '../components/AdminLayout';
import { adminReportsApi } from '../services/adminService';
import '../styles/admin.css';

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminReportsApi.get()
      .then((data) => setReport(data))
      .catch(() => setError('Unable to load report data. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="state-loading">
          <div className="state-icon">⏳</div>
          <p>Loading reports...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !report) {
    return (
      <AdminLayout>
        <div className="state-error">
          <div className="state-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Placement Reports</h1>
          <p>Detailed analytics and historical trends.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="reports-stat-grid">
        <div className="report-stat-card">
          <div className="report-stat-label label-blue">Total Eligible</div>
          <div className="report-stat-value">{report.totalEligible}</div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-label label-green">Total Placed</div>
          <div className="report-stat-value" style={{ color: '#10b981' }}>{report.totalPlaced}</div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-label label-teal">Average Package</div>
          <div className="report-stat-value" style={{ color: '#0d9488' }}>{report.averagePackage}</div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-label label-blue">Highest Package</div>
          <div className="report-stat-value" style={{ color: '#0062ff' }}>{report.highestPackage}</div>
        </div>
      </div>

      {/* Historical Trend — full width */}
      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <div className="chart-card-title">Historical Placement Trend</div>
        <div className="chart-card-sub">Year over year placement count</div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={report.historicalTrend}
            margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0062ff" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0062ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            />
            <Area
              type="monotone"
              dataKey="placed"
              stroke="#0062ff"
              strokeWidth={2.5}
              fill="url(#trendGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#0062ff', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: bar chart + branch rates */}
      <div className="reports-chart-row">
        {/* Company wise bar chart */}
        <div className="chart-card">
          <div className="chart-card-title">Company Wise Offers</div>
          <div className="chart-card-sub" style={{ marginBottom: '12px' }}>&nbsp;</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={report.companyWiseOffers}
              margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
              barSize={36}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="company"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="offers" radius={[4, 4, 0, 0]}>
                {report.companyWiseOffers.map((_, i) => (
                  <Cell key={i} fill="#0062ff" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Branch wise placement rate */}
        <div className="chart-card">
          <div className="chart-card-title">Branch Wise Placement Rate</div>
          <div className="chart-card-sub" style={{ marginBottom: '24px' }}>&nbsp;</div>
          {report.branchWisePlacementRate.map((b) => {
            const pct = Math.round((b.placed / b.total) * 100);
            return (
              <div key={b.branch} className="branch-rate-item">
                <div className="branch-rate-header">
                  <span className="branch-rate-label">{b.branch}</span>
                  <span className="branch-rate-fraction">
                    {b.placed} / {b.total} ({pct}%)
                  </span>
                </div>
                <div className="branch-rate-track">
                  <div
                    className="branch-rate-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
