
import React, { useMemo, useState } from 'react';
import { DataItem, DashboardProps } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Activity, Calendar, UserCog, Shield } from 'lucide-react';

const RESULT_COLORS = {
  Win: '#10B981', // Emerald 500
  Draw: '#F59E0B', // Amber 500
  Loss: '#EF4444'  // Red 500
};

interface CoachStat {
  name: string;
  games: number;
  leagueGames: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  winRate: number;
  lastMatchDate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, seasons }) => {
  // Default to the first season (ranked #1) if available, otherwise 'all'
  const [selectedSeason, setSelectedSeason] = useState<string>(seasons.length > 0 ? seasons[0] : 'all');

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
    
    // League Stats (Previously Formal)
    let leagueWins = 0;
    let leagueDraws = 0;
    let leagueLosses = 0;
    let leagueGoalsFor = 0;
    let leagueGoalsAgainst = 0;
    let leagueMatchesPlayed = 0;

    const history: any[] = [];
    
    // Coach Analysis
    const coachMap: Record<string, CoachStat> = {};

    normalizedData.forEach((match, index) => {
      const gf = Number(match['ourscore'] || match['goalsfor'] || match['score'] || 0);
      const ga = Number(match['opponentscore'] || match['goalsagainst'] || 0);
      const opponent = match['opponent'] || match['team'] || `Match ${index + 1}`;
      const date = match['date'] || index;
      const coachName = match['coach'];
      const matchType = match['originalMatchType'] || match['matchtype'];
      // Logic Update: League stats now strictly count '联赛' type
      const isLeague = matchType === '联赛';
      
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

      // League Stats
      if (isLeague) {
        leagueMatchesPlayed++;
        leagueGoalsFor += gf;
        leagueGoalsAgainst += ga;
        if (result === 'Win') leagueWins++;
        else if (result === 'Draw') leagueDraws++;
        else if (result === 'Loss') leagueLosses++;
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
                leagueGames: 0,
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
         if (isLeague) c.leagueGames++;
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
    const winRate = matchesPlayed ? ((wins / matchesPlayed) * 100).toFixed(0) : "0";
    const undefeatedRate = matchesPlayed ? ((wins + draws) / matchesPlayed * 100).toFixed(0) : "0";
    const goalDiff = goalsFor - goalsAgainst;

    // League Derived Stats
    const leagueWinRate = leagueMatchesPlayed ? ((leagueWins / leagueMatchesPlayed) * 100).toFixed(0) : "0";
    const leagueUndefeatedRate = leagueMatchesPlayed ? ((leagueWins + leagueDraws) / leagueMatchesPlayed * 100).toFixed(0) : "0";
    const leagueGoalDiff = leagueGoalsFor - leagueGoalsAgainst;

    // Per Game Averages
    const avgGoalsFor = matchesPlayed ? (goalsFor / matchesPlayed).toFixed(1) : "0.0";
    const avgGoalsAgainst = matchesPlayed ? (goalsAgainst / matchesPlayed).toFixed(1) : "0.0";
    const avgLeagueGoalsFor = leagueMatchesPlayed ? (leagueGoalsFor / leagueMatchesPlayed).toFixed(1) : "0.0";
    const avgLeagueGoalsAgainst = leagueMatchesPlayed ? (leagueGoalsAgainst / leagueMatchesPlayed).toFixed(1) : "0.0";

    const resultData = [
      { name: '胜', value: wins, color: RESULT_COLORS.Win },
      { name: '平', value: draws, color: RESULT_COLORS.Draw },
      { name: '负', value: losses, color: RESULT_COLORS.Loss },
    ].filter(d => d.value > 0);

    const leagueResultData = [
      { name: '胜', value: leagueWins, color: RESULT_COLORS.Win },
      { name: '平', value: leagueDraws, color: RESULT_COLORS.Draw },
      { name: '负', value: leagueLosses, color: RESULT_COLORS.Loss },
    ].filter(d => d.value > 0);

    return {
      wins, draws, losses, goalsFor, goalsAgainst, matchesPlayed, winRate, undefeatedRate, goalDiff, history, resultData, coachStats,
      leagueMatchesPlayed, leagueWins, leagueDraws, leagueLosses, leagueGoalsFor, leagueGoalsAgainst, leagueWinRate, leagueUndefeatedRate, leagueGoalDiff, leagueResultData,
      avgGoalsFor, avgGoalsAgainst, avgLeagueGoalsFor, avgLeagueGoalsAgainst
    };
  }, [data, selectedSeason]);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
        <Activity className="w-16 h-16 mb-4 opacity-50" style={{ color: 'var(--primary)' }} />
        <h3 className="text-xl font-semibold">暂无比赛数据</h3>
        <p>请前往“比赛记录”页面添加第一场比赛。</p>
      </div>
    );
  }

  if (!stats || stats.matchesPlayed === 0) {
     return (
        <div className="space-y-6 animate-fade-in">
           <div className="flex justify-end">
              <div className="relative w-full md:w-48">
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
              <Activity className="w-12 h-12 mb-2 opacity-20" />
              <p>该赛季暂无正式比赛数据</p>
           </div>
        </div>
     );
  }

  const { 
    wins, draws, losses, goalsFor, goalsAgainst, matchesPlayed, winRate, undefeatedRate, goalDiff, history, resultData, coachStats,
    leagueMatchesPlayed, leagueWins, leagueDraws, leagueLosses, leagueGoalsFor, leagueGoalsAgainst, leagueWinRate, leagueUndefeatedRate, leagueGoalDiff, leagueResultData,
    avgGoalsFor, avgGoalsAgainst, avgLeagueGoalsFor, avgLeagueGoalsAgainst
  } = stats;

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20">
      
      {/* Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
         <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">球队数据看板</h2>
         </div>
         <div className="relative w-full md:w-48">
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

      {/* Stats Cards - Optimized Grid for Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        
        {/* Card 1: Matches */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
           {/* Top: All */}
           <div className="p-3 md:p-4 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-1">
                 <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">总场次</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-end">
                 <span className="text-2xl md:text-3xl font-black text-slate-800 leading-none mb-1 md:mb-0">{matchesPlayed}</span>
                 <div className="md:text-right">
                    <span className="text-[10px] text-slate-400 hidden md:block mb-0.5 uppercase tracking-wide">胜-平-负</span>
                    <span className="text-xs md:text-sm font-bold text-slate-600 font-mono block">
                       <span className="text-emerald-500">{wins}</span>-
                       <span className="text-amber-500">{draws}</span>-
                       <span className="text-red-500">{losses}</span>
                    </span>
                 </div>
              </div>
           </div>
           
           <div className="h-px bg-slate-100 mx-3"></div>

           {/* Bottom: League */}
           <div className="p-3 md:p-4 flex-1 flex flex-col justify-center bg-slate-50/50">
              <div className="flex justify-between items-start mb-1">
                 <span className="text-[10px] md:text-xs font-bold text-indigo-500 uppercase tracking-wider">联赛</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-end">
                 <span className="text-2xl md:text-3xl font-black text-slate-800 leading-none mb-1 md:mb-0">{leagueMatchesPlayed}</span>
                 <div className="md:text-right">
                    <span className="text-[10px] text-slate-400 hidden md:block mb-0.5 uppercase tracking-wide">胜-平-负</span>
                    <span className="text-xs md:text-sm font-bold text-slate-600 font-mono block">
                       <span className="text-emerald-500">{leagueWins}</span>-
                       <span className="text-amber-500">{leagueDraws}</span>-
                       <span className="text-red-500">{leagueLosses}</span>
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Card 2: Win Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
           {/* Top: All */}
           <div className="p-3 md:p-4 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-1">
                 <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">总胜率</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-end">
                 <span className="text-2xl md:text-3xl font-black text-blue-600 leading-none mb-1 md:mb-0">{winRate}<span className="text-sm md:text-lg text-blue-400 ml-0.5">%</span></span>
                 <div className="md:text-right">
                    <span className="text-[10px] text-slate-400 hidden md:block mb-0.5 uppercase tracking-wide">不败率</span>
                    <span className="text-xs md:text-sm font-bold text-slate-600 font-mono block">{undefeatedRate}%</span>
                 </div>
              </div>
           </div>

           <div className="h-px bg-slate-100 mx-3"></div>

           {/* Bottom: League */}
           <div className="p-3 md:p-4 flex-1 flex flex-col justify-center bg-slate-50/50">
              <div className="flex justify-between items-start mb-1">
                 <span className="text-[10px] md:text-xs font-bold text-indigo-500 uppercase tracking-wider">联赛胜率</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-end">
                 <span className="text-2xl md:text-3xl font-black text-blue-600 leading-none mb-1 md:mb-0">{leagueWinRate}<span className="text-sm md:text-lg text-blue-400 ml-0.5">%</span></span>
                 <div className="md:text-right">
                    <span className="text-[10px] text-slate-400 hidden md:block mb-0.5 uppercase tracking-wide">不败率</span>
                    <span className="text-xs md:text-sm font-bold text-slate-600 font-mono block">{leagueUndefeatedRate}%</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Card 3: Offense */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
           {/* Top: All */}
           <div className="p-3 md:p-4 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-1">
                 <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">总进球</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-end">
                 <span className="text-2xl md:text-3xl font-black text-emerald-600 leading-none mb-1 md:mb-0">{goalsFor}</span>
                 <div className="md:text-right">
                    <span className="text-[10px] text-slate-400 hidden md:block mb-0.5 uppercase tracking-wide">场均进球</span>
                    <span className="text-xs md:text-sm font-bold text-slate-600 font-mono block">{avgGoalsFor}</span>
                 </div>
              </div>
           </div>

           <div className="h-px bg-slate-100 mx-3"></div>

           {/* Bottom: League */}
           <div className="p-3 md:p-4 flex-1 flex flex-col justify-center bg-slate-50/50">
              <div className="flex justify-between items-start mb-1">
                 <span className="text-[10px] md:text-xs font-bold text-indigo-500 uppercase tracking-wider">联赛进球</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-end">
                 <span className="text-2xl md:text-3xl font-black text-emerald-600 leading-none mb-1 md:mb-0">{leagueGoalsFor}</span>
                 <div className="md:text-right">
                    <span className="text-[10px] text-slate-400 hidden md:block mb-0.5 uppercase tracking-wide">场均进球</span>
                    <span className="text-xs md:text-sm font-bold text-slate-600 font-mono block">{avgLeagueGoalsFor}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Card 4: Defense */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
           {/* Top: All */}
           <div className="p-3 md:p-4 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-1">
                 <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">总净胜</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-end">
                 <span className={`text-2xl md:text-3xl font-black leading-none mb-1 md:mb-0 ${goalDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {goalDiff > 0 ? '+' : ''}{goalDiff}
                 </span>
                 <div className="md:text-right">
                    <span className="text-[10px] text-slate-400 hidden md:block mb-0.5 uppercase tracking-wide">场均失球</span>
                    <span className="text-xs md:text-sm font-bold text-rose-500 font-mono flex items-center md:justify-end">
                       <Shield className="w-3 h-3 mr-1" />
                       {avgGoalsAgainst}
                    </span>
                 </div>
              </div>
           </div>

           <div className="h-px bg-slate-100 mx-3"></div>

           {/* Bottom: League */}
           <div className="p-3 md:p-4 flex-1 flex flex-col justify-center bg-slate-50/50">
              <div className="flex justify-between items-start mb-1">
                 <span className="text-[10px] md:text-xs font-bold text-indigo-500 uppercase tracking-wider">联赛净胜</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-end">
                 <span className={`text-2xl md:text-3xl font-black leading-none mb-1 md:mb-0 ${leagueGoalDiff >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                    {leagueGoalDiff > 0 ? '+' : ''}{leagueGoalDiff}
                 </span>
                 <div className="md:text-right">
                    <span className="text-[10px] text-slate-400 hidden md:block mb-0.5 uppercase tracking-wide">场均失球</span>
                    <span className="text-xs md:text-sm font-bold text-rose-500 font-mono flex items-center md:justify-end">
                       <Shield className="w-3 h-3 mr-1" />
                       {avgLeagueGoalsAgainst}
                    </span>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Goals History */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2" style={{ color: 'var(--primary)' }} />
            进球趋势分析
          </h3>
          <div className="h-60 md:h-80 w-full">
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
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[320px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">比赛结果分布</h3>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
             {/* Chart 1: All Matches */}
             <div className="flex flex-col items-center justify-center">
                {/* Label above chart */}
                <div className="mb-2">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">全部</span>
                </div>
                
                <div className="relative h-40 w-full">
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                       <p className="text-2xl font-black text-slate-800">
                          {matchesPlayed}<span className="text-xs font-bold text-slate-400 ml-0.5">场</span>
                       </p>
                    </div>
                    
                    <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                      <PieChart>
                        <Pie
                          data={resultData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
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
             </div>

             {/* Chart 2: League Matches */}
             <div className="flex flex-col items-center justify-center sm:border-l border-slate-100 pt-4 sm:pt-0 border-t sm:border-t-0">
                {/* Label above chart */}
                <div className="mb-2">
                   <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">联赛</span>
                </div>

                <div className="relative h-40 w-full">
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                       <p className="text-2xl font-black text-slate-800">
                          {leagueMatchesPlayed}<span className="text-xs font-bold text-slate-400 ml-0.5">场</span>
                       </p>
                    </div>

                    <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                      <PieChart>
                        <Pie
                          data={leagueResultData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {leagueResultData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Shared Legend */}
          <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500 border-t border-slate-50 pt-4">
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{backgroundColor: RESULT_COLORS.Win}}></div> 胜</div>
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{backgroundColor: RESULT_COLORS.Draw}}></div> 平</div>
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{backgroundColor: RESULT_COLORS.Loss}}></div> 负</div>
          </div>
        </div>
      </div>

      {/* Coach Stats Section */}
      {coachStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center">
                <UserCog className="w-5 h-5 mr-2 text-indigo-500" />
                <h3 className="text-base md:text-lg font-bold text-slate-800">执教表现</h3>
              </div>
              <div className="text-[10px] md:text-xs text-slate-400 font-medium">
                 按最近执教时间排序
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm text-left text-slate-600">
                 <thead className="text-[10px] md:text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                       <th className="px-3 md:px-6 py-3 font-bold whitespace-nowrap sticky left-0 bg-slate-50 z-10">主教练</th>
                       <th className="px-2 md:px-4 py-3 text-center whitespace-nowrap">最近执教</th>
                       <th className="px-2 md:px-4 py-3 text-center whitespace-nowrap">执教/联赛</th>
                       <th className="px-2 md:px-4 py-3 text-center whitespace-nowrap">战绩 (胜/平/负)</th>
                       <th className="px-2 md:px-4 py-3 text-center whitespace-nowrap">胜率</th>
                       <th className="px-2 md:px-4 py-3 text-center whitespace-nowrap">进/失球</th>
                       <th className="px-2 md:px-4 py-3 text-center whitespace-nowrap">场均净胜</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {coachStats.map((coach, idx) => (
                       <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 md:px-6 py-3 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100 md:border-none shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] md:shadow-none">{coach.name}</td>
                          <td className="px-2 md:px-4 py-3 text-center text-xs text-slate-500 font-mono whitespace-nowrap">
                             {coach.lastMatchDate}
                          </td>
                          <td className="px-2 md:px-4 py-3 text-center font-medium">
                             {coach.games} <span className="text-slate-300">/</span> <span className="text-indigo-600">{coach.leagueGames}</span>
                          </td>
                          <td className="px-2 md:px-4 py-3 text-center whitespace-nowrap">
                             <span className="text-emerald-600 font-bold">{coach.wins}</span> - <span className="text-amber-500 font-bold">{coach.draws}</span> - <span className="text-red-500 font-bold">{coach.losses}</span>
                          </td>
                          <td className="px-2 md:px-4 py-3 text-center">
                             <div className="flex items-center justify-center gap-2">
                                <span className="font-bold text-slate-800">{coach.winRate.toFixed(0)}%</span>
                                <div className="w-12 md:w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                   <div className="h-full bg-emerald-500" style={{ width: `${coach.winRate}%` }}></div>
                                </div>
                             </div>
                          </td>
                          <td className="px-2 md:px-4 py-3 text-center whitespace-nowrap">
                             {coach.goalsFor} : {coach.goalsAgainst}
                          </td>
                          <td className="px-2 md:px-4 py-3 text-center font-mono">
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
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 bg-slate-50/50">
           <h3 className="text-base md:text-lg font-bold text-slate-800">近期比赛记录</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm text-left text-slate-600">
            <thead className="text-[10px] md:text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 md:px-6 py-3 font-bold whitespace-nowrap">日期</th>
                <th className="px-2 md:px-4 py-3 text-center whitespace-nowrap">类型</th>
                <th className="px-3 md:px-6 py-3 whitespace-nowrap">对手</th>
                <th className="px-2 md:px-6 py-3 text-center whitespace-nowrap">结果</th>
                <th className="px-3 md:px-6 py-3 text-center whitespace-nowrap">比分</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Reverse history to show newest first */}
              {history.slice().reverse().slice(0, 10).map((match, idx) => (
                <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-3 md:px-6 py-3 font-medium text-slate-900 whitespace-nowrap">{match.date}</td>
                  <td className="px-2 md:px-4 py-3 text-center">
                     <span className={`text-[10px] md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded border font-medium ${
                        match.type === '联赛' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        match.type === '友谊赛' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                        match.type === '杯赛' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                     }`}>
                        {match.type || '友谊赛'}
                     </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 text-slate-900 font-bold whitespace-nowrap max-w-[120px] truncate">{match.name}</td>
                  <td className="px-2 md:px-6 py-3 text-center">
                    <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-xs font-bold ${
                      match.result === 'Win' ? 'bg-emerald-100 text-emerald-700' :
                      match.result === 'Loss' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {match.result === 'Win' ? '胜' : match.result === 'Loss' ? '负' : '平'}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 text-center font-mono font-bold text-slate-700 whitespace-nowrap">
                    {match.进球} : {match.失球}
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
