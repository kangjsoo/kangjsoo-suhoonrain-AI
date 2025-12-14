import React from 'react';
import { DisputeForm, UserRole, IssueType } from '../types';
import { Send, Loader2, Phone, Mail, Beaker } from 'lucide-react';

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
      phone: "010-1234-5678",
      email: "test_user@example.com"
    });
  };

  const isContactInfoValid = !!(formData.phone || formData.email);
  const isFormValid = !!(formData.symptoms && isContactInfoValid);

  // 버튼 비활성화 사유에 따른 메시지 결정
  const getDisabledMessage = () => {
    if (loading) return null;
    if (!formData.symptoms) return "증상 및 현상 상세 내용을 입력해주세요.";
    if (!isContactInfoValid) return "연락처 또는 이메일을 입력해야 요청 가능합니다.";
    return null;
  };

  const disabledMessage = getDisabledMessage();

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-slate-200">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-lg font-bold text-slate-800 flex items-center">
          <span className="bg-slate-800 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2 flex-shrink-0">1</span>
          상황 정보 입력
        </h2>
        <button
          type="button"
          onClick={handleFillTestData}
          className="text-xs text-slate-400 hover:text-blue-600 flex items-center transition-colors px-2 py-1 rounded hover:bg-slate-100"
          title="테스트용 데이터 자동 입력"
        >
          <Beaker className="w-3 h-3 mr-1" />
          테스트 입력
        </button>
      </div>
      
      <div className="space-y-4 md:space-y-5">
        
        {/* 연락처 정보 섹션 */}
        <div className="bg-slate-50 p-3 md:p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center">
             필수 고객 정보 <span className="text-xs font-normal text-slate-400 ml-2">(연락처 또는 이메일 중 1개 필수)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                <Phone className="w-3 h-3 mr-1 text-slate-400" /> 연락처
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="010-0000-0000"
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                <Mail className="w-3 h-3 mr-1 text-slate-400" /> 이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-base"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">내 역할</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-base"
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">문제 유형</label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-base"
            >
              {Object.values(IssueType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">증상 및 현상 상세</label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            placeholder="예: 안방 천장에서 물이 똑똑 떨어짐, 변기 물을 내리면 욕실 바닥으로 역류함 등"
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border h-24 resize-none text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">시공/거주 이력 (날짜 포함)</label>
          <textarea
            name="history"
            value={formData.history}
            onChange={handleChange}
            placeholder="예: 3일 전 하수구 뚫음 작업 진행함, 이사온 지 2주일 됨, 건물 지은지 20년 됨"
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border h-20 resize-none text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">상대방 주장 및 관계</label>
          <textarea
            name="otherPartyInfo"
            value={formData.otherPartyInfo}
            onChange={handleChange}
            placeholder="예: 집주인은 세입자 과실이라며 비용 거부 중, 업자는 무상 AS 기간 지났다고 함"
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border h-20 resize-none text-base"
          />
        </div>

        <div className="relative group w-full">
            <button
              onClick={onSubmit}
              disabled={loading || !isFormValid}
              className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-colors ${
                loading || !isFormValid
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-blue-800'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  전문가 분석 중...
                </>
              ) : (
                <>
                  <Send className="-ml-1 mr-2 h-5 w-5" />
                  AI 전문가에게 분석 요청하기
                </>
              )}
            </button>

            {disabledMessage && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[90%] px-3 py-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                    {disabledMessage}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default InputForm;