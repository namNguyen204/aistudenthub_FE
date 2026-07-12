import React, { useState, useEffect } from 'react';
import { Users, FileText, MessageSquare, ShieldAlert, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import adminService from '../../services/admin.service';

const AdminDashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [typeStats, setTypeStats] = useState([]);
  const [uploadTrend, setUploadTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, aiData, typeData, trendData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getAiUsage(),
          adminService.getDocumentTypeStats(),
          adminService.getUploadTrend()
        ]);
        setStats(statsData);
        setAiUsage(aiData);
        setTypeStats(typeData || []);
        
        // Ensure trendData is in the correct format for recharts
        // Assuming backend returns [{ date: '2023-10-01', count: 5 }, ...]
        setUploadTrend(trendData || []);
      } catch (err) {
        setError('Không thể tải dữ liệu thống kê');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu Dashboard...</div>;

  return (
    <div className="premium-page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Dashboard Quản Trị</h1>
        <p className="page-description">Tổng quan tình hình hoạt động của hệ thống AI Student Hub.</p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-600)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Tổng số Users</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalDocuments || 0}</div>
            <div className="stat-label">Tổng Tài liệu</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <MessageSquare size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalChatSessions || 0}</div>
            <div className="stat-label">Phiên Chat AI</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon danger">
            <ShieldAlert size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.deactivatedUsers || 0}</div>
            <div className="stat-label">User Bị Khóa</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="dashboard-section glass-card">
          <div className="dashboard-section-header">
            <h3 className="dashboard-section-title">Tỷ lệ sử dụng AI</h3>
          </div>
          <div className="dashboard-section-body" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary-600)', marginBottom: '1rem' }}>
              {aiUsage?.usagePercentage ? aiUsage.usagePercentage.toFixed(1) : 0}%
            </div>
            <p style={{ color: 'var(--neutral-600)' }}>
              Có <strong>{aiUsage?.documentsWithAi || 0}</strong> trên tổng số <strong>{aiUsage?.totalDocuments || 0}</strong> tài liệu đã được tương tác với AI.
            </p>
          </div>
        </div>
        
        <div className="dashboard-section glass-card">
           <div className="dashboard-section-header">
            <h3 className="dashboard-section-title">Thống kê theo Loại tệp</h3>
          </div>
          <div className="dashboard-section-body" style={{ padding: '2rem', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeStats.map(t => {
                    let name = t.fileType || 'Khác';
                    if (name.includes('pdf')) name = 'PDF';
                    else if (name.includes('wordprocessingml')) name = 'Word';
                    else if (name.includes('presentationml')) name = 'PowerPoint';
                    else if (name.includes('image')) name = 'Hình ảnh';
                    else if (name.includes('text')) name = 'Văn bản';
                    return { name, value: t.count };
                  })}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typeStats.map((entry, index) => {
                    const colors = ['var(--primary-500)', 'var(--danger-500)', 'var(--success-500)', 'var(--warning-500)'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="dashboard-section glass-card" style={{ marginTop: '2rem' }}>
        <div className="dashboard-section-header">
          <h3 className="dashboard-section-title">Xu hướng Upload tài liệu (30 ngày)</h3>
        </div>
        <div className="dashboard-section-body" style={{ padding: '2rem', height: '350px' }}>
          {uploadTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={uploadTrend}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neutral-200)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--neutral-500)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--neutral-500)' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--neutral-100)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="count" fill="var(--primary-500)" radius={[4, 4, 0, 0]} barSize={30} name="Số lượng tài liệu" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--neutral-500)' }}>
              Chưa có dữ liệu upload
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
