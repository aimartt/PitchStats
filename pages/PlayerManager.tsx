import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Shirt, Plus, Trash2, Search, Pencil, X, Check, Trophy, Zap, 
  Camera, ArrowUp, ArrowDown, Shield, Filter, HeartCrack, Cake, 
  Eye, ArrowLeft, Calendar, Info, Star, Activity, Target, Award, 
  ChevronRight, Crown, ChevronDown 
} from 'lucide-react';
import { PlayerManagerProps, PlayerProfile, MatchRecord } from '../types';

// Helper interface for calculated stats
interface PlayerStats {
  name: string;
  number?: string;
  avatar?: string;
  birthday?: string;
  age?: number;
  
  // Total Stats
  goals: number;
  assists: number;
  starts: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  conceded: number;
  matchesPlayed: number;
  matchesCounted: number; // 计入统计的场次
  matchesAsGK: number;
  matchesAsGKCounted: number; // 计入统计的守门员场次
  
  // League Stats (matchType === '联赛')
  leagueGoals: number;
  leagueAssists: number;
  leagueStarts: number;
  leagueOwnGoals: number;
  leagueYellowCards: number;
  leagueRedCards: number;
  leagueConceded: number;
  leagueMatchesPlayed: number;
  leagueMatchesCounted: number; // 计入统计的联赛场次
  leagueMatchesAsGK: number;
  leagueMatchesAsGKCounted: number; // 计入统计的联赛守门员场次

  // Averages (Format to 2 decimal places)
  goalsAvg: string;
  leagueGoalsAvg: string;
  assistsAvg: string;
  leagueAssistsAvg: string;
  concededAvg: string;
  leagueConcededAvg: string;

  disciplineScore: number;
}

// Formatting helper
const formatAvg = (val: number, matches: number) => {
   if (matches <= 0) return '-';
   const avg = val / matches;
   return avg.toFixed(2);
};

