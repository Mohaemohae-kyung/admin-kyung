import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  UserX, 
  UserCheck, 
  Calendar, 
  Mail, 
  Smartphone, 
  User as UserIcon,
  ShieldAlert,
  Loader2,
  X,
  History
} from 'lucide-react';

interface UserList {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  role: string;
  status: string;
  createdAt: string;
}

interface ActionLog {
  adminActionId: number;
  adminEmail: string;
  actionType: string;
  reason: string;
  createdAt: string;
}

interface UserDetail {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string;
  profileImageUrl: string;
  actionLogs: ActionLog[];
}

export const Users: React.FC = () => {
  const { apiFetch } = useAuth();
  const [users, setUsers] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [showActionModal, setShowActionModal] = useState<'suspend' | 'unsuspend' | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : '';
      const result = await apiFetch(`/api/admin/users${q}`);
      setUsers(result);
    } catch (err: any) {
      alert(err.message || '회원 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId: number) => {
    setDetailLoading(true);
    try {
      const result = await apiFetch(`/api/admin/users/${userId}`);
      setSelectedUser(result);
    } catch (err: any) {
      alert(err.message || '상세 정보를 불러오는 데 실패했습니다.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !showActionModal) return;
    if (!actionReason.trim()) {
      alert('조치 사유를 입력해 주세요.');
      return;
    }

    setSubmittingAction(true);
    try {
      const path = `/api/admin/users/${selectedUser.userId}/${showActionModal}`;
      await apiFetch(path, {
        method: 'POST',
        body: JSON.stringify({ reason: actionReason }),
      });
      alert(`성공적으로 처리되었습니다.`);
      setShowActionModal(null);
      setActionReason('');
      fetchUserDetail(selectedUser.userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || '작업이 실패했습니다.');
    } finally {
      setSubmittingAction(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="flex-1 flex overflow-hidden h-screen bg-slate-50">
      {/* Main Panel */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">회원 관리</h2>
            <p className="text-slate-500 text-sm mt-1">회원 목록 검색 및 계정 활성화/정지 조치 제어</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm mb-6 flex items-center">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 이메일, 닉네임으로 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        {/* Table list */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex justify-center items-center py-20">
              <Loader2 size={36} className="animate-spin text-indigo-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center py-20 text-slate-400 space-y-2">
              <UserIcon size={48} className="stroke-[1.5]" />
              <p>검색 조건에 맞는 회원이 존재하지 않습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-6">식별자</th>
                    <th className="py-3.5 px-6">이름</th>
                    <th className="py-3.5 px-6">이메일</th>
                    <th className="py-3.5 px-6">닉네임</th>
                    <th className="py-3.5 px-6">역할</th>
                    <th className="py-3.5 px-6">계정 상태</th>
                    <th className="py-3.5 px-6 text-right">가입일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => (
                    <tr
                      key={u.userId}
                      onClick={() => fetchUserDetail(u.userId)}
                      className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${
                        selectedUser?.userId === u.userId ? 'bg-indigo-50/50 font-medium' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-xs font-mono text-slate-400">{u.userId}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{u.name}</td>
                      <td className="py-4 px-6 text-slate-500">{u.email}</td>
                      <td className="py-4 px-6 text-slate-500">{u.nickname || '-'}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            u.role === 'ADMIN'
                              ? 'bg-red-100 text-red-700'
                              : u.role === 'EXPERT'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : u.status === 'SUSPENDED'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-400 text-xs">
                        {u.createdAt.split(' ')[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Side Detail Panel (Slide over Drawer) */}
      {selectedUser && (
        <div className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col h-screen overflow-y-auto animate-slide-in shrink-0 relative z-20">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center space-x-2">
              <UserIcon size={18} className="text-slate-500" />
              <span>회원 상세 정보</span>
            </h3>
            <button
              onClick={() => setSelectedUser(null)}
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {detailLoading ? (
            <div className="flex-1 flex justify-center items-center py-20">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="p-6 flex-1 flex flex-col space-y-6">
              {/* User basic info */}
              <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full border border-indigo-500/20 shadow-md bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-2xl overflow-hidden">
                  {selectedUser.profileImageUrl ? (
                    <img src={selectedUser.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    selectedUser.name.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{selectedUser.name}</h4>
                  <p className="text-sm text-slate-400 mt-0.5">@{selectedUser.nickname || '닉네임 없음'}</p>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {selectedUser.role}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedUser.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              {/* Data fields */}
              <div className="space-y-4 text-sm pb-6 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-16 shrink-0 font-medium">이메일</span>
                  <span className="text-slate-800 font-semibold truncate">{selectedUser.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Smartphone size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-16 shrink-0 font-medium">연락처</span>
                  <span className="text-slate-800 font-semibold">{selectedUser.phone || '-'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-16 shrink-0 font-medium">가입일시</span>
                  <span className="text-slate-800 font-semibold">{selectedUser.createdAt}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-16 shrink-0 font-medium">최근 로그인</span>
                  <span className="text-slate-800 font-semibold">{selectedUser.lastLoginAt || '-'}</span>
                </div>
              </div>

              {/* Account actions */}
              <div>
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">관리자 조치</h5>
                <div className="grid grid-cols-2 gap-4">
                  {selectedUser.status === 'ACTIVE' ? (
                    <button
                      onClick={() => setShowActionModal('suspend')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-semibold transition-colors"
                    >
                      <UserX size={16} />
                      <span>계정 정지</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowActionModal('unsuspend')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-semibold transition-colors animate-pulse"
                    >
                      <UserCheck size={16} />
                      <span>정지 해제</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Administrative log audit */}
              <div className="flex-1 flex flex-col min-h-0">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <History size={14} className="text-slate-400" />
                  <span>조치 이력 내역</span>
                </h5>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {selectedUser.actionLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">조치 이력이 존재하지 않습니다.</p>
                  ) : (
                    selectedUser.actionLogs.map((log) => (
                      <div
                        key={log.adminActionId}
                        className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5 text-xs text-slate-700"
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              log.actionType === 'SUSPEND'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {log.actionType}
                          </span>
                          <span className="text-slate-400">{log.createdAt.split(' ')[0]}</span>
                        </div>
                        <p className="font-medium text-slate-800">{log.reason}</p>
                        <p className="text-[10px] text-slate-400 border-t border-slate-200/60 pt-1">
                          담당자: {log.adminEmail}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center space-x-3.5 text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-2xl">
              <ShieldAlert size={24} className="shrink-0" />
              <div>
                <h4 className="font-bold">회원 계정 상태 변경</h4>
                <p className="text-xs text-slate-500 mt-0.5">회원 이름: {selectedUser.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">조치 사유</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="해당 조치 사유를 상세하게 기록해 주세요 (이력 로그에 적재됩니다)..."
                rows={4}
                className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm bg-slate-50 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setActionReason('');
                }}
                disabled={submittingAction}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors outline-none"
              >
                취소
              </button>
              <button
                onClick={handleAction}
                disabled={submittingAction}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors outline-none shadow-md shadow-indigo-600/15 flex items-center justify-center space-x-2"
              >
                {submittingAction ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>처리 중...</span>
                  </>
                ) : (
                  <span>실행</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
