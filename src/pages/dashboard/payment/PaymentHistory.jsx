import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';
import paymentService from '../../../services/payment.service';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await paymentService.getMyPayments();
        setPayments(data || []);
      } catch (err) {
        console.error('Lỗi khi lấy lịch sử giao dịch', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="badge" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-600)', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} /> Thành công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="badge" style={{ backgroundColor: 'var(--danger-50)', color: 'var(--danger-600)', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <XCircle size={14} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="badge" style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-600)', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> Chờ thanh toán
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="premium-page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Lịch sử Giao dịch</h1>
        <p className="page-description">Quản lý và theo dõi các khoản nạp tiền vào tài khoản của bạn.</p>
      </div>

      <div className="dashboard-section glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table className="modern-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--neutral-200)', textAlign: 'left', color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Mã Đơn Hàng</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Ngày Tạo</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Nội Dung</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Số Tiền</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-neutral-400">Đang tải dữ liệu...</td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-neutral-400">Bạn chưa có giao dịch nào.</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid var(--neutral-100)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem' }} className="font-medium text-neutral-800">
                    {payment.orderCode}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--neutral-600)' }}>
                    {formatDate(payment.createdAt)}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--neutral-700)' }}>
                    {payment.description}
                  </td>
                  <td style={{ padding: '1rem' }} className="font-bold text-primary-600">
                    {payment.amount?.toLocaleString()} đ
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {getStatusBadge(payment.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
