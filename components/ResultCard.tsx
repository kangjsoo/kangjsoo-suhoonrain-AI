import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle2, Gavel, Scale, Copy, Check, Lightbulb, MessageCircle, AlertCircle, BookOpen, HelpCircle, Share2, Download, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Disclaimer from './Disclaimer';

interface ResultCardProps {
  result: AnalysisResult;
}

// 1. 법률 용어 사전 정의
const LEGAL_GLOSSARY: Record<string, string> = {
  "담보책임": "물건(주택, 배관 등)에 하자가 있을 때, 이를 판 사람이나 시공한 사람이 구매자(또는 도급인)에게 져야 하는 법적 책임입니다.",
  "하자담보책임": "공사나 매매 목적물에 결함이 있을 때 시공자나 매도인이 부담하는 손해배상 또는 보수 책임입니다.",
  "선관주의의무": "'선량한 관리자의 주의 의무'의 줄임말입니다. 남의 물건을 빌려 쓰는 사람(세입자)이 일반적으로 기울여야 할 관리 의무를 뜻합니다.",
  "선량한 관리자의 주의 의무": "사회 통념상 요구되는 정도의 주의를 기울여 물건을 관리해야 하는 의무입니다. 이를 위반하면 과실이 인정될 수 있습니다.",
  "원상회복": "계약이 끝났을 때, 빌린 물건을 처음 상태로 되돌려 놓는 것을 말합니다. 단, 자연스러운 노후화는 제외됩니다.",
  "임대인의 수선의무": "집주인은 세입자가 집을 문제없이 사용할 수 있도록 고장 난 곳을 고쳐줘야 할 의무가 있습니다 (민법 제623조).",
  "소비자분쟁해결기준": "공정거래위원회가 고시한 기준으로, 법적 강제력은 없으나 분쟁 해결의 중요한 합의 기준이 됩니다.",
  "내용증명": "우체국을 통해 '누가, 언제, 어떤 내용을' 보냈는지 증명해주는 우편 제도입니다. 법적 효력은 없으나 강력한 증거가 됩니다.",
  "채무불이행": "계약한 내용을 제대로 지키지 않은 것을 말합니다. (예: 제대로 시공하지 않음, 월세를 안 냄)",
  "과실상계": "피해자에게도 잘못(부주의)이 있을 때, 그만큼을 깎고 배상액을 정하는 것입니다.",
  "부당이득": "법률상 원인 없이 남의 재산이나 노무로 인해 이익을 얻고, 이로 인해 남에게 손해를 끼친 것을 말합니다.",
  "통상손해": "일반적으로 발생할 것으로 예상되는 손해를 말합니다.",
  "특별손해": "특수한 사정으로 인해 발생한 손해로, 상대방이 그 사정을 알았거나 알 수 있었을 때만 배상 책임이 있습니다."
};

