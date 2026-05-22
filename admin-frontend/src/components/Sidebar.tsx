import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  FileText, 
  CreditCard, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: '대시보드', icon: <LayoutDashboard size={20} /> },
    { to: '/users', label: '회원 관리', icon: <UsersIcon size={20} /> },
    { to: '/content', label: '콘텐츠 관리', icon: <FileText size={20} /> },
    { to: '/transactions', label: '예약/결제 관리', icon: <CreditCard size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Mohaemohae</h1>
          <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">Admin Center</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <span className="transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800">
        {user && (
          <div className="flex items-center space-x-3 p-2 bg-slate-800/50 rounded-xl mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">로그아웃</span>
        </button>
      </div>
    </aside>
  );
};
