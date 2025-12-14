import React from 'react';
import { ShieldCheck, Wrench, History, Home, Menu } from 'lucide-react';

interface HeaderProps {
  currentView?: 'home' | 'history';
  onNavigate?: (view: 'home' | 'history') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView = 'home', onNavigate }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between">
        {/* Logo Section */}
        <div 
          className={`flex items-center gap-2 md:gap-3 ${onNavigate ? 'cursor-pointer' : ''}`}
          onClick={() => onNavigate && onNavigate('home')}
        >
          <div className="bg-blue-700 p-1.5 md:p-2 rounded-lg flex-shrink-0">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 leading-none flex items-center gap-1 md:gap-2">
              수훈라인
              <span className="text-blue-700">AI 상담센터</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium hidden sm:block">
              배관 분쟁 해결을 위한 법률·기술 통합 솔루션
            </p>
          </div>
        </div>

        {/* Navigation */}
        {onNavigate && (
            <nav className="flex items-center gap-2">
            <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                currentView === 'home' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">상담 신청</span>
            </button>
            <button
                onClick={() => onNavigate('history')}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                currentView === 'history' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <History className="w-4 h-4" />
                <span className="hidden md:inline">나의 상담 내역</span>
            </button>
            </nav>
        )}
      </div>
    </header>
  );
};

export default Header;