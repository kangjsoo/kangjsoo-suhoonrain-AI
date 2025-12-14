import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultCard from './components/ResultCard';
import Disclaimer from './components/Disclaimer';
import HistoryView from './components/HistoryView';
import { DisputeForm, AnalysisResult, INITIAL_FORM } from './types';
import { analyzeDispute } from './services/geminiService';
import { databaseService } from './services/databaseService';
import { saveToGoogleSheet } from './services/googleSheetService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'history'>('home');
  const [formData, setFormData] = useState<DisputeForm>(INITIAL_FORM);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null); // 백그라운드 저장 에러 상태
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (view: 'home' | 'history') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    // 유효성 검사: 증상은 필수, 연락처와 이메일 중 하나는 필수
    if (!formData.symptoms) {
      setError("증상 및 현상 상세 내용을 입력해주세요.");
      return;
    }

    if (!formData.phone && !formData.email) {
      setError("연락처 또는 이메일 중 하나는 반드시 입력해야 합니다.");
      return;
    }

    setLoading(true);
    setError(null);
    setSaveError(null);
    setResult(null);

    // Scroll to results area on mobile when loading starts
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    try {
      // 1. AI 분석 요청
      const data = await analyzeDispute(formData);
      setResult(data);
      
      // 2. 데이터 저장 (로컬 DB + 구글 시트)
      // 사용자 경험을 위해 백그라운드에서 실행 (await로 UI를 블로킹하지 않음)
      Promise.allSettled([
        databaseService.saveRecord(formData, data),
        saveToGoogleSheet(formData, data)
      ]).then((results) => {
        const errorMessages: string[] = [];

        // 로컬 DB 저장 실패
        if (results[0].status === 'rejected') {
           const dbErrorMsg = results[0].reason?.message || "내역 저장 실패";
           console.warn("History Save Warning:", dbErrorMsg);
           // 로컬 DB 에러도 사용자에게 알림 (요청사항 반영)
           errorMessages.push(`[기기 저장 실패] ${dbErrorMsg}`);
        }
        
        // 구글 시트 저장 실패
        if (results[1].status === 'rejected') {
           console.error("Sheet Save Failed:", results[1].reason);
           const sheetErrorMsg = results[1].reason?.message || "서버 접수 중 문제 발생";
           errorMessages.push(`[서버 접수 실패] ${sheetErrorMsg}`);
        }

        if (errorMessages.length > 0) {
            setSaveError(`${errorMessages.join("\n")} (분석 결과는 정상입니다)`);
        }
      });
      
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Ensure result comes into view when analysis is done
  useEffect(() => {
    if (result && resultRef.current && window.innerWidth < 1024) {
       resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-50 pb-10 md:pb-20">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {currentView === 'history' ? (
          <HistoryView onBack={() => handleNavigate('home')} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column: Input Form */}
            <div className="lg:col-span-5 space-y-6">
              {/* sticky only on large screens, adjusted top to accommodate sticky header */}
              <div className="lg:sticky lg:top-28">
                  <div className="mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900">상담 신청</h2>
                    <p className="text-sm md:text-base text-slate-500">
                      현재 겪고 계신 배관/누수 문제 상황을 자세히 적어주시면 AI가 분석합니다.
                    </p>
                  </div>
                  <InputForm 
                    formData={formData} 
                    setFormData={setFormData} 
                    onSubmit={handleSubmit}
                    loading={loading}
                  />
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7" ref={resultRef}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Background Save Error Notification */}
              {saveError && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-r-md animate-fade-in">
                  <div className="flex">
                    <div className="flex-shrink-0">
                       <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                       </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-orange-700 whitespace-pre-wrap">
                        {saveError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result ? (
                <>
                  <ResultCard result={result} />
                  <Disclaimer />
                </>
              ) : (
                !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px] md:min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl p-6 md:p-8 bg-white/50">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-base md:text-lg font-medium">아직 분석 결과가 없습니다.</p>
                    <p className="text-sm mt-2 text-center max-w-xs text-slate-500">
                      좌측 폼에 정보를 입력하고 분석을 요청하시면<br/>
                      전문가의 소견과 법적 판단을 확인하실 수 있습니다.
                    </p>
                  </div>
                )
              )}
              
              {loading && (
                 <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
                      <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-slate-200 rounded"></div>
                    </div>
                    <p className="mt-8 text-slate-500 font-medium animate-pulse text-center text-sm md:text-base">
                      법률 및 기술 데이터베이스 검색 중...<br/>
                      <span className="text-xs text-slate-400 mt-1 block">잠시만 기다려주세요 (약 5-10초 소요)</span>
                    </p>
                 </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;