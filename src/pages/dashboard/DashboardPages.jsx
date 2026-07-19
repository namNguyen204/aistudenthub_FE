import React from 'react';
import { HardHat } from 'lucide-react';
import UserProfile from './profile/UserProfile';
import DashboardHome from './home/DashboardHome';

const PageWrapper = ({ title, description }) => (
  <div className="premium-page-wrapper">
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      <p className="page-description">{description}</p>
    </div>
    
    <div className="glass-card construction-box">
      <div className="construction-icon">
        <HardHat size={32} />
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--neutral-900)', marginBottom: '8px' }}>
        Đang xây dựng
      </h3>
      <p style={{ color: 'var(--neutral-500)', maxWidth: '400px' }}>
        Mô-đun này hiện đang được xây dựng. Vui lòng quay lại sau để xem những bản cập nhật thú vị cho AI Student Hub!
      </p>
    </div>
  </div>
);

import AdminDashboardHome from '../admin/AdminDashboardHome';
import AdminUserList from '../admin/AdminUserList';
import AdminDocumentList from '../admin/AdminDocumentList';
import AdminChatModeration from '../admin/AdminChatModeration';
import AdminSystemConfig from '../admin/AdminSystemConfig';
import AdminSystemLogs from '../admin/AdminSystemLogs';

export { 
  DashboardHome, 
  UserProfile,
  AdminDashboardHome,
  AdminUserList,
  AdminDocumentList,
  AdminChatModeration,
  AdminSystemConfig,
  AdminSystemLogs
};
