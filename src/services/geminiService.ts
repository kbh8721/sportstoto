import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT" as any,
          properties: {
            overview: {
              type: "OBJECT" as any,
              description: "경기 개요",
              properties: {
                datetime: { type: "STRING" as any, description: "경기 일시 (최대한 실제와 가깝게 또는 가상)" },
                location: { type: "STRING" as any, description: "경기 장소" },
                keyPoints: { type: "STRING" as any, description: "핵심 관전 포인트 요약" },
              },
              required: ["datetime", "location", "keyPoints"],
            },
            analysis: {
              type: "OBJECT" as any,
              description: "심층 전력 분석",
              properties: {
                offenseDefense: { type: "STRING" as any, description: "공격/수비 지표 비교" },
                keyPlayers: { type: "STRING" as any, description: "핵심 선수 임팩트 분석" },
              },
              required: ["offenseDefense", "keyPlayers"],
            },
            prediction: {
              type: "OBJECT" as any,
              description: "예측 결과",
              properties: {
                homeWinProb: { type: "NUMBER" as any, description: "홈팀 승률 (0~100)" },
                drawProb: { type: "NUMBER" as any, description: "무승부 확률 (0~100) (농구, 야구 등 무승부가 드문 경우 0으로 처리)" },
                awayWinProb: { type: "NUMBER" as any, description: "원정팀 승률 (0~100) (홈/무/원정 합산 100이 되도록)" },
                underOver: { type: "STRING" as any, description: "언더/오버 (예: 2.5 기준 오버 예상)" },
                handicap: { type: "STRING" as any, description: "핸디캡 예측 (예: 홈팀 -1.0 극복 가능성 높음)" },
              },
              required: ["homeWinProb", "drawProb", "awayWinProb", "underOver", "handicap"],
            },
            bettingGuide: {
              type: "OBJECT" as any,
              description: "베팅 가이드",
              properties: {
                recommendation: { type: "STRING" as any, description: "추천 베팅 조합" },
                riskLevel: { type: "STRING" as any, description: "리스크 관리 등급 (Low, Medium, High 중 하나)" },
                tips: { type: "STRING" as any, description: "리스크 관리 팁" },
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
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
      throw new Error("올바르지 않은 API 키가 입력되어 발생한 문제입니다. 화면 우측 상단의 [톱니바퀴(Settings) 아이콘]을 눌러 API 키 입력칸에 적힌 내용을 전부 지워주세요. (입력칸을 비우면 시스템에서 자동으로 제공하는 무료 모델이 작동하며 정상적으로 이용하실 수 있습니다.)");
    }
    throw new Error(msg || "분석을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}
