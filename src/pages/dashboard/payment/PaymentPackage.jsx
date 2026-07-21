import React, { useState } from 'react';
import { CreditCard, Zap, Crown, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/Button/Button';
import paymentService from '../../../services/payment.service';
import './Payment.css';

const PACKAGES = [
  {
    id: 'basic',
    name: 'Gói Cơ bản',
    price: 0,
    priceStr: 'Miễn phí',
    icon: <CreditCard size={24} className="package-icon" />,
    color: 'var(--primary-500)',
    features: ['100 câu hỏi AI / ngày', 'Lưu trữ 50 tài liệu', 'Hỗ trợ cơ bản'],
    isPopular: false
  },
  {
    id: 'pro',
    name: 'Gói Nâng cao',
    price: 39000,
    priceStr: '39.000đ',
    icon: <Zap size={24} className="package-icon text-warning" />,
    color: '#eab308',
    features: ['Không giới hạn AI Chat', 'Lưu trữ 500 tài liệu', 'Phân tích tài liệu PDF', 'Hỗ trợ ưu tiên'],
    isPopular: true
  },
  {
    id: 'premium',
    name: 'Gói Chuyên gia',
    price: 79000,
    priceStr: '79.000đ',
    icon: <Crown size={24} className="package-icon text-danger" />,
    color: 'var(--danger-500)',
    features: ['Tất cả tính năng Pro', 'Lưu trữ không giới hạn', 'Ưu tiên kết quả tìm kiếm', 'Lưu lịch sử vĩnh viễn'],
    isPopular: false
  }
];

const PaymentPackage = () => {
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const returnUrl = `${window.location.origin}/dashboard/payment/success`;
      const cancelUrl = `${window.location.origin}/dashboard/payment/cancel`;
      const description = `Mua ${selectedPkg.name}`;
      
      const response = await paymentService.createPayment(
        selectedPkg.price, 
        description, 
        returnUrl, 
        cancelUrl
      );
      
      if (response && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        setError('Không thể tạo link thanh toán, vui lòng thử lại sau.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi kết nối tới cổng thanh toán.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="premium-page-wrapper payment-page">
      <div className="page-header text-center" style={{ alignItems: 'center', marginBottom: '3rem' }}>
        <h1 className="page-title">Nâng cấp Tài khoản</h1>
        <p className="page-description" style={{ maxWidth: '600px', margin: '0.5rem auto' }}>
          Mở khóa toàn bộ sức mạnh của AI Student Hub với các gói cước siêu tiết kiệm. Thanh toán an toàn, nhanh chóng qua VietQR.
        </p>
      </div>

      {error && <div className="alert alert-danger" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>{error}</div>}

      <div className="packages-grid">
        {PACKAGES.map((pkg) => (
          <div 
            key={pkg.id} 
            className={`package-card glass-card ${selectedPkg.id === pkg.id ? 'selected' : ''} ${pkg.isPopular ? 'popular' : ''}`}
            onClick={() => setSelectedPkg(pkg)}
            style={{ '--pkg-color': pkg.color }}
          >
            {pkg.isPopular && <div className="popular-badge">Phổ biến nhất</div>}
            
            <div className="package-header">
              <div className="icon-wrapper" style={{ color: pkg.color, backgroundColor: `${pkg.color}15` }}>
                {pkg.icon}
              </div>
              <h3 className="package-name">{pkg.name}</h3>
              <div className="package-price">
                <span className="amount">{pkg.priceStr}</span>
                <span className="period">/tháng</span>
              </div>
            </div>

            <ul className="package-features">
              {pkg.features.map((feature, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={18} color="var(--success-500)" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="package-footer">
              <Button 
                variant={selectedPkg.id === pkg.id ? 'primary' : 'outline'}
                className="w-100"
                onClick={() => setSelectedPkg(pkg)}
              >
                {selectedPkg.id === pkg.id ? 'Đang chọn' : 'Chọn gói này'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="payment-action-container glass-card text-center" style={{ marginTop: '3rem' }}>
        <h3 className="mb-2">Bạn đang chọn: <strong>{selectedPkg.name}</strong></h3>
        <p className="text-neutral-500 mb-4">Tổng thanh toán: <strong style={{ color: 'var(--primary-600)', fontSize: '1.25rem' }}>{selectedPkg.priceStr}</strong></p>
        
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handlePayment} 
          disabled={isProcessing || selectedPkg.price === 0}
          style={{ minWidth: '250px', fontSize: '1.1rem' }}
        >
          {selectedPkg.price === 0 ? 'Gói mặc định của bạn' : (isProcessing ? 'Đang chuyển hướng...' : 'Thanh toán qua VietQR')}
        </Button>
        {selectedPkg.price > 0 && (
          <div className="payment-methods mt-3 text-neutral-400" style={{ fontSize: '0.85rem' }}>
            Hỗ trợ quét mã QR qua mọi ứng dụng ngân hàng và ví điện tử tại Việt Nam.
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPackage;