// Age calculation helper
const calculateAge = (birthday?: string): number | undefined => {
  if (!birthday) return undefined;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// --- Shared Helper Components ---

const AppearanceCell = ({ val, total, color }: { val: number, total: number, color: string }) => {
  const rate = total > 0 ? (val / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-1 w-full max-w-[56px] mx-auto">
      <div className="flex justify-between items-baseline px-0.5">
        <span className="font-black text-slate-800 text-[12px]">{val}</span>
        <span className="text-slate-400 text-[9px] font-bold">{Math.round(rate)}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
};

const StatWithAvgCell = ({ val, avg, color = "text-slate-800" }: { val: number, avg: string, color?: string }) => {
  if (val === 0) return <span className="text-slate-200">-</span>;
  return (
    <div className="flex flex-col leading-tight items-center">
      <span className={`font-bold text-sm ${color}`}>{val}</span>
      <span className="text-[10px] text-slate-400 font-medium tracking-tight">({avg})</span>
    </div>
  );
};

const StarterCell = ({ val, matches, color = "text-amber-600" }: { val: number, matches: number, color?: string }) => {
   if (val === 0) return <span className="text-slate-200">-</span>;
   const rate = matches > 0 ? Math.round((val / matches) * 100) : 0;
   return (
      <div className="flex flex-col leading-tight items-center">
         <span className={`font-bold text-sm ${color}`}>{val}</span>
         <span className="text-[10px] text-slate-400 font-medium">{rate}%</span>
      </div>
   );
};

const CardIcon = ({ type, count }: { type: 'yellow' | 'red', count: number }) => {
  if (count <= 0) return null;
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-3.5 rounded-[1px] border border-black/10 shadow-sm ${type === 'yellow' ? 'bg-[#FACC15]' : 'bg-[#EF4444]'}`} />
      <span className="font-bold text-xs text-slate-700">{count}</span>
    </div>
  );
};

// --- Player Detail View ---
const PlayerDetailView: React.FC<{ 
  player: PlayerStats; 
  matches: MatchRecord[]; 
  seasons: string[]; 
  onBack: () => void;
  onViewMatch?: (match: MatchRecord) => void; 
}> = ({ player, matches, seasons, onBack, onViewMatch }) => {
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  const allTimeAggregate = useMemo(() => {
    let played = 0;
    let playedCounted = 0;
    let leaguePlayed = 0;
    let goals = 0;
    let assists = 0;
    let redCards = 0;
    let yellowCards = 0;

    matches.forEach(m => {
       const isCounted = m.countForStats !== false;
       const isLeague = m.matchType === '联赛';
       if (m.squad?.includes(player.name)) {
          played++;
          if (isCounted) playedCounted++;
          if (isLeague) leaguePlayed++;
       }
       m.goalsDetails?.forEach(g => {
          if (g.scorer === player.name) goals++;
          if (g.assist === player.name) assists++;
       });
       if (m.redCards?.includes(player.name)) redCards++;
       if (m.yellowCards?.includes(player.name)) yellowCards++;
    });

    return {
      played,
      leaguePlayed,
      goals,
      assists,
      redCards,
      yellowCards,
      disciplineScore: (redCards * 3) + yellowCards,
      goalsAvg: formatAvg(goals, playedCounted),
      assistsAvg: formatAvg(assists, playedCounted)
    };
  }, [matches, player.name]);

  const seasonTotals = useMemo(() => {
     const totals: Record<string, { total: number, league: number }> = {};
     matches.forEach(m => {
        if (!totals[m.season]) totals[m.season] = { total: 0, league: 0 };
        totals[m.season].total++;
        if (m.matchType === '联赛') totals[m.season].league++;
     });
     return totals;
  }, [matches]);

  const seasonStats = useMemo(() => {
    const stats: Record<string, any> = {};
    matches.forEach(m => {
       const inSquad = m.squad?.includes(player.name);
       if (!inSquad) return;
       if (!stats[m.season]) {
          stats[m.season] = { 
            season: m.season, 
            matchesPlayed: 0, leagueMatchesPlayed: 0,
            matchesCounted: 0, leagueMatchesCounted: 0,
            starts: 0, leagueStarts: 0,
            goals: 0, leagueGoals: 0,
            assists: 0, leagueAssists: 0,
            yellowCards: 0, leagueYellowCards: 0,
            redCards: 0, leagueRedCards: 0,
            conceded: 0, leagueConceded: 0,
            matchesAsGK: 0, matchesAsGKCounted: 0,
            leagueMatchesAsGK: 0, leagueMatchesAsGKCounted: 0,
            ownGoals: 0, leagueOwnGoals: 0
          };
       }
       const s = stats[m.season];
       const isLeague = m.matchType === '联赛';
       const isCounted = m.countForStats !== false;

       s.matchesPlayed++;
       if (isCounted) s.matchesCounted++;
       if (isLeague) {
          s.leagueMatchesPlayed++;
          if (isCounted) s.leagueMatchesCounted++;
       }
       
       if (m.starters?.includes(player.name)) { s.starts++; if (isLeague) s.leagueStarts++; }
       m.goalsDetails?.forEach(goal => {
          if (goal.scorer === player.name) { s.goals++; if (isLeague) s.leagueGoals++; }
          if (goal.assist === player.name) { s.assists++; if (isLeague) s.leagueAssists++; }
       });
       if (m.ownGoals?.includes(player.name)) { s.ownGoals++; if (isLeague) s.leagueOwnGoals++; }
       if (m.yellowCards?.includes(player.name)) { s.yellowCards++; if (isLeague) s.leagueYellowCards++; }
       if (m.redCards?.includes(player.name)) { s.redCards++; if (isLeague) s.leagueRedCards++; }
       
       const specificGkStat = m.goalkeeperStats?.find(gk => gk.player === player.name);
       const isInLegacyGkList = m.goalkeepers?.includes(player.name);
       if (specificGkStat) {
          s.matchesAsGK++;
          if (isCounted) s.matchesAsGKCounted++;
          s.conceded += specificGkStat.conceded;
          if (isLeague) { 
            s.leagueMatchesAsGK++; 
            if (isCounted) s.leagueMatchesAsGKCounted++;
            s.leagueConceded += specificGkStat.conceded; 
          }
       } else if (isInLegacyGkList) {
          const matchConceded = m.opponentScore || 0;
          s.matchesAsGK++;
          if (isCounted) s.matchesAsGKCounted++;
          s.conceded += matchConceded;
          if (isLeague) { 
            s.leagueMatchesAsGK++; 
            if (isCounted) s.leagueMatchesAsGKCounted++;
            s.leagueConceded += matchConceded; 
          }
       }
    });
    return Object.values(stats).sort((a, b) => seasons.indexOf(a.season) - seasons.indexOf(b.season));
  }, [matches, player.name, seasons]);

  const getSeasonMatchHistory = (seasonName: string) => {
    return matches
      .filter(m => m.season === seasonName && m.squad?.includes(player.name))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const toggleSeason = (seasonName: string) => {
    setExpandedSeason(expandedSeason === seasonName ? null : seasonName);
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl mx-auto pb-16">
      {/* 顶部个人信息卡片 */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="h-56 bg-slate-900 relative">
           <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
           <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <span className="text-[15rem] font-black leading-none text-white italic tracking-tighter select-none">{player.number || 'PS'}</span>
           </div>
           <button onClick={onBack} className="absolute top-8 left-8 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-white backdrop-blur-md border border-white/20 shadow-xl group">
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div className="absolute -bottom-20 left-12 flex items-end gap-10">
              <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl ring-4 ring-slate-900">
                 <div className="w-full h-full rounded-[2.1rem] bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-50 font-black text-slate-300 text-6xl">
                    {player.avatar ? <img src={player.avatar} className="w-full h-full object-cover" /> : player.number || '#'}
                 </div>
              </div>
              <div className="pb-28"> 
                 <div className="flex items-center gap-5">
                    <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-2xl">{player.name}</h1>
                    {player.number && (
                      <div className="relative">
                         <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-40"></div>
                         <span className="relative bg-emerald-500 text-white px-5 py-1.5 rounded-2xl text-2xl font-black shadow-2xl">#{player.number}</span>
                      </div>
                    )}
                 </div>
                 <div className="flex items-center gap-4 mt-4">
                    <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-slate-100 font-bold text-sm border border-white/10">
                       <Cake className="w-4 h-4 text-emerald-400" /> {player.birthday || '未设生日'} {player.age ? `(${player.age}岁)` : ''}
                    </span>
                 </div>
              </div>
           </div>
        </div>
        <div className="h-28"></div>
      </div>

      {/* 生涯汇总数据 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-1">
         <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:border-indigo-400 transition-all hover:shadow-lg group">
            <div className="flex items-center justify-between mb-4">
               <span className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Activity className="w-7 h-7" /></span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appearances</span>
            </div>
            <div className="space-y-1">
               <h4 className="text-xs font-bold text-slate-400 mb-1">生涯出场</h4>
               <p className="text-4xl font-black text-slate-800">{allTimeAggregate.played} <span className="text-sm font-bold text-slate-400 ml-1">场</span></p>
               <p className="text-xs text-slate-500 font-bold">联赛出场: <span className="text-indigo-600">{allTimeAggregate.leaguePlayed}</span> 场</p>
            </div>
         </div>
         <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:border-emerald-400 transition-all hover:shadow-lg group">
            <div className="flex items-center justify-between mb-4">
               <span className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Target className="w-7 h-7" /></span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
            </div>
            <div className="space-y-1">
               <h4 className="text-xs font-bold text-slate-400 mb-1">进球火力</h4>
               <p className="text-4xl font-black text-slate-800">{allTimeAggregate.goals} <span className="text-sm font-bold text-slate-400 ml-1">球</span></p>
               <p className="text-xs text-slate-500 font-bold">场均进球: <span className="text-emerald-600">{allTimeAggregate.goalsAvg}</span></p>
            </div>
         </div>
         <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-400 transition-all hover:shadow-lg group">
            <div className="flex items-center justify-between mb-4">
               <span className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Award className="w-7 h-7" /></span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Playmaking</span>
            </div>
            <div className="space-y-1">
               <h4 className="text-xs font-bold text-slate-400 mb-1">组织贡献</h4>
               <p className="text-4xl font-black text-slate-800">{allTimeAggregate.assists} <span className="text-sm font-bold text-slate-400 ml-1">助</span></p>
               <p className="text-xs text-slate-500 font-bold">场均助攻: <span className="text-blue-600">{allTimeAggregate.assistsAvg}</span></p>
            </div>
         </div>
         <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:border-rose-400 transition-all hover:shadow-lg group">
            <div className="flex items-center justify-between mb-4">
               <span className="p-3 rounded-2xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors"><Star className="w-7 h-7" /></span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fairplay</span>
            </div>
            <div className="space-y-1">
               <h4 className="text-xs font-bold text-slate-400 mb-1">纪律表现</h4>
               <p className="text-4xl font-black text-slate-800">{allTimeAggregate.disciplineScore} <span className="text-sm font-bold text-slate-400 ml-1">罚分</span></p>
               <p className="text-xs text-slate-500 font-bold">红牌 {allTimeAggregate.redCards} / 黄牌 {allTimeAggregate.yellowCards}</p>
            </div>
         </div>
      </div>

      {/* 赛季表现明细列表 */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
         <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm"><Calendar className="w-7 h-7 text-slate-400" /></div>
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">各赛季明细</h3>
                  <p className="text-xs text-slate-400 mt-0.5">场均数据基于该赛季“计入统计”的场次计算</p>
               </div>
            </div>
            <div className="text-xs font-black text-slate-400 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
               生涯历程: {seasonStats.length} 个赛季
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
               <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr className="border-b border-slate-100">
                     <th rowSpan={2} className="pl-10 pr-4 py-5 sticky left-0 bg-slate-50 z-30 font-black text-slate-900 text-xs">赛季信息</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-indigo-50/30">参与活动 (总)</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-amber-50/30">首发率</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-emerald-50/30 text-emerald-700">进球 (场均)</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-blue-50/30 text-blue-700">助攻 (场均)</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-slate-100/50 text-slate-700">失球 (场均)</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100">红黄牌</th>
                     <th colSpan={2} className="pr-10 pl-4 py-3 text-center border-l border-slate-100 bg-rose-50/30 text-rose-700">乌龙球</th>
                  </tr>
                  <tr className="bg-white/50 font-black">
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center text-emerald-600">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center text-blue-600">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="pr-10 pl-2 py-3 text-center text-rose-600">联赛</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {seasonStats.map((s, index) => {
                     const isExpanded = expandedSeason === s.season;
                     const isEven = index % 2 !== 0; // 用于斑马纹
                     const totals = seasonTotals[s.season] || { total: 1, league: 1 };
                     const seasonMatches = getSeasonMatchHistory(s.season);

                     return (
                        <React.Fragment key={s.season}>
                           <tr 
                             onClick={() => toggleSeason(s.season)}
                             className={`group cursor-pointer transition-all duration-300 ${isExpanded ? 'bg-indigo-50/30' : isEven ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}
                           >
                              <td className={`pl-10 pr-4 py-6 sticky left-0 z-20 border-r border-slate-100 font-black text-base flex items-center gap-3 transition-colors ${isExpanded ? 'bg-indigo-50/50 text-slate-900 shadow-sm' : isEven ? 'bg-slate-50 text-slate-900' : 'bg-white group-hover:bg-slate-50 text-slate-900'}`}>
                                 {isExpanded && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: 'var(--primary)' }}></div>}
                                 <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'text-slate-300'}`} style={isExpanded ? { color: 'var(--primary)' } : {}} />
                                 {s.season}
                              </td>
                              
                              <td className="px-2 py-6 border-l border-slate-100 bg-indigo-50/10 text-slate-800">
                                 <AppearanceCell val={s.matchesPlayed} total={totals.total} color="bg-[#10B981]" />
                              </td>
                              <td className="px-2 py-6 bg-indigo-50/10 text-slate-800">
                                 <AppearanceCell val={s.leagueMatchesPlayed} total={totals.league} color="bg-[#3B82F6]" />
                              </td>
                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-amber-50/10 text-slate-800">
                                 <StarterCell val={s.starts} matches={s.matchesPlayed} />
                              </td>
                              <td className="px-2 py-6 text-center bg-amber-50/10 text-slate-800">
                                 <StarterCell val={s.leagueStarts} matches={s.leagueMatchesPlayed} color="text-amber-500" />
                              </td>
                              
                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-emerald-50/10">
                                 <StatWithAvgCell val={s.goals} avg={formatAvg(s.goals, s.matchesCounted)} color="text-slate-800" />
                              </td>
                              <td className="px-2 py-6 text-center bg-emerald-50/10">
                                 <StatWithAvgCell val={s.leagueGoals} avg={formatAvg(s.leagueGoals, s.leagueMatchesCounted)} color="text-emerald-600" />
                              </td>
                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-blue-50/10">
                                 <StatWithAvgCell val={s.assists} avg={formatAvg(s.assists, s.matchesCounted)} color="text-slate-800" />
                              </td>
                              <td className="px-2 py-6 text-center bg-blue-50/10">
                                 <StatWithAvgCell val={s.leagueAssists} avg={formatAvg(s.leagueAssists, s.leagueMatchesCounted)} color="text-blue-600" />
                              </td>

                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-slate-100/30">
                                 {s.matchesAsGK > 0 ? <StatWithAvgCell val={s.conceded} avg={formatAvg(s.conceded, s.matchesAsGKCounted)} color="text-slate-500" /> : <span className="text-slate-200">-</span>}
                              </td>
                              <td className="px-2 py-6 text-center bg-slate-100/30">
                                 {s.leagueMatchesAsGK > 0 ? <StatWithAvgCell val={s.leagueConceded} avg={formatAvg(s.leagueConceded, s.leagueMatchesAsGKCounted)} color="text-slate-400" /> : <span className="text-slate-200">-</span>}
                              </td>
                              
                              <td className="px-2 py-6 text-center border-l border-slate-100 text-slate-800">
                                 <div className="flex justify-center gap-1.5">
                                    <CardIcon type="yellow" count={s.yellowCards} />
                                    <CardIcon type="red" count={s.redCards} />
                                    {!(s.yellowCards || s.redCards) && <span className="text-slate-200">-</span>}
                                 </div>
                              </td>
                              <td className="px-2 py-6 text-center text-slate-800">
                                 <div className="flex justify-center gap-1.5">
                                    <CardIcon type="yellow" count={s.leagueYellowCards} />
                                    <CardIcon type="red" count={s.leagueRedCards} />
                                    {!(s.leagueYellowCards || s.leagueRedCards) && <span className="text-slate-200">-</span>}
                                 </div>
                              </td>

                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-rose-50/10">
                                 {s.ownGoals > 0 ? <span className="font-bold text-slate-700">{s.ownGoals}</span> : <span className="text-slate-200">-</span>}
                              </td>
                              <td className="pr-10 pl-2 py-6 text-center bg-rose-50/10">
                                 {s.leagueOwnGoals > 0 ? <span className="font-bold text-rose-600">{s.leagueOwnGoals}</span> : <span className="text-slate-200">-</span>}
                              </td>
                           </tr>

                           {isExpanded && (
                             <tr>
                                <td colSpan={15} className="p-0 bg-slate-50">
                                   <div className="p-6 space-y-4 animate-slide-up border-b border-slate-200 shadow-inner">
                                      <div className="flex items-center gap-2 mb-2">
                                         <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">{s.season} 赛季详细赛果</h4>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                         {seasonMatches.map(match => {
                                            const isWin = match.result === 'Win';
                                            const isLoss = match.result === 'Loss';
                                            
                                            const matchGoals = match.goalsDetails?.filter(g => g.scorer === player.name).length || 0;
                                            const matchAssists = match.goalsDetails?.filter(g => g.assist === player.name).length || 0;
                                            const matchOwnGoals = match.ownGoals?.filter(name => name === player.name).length || 0;
                                            const hasYellow = match.yellowCards?.includes(player.name);
                                            const hasRed = match.redCards?.includes(player.name);
                                            const gkStat = match.goalkeeperStats?.find(g => g.player === player.name);

                                            return (
                                               <div 
                                                  key={match.id} 
                                                  onClick={() => onViewMatch && onViewMatch(match)}
                                                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer group/match"
                                               >
                                                  <div className="flex flex-col gap-1 min-w-0">
                                                     <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                                        <span>{match.date}</span>
                                                        <span className={`px-1.5 py-0.5 rounded ${match.matchType === '联赛' ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-500'}`}>
                                                           {match.matchType}
                                                           {match.round && ` · 第${match.round}轮`}
                                                        </span>
                                                        {!match.countForStats && <span className="px-1 py-0.5 rounded bg-rose-50 text-rose-400 text-[8px]">未统</span>}
                                                     </div>
                                                     <div className="font-black text-slate-800 truncate text-sm group-hover/match:text-indigo-600 transition-colors">vs {match.opponent}</div>
                                                     <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs font-mono font-black ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-amber-500'}`}>
                                                           {match.ourScore}:{match.opponentScore}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-1.5 rounded ${isWin ? 'bg-emerald-50 text-emerald-600' : isLoss ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                           {isWin ? '胜' : isLoss ? '负' : '平'}
                                                        </span>
                                                     </div>
                                                  </div>
                                                  
                                                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-4 border-l border-slate-100 min-w-[70px]">
                                                     <div className="flex flex-wrap justify-end gap-1.5">
                                                        {matchGoals > 0 && <span className="text-[10px] font-black text-emerald-600" title="进球">⚽ x{matchGoals}</span>}
                                                        {matchAssists > 0 && <span className="text-[10px] font-black text-blue-600" title="助攻">👟 x{matchAssists}</span>}
                                                        {matchOwnGoals > 0 && <span className="text-[10px] font-black text-rose-600" title="乌龙球">💀 x{matchOwnGoals}</span>}
                                                        {gkStat && <span className="text-[10px] font-black text-slate-400" title="失球">🧤 -{gkStat.conceded}</span>}
                                                     </div>
                                                     <div className="flex gap-0.5">
                                                        {hasYellow && <div className="w-1.5 h-2.5 bg-amber-400 rounded-sm" title="黄牌"></div>}
                                                        {hasRed && <div className="w-1.5 h-2.5 bg-rose-500 rounded-sm" title="红牌"></div>}
                                                     </div>
                                                  </div>
                                               </div>
                                            );
                                         })}
                                      </div>
                                   </div>
                                </td>
                             </tr>
                           )}
                        </React.Fragment>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

