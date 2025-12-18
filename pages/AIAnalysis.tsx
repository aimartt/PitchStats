
import React, { useState } from 'react';
import { DataItem, AnalysisResponse } from '../types';
import { analyzeDataset } from '../services/gemini';
import { Sparkles, BrainCircuit, Lightbulb, AlertTriangle, RefreshCw, TrendingUp, ClipboardList, Trophy } from 'lucide-react';

interface AIAnalysisProps {
  data: DataItem[];
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ data }) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!data || data.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeDataset(data);
      setAnalysis(result);
    } catch (err) {
      setError("无法生成分析报告，请检查网络或 API 设置。");
    } finally {
      setLoading(false);
    }
  };

  // Environment variables like process.env.API_KEY are assumed pre-configured and accessible.
  // The app should not inform the user about key status or ask for keys.

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4 animate-fade-in">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <ClipboardList className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">数据不足</h3>
        <p className="text-slate-500 max-w-md">
          请先在“比赛记录”页面添加比赛数据，AI 教练才能为您提供战术分析。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            AI 战术分析师
          </h2>
          <p className="text-slate-500 mt-1">基于比赛数据的智能洞察与建议</p>
        </div>
        
        <button
          onClick={runAnalysis}
          disabled={loading}
          className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-all ${
            loading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'hover:brightness-110 shadow-lg active:scale-95'
          }`}
          style={loading ? {} : { backgroundColor: 'var(--primary)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              正在分析战术...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              {analysis ? '更新分析报告' : '生成球队报告'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {analysis && !loading && (
        <div className="grid gap-6 animate-slide-up">
          {/* Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, var(--primary), var(--primary-hover))' }}>
              <h3 className="text-lg font-bold text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                赛季综述
              </h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 leading-relaxed text-lg">
                {analysis.summary}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Trends Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                关键趋势
              </h3>
              <ul className="space-y-3">
                {analysis.keyTrends.map((trend, idx) => (
                  <li key={idx} className="flex items-start bg-blue-50 p-3 rounded-lg text-blue-800 text-sm">
                    <span className="bg-blue-200 text-blue-700 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold mr-3 mt-0.5 shrink-0">
                      {idx + 1}
                    </span>
                    {trend}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
                教练建议
              </h3>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start bg-amber-50 p-3 rounded-lg text-amber-900 text-sm">
                     <span className="bg-amber-200 text-amber-700 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold mr-3 mt-0.5 shrink-0">
                      {idx + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {!analysis && !loading && (
        <div className="text-center py-20 bg-slate-100 rounded-xl border border-dashed border-slate-300">
           <BrainCircuit className="w-16 h-16 mx-auto text-slate-300 mb-4" />
           <p className="text-slate-500 font-medium">点击上方按钮，让 AI 助理教练分析比赛数据</p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
