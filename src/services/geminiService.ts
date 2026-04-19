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
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `서버 오류가 발생했습니다 (${response.status})` };
      }
      throw new Error(errorData.error || `서버 오류가 발생했습니다 (${response.status})`);
    }

    return await response.json() as AnalysisReport;
  } catch (error) {
    console.error("Error generating sports analysis:", error);
    throw new Error(error instanceof Error ? error.message : "분석을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}
