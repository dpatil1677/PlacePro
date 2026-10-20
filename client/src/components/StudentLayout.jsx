import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, Code2, MessageSquare,
  Building2, TrendingUp, LogOut, Menu, X, Bell,
} from 'lucide-react';
import PlaceProLogo from './PlaceProLogo';
import { authService } from '../services/authService';
import '../styles/dashboard.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
  { id: 'resume',    label: 'Resume',    icon: FileText,        path: '/student/resume' },
  { id: 'aptitude',  label: 'Aptitude',  icon: BookOpen,        path: '/student/aptitude' },
  { id: 'coding',    label: 'Coding',    icon: Code2,           path: '/student/coding' },
  { id: 'interview', label: 'Interview', icon: MessageSquare,   path: '/student/interview' },
  { id: 'companies', label: 'Companies', icon: Building2,       path: '/student/companies' },
  { id: 'progress',  label: 'Progress',  icon: TrendingUp,      path: '/student/progress' },
];

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function StudentLayout({ children }) {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.clearSession();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <PlaceProLogo size="sm" dark />
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <NavLink
              key={id}
              to={path}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={17} className="sidebar-nav-icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(user?.name || 'Arjun Sharma')}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Arjun Sharma'}</div>
            <div className="sidebar-user-email">{user?.email || 'student@placepro.com'}</div>
          </div>
          <button onClick={handleLogout} title="Logout" className="sidebar-logout-btn">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header-spacer" />
          <div className="dashboard-header-actions">
            <button className="header-icon-btn" aria-label="Notifications">
              <Bell size={18} />
            </button>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="dashboard-content-inner">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
