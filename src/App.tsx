import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Search, 
  Target, 
  TrendingUp, 
  Swords, 
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Loader2,
  CalendarDays,
  MapPin
} from 'lucide-react';
import { analyzeSportsMatch, AnalysisReport } from './services/geminiService';

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const result = await analyzeSportsMatch(query);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    if (level.toLowerCase().includes('low')) return 'bg-emerald-600 text-white';
    if (level.toLowerCase().includes('medium')) return 'bg-amber-600 text-white';
    return 'bg-red-600 text-white';
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <header className="mb-10 p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-800 to-[#0f172a] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <Swords className="w-6 h-6 text-blue-500" />
              AI 스포츠 전력분석 프로
            </h1>
            <p className="text-sm text-slate-400">
              데이터 사이언티스트 AI가 팀 전력, 변수, 배당률의 기댓값을 계산하여 최적의 예측을 도출합니다.
            </p>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="bg-blue-500 px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide">
              LIVE DATA ANALYSIS
            </span>
          </div>
        </header>

        {/* Search Input Section */}
        <form onSubmit={handleAnalyze} className="relative max-w-full mx-auto mb-10">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="분석하고 싶은 경기 대진 또는 리그 이름 (예: 레알 마드리드 vs 바르셀로나)"
              className="w-full pl-12 pr-32 py-4 bg-[#1a202c] border border-white/5 rounded-[20px] text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-xl"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-[#2d3748] disabled:text-slate-500 text-white font-bold text-sm rounded-2xl transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  분석중
                </>
              ) : (
                '분석 시작'
              )}
            </button>
          </div>
        </form>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 bg-red-500/10 border border-red-500/20 rounded-[20px] text-red-400 text-center flex flex-col items-center gap-3 mb-6"
            >
              <AlertTriangle className="w-6 h-6" />
              <p className="font-medium text-sm">{error}</p>
            </motion.div>
          )}

          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* [1] 경기 개요 - Wide Card */}
                <div className="col-span-1 md:col-span-4 bg-[#1a202c] border border-white/5 rounded-[20px] p-5 flex flex-col">
                  <div className="text-[12px] font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-sm"></div>
                    <Target className="w-3.5 h-3.5" />
                    경기 개요
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300 bg-[#0b0e14] px-4 py-2 rounded-xl">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      <span>{report.overview.datetime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300 bg-[#0b0e14] px-4 py-2 rounded-xl">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>{report.overview.location}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {report.overview.keyPoints}
                  </p>
                </div>

                {/* [2] 심층 전력 분석 - Large Card (2x2) */}
                <div className="col-span-1 md:col-span-2 md:row-span-2 bg-[#1a202c] border border-white/5 rounded-[20px] p-5 flex flex-col">
                  <div className="text-[12px] font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-sm"></div>
                    <TrendingUp className="w-3.5 h-3.5" />
                    심층 전력 및 지표 비교
                  </div>
                  <div className="space-y-5 flex-1 flex flex-col justify-center">
                    <div className="bg-[#0b0e14] p-4 rounded-xl">
                      <h3 className="text-xs font-bold text-blue-400 mb-2 uppercase">공격 및 수비 지표</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {report.analysis.offenseDefense}
                      </p>
                    </div>
                    <div className="bg-[#0b0e14] p-4 rounded-xl">
                      <h3 className="text-xs font-bold text-blue-400 mb-2 uppercase">핵심 선수 임팩트</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {report.analysis.keyPlayers}
                      </p>
                    </div>
                  </div>
                </div>

                {/* [3] 예측 결과 - Home/Draw/Away Probabilities (col 3-4, row 1) */}
                <div className="col-span-1 md:col-span-2 bg-[#1a202c] border border-white/5 rounded-[20px] p-5 flex flex-col">
                  <div className="text-[12px] font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-sm"></div>
                    <Dumbbell className="w-3.5 h-3.5" />
                    승률 예측
                  </div>
                  
                  <div className="flex items-center gap-4 mb-5">
                    <div>
                      <div className="text-4xl font-extrabold text-blue-500 leading-none">{report.prediction.homeWinProb}%</div>
                      <div className="text-xs text-slate-400 mt-1">홈팀 승리 확률</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center text-xs text-slate-400 gap-1 ml-4 border-l border-white/10 pl-4">
                      <div>무승부: <span className="font-bold text-slate-300">{report.prediction.drawProb}%</span></div>
                      <div>원정승: <span className="font-bold text-slate-300">{report.prediction.awayWinProb}%</span></div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-auto">
                     <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
                        <span>홈</span>
                        <span>무</span>
                        <span>원정</span>
                     </div>
                     <div className="h-2 w-full bg-[#2d3748] rounded-full overflow-hidden flex">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: report.prediction.homeWinProb + '%' }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-blue-500" 
                        />
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: report.prediction.drawProb + '%' }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-slate-500" 
                        />
                         <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: report.prediction.awayWinProb + '%' }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-rose-500" 
                        />
                     </div>
                  </div>
                </div>

                {/* [3-2] 언더/오버 및 핸디캡 - (col 3, row 2) */}
                <div className="col-span-1 bg-[#1a202c] border border-white/5 rounded-[20px] p-5 flex flex-col justify-between">
                  <div className="text-[12px] font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-sm"></div>
                    언더/오버 및 기타
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-[28px] font-extrabold text-amber-500 leading-none mb-1">{report.prediction.underOver}</div>
                      <div className="text-xs text-slate-400">기준점 돌파 예측</div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div>
                      <div className="text-sm font-bold text-slate-200 mb-1">{report.prediction.handicap}</div>
                      <div className="text-xs text-slate-400">핸디캡 적용 분석</div>
                    </div>
                  </div>
                </div>

                {/* [4] 베팅 가이드 - (col 4, row 2) */}
                <div className="col-span-1 bg-[#1a202c] border border-white/5 rounded-[20px] p-5 flex flex-col justify-between">
                  <div className="text-[12px] font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-sm"></div>
                    <Lightbulb className="w-3.5 h-3.5" />
                    리스크 평가
                  </div>
                  <div className="mb-4">
                    <div className="text-[28px] font-extrabold text-blue-500 leading-none mb-2 capitalize">
                       {report.bettingGuide.riskLevel}
                    </div>
                    <div className="text-xs text-slate-400">시장 대비 위험도 곡선</div>
                  </div>
                  <div className={`px-2 py-1 inline-block w-fit rounded-md text-[10px] font-bold uppercase tracking-wider ${getRiskColor(report.bettingGuide.riskLevel)}`}>
                    RISK LEVEL
                  </div>
                </div>

                {/* [4-2] 베팅 추천 세부 - Wide Card */}
                <div className="col-span-1 md:col-span-4 bg-[#1a202c] border border-white/5 rounded-[20px] p-5">
                   <div className="text-[12px] font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-sm"></div>
                    최종 베팅 가이드
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="bg-[#2d3748] rounded-xl p-4 flex-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold mr-2 ${getRiskColor(report.bettingGuide.riskLevel)}`}>
                        {report.bettingGuide.riskLevel}
                      </span>
                      <strong className="text-sm text-white">추천 베팅 전략</strong>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {report.bettingGuide.recommendation}
                      </p>
                    </div>
                    <div className="bg-[#2d3748] rounded-xl p-4 flex-1">
                      <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold mr-2 bg-slate-600 text-white">INFO</span>
                      <strong className="text-sm text-white">리스크 관리 및 고려사항</strong>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {report.bettingGuide.tips}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer Section */}
        <footer className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-[11px] text-slate-500 max-w-3xl mx-auto leading-relaxed">
            <ShieldAlert className="w-3 h-3 inline mr-1 mb-0.5" />
            본 시스템은 통계적 데이터 분석을 위한 정보 제공만을 목적으로 하며, 불법적인 도박을 권장하거나 조장하지 않습니다. 
            모든 분석 및 예측은 참고 자료일 뿐, 실제 경기 결과와 다를 수 있으며 투자 및 베팅에 대한 책임은 전적으로 본인에게 있습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}

