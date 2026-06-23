import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import authService from '../../services/auth.service';
import { validateForm, ruleRequired, rulePassword, ruleMatch } from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = {
    password: [ruleRequired('New password is required'), rulePassword()],
    confirmPassword: [ruleRequired('Please confirm your new password'), ruleMatch('password', 'Passwords do not match')],
  };

  useEffect(() => {
    if (!token) {
      setError('Token đặt lại không hợp lệ hoặc bị thiếu. Vui lòng yêu cầu đặt lại mật khẩu mới.');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const fieldErrors = validateForm(formData, { [name]: schema[name] });
    if (fieldErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    setError('');
    const errors = validateForm(formData, schema);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await authService.resetPassword(token, formData.password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-header" style={{ marginBottom: '1rem' }}>
            <h1 className="auth-title">Đã Đặt Lại Mật Khẩu!</h1>
            <p className="auth-subtitle">Mật khẩu của bạn đã được cập nhật thành công.</p>
          </div>
          <Button fullWidth onClick={() => navigate('/login')} className="mt-4">
            Đến trang Đăng nhập <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Đặt Lại Mật Khẩu</h1>
          <p className="auth-subtitle">Tạo mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Mật khẩu mới"
            name="password"
            type="password"
            placeholder="Nhập mật khẩu mới"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            iconLeft={<Lock size={18} />}
            error={formErrors.password}
            required
            disabled={!token}
          />

          <Input
            label="Xác nhận Mật khẩu mới"
            name="confirmPassword"
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            iconLeft={<Lock size={18} />}
            error={formErrors.confirmPassword}
            required
            disabled={!token}
          />

          <div className="mt-4">
            <Button type="submit" fullWidth isLoading={loading} disabled={!token}>
              Đặt Lại Mật Khẩu
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          Nhớ mật khẩu của bạn? <Link to="/login" className="auth-link">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
