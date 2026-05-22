import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  CreditCard, 
  Search, 
  Loader2, 
  AlertTriangle
} from 'lucide-react';

interface Booking {
  bookingId: number;
  userEmail: string;
  userName: string;
  storeProductTitle: string;
  startAt: string;
  endAt: string;
  locationText: string;
  status: string;
  createdAt: string;
}

interface Payment {
  paymentId: number;
  orderId: string;
  userEmail: string;
  userName: string;
  paymentMethod: string;
  paymentAmount: number;
  paymentStatus: string;
  paidAt: string;
  cancelledAt: string | null;
  failedReason: string | null;
  createdAt: string;
}

export const BookingsPayments: React.FC = () => {
  const { apiFetch } = useAuth();
  
  // Tab State: 'bookings' | 'payments'
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments'>('bookings');
  
  // Loaders & Errors
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingSearch, setBookingSearch] = useState('');
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentSearch, setPaymentSearch] = useState('');

  // Refund Modal States
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  // Fetch Bookings
  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const data = await apiFetch('/api/admin/bookings');
      setBookings(data);
    } catch (err: any) {
      alert(err.message || '예약 현황 목록을 불러오지 못했습니다.');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch Payments
  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const data = await apiFetch('/api/admin/payments');
      setPayments(data);
    } catch (err: any) {
      alert(err.message || '결제 내역 목록을 불러오지 못했습니다.');
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    } else {
      fetchPayments();
    }
  }, [activeTab]);

  // Handle Refund Submit
  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForRefund) return;
    if (!refundReason.trim()) {
      alert('환불 사유를 작성해 주세요.');
      return;
    }

    setRefundSubmitting(true);
    try {
      await apiFetch(`/api/admin/payments/${selectedPaymentForRefund.paymentId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason: refundReason })
      });
      alert('환불 처리가 성공적으로 완료되었습니다.');
      setSelectedPaymentForRefund(null);
      setRefundReason('');
      fetchPayments();
    } catch (err: any) {
      alert(err.message || '환불 처리에 실패하였습니다.');
    } finally {
      setRefundSubmitting(false);
    }
  };

  // Filtering
  const filteredBookings = bookings.filter(b => 
    b.storeProductTitle.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.userEmail.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (b.locationText && b.locationText.toLowerCase().includes(bookingSearch.toLowerCase()))
  );

  const filteredPayments = payments.filter(p => 
    p.orderId.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.userName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.userEmail.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.paymentMethod.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-8 bg-slate-50 overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">예약 및 결제 관리</h2>
          <p className="text-slate-500 text-sm mt-1">실시간 예약 일정 관리 및 매출/환불 처리 프로세스 제어</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center space-x-2 px-6 py-3.5 font-semibold text-sm border-b-2 transition-all duration-200 outline-none ${
            activeTab === 'bookings'
              ? 'border-indigo-600 text-indigo-600 bg-white/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar size={18} />
          <span>예약 목록 현황</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center space-x-2 px-6 py-3.5 font-semibold text-sm border-b-2 transition-all duration-200 outline-none ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600 bg-white/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard size={18} />
          <span>결제/환불 내역 내역</span>
        </button>
      </div>

      {/* Tab content: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Search */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="고객명, 이메일, 상품명, 지역 검색..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
            {bookingsLoading ? (
              <div className="flex-1 flex justify-center items-center py-20">
                <Loader2 size={36} className="animate-spin text-indigo-600" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center py-20 text-slate-400 space-y-2">
                <Calendar size={48} className="stroke-[1.5]" />
                <p>예약 정보가 존재하지 않습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-6">ID</th>
                      <th className="py-3.5 px-6">예약자 정보</th>
                      <th className="py-3.5 px-6">스토어 상품</th>
                      <th className="py-3.5 px-6">지역</th>
                      <th className="py-3.5 px-6">예약 일정</th>
                      <th className="py-3.5 px-6">상태</th>
                      <th className="py-3.5 px-6 text-right">예약일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredBookings.map((b) => (
                      <tr key={b.bookingId} className="hover:bg-indigo-50/10 transition-colors">
                        <td className="py-4 px-6 text-xs font-mono text-slate-400">{b.bookingId}</td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{b.userName}</div>
                          <div className="text-xs text-slate-400">{b.userEmail}</div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900 max-w-[200px] truncate" title={b.storeProductTitle}>
                          {b.storeProductTitle}
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs">
                          {b.locationText || '-'}
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-xs">
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">시작</span>
                            <span>{b.startAt}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">종료</span>
                            <span>{b.endAt}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : b.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-400 text-xs">
                          {b.createdAt.split(' ')[0]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab content: Payments */}
      {activeTab === 'payments' && (
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Search */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="주문번호, 결제고객, 수단 검색..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
            {paymentsLoading ? (
              <div className="flex-1 flex justify-center items-center py-20">
                <Loader2 size={36} className="animate-spin text-indigo-600" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center py-20 text-slate-400 space-y-2">
                <CreditCard size={48} className="stroke-[1.5]" />
                <p>결제 내역 정보가 존재하지 않습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-6">ID / 주문번호</th>
                      <th className="py-3.5 px-6">결제고객</th>
                      <th className="py-3.5 px-6">결제방식</th>
                      <th className="py-3.5 px-6">결제금액</th>
                      <th className="py-3.5 px-6">결제상태</th>
                      <th className="py-3.5 px-6">승인/취소일시</th>
                      <th className="py-3.5 px-6 text-right">조치</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredPayments.map((p) => (
                      <tr key={p.paymentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 text-xs font-mono">
                          <span className="text-slate-400 block">{p.paymentId}</span>
                          <span className="text-slate-800 font-medium">{p.orderId}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{p.userName}</div>
                          <div className="text-xs text-slate-400">{p.userEmail}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-medium">
                          {p.paymentMethod}
                        </td>
                        <td className="py-4 px-6 text-slate-900 font-bold">
                          ₩{p.paymentAmount.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              p.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-700'
                                : p.paymentStatus === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-700'
                                : p.paymentStatus === 'READY'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 text-xs">
                          {p.paidAt ? (
                            <div className="flex items-center space-x-1">
                              <span className="bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded text-[9px] font-bold">승인</span>
                              <span>{p.paidAt}</span>
                            </div>
                          ) : null}
                          {p.cancelledAt ? (
                            <div className="flex items-center space-x-1 mt-1">
                              <span className="bg-rose-50 text-rose-600 px-1 py-0.5 rounded text-[9px] font-bold">취소</span>
                              <span>{p.cancelledAt}</span>
                            </div>
                          ) : null}
                          {p.failedReason ? (
                            <div className="text-[10px] text-red-400 mt-1 truncate max-w-[150px]" title={p.failedReason}>
                              사유: {p.failedReason}
                            </div>
                          ) : null}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {p.paymentStatus === 'PAID' && (
                            <button
                              onClick={() => setSelectedPaymentForRefund(p)}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                            >
                              환불 처리
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refund Request Reason Modal */}
      {selectedPaymentForRefund && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <form
            onSubmit={handleRefundSubmit}
            className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5 animate-scale-in"
          >
            <div className="flex items-center space-x-3.5 text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-2xl">
              <AlertTriangle size={24} className="shrink-0" />
              <div>
                <h4 className="font-bold">결제 환불 강제 처리</h4>
                <p className="text-xs text-slate-500 mt-0.5">주문번호: {selectedPaymentForRefund.orderId}</p>
                <p className="text-xs text-slate-500">결제금액: ₩{selectedPaymentForRefund.paymentAmount.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">환불 사유 입력</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="이 결제를 취소/환불 조치하는 명확한 사유를 기록해 주세요..."
                rows={4}
                className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-sm bg-slate-50 transition-all focus:bg-white focus:ring-4 focus:ring-rose-500/10"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPaymentForRefund(null);
                  setRefundReason('');
                }}
                disabled={refundSubmitting}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors outline-none cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={refundSubmitting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition-colors outline-none shadow-md shadow-rose-600/15 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {refundSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>환불 진행 중...</span>
                  </>
                ) : (
                  <span>환불 승인</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
