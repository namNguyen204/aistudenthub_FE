import React from 'react';
import { HardHat } from 'lucide-react';

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
        Under Construction
      </h3>
      <p style={{ color: 'var(--neutral-500)', maxWidth: '400px' }}>
        This module is currently being built. Check back soon for exciting updates to the AI Student Hub!
      </p>
    </div>
  </div>
);

export const DashboardHome = () => <PageWrapper title="Dashboard Home" description="Welcome back to AI Student Hub. Here is an overview of your recent learning activities and document uploads." />;
export const AIChatbot = () => <PageWrapper title="AI Chatbot Assistant" description="Chat with the intelligent AI, ask deep questions about specific documents, and review your historical chats." />;
export const UserProfile = () => <PageWrapper title="My Profile" description="Update your personal information, manage security settings, and customize your experience." />;

export const AdminDocumentList = () => <PageWrapper title="Manage Documents" description="Full administrative access to view, edit, approve, or securely delete all documents across the entire system." />;
export const AdminSettings = () => <PageWrapper title="System Settings" description="Manage global system configurations, user roles, and platform integrations." />;
