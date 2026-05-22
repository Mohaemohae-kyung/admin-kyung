import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Sparkles, 
  TrendingUp, 
  CalendarCheck, 
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface SummaryData {
  totalUsers: number;
  expertUsers: number;
  totalSales: number;
  activeBookings: number;
  totalCommunityPosts: number;
  totalNotices: number;
  salesTrend: Array<{ date: string; sales: number; bookings: number }>;
  recentUsers: Array<{
    userId: number;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
  recentPayments: Array<{
    paymentId: number;
    orderId: string;
    userName: string;
    paymentMethod: string;
    paymentAmount: number;
    paymentStatus: string;
    paidAt: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch('/api/admin/dashboard');
      setData(result);
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-8 flex flex-col justify-center items-center">
        <p className="text-red-500 font-semibold mb-4">{error || '데이터 로딩 오류'}</p>
        <button onClick={fetchDashboardData} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">
          다시 시도
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: '총 회원 수',
      value: data.totalUsers.toLocaleString() + '명',
      icon: <Users size={22} />,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10',
      description: '누적 가입 회원',
    },
    {
      title: '등록된 고수 수',
      value: data.expertUsers.toLocaleString() + '명',
      icon: <Sparkles size={22} />,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/10',
      description: '활동 중인 고수 파트너',
    },
    {
      title: '누적 결제액',
      value: `₩${data.totalSales.toLocaleString()}`,
      icon: <TrendingUp size={22} />,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10',
      description: '결제 승인 누적 총액',
    },
    {
      title: '확정된 예약 수',
      value: data.activeBookings.toLocaleString() + '건',
      icon: <CalendarCheck size={22} />,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10',
      description: 'CONFIRMED 예약 상태',
    },
  ];

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">대시보드 홈</h2>
          <p className="text-slate-500 text-sm mt-1">플랫폼 리소스 및 실시간 비즈니스 동향 모니터링</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl transition-all duration-200 shadow-sm"
        >
          <RefreshCw size={16} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {card.title}
              </span>
              <h3 className="text-2xl font-bold text-slate-800 leading-none">{card.value}</h3>
              <p className="text-xs text-slate-500 pt-1">{card.description}</p>
            </div>
            <div className={`p-4 rounded-xl border ${card.color}`}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Recharts Area Chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="font-bold text-slate-800">최근 7일 매출 및 예약 건수 추이</h4>
            <p className="text-xs text-slate-500 mt-0.5">결제 승인일 및 예약 생성일 기준</p>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                itemStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                name="매출액 (₩)"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Recent Users & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-slate-800">최근 가입 회원</h4>
              <p className="text-xs text-slate-500 mt-0.5">신규 가입 유저 목록</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="py-3 pr-2">이름</th>
                  <th className="py-3">이메일</th>
                  <th className="py-3">역할</th>
                  <th className="py-3 text-right">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {data.recentUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-2 font-semibold text-slate-800">{user.name}</td>
                    <td className="py-3 text-slate-500">{user.email}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === 'EXPERT'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400 text-xs">
                      {user.createdAt.split(' ')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-slate-800">최근 결제 내역</h4>
              <p className="text-xs text-slate-500 mt-0.5">실시간 승인/대기 결제 목록</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="py-3 pr-2">주문번호</th>
                  <th className="py-3">회원</th>
                  <th className="py-3">금액</th>
                  <th className="py-3 text-right">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {data.recentPayments.map((payment) => (
                  <tr key={payment.paymentId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-2 font-mono text-slate-500 text-xs max-w-[120px] truncate">
                      {payment.orderId}
                    </td>
                    <td className="py-3 font-semibold text-slate-800">{payment.userName}</td>
                    <td className="py-3 font-bold text-slate-700">
                      ₩{payment.paymentAmount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          payment.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : payment.paymentStatus === 'READY'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