// --- Player Honor Card Component ---
const PlayerHonorCard = ({ title, stat, player, icon: Icon, colorClass, onPlayerClick }: { title: string, stat: string | number, player?: PlayerStats, icon: any, colorClass: string, onPlayerClick: (p: PlayerStats) => void }) => {
   return (
      <div 
        className="bg-white rounded-[1.5rem] p-4 border border-slate-100 shadow-sm flex items-center relative overflow-hidden group hover:shadow-md hover:border-slate-200 transition-all cursor-pointer select-none"
        onClick={() => player && onPlayerClick(player)}
      >
         <div className={`w-14 h-14 rounded-full ${colorClass} bg-opacity-20 flex items-center justify-center shrink-0 border border-white shadow-inner overflow-hidden z-10`}>
            {player?.avatar ? (
              <img src={player.avatar} className="w-full h-full object-cover shadow-sm" alt={player.name}/>
            ) : (
              <span className={`text-xl font-black ${colorClass.replace('bg-', 'text-')}`}>
                 {player?.name.charAt(0) || '?'}
              </span>
            )}
         </div>
         <div className="ml-4 flex flex-col z-10 text-left min-w-0">
            <span className={`text-xs font-bold ${colorClass.replace('bg-', 'text-')}`}>{title}</span>
            <h4 className="text-lg font-black text-slate-800 leading-tight mt-0.5 truncate pr-2">
               {player?.name || '暂无'}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
               <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  {stat}
               </span>
            </div>
         </div>
         <div className="absolute -right-4 -bottom-4 opacity-[0.04] text-slate-900 transform rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-500">
            <Icon className="w-24 h-24" />
         </div>
      </div>
   );
};

