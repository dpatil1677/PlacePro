import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, BookOpen, BarChart2,
  Building2, FileText, Bell, Settings, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import PlaceProLogo from './PlaceProLogo';
import { authService } from '../services/authService';
import '../styles/dashboard.css';
import '../styles/admin.css';

const navItems = [
  { id: 'overview',      label: 'Overview',         icon: LayoutDashboard, to: '/admin/dashboard' },
  { id: 'students',      label: 'Students',          icon: Users,           to: '/admin/students' },
  { id: 'companies',     label: 'Companies',         icon: Building2,       to: '/admin/companies' },
  { id: 'drives',        label: 'Placement Drives',  icon: Briefcase,       to: '/admin/drives' },
  { id: 'applications',  label: 'Applications',      icon: FileText,        to: '/admin/applications' },
  { id: 'questionbank',  label: 'Question Bank',     icon: BookOpen,        to: '/admin/question-bank' },
  { id: 'reports',       label: 'Reports',           icon: BarChart2,       to: '/admin/reports' },
  { id: 'notifications', label: 'Notifications',     icon: Bell,            to: '/admin/notifications' },
  { id: 'settings',      label: 'Settings',          icon: Settings,        to: '/admin/settings' },
];

export default function AdminLayout({ children, headerTitle = 'ADMIN PORTAL' }) {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.clearSession();
    navigate('/login');
  };

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile header bar */}
      <div className="mobile-header">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(prev => !prev)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="mobile-header-title">{headerTitle}</div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/" onClick={closeSidebar}>
            <PlaceProLogo size="sm" dark />
          </Link>
          <span className="sidebar-admin-badge">ADMIN</span>
          {/* Close button visible only on mobile inside sidebar */}
          <button
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ id, label, icon: Icon, to }) => (
            <NavLink
              key={id}
              to={to}
              end={to === '/admin/dashboard'}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
              onClick={closeSidebar}
            >
              <Icon size={17} className="sidebar-nav-icon" />
              <span style={{ flex: 1 }}>{label}</span>
              <ChevronRight size={13} style={{ opacity: 0.3 }} />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(user?.name || 'Admin User')}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Admin User'}</div>
            <div className="sidebar-user-email">{user?.email || 'admin@placepro.com'}</div>
          </div>
          <button onClick={handleLogout} title="Logout" className="sidebar-logout-btn">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header-title">{headerTitle}</div>
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
