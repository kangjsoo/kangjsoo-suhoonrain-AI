import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  className?: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ className }) => {
  return (
    <div className={`bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md ${className ?? 'mt-8'}`}>
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-bold mb-1">면책 조항</p>
          <p>
            본 서비스는 AI 기반의 참고용 상담 결과를 제공하며, <strong>법적 효력이 없습니다.</strong><br />
            실제 소송이나 법적 조치가 필요한 경우 반드시 변호사나 법률 전문가와 상담하시기 바랍니다.<br />
            제공된 스크립트의 사용으로 인한 결과에 대해 수훈라인은 책임을 지지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;