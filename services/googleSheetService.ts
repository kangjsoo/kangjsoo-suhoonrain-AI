import { DisputeForm, AnalysisResult } from "../types";

// 수훈라인 상담 저장용 Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxYR4jWz5o18XUh-dmoTjbxwBkPvGAlOO2lb-pOf8MPmGuUxGRxGj7YwMS9lRH2qt8I/exec"; 

const TIMEOUT_MS = 15000; // 타임아웃 15초로 연장
const MAX_RETRIES = 2;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const saveToGoogleSheet = async (formData: DisputeForm, result: AnalysisResult): Promise<void> => {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("Google Sheet URL is not configured.");
    return;
  }

  // 1. 네트워크 연결 상태 확인
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error("인터넷 연결이 불안정하여 상담 내용이 서버에 저장되지 않았습니다.");
  }

  // Google Apps Script와의 호환성을 위해 JSON 대신 URLSearchParams(Form Data) 방식을 사용합니다.
  const params = new URLSearchParams();
  
  // 타임스탬프 생성 (한국 시간 기준)
  const now = new Date();
  const timestamp = now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  params.append("timestamp", timestamp);
  params.append("role", formData.role);
  params.append("issueType", formData.issueType);
  params.append("phone", formData.phone || "미입력");
  params.append("email", formData.email || "미입력");
  params.append("symptoms", formData.symptoms);
  params.append("history", formData.history);
  params.append("otherPartyInfo", formData.otherPartyInfo);
  params.append("coreIssue", result.coreIssue);
  params.append("recommendedScript", result.recommendedScript);
  params.append("isSuccess", result.isConsultationPossible ? "분석 성공" : "분석 실패");

  let lastError: any;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      if (attempt > 0) {
        // 지수 백오프 (Exponential Backoff): 1초, 2초 대기
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.log(`Google Sheet Retry: ${attempt + 1}, waiting ${delay}ms`);
        await wait(delay); 
      }

      // 'no-cors' 모드는 응답 상태 코드를 확인할 수 없지만, 네트워크 오류 시에는 예외가 발생합니다.
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log("구글 시트 전송 요청 완료");
      return; 

    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      
      const isAbort = error.name === 'AbortError';
      const errorMessage = isAbort ? 'Request timed out' : error.message;
      console.warn(`Google Sheet save attempt ${attempt + 1} failed: ${errorMessage}`);

      // 재시도 중 인터넷이 끊긴 경우 즉시 중단
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error("전송 중 네트워크 연결이 끊어졌습니다.");
      }
    }
  }

  console.error("All Google Sheet save attempts failed.");
  
  // 사용자에게 보여줄 친절한 에러 메시지 생성
  let userMessage = "상담 내용 서버 저장 실패 (네트워크 오류)";
  if (lastError?.name === 'AbortError') {
    userMessage = "서버 응답 시간이 초과되었습니다.";
  } else if (lastError?.message?.includes('Failed to fetch')) {
    userMessage = "네트워크 연결 상태를 확인해주세요.";
  }

  throw new Error(userMessage);
};