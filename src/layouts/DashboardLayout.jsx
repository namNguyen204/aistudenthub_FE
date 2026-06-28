import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Search, 
  MessageSquare, 
  Upload, 
  FileText, 
  LogOut,
  Settings,
  Shield,
  Bell,
  Menu,
  Folder
} from 'lucide-react';
import Button from '../components/Button/Button';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  
  const role = user?.role?.replace('ROLE_', '') || 'USER';
  const isAdmin = role === 'ADMIN';

  const userNavigation = [
    { name: 'Trang chủ', to: '/dashboard', icon: <BookOpen size={20} /> },
    { name: 'Tài liệu của tôi', to: '/dashboard/my', icon: <Search size={20} /> },
    { name: 'Trò chuyện AI', to: '/dashboard/chat', icon: <MessageSquare size={20} /> },
    { name: 'Thư mục của tôi', to: '/dashboard/folders', icon: <Folder size={20} /> },
    { name: 'Tải lên Tài liệu', to: '/dashboard/upload', icon: <Upload size={20} /> },
    { name: 'Hồ sơ của tôi', to: '/dashboard/profile', icon: <Settings size={20} /> },
  ];

  const adminNavigation = [
    { name: 'Quản lý Tài liệu', to: '/admin/documents', icon: <FileText size={20} /> },
    { name: 'Cài đặt Hệ thống', to: '/admin/settings', icon: <Shield size={20} /> },
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <BookOpen size={28} />
          <span>AI Student Hub</span>
        </div>
        
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-btn">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-email">{user?.email || 'user@example.com'}</span>
              <span className="user-role">{role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-search">
            <Search size={18} color="var(--neutral-400)" />
            <input type="text" placeholder="Tìm kiếm nhanh trong hub..." />
          </div>
          <div className="header-actions">
            <button className="header-icon-btn">
              <Bell size={20} />
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--neutral-200)', margin: '0 8px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, fontSize: '14px', color: 'var(--neutral-700)' }}>
               {user?.fullName || user?.email?.split('@')[0] || 'User'}
            </div>
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