// 2. 툴팁 컴포넌트
const LegalTooltip: React.FC<{ term: string, children: React.ReactNode }> = ({ term, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const definition = LEGAL_GLOSSARY[term] || LEGAL_GLOSSARY[Object.keys(LEGAL_GLOSSARY).find(k => term.includes(k)) || ""];

  if (!definition) return <>{children}</>;

  return (
    <span className="relative inline-block" ref={tooltipRef}>
      <span 
        className="cursor-help text-blue-700 border-b border-blue-400 border-dashed font-medium transition-colors hover:bg-blue-50 hover:text-blue-800"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        onMouseEnter={() => setIsOpen(true)}
      >
        {children}
      </span>
      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs md:text-sm rounded-lg shadow-xl animate-fade-in">
          <div className="font-bold text-yellow-400 mb-1 flex items-center">
            <HelpCircle className="w-3 h-3 mr-1" />
            {term}
          </div>
          <div className="leading-relaxed opacity-90 text-left font-normal">
            {definition}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </span>
  );
};

// 3. 텍스트 내 법률 용어 파싱 함수
const parseTextWithTerms = (text: string) => {
  if (!text) return null;
  
  // 긴 용어부터 먼저 매칭되도록 정렬 (예: '하자담보책임'이 '담보책임'보다 먼저 매칭)
  const terms = Object.keys(LEGAL_GLOSSARY).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${terms.join('|')})`, 'g');
  
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (LEGAL_GLOSSARY[part]) {
      return <LegalTooltip key={index} term={part}>{part}</LegalTooltip>;
    }
    return part;
  });
};

// 4. 재귀적으로 Children을 처리하는 헬퍼 함수
const processChildren = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return parseTextWithTerms(child);
    }
    // React Element인 경우 (예: strong 태그), 그 내부의 children도 처리
    if (React.isValidElement(child)) {
       // 타입 단언을 사용하여 props 접근 허용
       const element = child as React.ReactElement<any>;
       if (element.props.children) {
         return React.cloneElement(element, {
           ...element.props,
           children: processChildren(element.props.children)
         });
       }
    }
    return child;
  });
};

const MarkdownContent = ({ content, className = "" }: { content: string, className?: string }) => (
  // ReactMarkdown에 className이 직접 전달되지 않는 경우를 대비해 div로 래핑
  <div className={`text-sm md:text-base leading-relaxed ${className}`}>
    <ReactMarkdown
      components={{
        // p, li, strong 등 텍스트가 들어갈 수 있는 요소들에 커스텀 렌더링 적용
        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props}>{processChildren(props.children)}</p>,
        li: ({node, ...props}) => <li className="pl-1" {...props}>{processChildren(props.children)}</li>,
        strong: ({node, ...props}) => <span className="font-bold text-slate-900 bg-yellow-100/50 px-0.5 rounded" {...props}>{processChildren(props.children)}</span>,
        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-1 my-2" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 space-y-1 my-2" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [scriptCopied, setScriptCopied] = useState(false);
  const [resultShared, setResultShared] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(result.recommendedScript);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  const handleShareResult = async () => {
    const shareText = `[수훈라인 AI 배관 분쟁 상담 결과]

■ 핵심 쟁점
${result.coreIssue}

■ 기술적 추정
${result.technicalEstimation}

■ 책임 소재 판단
${result.responsibilityJudgment}

■ 법적 근거
${result.legalBasis}

■ 수훈라인 솔루션
${result.suhoonSolution}

* 본 결과는 참고용이며 법적 효력은 없습니다.`;

    // Web Share API 지원 확인 (모바일/최신 브라우저)
    if (navigator.share) {
      try {
        await navigator.share({
          title: '수훈라인 배관 분쟁 상담 결과',
          text: shareText,
        });
      } catch (error) {
        console.log('Share cancelled or failed', error);
      }
    } else {
      // 데스크탑 등 미지원 시 클립보드 복사 fallback
      navigator.clipboard.writeText(shareText);
      setResultShared(true);
      setTimeout(() => setResultShared(false), 2000);
    }
  };
  
  const handleDownloadPDF = async () => {
    if (!pdfContentRef.current || isPdfGenerating) return;
    
    // window.html2pdf 가 존재하는지 확인 (index.html에서 로드됨)
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
      alert("PDF 생성 라이브러리를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsPdfGenerating(true);

    const element = pdfContentRef.current;
    
    // 파일명 생성
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `수훈라인_배관분쟁상담_${dateStr}.pdf`;

    const opt = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // 상담 불가(유효성 검증 실패) 시 렌더링
  if (!result.isConsultationPossible) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 md:p-8 text-center animate-fade-in shadow-md">
            <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">상담 분석이 어렵습니다</h3>
            <p className="text-slate-600 text-base md:text-lg mb-6 leading-relaxed max-w-lg mx-auto">
                {result.refusalReason || "입력하신 내용만으로는 정확한 배관 분쟁 분석이 어렵습니다. 실제 겪고 계신 증상과 상황을 구체적으로 입력해 주세요."}
            </p>
            <div className="bg-white p-4 rounded-lg border border-red-100 text-sm text-slate-500 inline-block text-left">
                <p className="font-semibold text-slate-700 mb-2">💡 올바른 입력 예시</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>"3일 전 하수구를 뚫었는데 오늘 또 막혔어요."</li>
                    <li>"이사 온 지 일주일 됐는데 천장에서 물이 샙니다."</li>
                    <li>"집주인이 노후 배관 수리비를 저보고 내라고 해요."</li>
                </ul>
            </div>
        </div>
    );
  }

  return (
    <div ref={pdfContentRef} className="space-y-4 md:space-y-6 animate-fade-in pb-4">
      {/* Analysis Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200" style={{ breakInside: 'avoid' }}>
         <div className="bg-slate-100 px-4 py-3 md:px-6 md:py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2 flex-shrink-0">2</span>
                <h2 className="text-lg font-bold text-slate-800">전문가 분석 결과</h2>
            </div>
            {/* data-html2canvas-ignore 속성은 PDF 생성 시 이 영역을 제외합니다 */}
            <div className="flex items-center gap-3" data-html2canvas-ignore="true">
                <div className="text-xs text-slate-500 hidden md:flex items-center">
                    <HelpCircle className="w-3 h-3 mr-1" />
                    파란색 단어를 누르면 용어 설명이 나옵니다
                </div>
                
                {/* PDF Download Button (Top) */}
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isPdfGenerating}
                  className="flex items-center text-sm font-medium text-slate-600 hover:text-red-700 transition-colors bg-white px-2.5 py-1.5 rounded-md shadow-sm border border-slate-300"
                  title="PDF로 저장"
                >
                    {isPdfGenerating ? <Loader2 className="w-4 h-4 mr-1 md:mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1 md:mr-1.5" />}
                    {isPdfGenerating ? '생성 중...' : 'PDF'}
                </button>

                {/* Share Button */}
                <button 
                  onClick={handleShareResult}
                  className="flex items-center text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors bg-white px-2.5 py-1.5 rounded-md shadow-sm border border-slate-300"
                  title="결과 공유하기"
                >
                    {resultShared ? <Check className="w-4 h-4 mr-1 md:mr-1.5" /> : <Share2 className="w-4 h-4 mr-1 md:mr-1.5" />}
                    {resultShared ? '복사됨' : '공유'}
                </button>
            </div>
         </div>
         
         <div className="p-4 md:p-6 space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-blue-500" />
                    핵심 쟁점 및 기술적 추정
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg text-slate-700">
                    <p className="font-bold text-slate-900 mb-2 text-lg">{result.coreIssue}</p>
                    <MarkdownContent content={result.technicalEstimation} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col h-full">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                        <Scale className="w-4 h-4 mr-1 text-purple-500" />
                        책임 소재 판단
                    </h3>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 h-full text-purple-900">
                        <MarkdownContent content={result.responsibilityJudgment} className="text-purple-900" />
                    </div>
                </div>
                <div className="flex flex-col h-full">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                        <Gavel className="w-4 h-4 mr-1 text-red-500" />
                        법적 근거
                    </h3>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 h-full text-red-900">
                         <MarkdownContent content={result.legalBasis} className="text-red-900" />
                    </div>
                </div>
            </div>

            {/* Precedent Section */}
            {result.supremeCourtPrecedent && (
                <div className="mt-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1 text-amber-600" />
                        관련 판례 및 조정 사례
                    </h3>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-900">
                        <MarkdownContent content={result.supremeCourtPrecedent} className="text-amber-900" />
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* Script Section */}
      <div className="bg-blue-50 rounded-xl shadow-md border border-blue-100 overflow-hidden" style={{ breakInside: 'avoid' }}>
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-blue-200 bg-blue-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-blue-900 flex items-center">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2 flex-shrink-0">3</span>
                추천 대응 스크립트
            </h2>
            <button 
                data-html2canvas-ignore="true"
                onClick={handleCopyScript}
                className="flex items-center text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-blue-200 whitespace-nowrap hover:bg-blue-50"
            >
                {scriptCopied ? <Check className="w-4 h-4 mr-1 md:mr-1.5" /> : <Copy className="w-4 h-4 mr-1 md:mr-1.5" />}
                {scriptCopied ? '복사완료' : '복사하기'}
            </button>
        </div>
        <div className="p-4 md:p-6 bg-slate-50">
            <div className="bg-white p-5 md:p-7 rounded-2xl border border-blue-200 shadow-sm relative">
                <div className="absolute -top-3 -left-2 bg-blue-100 text-blue-500 rounded-full p-1.5 border border-blue-200">
                    <MessageCircle className="w-4 h-4" />
                </div>
                {/* pre 태그를 사용하여 줄바꿈을 유지하되, font-sans를 적용하여 가독성 좋은 고딕체 사용 */}
                <pre className="text-slate-800 whitespace-pre-wrap leading-loose font-sans text-base md:text-lg">
                    {result.recommendedScript}
                </pre>
            </div>
            <div className="flex justify-between items-center mt-3 px-1">
                <p className="text-xs text-slate-500 flex items-center">
                    <Lightbulb className="w-3 h-3 mr-1 text-amber-500" />
                    상황에 맞춰 내용을 조금씩 수정해서 문자나 카톡으로 보내세요.
                </p>
                <p className="text-xs text-blue-600 text-right font-medium hidden md:block" data-html2canvas-ignore="true">
                    * 텍스트 박스를 눌러 전체 선택할 수 있습니다.
                </p>
            </div>
        </div>
      </div>

      {/* Sales Strategy / Suhoon Solution Section */}
      {result.suhoonSolution && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden text-white" style={{ breakInside: 'avoid' }}>
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-700 flex items-center bg-white/5">
            <Lightbulb className="w-5 h-5 text-yellow-400 mr-2" />
            <h2 className="text-lg font-bold text-white">수훈라인 전문가의 한마디</h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="text-slate-200 text-base leading-relaxed">
                <ReactMarkdown
                    components={{
                    strong: ({node, ...props}) => <span className="font-bold text-yellow-300" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-1 my-2" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                    }}
                >
                    {result.suhoonSolution}
                </ReactMarkdown>
            </div>
            <div className="mt-4 flex justify-end" data-html2canvas-ignore="true">
              <a 
                href="sms:01046470990"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-colors flex items-center transform hover:scale-105 duration-200 no-underline"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                수훈라인 정밀 내시경 점검 예약하기
              </a>
            </div>
          </div>
        </div>
      )}

      <Disclaimer className="mt-4 md:mt-6" />

      {/* Bottom Download Button (Visible only on screen) */}
      <div className="flex justify-center mt-6" data-html2canvas-ignore="true">
        <button 
            onClick={handleDownloadPDF}
            disabled={isPdfGenerating}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isPdfGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isPdfGenerating ? 'PDF 문서 생성 중...' : '전체 상담 결과 PDF로 다운로드'}
        </button>
      </div>
    </div>
  );
};

export default ResultCard;