import React from 'react';
import { ShieldCheck, Wrench } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white p-4 md:p-6 shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center gap-3 md:gap-4">
        <div className="bg-blue-600 p-2 md:p-3 rounded-full flex-shrink-0">
          <Wrench className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
        <div>
          <h1 className="text-lg md:text-2xl font-bold tracking-tight flex items-center gap-2">
            수훈라인 AI 배관 분쟁 상담가
            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            20년 경력 기술 노하우 & 법률 지식 기반 분쟁 솔루션
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;