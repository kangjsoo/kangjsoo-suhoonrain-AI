import React from 'react';
import { DisputeForm, UserRole, IssueType } from '../types';
import { Send, Loader2, Beaker, FileText } from 'lucide-react';

interface InputFormProps {
  formData: DisputeForm;
  setFormData: React.Dispatch<React.SetStateAction<DisputeForm>>;
  onSubmit: () => void;
  loading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ formData, setFormData, onSubmit, loading }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFillTestData = () => {
    setFormData({
      role: UserRole.TENANT,
      issueType: IssueType.LEAK,
      symptoms: "이사 온 지 2주일 됐는데 어제부터 안방 천장에서 물이 뚝뚝 떨어집니다. 벽지도 다 젖었고 가구에도 물이 튀었습니다. 관리실에서는 윗집 문제라고 하는데, 윗집은 자기는 책임 없다고 합니다.",
      history: "2010년 준공된 아파트이며, 2주 전 전세로 입주했습니다.",
      otherPartyInfo: "집주인: '세입자가 알아서 해결해라, 나는 모른다'\n윗집: '우리 집 화장실 방수 공사 1년 전에 했다. 우리 문제 아니다'",
      phone: "",
      email: ""
    });
  };

  const isFormValid = !!formData.symptoms;

  const getDisabledMessage = () => {
    if (loading) return null;
    if (!formData.symptoms) return "상담 내용을 입력해주세요.";
    return null;
  };

  const disabledMessage = getDisabledMessage();

  // Mobile optimization: use text-base on mobile to prevent iOS zoom, text-sm on desktop
  const inputBaseClass = "w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-base md:text-sm";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 md:px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          상담 신청서 작성
        </h2>
        <button
          type="button"
          onClick={handleFillTestData}
          className="text-xs text-slate-500 hover:text-blue-700 bg-white border border-slate-300 px-3 py-1.5 rounded-md shadow-sm transition-colors flex items-center"
        >
          <Beaker className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">예시 입력</span>
          <span className="sm:hidden">예시</span>
        </button>
      </div>
      
      <div className="p-4 md:p-6 space-y-6">
        
        {/* Section 1: Basic Info */}
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                기본 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">신청인 구분</label>
                <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`${inputBaseClass} py-2.5 bg-slate-50/50`}
                >
                {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>{role}</option>
                ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">분쟁 유형</label>
                <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                className={`${inputBaseClass} py-2.5 bg-slate-50/50`}
                >
                {Object.values(IssueType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                ))}
                </select>
            </div>
            </div>
        </div>

        <hr className="border-slate-100" />

        {/* Section 3: Details (Renamed/Reordered implicitly by removing section 2) */}
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                상세 분쟁 내용
            </h3>
            
            <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                1. 겪고 계신 증상과 현재 상황을 자세히 적어주세요. <span className="text-red-500">*</span>
            </label>
            <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="예: 안방 천장에서 물이 똑똑 떨어집니다. 관리소에서는 윗집 문제라고 하는데 윗집은 아니라고 합니다."
                className={`${inputBaseClass} p-3 min-h-[100px] resize-none`}
            />
            </div>

            <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                2. 시공 시점, 거주 기간 등 관련 이력
            </label>
            <textarea
                name="history"
                value={formData.history}
                onChange={handleChange}
                placeholder="예: 이사 온 지 2주 되었습니다. 건물은 20년 된 빌라입니다."
                className={`${inputBaseClass} p-3 min-h-[80px] resize-none`}
            />
            </div>

            <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                3. 상대방의 주장이나 요구사항
            </label>
            <textarea
                name="otherPartyInfo"
                value={formData.otherPartyInfo}
                onChange={handleChange}
                placeholder="예: 집주인은 '살면서 생긴 문제니 세입자가 고쳐라'라고 합니다."
                className={`${inputBaseClass} p-3 min-h-[80px] resize-none`}
            />
            </div>
        </div>

        <div className="pt-2">
            <div className="relative group w-full">
                <button
                onClick={onSubmit}
                disabled={loading || !isFormValid}
                className={`w-full flex items-center justify-center py-4 px-6 rounded-lg shadow-md text-base font-bold text-white transition-all transform hover:-translate-y-0.5 active:scale-[0.98] ${
                    loading || !isFormValid
                    ? 'bg-slate-300 cursor-not-allowed shadow-none hover:transform-none'
                    : 'bg-blue-700 hover:bg-blue-800 hover:shadow-lg'
                }`}
                >
                {loading ? (
                    <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    분석 중...
                    </>
                ) : (
                    <>
                    <Send className="-ml-1 mr-2 h-5 w-5" />
                    AI 상담 분석 신청하기
                    </>
                )}
                </button>

                {disabledMessage && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[90%] px-3 py-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center hidden md:block">
                        {disabledMessage}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default InputForm;