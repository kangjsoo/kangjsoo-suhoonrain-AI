
export enum UserRole {
  CONTRACTOR = '시공업자',
  LANDLORD = '임대인(집주인)',
  TENANT = '임차인(세입자)',
  CLIENT = '의뢰인(자가)'
}

export enum IssueType {
  LEAK = '누수',
  CLOG = '막힘/역류',
  ODOR = '악취',
  FROZEN = '동파',
  OTHER = '기타 시공 하자'
}

export interface DisputeForm {
  role: UserRole;
  issueType: IssueType;
  symptoms: string;
  history: string; // 시공 시점, 거주 기간 등
  otherPartyInfo: string; // 상대방과의 관계 및 현재 주장
  // 연락처 정보 추가
  phone: string;
  email: string;
}

export interface AnalysisResult {
  // 유효성 검증 필드
  isConsultationPossible: boolean;
  refusalReason: string;

  coreIssue: string;
  technicalEstimation: string;
  responsibilityJudgment: string;
  legalBasis: string;
  supremeCourtPrecedent: string; // 대법원 판례 및 유사 사례
  recommendedScript: string;
  suhoonSolution: string; // 수훈라인 세일즈 솔루션
}

// 데이터베이스 저장용 레코드 정의
export interface ConsultationRecord {
  id: string;
  timestamp: number;
  formData: DisputeForm;
  result: AnalysisResult;
}

export const INITIAL_FORM: DisputeForm = {
  role: UserRole.TENANT,
  issueType: IssueType.CLOG,
  symptoms: '',
  history: '',
  otherPartyInfo: '',
  phone: '',
  email: ''
};
