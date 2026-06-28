import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import profileService from '../../../services/profile.service';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import { validateForm, ruleRequired, ruleEmail, ruleMinLength, ruleMatch } from '../../../utils/validation';
import { User, Lock, Save, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const { user, setUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  };

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      if (data) {
        setProfileData({
          fullName: data.fullName || '',
          email: data.email || '',
          avatarUrl: data.avatarUrl || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        avatarUrl: prev.avatarUrl || user.avatarUrl || ''
      }));
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(profileData, {
      fullName: [ruleRequired('Họ và tên không được để trống')],
      email: [ruleRequired('Email không được để trống'), ruleEmail('Email không hợp lệ')]
    });
    
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSavingProfile(true);
    try {
      const updatedProfile = await profileService.updateProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        avatarUrl: profileData.avatarUrl
      });
      
      showToast('Cập nhật hồ sơ thành công!', 'success');
      
      // Update global auth context user state if needed
      if (setUser && updatedProfile) {
        setUser({ ...user, ...updatedProfile });
      }
    } catch (err) {
      setProfileErrors({ form: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrorMessage('');
    
    const errors = validateForm(passwordData, {
      currentPassword: [ruleRequired('Mật khẩu hiện tại không được để trống')],
      newPassword: [
        ruleRequired('Mật khẩu mới không được để trống'),
        ruleMinLength(8, 'Mật khẩu mới phải từ 8 ký tự trở lên')
      ],
      confirmPassword: [
        ruleRequired('Xác nhận mật khẩu không được để trống'),
        ruleMatch('newPassword', 'Xác nhận mật khẩu không khớp')
      ]
    });
    
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSavingPassword(true);
    try {
      const message = await profileService.changePassword(passwordData);
      showToast(message || 'Đổi mật khẩu thành công!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordErrorMessage(err.response?.data?.message || 'Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-header">
        <h1>Hồ sơ của tôi</h1>
        <p>Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>

      <div className="profile-content">
        {/* Update Profile Section */}
        <section className="profile-section">
          <h2><User size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Thông tin cá nhân</h2>
          
          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <div className="avatar-preview">
              {profileData.avatarUrl ? (
                <img src={profileData.avatarUrl} alt="Avatar" className="avatar-image" />
              ) : (
                <div className="avatar-image">
                  {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <Input 
                  label="URL Ảnh đại diện"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileData.avatarUrl}
                  onChange={(e) => setProfileData({...profileData, avatarUrl: e.target.value})}
                />
              </div>
            </div>

            <Input 
              label="Họ và tên"
              value={profileData.fullName}
              onChange={(e) => {
                setProfileData({...profileData, fullName: e.target.value});
                if(profileErrors.fullName) setProfileErrors({...profileErrors, fullName: null});
              }}
              error={profileErrors.fullName}
            />

            <Input 
              label="Địa chỉ Email"
              value={profileData.email}
              disabled={true}
              error={profileErrors.email}
              style={{ backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-600)' }}
            />
            <small style={{ color: 'var(--neutral-500)', marginTop: '-8px' }}>Email hiện tại không thể thay đổi.</small>

            {profileErrors.form && <div style={{ color: 'var(--error-600)', fontSize: '14px' }}>{profileErrors.form}</div>}

            <div className="form-actions">
              <Button type="submit" isLoading={isSavingProfile} icon={<Save size={16} />}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </section>

        {/* Change Password Section */}
        <section className="profile-section">
          <h2><Lock size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Đổi mật khẩu</h2>
          
          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <Input 
              label="Mật khẩu hiện tại"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => {
                setPasswordData({...passwordData, currentPassword: e.target.value});
                if(passwordErrors.currentPassword) setPasswordErrors({...passwordErrors, currentPassword: null});
                setPasswordErrorMessage('');
              }}
              error={passwordErrors.currentPassword}
            />

            <Input 
              label="Mật khẩu mới"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => {
                setPasswordData({...passwordData, newPassword: e.target.value});
                if(passwordErrors.newPassword) setPasswordErrors({...passwordErrors, newPassword: null});
              }}
              error={passwordErrors.newPassword}
            />

            <Input 
              label="Xác nhận mật khẩu mới"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => {
                setPasswordData({...passwordData, confirmPassword: e.target.value});
                if(passwordErrors.confirmPassword) setPasswordErrors({...passwordErrors, confirmPassword: null});
              }}
              error={passwordErrors.confirmPassword}
            />

            {passwordErrorMessage && <div style={{ color: 'var(--error-600)', fontSize: '14px' }}>{passwordErrorMessage}</div>}

            <div className="form-actions">
              <Button type="submit" variant="outline" isLoading={isSavingPassword}>
                Đổi mật khẩu
              </Button>
            </div>
          </form>
        </section>
      </div>

      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
