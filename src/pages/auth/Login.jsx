import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateForm, ruleRequired, ruleEmail } from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const schema = {
    email: [ruleRequired('Email is required'), ruleEmail('Please enter a valid email')],
    password: [ruleRequired('Password is required')],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field as user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    // Validate only this specific field on blur
    const fieldErrors = validateForm({ [name]: formData[name] }, { [name]: schema[name] });
    if (fieldErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errors = validateForm(formData, schema);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Chào mừng trở lại</h1>
          <p className="auth-subtitle">Đăng nhập để truy cập AI Student Hub</p>
        </div>

        {apiError && <div className="auth-error-alert">{apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Địa chỉ Email"
            name="email"
            type="email"
            placeholder="Nhập email của bạn"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            iconLeft={<Mail size={18} />}
            error={formErrors.email}
            required
          />

          <Input
            label="Mật khẩu"
            name="password"
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            iconLeft={<Lock size={18} />}
            error={formErrors.password}
            required
          />

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '14px' }}>
              Quên mật khẩu?
            </Link>
          </div>

          <Button type="submit" fullWidth isLoading={loading}>
            Đăng nhập
          </Button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
