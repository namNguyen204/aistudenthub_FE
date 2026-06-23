import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import authService from '../../services/auth.service';
import { validateForm, ruleRequired, ruleEmail } from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const schema = {
    email: [ruleRequired('Email is required'), ruleEmail('Please enter a valid email')],
  };

  const handleBlur = () => {
    const errors = validateForm({ email }, schema);
    setFormErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const errors = validateForm({ email }, schema);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess('Nếu tài khoản với email này tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.');
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Quên Mật Khẩu</h1>
          <p className="auth-subtitle">Nhập email để nhận liên kết đặt lại</p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}
        {success && (
          <div className="auth-error-alert" style={{ 
            backgroundColor: 'var(--success-50)', 
            color: 'var(--success-500)', 
            borderColor: 'var(--success-500)' 
          }}>
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Địa chỉ Email"
            name="email"
            type="email"
            placeholder="Nhập email đã đăng ký của bạn"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) setFormErrors({ email: null });
            }}
            onBlur={handleBlur}
            iconLeft={<Mail size={18} />}
            error={formErrors.email}
            required
          />

          <div className="mt-4">
            <Button type="submit" fullWidth isLoading={loading}>
              Gửi Liên Kết Đặt Lại
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link flex-center" style={{ gap: '4px' }}>
            <ArrowLeft size={16} /> Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
