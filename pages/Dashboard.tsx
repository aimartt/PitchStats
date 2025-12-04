
import React, { useMemo, useState } from 'react';
import { DataItem, DashboardProps } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Trophy, ShieldAlert, Target, Activity, Flag, Filter, Calendar, UserCog, PieChart as PieChartIcon } from 'lucide-react';

const RESULT_COLORS = {
  Win: '#10B981', // Emerald 500
  Draw: '#F59E0B', // Amber 500
  Loss: '#EF4444'  // Red 500
};

interface CoachStat {
  name: string;
  games: number;
  formalGames: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  winRate: number;
  lastMatchDate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, seasons }) => {
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Filter Data: Exclude only '队内赛' matches, everything else counts.
    let filteredData = data.filter(item => item.matchType !== '队内赛');

    if (selectedSeason !== 'all') {
      filteredData = filteredData.filter(item => item.season === selectedSeason);
    }

    // Normalize keys
    const normalizedData = filteredData.map(item => {
      const newItem: any = {};
      Object.keys(item).forEach(key => {
        newItem[key.toLowerCase()] = item[key];
      });
      // Keep coach specifically in case casing matters, but lowercased key helps generic access
      newItem.coach = item.coach; 
      // Keep matchType with correct casing for display if needed, though lowercased key exists
      newItem.originalMatchType = item.matchType;
      return newItem;
    });

    // Sort by date ascending for charts
    normalizedData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    
    // Formal Stats
    let formalWins = 0;
    let formalDraws = 0;
    let formalLosses = 0;
    let formalGoalsFor = 0;
    let formalGoalsAgainst = 0;
    let formalMatchesPlayed = 0;

    const history: any[] = [];
    
    // Coach Analysis
    const coachMap: Record<string, CoachStat> = {};

    normalizedData.forEach((match, index) => {
      const gf = Number(match['ourscore'] || match['goalsfor'] || match['score'] || 0);
      const ga = Number(match['opponentscore'] || match['goalsagainst'] || 0);
      const opponent = match['opponent'] || match['team'] || `Match ${index + 1}`;
      const date = match['date'] || index;
      const coachName = match['coach'];
      const isFormal = match['countforstats'] === true;
      const matchType = match['originalMatchType'] || match['matchtype'];
      
      let result = match['result'];
      if (!result) {
        if (gf > ga) result = 'Win';
        else if (gf < ga) result = 'Loss';
        else result = 'Draw';
      }

      // Total Stats
      if (result === 'Win') wins++;
      else if (result === 'Draw') draws++;
      else if (result === 'Loss') losses++;

      goalsFor += gf;
      goalsAgainst += ga;

      // Formal Stats
      if (isFormal) {
        formalMatchesPlayed++;
        formalGoalsFor += gf;
        formalGoalsAgainst += ga;
        if (result === 'Win') formalWins++;
        else if (result === 'Draw') formalDraws++;
        else if (result === 'Loss') formalLosses++;
      }

      history.push({
        name: opponent,
        date: date,
        type: matchType,
        进球: gf,
        失球: ga,
        result
      });

      // Coach Stats Calculation
      if (coachName) {
         if (!coachMap[coachName]) {
            coachMap[coachName] = { 
                name: coachName, 
                games: 0, 
                formalGames: 0,
                wins: 0, 
                draws: 0, 
                losses: 0, 
                goalsFor: 0, 
                goalsAgainst: 0, 
                winRate: 0, 
                lastMatchDate: date 
            };
         }
         const c = coachMap[coachName];
         c.games++;
         if (isFormal) c.formalGames++;
         c.goalsFor += gf;
         c.goalsAgainst += ga;
         c.lastMatchDate = date; // Update to latest match date
         if (result === 'Win') c.wins++;
         else if (result === 'Draw') c.draws++;
         else if (result === 'Loss') c.losses++;
      }
    });

    // Finalize Coach Stats
    const coachStats = Object.values(coachMap).map(c => ({
       ...c,
       winRate: c.games > 0 ? (c.wins / c.games) * 100 : 0
    })).sort((a, b) => {
        // Sort by Last Match Date desc (Newest first)
        const dateA = new Date(a.lastMatchDate).getTime() || 0;
        const dateB = new Date(b.lastMatchDate).getTime() || 0;
        if (dateA !== dateB) return dateB - dateA;
        
        // Then by Games desc
        return b.games - a.games;
    });

    const matchesPlayed = normalizedData.length;
    const winRate = matchesPlayed ? ((wins / matchesPlayed) * 100).toFixed(1) : 0;
    const goalDiff = goalsFor - goalsAgainst;

    // Formal Derived Stats
    const formalWinRate = formalMatchesPlayed ? ((formalWins / formalMatchesPlayed) * 100).toFixed(1) : 0;
    const formalGoalDiff = formalGoalsFor - formalGoalsAgainst;

    // Per Game Averages
    const avgGoalsFor = matchesPlayed ? (goalsFor / matchesPlayed).toFixed(2) : "0.00";
    const avgGoalsAgainst = matchesPlayed ? (goalsAgainst / matchesPlayed).toFixed(2) : "0.00";
    const avgFormalGoalsFor = formalMatchesPlayed ? (formalGoalsFor / formalMatchesPlayed).toFixed(2) : "0.00";
    const avgFormalGoalsAgainst = formalMatchesPlayed ? (formalGoalsAgainst / formalMatchesPlayed).toFixed(2) : "0.00";

    const resultData = [
      { name: '胜', value: wins, color: RESULT_COLORS.Win },
      { name: '平', value: draws, color: RESULT_COLORS.Draw },
      { name: '负', value: losses, color: RESULT_COLORS.Loss },
    ].filter(d => d.value > 0);

    const formalResultData = [
      { name: '胜', value: formalWins, color: RESULT_COLORS.Win },
      { name: '平', value: formalDraws, color: RESULT_COLORS.Draw },
      { name: '负', value: formalLosses, color: RESULT_COLORS.Loss },
    ].filter(d => d.value > 0);

    return {
      wins, draws, losses, goalsFor, goalsAgainst, matchesPlayed, winRate, goalDiff, history, resultData, coachStats,
      formalMatchesPlayed, formalWins, formalDraws, formalLosses, formalGoalsFor, formalGoalsAgainst, formalWinRate, formalGoalDiff, formalResultData,
      avgGoalsFor, avgGoalsAgainst, avgFormalGoalsFor, avgFormalGoalsAgainst
    };
  }, [data, selectedSeason]);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
        <Trophy className="w-16 h-16 mb-4 opacity-50" style={{ color: 'var(--primary)' }} />
        <h3 className="text-xl font-semibold">暂无比赛数据</h3>
        <p>请前往“比赛记录”页面添加第一场比赛。</p>
      </div>
    );
  }

  // If filtered result is empty (e.g. selected a season with only internal matches)
  if (!stats || stats.matchesPlayed === 0) {
     return (
        <div className="space-y-6 animate-fade-in">
           <div className="flex justify-end">
              <div className="relative w-48">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm appearance-none outline-none focus:ring-2 shadow-sm cursor-pointer"
                  style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                >
                   <option value="all">所有赛季统计</option>
                   {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
           </div>
           <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
              <Filter className="w-12 h-12 mb-2 opacity-20" />
              <p>该赛季暂无正式比赛数据</p>
           </div>
        </div>
     );
  }

  const { 
    wins, draws, losses, goalsFor, goalsAgainst, matchesPlayed, winRate, goalDiff, history, resultData, coachStats,
    formalMatchesPlayed, formalWins, formalDraws, formalLosses, formalGoalsFor, formalGoalsAgainst, formalWinRate, formalGoalDiff, formalResultData,
    avgGoalsFor, avgGoalsAgainst, avgFormalGoalsFor, avgFormalGoalsAgainst
  } = stats;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Filter Header */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">球队数据</h2>
         </div>
         <div className="relative w-48">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm appearance-none outline-none focus:ring-2 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
              style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
            >
               <option value="all">所有赛季统计</option>
               {seasons.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Matches */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">全部场次</p>
            <Flag className="w-5 h-5 opacity-40" style={{ color: 'var(--primary)' }} />
          </div>
          <div className="flex items-baseline mb-2">
             <h3 className="text-2xl font-bold text-slate-900 mr-2">{matchesPlayed}</h3>
             <span className="text-xs text-slate-400">场</span>
          </div>
          <div className="text-[10px] text-slate-400 mb-3">
            {wins}胜 - {draws}平 - {losses}负
          </div>
          
          <div className="pt-3 border-t border-slate-100">
             <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">正式比赛</p>
             </div>
             <div className="flex items-baseline mb-1">
                <h3 className="text-lg font-bold text-slate-800 mr-1">{formalMatchesPlayed}</h3>
                <span className="text-[10px] text-slate-400">场</span>
             </div>
             <div className="text-[10px] text-slate-400">
                {formalWins}胜 - {formalDraws}平 - {formalLosses}负
             </div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">总胜率</p>
            <Trophy className="w-5 h-5 text-blue-200" />
          </div>
          <div className="flex items-baseline mb-2">
             <h3 className="text-2xl font-bold text-slate-900 mr-2">{winRate}%</h3>
          </div>
          <div className="text-[10px] text-slate-400 mb-3">
             综合表现
          </div>
          
          <div className="pt-3 border-t border-slate-100">
             <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">正式胜率</p>
             </div>
             <div className="flex items-baseline mb-1">
                <h3 className="text-lg font-bold text-blue-600 mr-1">{formalWinRate}%</h3>
             </div>
             <div className="text-[10px] text-slate-400">
                不含友谊/队内
             </div>
          </div>
        </div>

        {/* Goals For */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">总进球</p>
            <Target className="w-5 h-5 text-indigo-200" />
          </div>
          <div className="flex items-baseline mb-2">
             <h3 className="text-2xl font-bold text-slate-900 mr-2">{goalsFor}</h3>
             <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">场均 {avgGoalsFor}</span>
          </div>
          <div className="text-[10px] text-slate-400 mb-3">
             进攻火力
          </div>
          
          <div className="pt-3 border-t border-slate-100">
             <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">正式进球</p>
             </div>
             <div className="flex items-baseline mb-1">
                <h3 className="text-lg font-bold text-indigo-600 mr-2">{formalGoalsFor}</h3>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">场均 {avgFormalGoalsFor}</span>
             </div>
             <div className="text-[10px] text-slate-400">
                关键比赛数据
             </div>
          </div>
        </div>

        {/* Goal Diff / Defense */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">净胜球</p>
            <ShieldAlert className="w-5 h-5 text-rose-200" />
          </div>
          <div className="flex items-baseline mb-2">
             <h3 className={`text-2xl font-bold mr-2 ${goalDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {goalDiff > 0 ? '+' : ''}{goalDiff}
             </h3>
             <span className="text-[10px] text-slate-400">总失球: {goalsAgainst}</span>
          </div>
          <div className="text-[10px] text-slate-400 mb-3">
             场均失球: {avgGoalsAgainst}
          </div>
          
          <div className="pt-3 border-t border-slate-100">
             <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">正式净胜</p>
             </div>
             <div className="flex items-baseline mb-1">
                <h3 className={`text-lg font-bold mr-2 ${formalGoalDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {formalGoalDiff > 0 ? '+' : ''}{formalGoalDiff}
                </h3>
                <span className="text-[10px] text-slate-400">失球: {formalGoalsAgainst}</span>
             </div>
             <div className="text-[10px] text-slate-400">
                场均失球: {avgFormalGoalsAgainst}
             </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Goals History */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2" style={{ color: 'var(--primary)' }} />
            进球趋势分析
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="进球" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="失球" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts - Results */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[320px]">
          <h3 className="text-lg font-bold text-slate-800 mb-2">比赛结果分布</h3>
          
          <div className="flex-1 grid grid-cols-2 gap-2 items-center">
             {/* Chart 1: All Matches */}
             <div className="relative h-40 w-full flex flex-col items-center justify-center">
                <div className="absolute top-0 w-full text-center z-10">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">全部</span>
                </div>
                {/* Center Text - Moved before ResponsiveContainer for correct stacking */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-2 z-0">
                   <p className="text-sm font-black text-slate-800">{matchesPlayed}场</p>
                </div>
                <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                  <PieChart>
                    <Pie
                      data={resultData}
                      cx="50%"
                      cy="55%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {resultData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>

             {/* Chart 2: Formal Matches */}
             <div className="relative h-40 w-full flex flex-col items-center justify-center border-l border-slate-100">
                <div className="absolute top-0 w-full text-center z-10">
                   <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">正式</span>
                </div>
                {/* Center Text - Moved before ResponsiveContainer for correct stacking */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-2 z-0">
                   <p className="text-sm font-black text-slate-800">{formalMatchesPlayed}场</p>
                </div>
                <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                  <PieChart>
                    <Pie
                      data={formalResultData}
                      cx="50%"
                      cy="55%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {formalResultData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Shared Legend */}
          <div className="mt-2 flex justify-center gap-4 text-xs text-slate-500 border-t border-slate-50 pt-3">
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{backgroundColor: RESULT_COLORS.Win}}></div> 胜</div>
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{backgroundColor: RESULT_COLORS.Draw}}></div> 平</div>
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{backgroundColor: RESULT_COLORS.Loss}}></div> 负</div>
          </div>
        </div>
      </div>

      {/* Coach Stats Section */}
      {coachStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center">
                <UserCog className="w-5 h-5 mr-2 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-800">执教表现</h3>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                 按最近执教时间排序
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                       <th className="px-6 py-3 font-bold">主教练</th>
                       <th className="px-4 py-3 text-center">最近执教</th>
                       <th className="px-4 py-3 text-center">执教场次</th>
                       <th className="px-4 py-3 text-center">正式比赛</th>
                       <th className="px-4 py-3 text-center">战绩 (胜/平/负)</th>
                       <th className="px-4 py-3 text-center">胜率</th>
                       <th className="px-4 py-3 text-center">进/失球</th>
                       <th className="px-4 py-3 text-center">场均净胜</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {coachStats.map((coach, idx) => (
                       <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{coach.name}</td>
                          <td className="px-4 py-4 text-center text-xs text-slate-500 font-mono">
                             {coach.lastMatchDate}
                          </td>
                          <td className="px-4 py-4 text-center font-medium">{coach.games}</td>
                          <td className="px-4 py-4 text-center font-medium">{coach.formalGames}</td>
                          <td className="px-4 py-4 text-center">
                             <span className="text-emerald-600 font-bold">{coach.wins}</span> - <span className="text-amber-500 font-bold">{coach.draws}</span> - <span className="text-red-500 font-bold">{coach.losses}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                             <div className="flex items-center justify-center gap-2">
                                <span className="font-bold text-slate-800">{coach.winRate.toFixed(0)}%</span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-emerald-500" style={{ width: `${coach.winRate}%` }}></div>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                             {coach.goalsFor} : {coach.goalsAgainst}
                          </td>
                          <td className="px-4 py-4 text-center font-mono">
                             {((coach.goalsFor - coach.goalsAgainst) / coach.games).toFixed(1)}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Recent Matches Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
           <h3 className="text-lg font-bold text-slate-800">近期比赛记录</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">日期</th>
                <th className="px-4 py-3">类型</th>
                <th className="px-6 py-3">对手</th>
                <th className="px-6 py-3 text-center">结果</th>
                <th className="px-6 py-3 text-center">比分</th>
              </tr>
            </thead>
            <tbody>
              {/* Reverse history to show newest first */}
              {history.slice().reverse().slice(0, 10).map((match, idx) => (
                <tr key={idx} className="bg-white border-b hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{match.date}</td>
                  <td className="px-4 py-4">
                     <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                        match.type === '联赛' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        match.type === '友谊赛' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                        match.type === '杯赛' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                     }`}>
                        {match.type || '友谊赛'}
                     </span>
                  </td>
                  <td className="px-6 py-4">{match.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      match.result === 'Win' ? 'bg-emerald-100 text-emerald-700' :
                      match.result === 'Loss' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {match.result === 'Win' ? '胜' : match.result === 'Loss' ? '负' : '平'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-800">
                    {match.进球} - {match.失球}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
