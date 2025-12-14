import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 mt-auto border-t border-slate-200 bg-slate-100">
      <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
        <p className="font-medium text-slate-700 mb-2">수훈라인 AI 배관 분쟁 상담가</p>
        <div className="mb-3 text-xs md:text-sm leading-relaxed text-slate-600">
          <p className="mb-1">
            서비스 책임자: 강정수 <span className="mx-2 text-slate-300">|</span> 
            문의: <a href="mailto:kangjsoo99@gmail.com" className="text-blue-600 hover:underline">kangjsoo99@gmail.com</a>
          </p>
          <p>
            주소: 서울시 중랑구 면목로73가길 17-2 B02
          </p>
        </div>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} SuhoonLine. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;