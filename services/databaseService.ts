import { DisputeForm, AnalysisResult, ConsultationRecord } from "../types";

const DB_KEY = "suhoon_consultation_db_v1";

// 데이터베이스 서비스 (백그라운드 로직)
export const databaseService = {
  
  // Helper: 쿼타 초과 에러 확인 (브라우저별 호환성 처리)
  isQuotaExceeded(e: any): boolean {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (localStorage.length !== 0)
    );
  },

  // Helper: 오래된 기록 삭제 (공간 확보용)
  pruneOldRecords(records: ConsultationRecord[], countToRemove: number = 5): ConsultationRecord[] {
    // 타임스탬프 오름차순 정렬 (오래된 순)
    const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
    // 앞에서부터 삭제하고 남은 데이터 반환
    return sorted.slice(countToRemove);
  },

  // 상담 내역 저장
  saveRecord: async (formData: DisputeForm, result: AnalysisResult): Promise<void> => {
    try {
      // 실제 DB 저장을 시뮬레이션하기 위한 지연 (UX상 자연스러움을 위해)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 0. 저장소 가용성 사전 체크
      try {
        const testKey = "__storage_test__";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
      } catch (e) {
        throw new Error("브라우저 보안 설정(쿠키 차단/시크릿 모드)으로 인해 로컬 저장이 불가능합니다.");
      }

      // 1. 데이터 구성
      const newRecord: ConsultationRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        formData: { ...formData }, // 복사본 저장
        result: { ...result }
      };

      // 2. 기존 데이터 로드 및 유효성 검사
      let records: ConsultationRecord[] = [];
      try {
        const existingData = localStorage.getItem(DB_KEY);
        records = existingData ? JSON.parse(existingData) : [];
      } catch (parseError) {
        console.warn("Corrupted data found in localStorage. Resetting DB.");
        records = [];
      }
      
      records.push(newRecord);

      // 3. 저장 시도 (Quota 관리 포함)
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(records));
        console.log("Record saved to database:", newRecord.id);
      } catch (e: any) {
        if (databaseService.isQuotaExceeded(e)) {
          console.warn("Storage quota exceeded. Attempting to prune old records...");
          
          // 공간 확보를 위해 오래된 기록 20% 또는 최소 5개 삭제
          const removeCount = Math.max(5, Math.ceil(records.length * 0.2));
          records = databaseService.pruneOldRecords(records, removeCount);
          
          // 재시도
          try {
             localStorage.setItem(DB_KEY, JSON.stringify(records));
             console.log("Record saved after pruning.");
          } catch (retryError) {
             console.error("Pruning failed to free enough space.");
             throw new Error("저장 공간 부족으로 상담 내역을 저장할 수 없습니다.");
          }
        } else {
          throw e; // 다른 에러는 상위로 전파
        }
      }

    } catch (error: any) {
      console.error("Database save failed:", error);
      
      let userMessage = "기기 내 상담 내역 저장 실패";
      
      if (error.message.includes("저장 공간") || error.message.includes("브라우저")) {
        userMessage = error.message;
      } else if (error.name === 'SecurityError') {
        userMessage = "브라우저 보안 설정으로 인해 저장할 수 없습니다.";
      }

      // UI에서 캐치할 수 있도록 에러 throw
      throw new Error(userMessage);
    }
  },

  // 전체 기록 조회 (관리자용 등)
  getAllRecords: (): ConsultationRecord[] => {
    try {
        const existingData = localStorage.getItem(DB_KEY);
        return existingData ? JSON.parse(existingData) : [];
    } catch (error) {
        console.error("Failed to load records", error);
        return [];
    }
  },

  // 특정 기록 삭제
  deleteRecord: (id: string): void => {
    try {
        const existingData = localStorage.getItem(DB_KEY);
        if (!existingData) return;

        const records: ConsultationRecord[] = JSON.parse(existingData);
        const filtered = records.filter(r => r.id !== id);
        localStorage.setItem(DB_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error("Failed to delete record", error);
    }
  }
};