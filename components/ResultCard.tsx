import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle2, Gavel, Scale, Copy, Check, Lightbulb, MessageCircle, AlertCircle, HelpCircle, Share2, FileCheck, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Disclaimer from './Disclaimer';

interface ResultCardProps {
  result: AnalysisResult;
}

// 1. 법률 용어 사전 정의 (유지)
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

const LegalTooltip: React.FC<{ term: string, children: React.ReactNode }> = ({ term, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside the tooltip content (which might be in a portal or fixed position)
      const target = event.target as HTMLElement;
      if (tooltipRef.current && !tooltipRef.current.contains(target as Node)) {
        // Also check if the target is within a fixed tooltip element (by checking class or id if needed)
        // For simplicity, we just close it. In mobile fixed mode, we might add a close button or overlay.
        setIsOpen(false);
      }
    };
    
    // Add scroll listener to close tooltip on scroll (improves mobile UX)
    const handleScroll = () => {
        if(isOpen) setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); // Support touch
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  const definition = LEGAL_GLOSSARY[term] || LEGAL_GLOSSARY[Object.keys(LEGAL_GLOSSARY).find(k => term.includes(k)) || ""];

  if (!definition) return <>{children}</>;

  return (
    <span className="relative inline-block" ref={tooltipRef}>
      <span 
        className="cursor-help text-blue-700 font-semibold border-b-2 border-blue-200 hover:bg-blue-50 active:bg-blue-100 transition-colors"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        onMouseEnter={() => window.matchMedia('(min-width: 768px)').matches && setIsOpen(true)}
      >
        {children}
      </span>
      {isOpen && (
        <>
            {/* Desktop Tooltip (Absolute) */}
            <div className="hidden md:block absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-4 bg-slate-800 text-white text-sm rounded-lg shadow-xl animate-fade-in z-[60]">
                <div className="font-bold text-yellow-400 mb-2 flex items-center border-b border-slate-600 pb-1">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    {term}
                </div>
                <div className="leading-relaxed opacity-95 text-left font-normal">
                    {definition}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-6 border-transparent border-t-slate-800"></div>
            </div>

            {/* Mobile Tooltip (Fixed Bottom Sheet/Toast style) */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-[9999] bg-slate-800 text-white p-4 rounded-xl shadow-2xl animate-fade-in-up border border-slate-700">
                 <div className="flex justify-between items-start mb-2 border-b border-slate-600 pb-2">
                    <div className="font-bold text-yellow-400 flex items-center text-base">
                        <HelpCircle className="w-5 h-5 mr-2" />
                        {term}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-sm leading-relaxed opacity-95">
                    {definition}
                </div>
            </div>
        </>
      )}
    </span>
  );
};

const parseTextWithTerms = (text: string) => {
  if (!text) return null;
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

const processChildren = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return parseTextWithTerms(child);
    }
    if (React.isValidElement(child)) {
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
  <div className={`text-sm md:text-base leading-relaxed text-slate-700 ${className}`}>
    <ReactMarkdown
      components={{
        p: ({node, ...props}) => <p className="mb-4 md:mb-5 last:mb-0 break-keep" {...props}>{processChildren(props.children)}</p>,
        li: ({node, ...props}) => <li className="mb-2 pl-1 break-keep" {...props}>{processChildren(props.children)}</li>,
        strong: ({node, ...props}) => <span className="font-bold text-slate-900 bg-yellow-100 px-1 rounded-sm" {...props}>{processChildren(props.children)}</span>,
        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-2 my-4 text-slate-600" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 space-y-2 my-4 text-slate-600" {...props} />,
        h1: ({node, ...props}) => <h3 className="font-bold text-lg mb-3 mt-6" {...props} />,
        h2: ({node, ...props}) => <h4 className="font-bold text-md mb-3 mt-5" {...props} />,
        h3: ({node, ...props}) => <h5 className="font-bold text-sm mb-2 mt-4" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [scriptCopied, setScriptCopied] = useState(false);
  const [resultShared, setResultShared] = useState(false);

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

* 본 결과는 참고용이며 법적 효력은 없습니다.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '수훈라인 배관 분쟁 상담 결과',
          text: shareText,
        });
      } catch (error) {
        console.log('Share cancelled', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setResultShared(true);
      setTimeout(() => setResultShared(false), 2000);
    }
  };

  if (!result.isConsultationPossible) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 md:p-8 text-center animate-fade-in shadow-sm">
            <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
                </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">분석 불가 안내</h3>
            <p className="text-slate-700 text-base md:text-lg mb-6 leading-relaxed break-keep">
                {result.refusalReason || "입력하신 정보만으로는 정확한 분석이 어렵습니다."}
            </p>
            <div className="bg-white p-4 md:p-5 rounded-lg border border-red-100 text-left max-w-md mx-auto shadow-sm">
                <p className="font-bold text-slate-800 mb-2 border-b pb-2 text-sm">💡 더 정확한 상담을 위해</p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                    <li>구체적인 증상 (예: 물이 떨어지는 위치, 주기)</li>
                    <li>발생 시점과 건물의 대략적인 연식</li>
                    <li>상대방(임대인/임차인)과의 대화 내용</li>
                </ul>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Report Container */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none">
         
         {/* Report Header */}
         <div className="bg-blue-900 text-white px-5 py-4 md:px-6 md:py-5 flex items-center justify-between print:bg-blue-900 print:text-white">
            <div className="flex items-center">
                <FileCheck className="w-5 h-5 md:w-6 md:h-6 mr-3 text-blue-300" />
                <div>
                    <h2 className="text-lg md:text-xl font-bold tracking-wide">AI 배관 분쟁 리포트</h2>
                    <p className="text-[10px] md:text-xs text-blue-200 mt-1 opacity-80">SuHoonRaIn Analysis</p>
                </div>
            </div>
            <div className="flex gap-2" data-html2canvas-ignore="true">
                <button 
                  onClick={handleShareResult}
                  className="bg-blue-800 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors border border-blue-700"
                  title="공유하기"
                >
                    {resultShared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </button>
            </div>
         </div>
         
         {/* Report Body */}
         <div className="p-5 md:p-8 space-y-6 md:space-y-8">
            
            {/* 1. Summary */}
            <div className="bg-slate-50 border-l-4 border-slate-600 p-4 md:p-5 rounded-r-lg">
                <h3 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">핵심 쟁점</h3>
                <p className="text-base md:text-lg font-bold text-slate-900 leading-snug break-keep">{result.coreIssue}</p>
            </div>

            {/* 2. Technical & Responsibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center mb-3 border-b pb-2">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
                        기술적 원인 추정
                    </h3>
                    <div className="text-slate-700">
                        <MarkdownContent content={result.technicalEstimation} />
                    </div>
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center mb-3 border-b pb-2">
                        <Scale className="w-5 h-5 mr-2 text-blue-600" />
                        책임 소재 판단
                    </h3>
                    <div className="text-slate-700 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <MarkdownContent content={result.responsibilityJudgment} className="text-slate-800" />
                    </div>
                </div>
            </div>

            {/* 3. Legal Basis & Precedent */}
            <div>
                 <h3 className="text-base font-bold text-slate-800 flex items-center mb-3 border-b pb-2">
                    <Gavel className="w-5 h-5 mr-2 text-slate-600" />
                    법적 근거 및 판례
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="font-bold text-sm text-slate-500 mb-2">관련 법령</h4>
                        <MarkdownContent content={result.legalBasis} />
                    </div>
                    {result.supremeCourtPrecedent && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h4 className="font-bold text-sm text-slate-500 mb-2">유사 판례/조정 사례</h4>
                            <MarkdownContent content={result.supremeCourtPrecedent} />
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Solution (Suhoon) - Light Theme Update */}
             {result.suhoonSolution && (
                <div className="mt-8 border-t-2 border-slate-100 pt-6">
                    <div className="flex flex-col md:flex-row items-start bg-indigo-50 border border-indigo-100 rounded-xl p-5 md:p-6 shadow-sm">
                        <div className="flex items-center mb-3 md:mb-0">
                            <Lightbulb className="w-8 h-8 text-amber-500 mr-4 flex-shrink-0" />
                            <h3 className="text-lg font-bold text-indigo-900 md:hidden">수훈라인 전문가 소견</h3>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-indigo-900 mb-2 hidden md:block">수훈라인 전문가 소견</h3>
                            <div className="">
                                <MarkdownContent content={result.suhoonSolution} className="text-slate-700" />
                            </div>
                            <div className="mt-5 text-right" data-html2canvas-ignore="true">
                                <a href="sms:01046470990" className="inline-flex items-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    전문가 정밀 점검 예약문의 &rarr;
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
         </div>

         {/* Script Section (Separate Style) */}
         <div className="bg-blue-50 border-t border-blue-100 px-5 py-5 md:px-8 md:py-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-blue-900 flex items-center text-sm md:text-base">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    추천 대응 문자 (내용증명 초안)
                </h3>
                <button 
                    data-html2canvas-ignore="true"
                    onClick={handleCopyScript}
                    className="text-xs bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-full flex items-center font-medium transition-colors"
                >
                    {scriptCopied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {scriptCopied ? '완료' : '복사'}
                </button>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-lg border border-blue-200 shadow-sm relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 rounded-l-lg"></div>
                <pre className="text-slate-700 whitespace-pre-wrap leading-relaxed font-sans text-sm md:text-base overflow-x-auto">
                    {result.recommendedScript}
                </pre>
            </div>
            <p className="text-xs text-blue-600 mt-2 text-center break-keep">
                * 위 내용은 법적 효력이 없으며, 상황에 맞춰 수정하여 사용하시기 바랍니다.
            </p>
         </div>
      </div>

      <Disclaimer />

    </div>
  );
};

export default ResultCard;