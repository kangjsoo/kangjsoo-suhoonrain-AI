import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultCard from './components/ResultCard';
import HistoryView from './components/HistoryView';
import Footer from './components/Footer';
import { DisputeForm, AnalysisResult, INITIAL_FORM } from './types';
import { analyzeDispute } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'history'>('home');
  const [formData, setFormData] = useState<DisputeForm>(INITIAL_FORM);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (view: 'home' | 'history') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!formData.symptoms) {
      setError("증상 및 현상 상세 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    if (window.innerWidth < 1024) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    try {
      const data = await analyzeDispute(formData);
      setResult(data);
      
      // 상담 내역 저장을 수행하지 않습니다.
      
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result && resultRef.current && window.innerWidth < 1024) {
       resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      
      <main className="flex-grow w-full">
        {currentView === 'history' ? (
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
            <HistoryView onBack={() => handleNavigate('home')} />
          </div>
        ) : (
          <>
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Input Form */}
                    <div className="lg:col-span-5 relative z-10">
                         <InputForm 
                            formData={formData} 
                            setFormData={setFormData} 
                            onSubmit={handleSubmit}
                            loading={loading}
                         />
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-7 pt-4 lg:pt-0" ref={resultRef}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            </div>
                            <div className="ml-3">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                        </div>
                    )}

                    {result ? (
                        <ResultCard result={result} />
                    ) : (
                        !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50/50">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 mb-2">분석 대기 중</h3>
                            <p className="text-sm text-center max-w-sm text-slate-500 leading-relaxed">
                            좌측 '상담 신청서'를 작성해주시면<br/>
                            AI 전문가가 즉시 법적 책임 소재와 해결책을 분석해 드립니다.
                            </p>
                        </div>
                        )
                    )}
                    
                    {loading && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-lg border border-blue-100 p-8">
                            <div className="relative">
                                <div className="h-16 w-16 bg-blue-100 rounded-full animate-ping absolute top-0 left-0 opacity-20"></div>
                                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
                                    <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="mt-6 text-lg font-bold text-slate-800">분쟁 데이터 분석 중</h3>
                            <p className="mt-2 text-slate-500 text-center text-sm">
                            민법 판례 및 소비자분쟁해결기준을 검토하고 있습니다.<br/>
                            잠시만 기다려주세요.
                            </p>
                        </div>
                    )}
                    </div>
                </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;