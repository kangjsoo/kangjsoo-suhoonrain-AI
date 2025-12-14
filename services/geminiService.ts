import { GoogleGenAI } from "@google/genai";
import { DisputeForm, AnalysisResult } from "../types";
import { RESPONSE_SCHEMA, SYSTEM_INSTRUCTION, createAnalysisPrompt } from "./promptManager";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 이 서비스 파일은 오직 API 통신과 응답 파싱(Infrastructure)만 담당합니다.
// 구체적인 프롬프트 내용이나 비즈니스 로직은 promptManager.ts로 분리되었습니다.
export const analyzeDispute = async (formData: DisputeForm): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash";
  
  try {
    const prompt = createAnalysisPrompt(formData);

    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("AI 응답이 비어있습니다.");
    }

    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};