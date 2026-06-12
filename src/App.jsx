import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardLayout from './layouts/DashboardLayout';
import { 
  DashboardHome, DocumentSearch, AIChatbot, 
  UploadDocument, UserProfile, AdminDocumentList, AdminSettings 
} from './pages/dashboard/DashboardPages';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const role = user?.role?.replace('ROLE_', '') || 'USER';
  if (requireAdmin && role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const role = user?.role?.replace('ROLE_', '') || 'USER';
  const isAdmin = role === 'ADMIN';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? (isAdmin ? "/admin/documents" : "/dashboard") : "/login"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<DashboardHome />} />
        <Route path="search" element={<DocumentSearch />} />
        <Route path="chat" element={<AIChatbot />} />
        <Route path="upload" element={<UploadDocument />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route 
        path="/admin" 
        element={<ProtectedRoute requireAdmin={true}><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="documents" replace />} />
        <Route path="documents" element={<AdminDocumentList />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