// --- Honor Section Container ---
const HonorSection: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
   <div className="space-y-3 bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100">
      <div className="flex items-center gap-2 pl-2">
         <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
         <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="space-y-3">
         {children}
      </div>
   </div>
);

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, matches, seasons, onAddPlayer, onRemovePlayer, onEditPlayer, onViewMatch, currentUserRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [viewingPlayer, setViewingPlayer] = useState<PlayerStats | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'default', direction: 'desc' });
  
  // Create / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null);
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formBirthday, setFormBirthday] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isReadOnly = currentUserRole === 'player';

  useEffect(() => {
     if (!selectedSeason && seasons.length > 0) setSelectedSeason(seasons[0]);
  }, [seasons, selectedSeason]);

  const seasonFilteredMatches = useMemo(() => {
      if (!selectedSeason || selectedSeason === 'all') return matches;
      return matches.filter(m => m.season === selectedSeason);
  }, [matches, selectedSeason]);

  const totalMatchesCount = seasonFilteredMatches.length;
  const totalLeagueMatchesCount = seasonFilteredMatches.filter(m => m.matchType === '联赛').length;
  // 计入统计的总场次数（用于看板参考）
  const totalCountedMatches = seasonFilteredMatches.filter(m => m.countForStats !== false).length;

  const playerStats = useMemo(() => {
    const statsMap: Record<string, PlayerStats> = {};
    players.forEach(p => {
      statsMap[p.name] = { 
        name: p.name, number: p.number, avatar: p.avatar, birthday: p.birthday, age: calculateAge(p.birthday),
        goals: 0, assists: 0, starts: 0, ownGoals: 0, yellowCards: 0, redCards: 0, conceded: 0, 
        matchesPlayed: 0, matchesCounted: 0, 
        matchesAsGK: 0, matchesAsGKCounted: 0,
        leagueGoals: 0, leagueAssists: 0, leagueStarts: 0, leagueOwnGoals: 0, leagueYellowCards: 0, leagueRedCards: 0, leagueConceded: 0, 
        leagueMatchesPlayed: 0, leagueMatchesCounted: 0, 
        leagueMatchesAsGK: 0, leagueMatchesAsGKCounted: 0,
        goalsAvg: '-', leagueGoalsAvg: '-', assistsAvg: '-', leagueAssistsAvg: '-', concededAvg: '-', leagueConcededAvg: '-', disciplineScore: 0
      };
    });

    seasonFilteredMatches.forEach(m => {
      const isLeague = m.matchType === '联赛';
      const isCounted = m.countForStats !== false;
      
      m.squad?.forEach(p => { 
        if (statsMap[p]) { 
            statsMap[p].matchesPlayed++; 
            if (isCounted) statsMap[p].matchesCounted++;
            if (isLeague) {
                statsMap[p].leagueMatchesPlayed++;
                if (isCounted) statsMap[p].leagueMatchesCounted++;
            }
        } 
      });

      m.starters?.forEach(p => { if (statsMap[p]) { statsMap[p].starts++; if (isLeague) statsMap[p].leagueStarts++; } });
      m.goalsDetails?.forEach(g => {
        if (statsMap[g.scorer]) { statsMap[g.scorer].goals++; if (isLeague) statsMap[g.scorer].leagueGoals++; }
        if (g.assist && statsMap[g.assist]) { statsMap[g.assist].assists++; if (isLeague) statsMap[g.assist].leagueAssists++; }
      });
      m.yellowCards?.forEach(p => { if (statsMap[p]) { statsMap[p].yellowCards++; if (isLeague) statsMap[p].leagueYellowCards++; } });
      m.redCards?.forEach(p => { if (statsMap[p]) { statsMap[p].redCards++; if (isLeague) statsMap[p].leagueRedCards++; } });
      m.ownGoals?.forEach(p => { if (statsMap[p]) { statsMap[p].ownGoals++; if (isLeague) statsMap[p].leagueOwnGoals++; } });
      players.forEach(p => {
         const specificGkStat = m.goalkeeperStats?.find(gk => gk.player === p.name);
         const isInLegacyGkList = m.goalkeepers?.includes(p.name);
         const stats = statsMap[p.name];
         if (!stats) return;
         if (specificGkStat) {
            stats.matchesAsGK++;
            if (isCounted) stats.matchesAsGKCounted++;
            stats.conceded += specificGkStat.conceded;
            if (isLeague) { 
                stats.leagueMatchesAsGK++; 
                if (isCounted) stats.leagueMatchesAsGKCounted++;
                stats.leagueConceded += specificGkStat.conceded; 
            }
         } else if (isInLegacyGkList) {
            const val = m.opponentScore || 0;
            stats.matchesAsGK++;
            if (isCounted) stats.matchesAsGKCounted++;
            stats.conceded += val;
            if (isLeague) { 
                stats.leagueMatchesAsGK++; 
                if (isCounted) stats.leagueMatchesAsGKCounted++;
                stats.leagueConceded += val; 
            }
         }
      });
    });

    Object.values(statsMap).forEach(s => {
      s.goalsAvg = formatAvg(s.goals, s.matchesCounted);
      s.leagueGoalsAvg = formatAvg(s.leagueGoals, s.leagueMatchesCounted);
      s.assistsAvg = formatAvg(s.assists, s.matchesCounted);
      s.leagueAssistsAvg = formatAvg(s.leagueAssists, s.leagueMatchesCounted);
      s.concededAvg = formatAvg(s.conceded, s.matchesAsGKCounted);
      s.leagueConcededAvg = formatAvg(s.leagueConceded, s.leagueMatchesAsGKCounted);
      s.disciplineScore = (s.redCards * 3) + s.yellowCards;
    });
    return Object.values(statsMap);
  }, [players, seasonFilteredMatches]);

  const honors = useMemo(() => {
     if (playerStats.length === 0) return null;
     const topScorer = [...playerStats].sort((a, b) => b.goals - a.goals || a.matchesPlayed - b.matchesPlayed)[0];
     const topLeagueScorer = [...playerStats].sort((a, b) => b.leagueGoals - a.leagueGoals || a.leagueMatchesPlayed - b.leagueMatchesPlayed)[0];
     const topAssist = [...playerStats].sort((a, b) => b.assists - a.assists || a.matchesPlayed - b.matchesPlayed)[0];
     const topLeagueAssist = [...playerStats].sort((a, b) => b.leagueAssists - a.leagueAssists || a.leagueMatchesPlayed - b.leagueMatchesPlayed)[0];
     const topGK = [...playerStats]
        .filter(p => p.matchesAsGKCounted > 0)
        .sort((a, b) => (a.conceded / a.matchesAsGKCounted) - (b.conceded / b.matchesAsGKCounted) || b.matchesAsGKCounted - a.matchesAsGKCounted)[0];
     const topLeagueGK = [...playerStats]
        .filter(p => p.leagueMatchesAsGKCounted > 0)
        .sort((a, b) => (a.leagueConceded / a.leagueMatchesAsGKCounted) - (b.leagueConceded / b.leagueMatchesAsGKCounted) || b.leagueMatchesAsGKCounted - a.matchesAsGKCounted)[0];
     const unluckyGuy = [...playerStats].sort((a, b) => b.ownGoals - a.ownGoals)[0];
     return { topScorer, topLeagueScorer, topAssist, topLeagueAssist, topGK, topLeagueGK, unluckyGuy };
  }, [playerStats]);

  const filteredStats = useMemo(() => {
    let sorted = [...playerStats];
    sorted.sort((a, b) => {
        if (sortConfig.key === 'default') {
             return (b.matchesPlayed - a.matchesPlayed) || 
                    (b.leagueMatchesPlayed - a.leagueMatchesPlayed) || 
                    (b.goals - a.goals) || 
                    (b.assists - a.assists);
        }
        const valA = a[sortConfig.key as keyof PlayerStats];
        const valB = b[sortConfig.key as keyof PlayerStats];
        if (valA === undefined || valB === undefined) return 0;
        return sortConfig.direction === 'asc' ? (valA < valB ? -1 : 1) : (valB < valA ? -1 : 1);
    });
    return sorted.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.number && p.number.includes(searchTerm)));
  }, [playerStats, sortConfig, searchTerm]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
        canvas.width = width; canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        setFormAvatar(canvas.toDataURL('image/jpeg', 0.8));
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const openAddModal = () => {
    setEditingPlayer(null);
    setFormName('');
    setFormNumber('');
    setFormBirthday('');
    setFormAvatar('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PlayerProfile) => {
    setEditingPlayer(p);
    setFormName(p.name);
    setFormNumber(p.number || '');
    setFormBirthday(p.birthday || '');
    setFormAvatar(p.avatar || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const savePlayer = () => {
    if (!formName.trim()) { setFormError('姓名不能为空'); return; }
    const newProfile: PlayerProfile = {
      name: formName.trim(),
      number: formNumber.trim(),
      birthday: formBirthday,
      avatar: formAvatar
    };

    if (editingPlayer) {
      onEditPlayer(editingPlayer.name, newProfile);
    } else {
      if (players.some(p => p.name === newProfile.name)) { setFormError('该球员已存在'); return; }
      onAddPlayer(newProfile);
    }
    setIsModalOpen(false);
  };

  if (viewingPlayer) {
    return <PlayerDetailView player={viewingPlayer} matches={matches} seasons={seasons} onBack={() => setViewingPlayer(null)} onViewMatch={onViewMatch} />;
  }

  return (
    <div className="max-w-full mx-auto space-y-6 animate-fade-in relative pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shirt className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            球员详细信息
          </h2>
          <p className="text-slate-500 mt-1">
             本赛季: 总 {totalMatchesCount} 场 / 联赛 {totalLeagueMatchesCount} 场 (均值基于计入统计的场次)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
           {!isReadOnly && (
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-md font-bold hover:brightness-110 transition-all shrink-0"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                 <Plus className="w-5 h-5" />
                 添加球员
              </button>
           )}
           <div className="relative"><Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)} className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm appearance-none bg-white shadow-sm">
                  <option value="all">所有赛季</option>
                  {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>
           <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="搜索球员..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm shadow-sm" />
           </div>
        </div>
      </div>

      {honors && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HonorSection title="射手榜">
               <PlayerHonorCard 
                  title="最佳射手" 
                  stat={`${honors.topScorer?.goals || 0} 进球`}
                  player={honors.topScorer}
                  icon={Trophy}
                  colorClass="bg-amber-400"
                  onPlayerClick={setViewingPlayer}
               />
               <PlayerHonorCard 
                  title="联赛最佳射手" 
                  stat={`${honors.topLeagueScorer?.leagueGoals || 0} 进球`}
                  player={honors.topLeagueScorer}
                  icon={Crown}
                  colorClass="bg-emerald-400"
                  onPlayerClick={setViewingPlayer}
               />
            </HonorSection>
            <HonorSection title="助攻榜">
               <PlayerHonorCard 
                  title="助攻王" 
                  stat={`${honors.topAssist?.assists || 0} 助攻`}
                  player={honors.topAssist}
                  icon={Zap}
                  colorClass="bg-blue-400"
                  onPlayerClick={setViewingPlayer}
               />
               <PlayerHonorCard 
                  title="联赛助攻王" 
                  stat={`${honors.topLeagueAssist?.leagueAssists || 0} 助攻`}
                  player={honors.topLeagueAssist}
                  icon={Star}
                  colorClass="bg-sky-400"
                  onPlayerClick={setViewingPlayer}
               />
            </HonorSection>
            <HonorSection title="防守榜">
               <PlayerHonorCard 
                  title="最佳守门员" 
                  stat={honors.topGK ? `${(honors.topGK.conceded / honors.topGK.matchesAsGKCounted).toFixed(2)} 场均` : '无数据'}
                  player={honors.topGK}
                  icon={Shield}
                  colorClass="bg-indigo-400"
                  onPlayerClick={setViewingPlayer}
               />
               <PlayerHonorCard 
                  title="联赛最佳守门员" 
                  stat={honors.topLeagueGK ? `${(honors.topLeagueGK.leagueConceded / honors.topLeagueGK.leagueMatchesAsGKCounted).toFixed(2)} 场均` : '无数据'}
                  player={honors.topLeagueGK}
                  icon={Award}
                  colorClass="bg-violet-400"
                  onPlayerClick={setViewingPlayer}
               />
            </HonorSection>
            <HonorSection title="特殊记录">
               <PlayerHonorCard 
                  title="倒霉蛋" 
                  stat={honors.unluckyGuy && honors.unluckyGuy.ownGoals > 0 ? `${honors.unluckyGuy.ownGoals} 乌龙` : '无乌龙记录'}
                  player={honors.unluckyGuy && honors.unluckyGuy.ownGoals > 0 ? honors.unluckyGuy : undefined}
                  icon={HeartCrack}
                  colorClass="bg-rose-400"
                  onPlayerClick={setViewingPlayer}
               />
               <div className="h-20 flex items-center justify-center opacity-10 grayscale">
                  <Shirt className="w-12 h-12" />
               </div>
            </HonorSection>
         </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[10px] md:text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr className="border-b border-slate-100">
                <th rowSpan={2} className="px-2 py-4 sticky left-0 bg-slate-50 z-30 min-w-[90px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">球员</th>
                <th rowSpan={2} className="px-1 py-4 text-center">年龄</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-indigo-50/30">参与活动 (总)</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-amber-50/30">首发</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-emerald-50/30 text-emerald-700">进球 (场均)</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-blue-50/30 text-blue-700">助攻 (场均)</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-slate-100/50 text-slate-700">失球 (场均)</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100">红黄牌</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-rose-50/30 text-rose-700">乌龙球</th>
                <th rowSpan={2} className="px-4 py-4 text-center">操作</th>
              </tr>
              <tr>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('matchesPlayed')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leagueMatchesPlayed')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('starts')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leagueStarts')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('goals')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100 font-bold text-emerald-600" onClick={() => handleSort('leagueGoals')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('assists')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100 font-bold text-blue-600" onClick={() => handleSort('leagueAssists')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('conceded')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leagueConceded')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100">总计</th>
                <th className="px-2 py-2 text-center">联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('ownGoals')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100 text-rose-600" onClick={() => handleSort('leagueOwnGoals')}>联赛</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStats.map((player, index) => {
                const isEven = index % 2 !== 0; // 用于斑马纹

                return (
                  <tr key={player.name} className={`hover:bg-slate-50 transition-colors group ${isEven ? 'bg-slate-50/50' : 'bg-white'}`}>
                    <td className={`px-2 py-3 sticky left-0 group-hover:bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100 ${isEven ? 'bg-slate-50' : 'bg-white'}`}>
                       <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 font-bold text-slate-400 text-[10px]">
                             {player.avatar ? <img src={player.avatar} className="w-full h-full object-cover" alt={player.name}/> : player.number || '#'}
                          </div>
                          <div className="font-black text-slate-800 truncate max-w-[64px] text-xs md:text-sm">{player.name}</div>
                       </div>
                    </td>
                    <td className="px-1 py-3 text-center text-slate-400 text-xs md:text-sm">{player.age || '-'}</td>
                    <td className="px-2 py-3 border-l border-slate-100 bg-indigo-50/10">
                       <AppearanceCell val={player.matchesPlayed} total={totalMatchesCount} color="bg-[#10B981]" />
                    </td>
                    <td className="px-2 py-3 bg-indigo-50/10">
                       <AppearanceCell val={player.leagueMatchesPlayed} total={totalLeagueMatchesCount} color="bg-[#3B82F6]" />
                    </td>
                    <td className="px-2 py-3 text-center border-l border-slate-100 bg-amber-50/10">
                       <StarterCell val={player.starts} matches={player.matchesPlayed} />
                    </td>
                    <td className="px-2 py-3 text-center bg-amber-50/10">
                       <StarterCell val={player.leagueStarts} matches={player.leagueMatchesPlayed} color="text-amber-500" />
                    </td>
                    <td className="px-2 py-3 text-center border-l border-slate-100 bg-emerald-50/10">
                       <StatWithAvgCell val={player.goals} avg={player.goalsAvg} />
                    </td>
                    <td className="px-2 py-3 text-center bg-emerald-50/10">
                       <StatWithAvgCell val={player.leagueGoals} avg={player.leagueGoalsAvg} color="text-emerald-600" />
                    </td>
                    <td className="px-2 py-3 text-center border-l border-slate-100 bg-blue-50/10">
                       <StatWithAvgCell val={player.assists} avg={player.assistsAvg} />
                    </td>
                    <td className="px-2 py-3 text-center bg-blue-50/10">
                       <StatWithAvgCell val={player.leagueAssists} avg={player.leagueAssistsAvg} color="text-blue-600" />
                    </td>
                    <td className="px-2 py-3 text-center border-l border-slate-100 bg-slate-100/30">
                       {player.matchesAsGK > 0 ? <StatWithAvgCell val={player.conceded} avg={player.concededAvg} color="text-slate-500" /> : <span className="text-slate-200">-</span>}
                    </td>
                    <td className="px-2 py-3 text-center bg-slate-100/30">
                       {player.leagueMatchesAsGK > 0 ? <StatWithAvgCell val={player.leagueConceded} avg={player.leagueConcededAvg} color="text-slate-400" /> : <span className="text-slate-200">-</span>}
                    </td>
                    <td className="px-2 py-3 text-center border-l border-slate-100">
                       {(player.yellowCards > 0 || player.redCards > 0) ? (
                          <div className="flex items-center justify-center gap-1.5">
                             <CardIcon type="yellow" count={player.yellowCards} />
                             <CardIcon type="red" count={player.redCards} />
                          </div>
                       ) : <span className="text-slate-200">-</span>}
                    </td>
                    <td className="px-2 py-3 text-center">
                       {(player.leagueYellowCards > 0 || player.leagueRedCards > 0) ? (
                          <div className="flex items-center justify-center gap-1.5">
                             <CardIcon type="yellow" count={player.leagueYellowCards} />
                             <CardIcon type="red" count={player.redCards} />
                          </div>
                       ) : <span className="text-slate-200">-</span>}
                    </td>
                    <td className="px-2 py-3 text-center border-l border-slate-100 bg-rose-50/10">
                       {player.ownGoals > 0 ? <span className="font-bold text-slate-700">{player.ownGoals}</span> : <span className="text-slate-200">-</span>}
                    </td>
                    <td className="px-2 py-3 text-center bg-rose-50/10">
                       {player.leagueOwnGoals > 0 ? <span className="font-bold text-rose-600">{player.leagueOwnGoals}</span> : <span className="text-slate-200">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                       <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setViewingPlayer(player)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded border border-slate-200"><Eye className="w-3.5 h-3.5" /></button>
                          {!isReadOnly && (
                             <>
                                <button onClick={() => openEditModal({ name: player.name, number: player.number, avatar: player.avatar, birthday: player.birthday })} className="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded border border-slate-200"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => onRemovePlayer(player.name)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded border border-slate-200"><Trash2 className="w-3.5 h-3.5" /></button>
                             </>
                          )}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Player Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up flex flex-col">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <Shirt className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    {editingPlayer ? '编辑球员档案' : '录入新球员'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 {/* Avatar Upload */}
                 <div className="flex flex-col items-center">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-indigo-500 overflow-hidden relative group shadow-inner"
                    >
                       {formAvatar ? (
                         <img src={formAvatar} className="w-full h-full object-cover" />
                       ) : (
                         <Camera className="w-8 h-8 text-slate-400" />
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Plus className="w-6 h-6 text-white" />
                       </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-widest">点击上传球员头像</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>

                 <div className="space-y-4">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">球员姓名 (不可重复)</label>
                       <input 
                         type="text" 
                         value={formName} 
                         onChange={(e) => setFormName(e.target.value)} 
                         placeholder="输入球员真名或绰号" 
                         className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 outline-none font-bold text-slate-800"
                         style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">球衣号码</label>
                          <input 
                            type="text" 
                            value={formNumber} 
                            onChange={(e) => setFormNumber(e.target.value)} 
                            placeholder="如: 10" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 outline-none font-bold text-slate-800"
                            style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">出生日期</label>
                          <input 
                            type="date" 
                            value={formBirthday} 
                            onChange={(e) => setFormBirthday(e.target.value)} 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 outline-none font-bold text-slate-800 text-sm"
                            style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                          />
                       </div>
                    </div>
                 </div>

                 {formError && (
                   <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100 animate-fade-in flex items-center gap-2">
                      <X className="w-4 h-4" /> {formError}
                   </div>
                 )}

                 <div className="flex gap-4 pt-2">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl font-black text-sm transition-colors"
                    >
                       取消
                    </button>
                    <button 
                      onClick={savePlayer}
                      className="flex-1 py-3 text-white rounded-2xl font-black text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      <Check className="w-5 h-5" />
                      {editingPlayer ? '确认修改' : '保存档案'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManager;