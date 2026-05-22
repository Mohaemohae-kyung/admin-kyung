import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Loader2, 
  X,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface Notice {
  noticeId: number;
  adminEmail: string;
  adminName: string;
  noticeType: string;
  title: string;
  content: string;
  viewCount: number;
  status: string;
  createdAt: string;
}

interface CommunityPost {
  communityPostId: number;
  userEmail: string;
  userName: string;
  boardType: string;
  title: string;
  content: string;
  viewCount: number;
  status: string;
  createdAt: string;
}

export const Content: React.FC = () => {
  const { apiFetch } = useAuth();
  
  // Tab State: 'notices' | 'community'
  const [activeTab, setActiveTab] = useState<'notices' | 'community'>('notices');
  
  // Notice States
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticeSearch, setNoticeSearch] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Notice Form
  const [noticeForm, setNoticeForm] = useState({
    noticeType: 'GENERAL',
    title: '',
    content: ''
  });
  const [noticeSubmitting, setNoticeSubmitting] = useState(false);

  // Community States
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postSearch, setPostSearch] = useState('');

  // Fetch Notices
  const fetchNotices = async () => {
    setNoticesLoading(true);
    try {
      const data = await apiFetch('/api/admin/notices');
      setNotices(data);
    } catch (err: any) {
      alert(err.message || '공지사항 목록을 불러오지 못했습니다.');
    } finally {
      setNoticesLoading(false);
    }
  };

  // Fetch Community Posts
  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const data = await apiFetch('/api/admin/community/posts');
      setPosts(data);
    } catch (err: any) {
      alert(err.message || '커뮤니티 게시글을 불러오지 못했습니다.');
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'notices') {
      fetchNotices();
    } else {
      fetchPosts();
    }
  }, [activeTab]);

  // Notice Form Handlers
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setNoticeForm({ noticeType: 'GENERAL', title: '', content: '' });
    setIsNoticeModalOpen(true);
  };

  const handleOpenEditModal = (notice: Notice) => {
    setIsEditMode(true);
    setSelectedNotice(notice);
    setNoticeForm({
      noticeType: notice.noticeType,
      title: notice.title,
      content: notice.content
    });
    setIsNoticeModalOpen(true);
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setNoticeSubmitting(true);
    try {
      if (isEditMode && selectedNotice) {
        await apiFetch(`/api/admin/notices/${selectedNotice.noticeId}`, {
          method: 'PATCH',
          body: JSON.stringify(noticeForm)
        });
        alert('공지사항이 수정되었습니다.');
      } else {
        await apiFetch('/api/admin/notices', {
          method: 'POST',
          body: JSON.stringify(noticeForm)
        });
        alert('공지사항이 등록되었습니다.');
      }
      setIsNoticeModalOpen(false);
      fetchNotices();
    } catch (err: any) {
      alert(err.message || '공지사항 저장에 실패했습니다.');
    } finally {
      setNoticeSubmitting(false);
    }
  };

  const handleNoticeDelete = async (noticeId: number) => {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`/api/admin/notices/${noticeId}`, {
        method: 'DELETE'
      });
      alert('공지사항이 삭제되었습니다.');
      fetchNotices();
    } catch (err: any) {
      alert(err.message || '공지사항 삭제에 실패했습니다.');
    }
  };

  // Community Post Blind
  const handlePostBlind = async (postId: number) => {
    if (!window.confirm('이 게시글을 커뮤니티에서 삭제(블라인드) 처리하시겠습니까?')) return;
    try {
      await apiFetch(`/api/admin/community/posts/${postId}`, {
        method: 'DELETE'
      });
      alert('게시글이 성공적으로 삭제/블라인드 처리되었습니다.');
      fetchPosts();
    } catch (err: any) {
      alert(err.message || '게시글 삭제에 실패했습니다.');
    }
  };

  // Filters
  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(noticeSearch.toLowerCase()) ||
    n.content.toLowerCase().includes(noticeSearch.toLowerCase()) ||
    (n.adminName && n.adminName.toLowerCase().includes(noticeSearch.toLowerCase()))
  );

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
    p.content.toLowerCase().includes(postSearch.toLowerCase()) ||
    p.userName.toLowerCase().includes(postSearch.toLowerCase()) ||
    p.userEmail.toLowerCase().includes(postSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-8 bg-slate-50 overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">콘텐츠 관리</h2>
          <p className="text-slate-500 text-sm mt-1">공지사항 시스템 제어 및 부적절한 커뮤니티 게시글 모니터링</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center space-x-2 px-6 py-3.5 font-semibold text-sm border-b-2 transition-all duration-200 outline-none ${
            activeTab === 'notices'
              ? 'border-indigo-600 text-indigo-600 bg-white/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={18} />
          <span>공지사항 관리</span>
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex items-center space-x-2 px-6 py-3.5 font-semibold text-sm border-b-2 transition-all duration-200 outline-none ${
            activeTab === 'community'
              ? 'border-indigo-600 text-indigo-600 bg-white/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare size={18} />
          <span>커뮤니티 모니터링</span>
        </button>
      </div>

      {/* Tab: Notices */}
      {activeTab === 'notices' && (
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                placeholder="제목, 내용, 작성자 검색..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200 text-sm"
              />
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <Plus size={18} />
              <span>공지사항 등록</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
            {noticesLoading ? (
              <div className="flex-1 flex justify-center items-center py-20">
                <Loader2 size={36} className="animate-spin text-indigo-600" />
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center py-20 text-slate-400 space-y-2">
                <FileText size={48} className="stroke-[1.5]" />
                <p>등록된 공지사항이 존재하지 않습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-6">ID</th>
                      <th className="py-3.5 px-6">분류</th>
                      <th className="py-3.5 px-6">제목</th>
                      <th className="py-3.5 px-6">작성 관리자</th>
                      <th className="py-3.5 px-6">조회수</th>
                      <th className="py-3.5 px-6">생성일</th>
                      <th className="py-3.5 px-6 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredNotices.map((notice) => (
                      <tr key={notice.noticeId} className="hover:bg-indigo-50/10 transition-colors">
                        <td className="py-4 px-6 text-xs font-mono text-slate-400">{notice.noticeId}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              notice.noticeType === 'URGENT'
                                ? 'bg-red-100 text-red-700'
                                : notice.noticeType === 'EVENT'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {notice.noticeType}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900 max-w-[280px] truncate" title={notice.title}>
                          {notice.title}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {notice.adminName || notice.adminEmail}
                        </td>
                        <td className="py-4 px-6 text-slate-400 flex items-center space-x-1">
                          <Eye size={14} className="inline shrink-0" />
                          <span>{notice.viewCount.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 text-xs">
                          {notice.createdAt.split(' ')[0]}
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(notice)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="수정"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleNoticeDelete(notice.noticeId)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 size={16} />
                          </button>
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

      {/* Tab: Community Posts */}
      {activeTab === 'community' && (
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Search Controls */}
          <div className="flex items-center bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                placeholder="제목, 내용, 작성자명, 이메일로 검색..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
            {postsLoading ? (
              <div className="flex-1 flex justify-center items-center py-20">
                <Loader2 size={36} className="animate-spin text-indigo-600" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center py-20 text-slate-400 space-y-2">
                <MessageSquare size={48} className="stroke-[1.5]" />
                <p>모니터링 대상 게시글이 존재하지 않습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-6">ID</th>
                      <th className="py-3.5 px-6">게시판</th>
                      <th className="py-3.5 px-6">제목</th>
                      <th className="py-3.5 px-6">작성자</th>
                      <th className="py-3.5 px-6">조회수</th>
                      <th className="py-3.5 px-6">상태</th>
                      <th className="py-3.5 px-6">등록일</th>
                      <th className="py-3.5 px-6 text-right">조치</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredPosts.map((post) => (
                      <tr key={post.communityPostId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 text-xs font-mono text-slate-400">{post.communityPostId}</td>
                        <td className="py-4 px-6">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                            {post.boardType}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900 max-w-[240px] truncate" title={post.title}>
                          {post.title}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-slate-900">{post.userName}</div>
                          <div className="text-xs text-slate-400">{post.userEmail}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-400">{post.viewCount}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              post.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 text-xs">
                          {post.createdAt.split(' ')[0]}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {post.status === 'ACTIVE' && (
                            <button
                              onClick={() => handlePostBlind(post.communityPostId)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                            >
                              블라인드/삭제
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

      {/* Notice Create/Edit Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <form
            onSubmit={handleNoticeSubmit}
            className="w-full max-w-2xl bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6 animate-scale-in"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
                <Sparkles size={20} className="text-indigo-600" />
                <span>{isEditMode ? '공지사항 수정' : '신규 공지사항 등록'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">분류 유형</label>
                <select
                  value={noticeForm.noticeType}
                  onChange={(e) => setNoticeForm({ ...noticeForm, noticeType: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold transition-all"
                >
                  <option value="GENERAL">일반 (GENERAL)</option>
                  <option value="EVENT">이벤트 (EVENT)</option>
                  <option value="URGENT">긴급 (URGENT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">공지 제목</label>
                <input
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="공지사항의 메인 제목을 입력해 주세요..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">상세 본문 내용</label>
                <textarea
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="공지사항의 세부 정보 및 내용을 작성해 주세요..."
                  rows={8}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-slate-100 justify-end">
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={noticeSubmitting}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-indigo-600/15 flex items-center space-x-2 cursor-pointer"
              >
                {noticeSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>저장 중...</span>
                  </>
                ) : (
                  <span>공지사항 저장</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
