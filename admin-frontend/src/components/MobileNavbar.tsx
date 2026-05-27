import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';

interface MobileNavbarProps {
  onOpenSidebar: () => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ onOpenSidebar }) => {
  return (
    <header className="lg:hidden bg-slate-900 text-slate-100 h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-30 shadow-md">
      {/* Brand & Left Hamburger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="메뉴 열기"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold text-base leading-tight tracking-wide">Mohaemohae</span>
          <span className="text-[10px] bg-slate-800 text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>
        </div>
      </div>
    </header>
  );
};
