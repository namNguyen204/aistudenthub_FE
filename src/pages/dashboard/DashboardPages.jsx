import React from 'react';
import { HardHat } from 'lucide-react';
import UserProfile from './profile/UserProfile';

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

export const DashboardHome = () => <PageWrapper title="Trang chủ" description="Chào mừng trở lại AI Student Hub. Dưới đây là tổng quan về các hoạt động học tập gần đây và tài liệu đã tải lên của bạn." />;
export { UserProfile };

export const AdminDocumentList = () => <PageWrapper title="Quản lý Tài liệu" description="Toàn quyền quản trị để xem, chỉnh sửa, phê duyệt hoặc xóa an toàn tất cả các tài liệu trên toàn bộ hệ thống." />;
export const AdminSettings = () => <PageWrapper title="Cài đặt Hệ thống" description="Quản lý cấu hình hệ thống toàn cầu, vai trò người dùng và tích hợp nền tảng." />;
