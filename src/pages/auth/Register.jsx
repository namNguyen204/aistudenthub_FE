import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';
import { validateForm, ruleRequired, ruleEmail, rulePassword, ruleMatch } from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const schema = {
    name: [ruleRequired()],
    email: [ruleRequired(), ruleEmail()],
    password: [ruleRequired(), rulePassword()],
    confirmPassword: [ruleRequired(), ruleMatch('password')],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    // Validate specific field on blur
    // Note: For confirmPassword, we pass the full formData so ruleMatch works correctly
    const fieldErrors = validateForm(formData, { [name]: schema[name] });
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

    setLoading(true);
    try {
      await authService.register({
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Tạo Tài Khoản</h1>
          <p className="auth-subtitle">Tham gia AI Student Hub ngay hôm nay</p>
        </div>

        {apiError && <div className="auth-error-alert">{apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Họ và Tên"
            name="name"
            type="text"
            placeholder="Nhập họ và tên của bạn"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            iconLeft={<User size={18} />}
            error={formErrors.name}
            required
          />

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
            placeholder="Tạo mật khẩu mạnh"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            iconLeft={<Lock size={18} />}
            error={formErrors.password}
            required
          />

          <Input
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            type="password"
            placeholder="Xác nhận mật khẩu của bạn"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            iconLeft={<Lock size={18} />}
            error={formErrors.confirmPassword}
            required
          />

          <div className="mt-4">
            <Button type="submit" fullWidth isLoading={loading}>
              Đăng ký
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
