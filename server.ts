import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Setup Gemini
  // Use lazy initialization or wait until the request to fail if the API key isn't provided
  let ai: GoogleGenAI | null = null;
  const getAiClient = () => {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required.");
      }
      ai = new GoogleGenAI({ apiKey });
    }
    return ai;
  };

  // API Routes FIRST
  app.post("/api/analyze", async (req, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const client = getAiClient();
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

      // We use raw string literals instead of the Type enum to avoid breaking 
      // Node's native type stripping which doesn't support TypeScript enums.
      const response = await client.models.generateContent({
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

      const parsed = JSON.parse(resultText);
      res.json(parsed);

    } catch (error: any) {
      console.error("Error analyzing sports match:", error);
      res.status(500).json({ error: error.message || "분석을 생성하는 중 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Provide a fallback for SPA routing
    // Express 4 expects '*', in Express 5 it would be '*all'
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
