import React from 'react';
import { ShieldCheck, Wrench, History, Home } from 'lucide-react';

interface HeaderProps {
  currentView?: 'home' | 'history';
  onNavigate?: (view: 'home' | 'history') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView = 'home', onNavigate }) => {
  return (
    <header className="bg-slate-900 text-white p-4 md:p-6 shadow-lg sticky top-0 z-50 transition-all duration-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div 
          className={`flex items-center gap-3 md:gap-4 ${onNavigate ? 'cursor-pointer' : ''}`}
          onClick={() => onNavigate && onNavigate('home')}
        >
          <div className="bg-blue-600 p-2 md:p-3 rounded-full flex-shrink-0 shadow-lg shadow-blue-900/50">
            <Wrench className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold tracking-tight flex items-center gap-2 truncate">
              수훈라인 AI 배관 분쟁 상담가
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 hidden sm:block truncate">
              20년 경력 기술 노하우 & 법률 지식 기반 분쟁 솔루션
            </p>
          </div>
        </div>

        {onNavigate && (
            <nav className="flex items-center bg-slate-800 p-1 rounded-xl flex-shrink-0">
            <button
                onClick={() => onNavigate('home')}
                className={`p-2 px-3 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                currentView === 'home' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title="상담 홈"
            >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:inline">상담하기</span>
            </button>
            <button
                onClick={() => onNavigate('history')}
                className={`p-2 px-3 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                currentView === 'history' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title="상담 기록"
            >
                <History className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:inline">기록함</span>
            </button>
            </nav>
        )}
      </div>
    </header>
  );
};

export default Header;