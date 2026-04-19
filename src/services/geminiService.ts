import { GoogleGenAI, Type } from "@google/genai";

// Ensure we have access to the Gemini API Key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined. The app will fail to fetch data.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface AnalysisReport {
  overview: {
    datetime: string;
    location: string;
    keyPoints: string;
  };
  analysis: {
    offenseDefense: string;
    keyPlayers: string;
  };
  prediction: {
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    underOver: string;
    handicap: string;
  };
  bettingGuide: {
    recommendation: string;
    riskLevel: "Low" | "Medium" | "High";
    tips: string;
  };
}

export async function analyzeSportsMatch(query: string): Promise<AnalysisReport> {
  const prompt = `
당신은 전 세계 축구, 농구, 야구 등 주요 스포츠 데이터를 수집하고 분석하여 승률을 예측하는 전문 분석 AI입니다.
학습된 데이터 사이언티스트 기반으로 아래에 주어진 '경기 대진' 또는 '리그명'에 대한 심층 분석을 자동 수행하십시오.

입력 데이터: "${query}"

[분석 프로세스]
1. 데이터 기반 전력 분석: 양 팀의 최근 5경기 성적, 상대 전적, 홈/원정 승률 데이터를 가상으로 시뮬레이션
2. 변수 데이터 적용: 부상자 명단, 결장 정보, 경기 당일 날씨, 팀의 동기부여 등
3. 배당률 가치 분석: 오즈메이커의 배당과 실제 확률을 비교하여 '기댓값(Value)' 도출

위 분석을 바탕으로, 요구된 JSON 스키마 형식에 맞춰 정확한 한국어로 답변하십시오.
어조는 전문가스럽고 데이터에 기반한 논리적인 문체를 사용하십시오.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.OBJECT,
              description: "경기 개요",
              properties: {
                datetime: { type: Type.STRING, description: "경기 일시 (최대한 실제와 가깝게 또는 가상)" },
                location: { type: Type.STRING, description: "경기 장소" },
                keyPoints: { type: Type.STRING, description: "핵심 관전 포인트 요약" },
              },
              required: ["datetime", "location", "keyPoints"],
            },
            analysis: {
              type: Type.OBJECT,
              description: "심층 전력 분석",
              properties: {
                offenseDefense: { type: Type.STRING, description: "공격/수비 지표 비교" },
                keyPlayers: { type: Type.STRING, description: "핵심 선수 임팩트 분석" },
              },
              required: ["offenseDefense", "keyPlayers"],
            },
            prediction: {
              type: Type.OBJECT,
              description: "예측 결과",
              properties: {
                homeWinProb: { type: Type.NUMBER, description: "홈팀 승률 (0~100)" },
                drawProb: { type: Type.NUMBER, description: "무승부 확률 (0~100) (농구, 야구 등 무승부가 드문 경우 0으로 처리)" },
                awayWinProb: { type: Type.NUMBER, description: "원정팀 승률 (0~100) (홈/무/원정 합산 100이 되도록)" },
                underOver: { type: Type.STRING, description: "언더/오버 (예: 2.5 기준 오버 예상)" },
                handicap: { type: Type.STRING, description: "핸디캡 예측 (예: 홈팀 -1.0 극복 가능성 높음)" },
              },
              required: ["homeWinProb", "drawProb", "awayWinProb", "underOver", "handicap"],
            },
            bettingGuide: {
              type: Type.OBJECT,
              description: "베팅 가이드",
              properties: {
                recommendation: { type: Type.STRING, description: "추천 베팅 조합" },
                riskLevel: { type: Type.STRING, description: "리스크 관리 등급 (Low, Medium, High 중 하나)" },
                tips: { type: Type.STRING, description: "리스크 관리 팁" },
              },
              required: ["recommendation", "riskLevel", "tips"],
            },
          },
          required: ["overview", "analysis", "prediction", "bettingGuide"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("AI returned an empty response.");
    }

    return JSON.parse(resultText) as AnalysisReport;
  } catch (error) {
    console.error("Error generating sports analysis:", error);
    throw new Error("분석을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}
