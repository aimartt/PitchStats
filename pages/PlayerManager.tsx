
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Shirt, Plus, Trash2, Search, Pencil, X, Check, Trophy, Zap, 
  Camera, ArrowUp, ArrowDown, Shield, Filter, HeartCrack, Cake, 
  Eye, ArrowLeft, Calendar, Info, Star, Activity, Target, Award, 
  ChevronRight, Crown, ChevronDown, Gift, UserX
} from 'lucide-react';
import { PlayerManagerProps, PlayerProfile, MatchRecord, PlayerStatus } from '../types';

// Helper interface for calculated stats
interface PlayerStats {
  name: string;
  number?: string;
  avatar?: string;
  birthday?: string;
  age?: number;
  status?: PlayerStatus;
  isBirthdayToday?: boolean; // 新增：是否今天生日
  
  // Total Stats
  goals: number;
  penaltyGoals: number; // 点球进球
  assists: number;
  penaltiesWon: number; // 造点
  starts: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  penaltiesMissed: number; // 失点
  conceded: number;
  matchesPlayed: number;
  matchesCounted: number; 
  matchesAsGK: number;
  matchesAsGKCounted: number; 
  
  // League Stats
  leagueGoals: number;
  leaguePenaltyGoals: number;
  leagueAssists: number;
  leaguePenaltiesWon: number;
  leagueStarts: number;
  leagueOwnGoals: number;
  leagueYellowCards: number;
  leagueRedCards: number;
  leaguePenaltiesMissed: number;
  leagueConceded: number;
  leagueMatchesPlayed: number;
  leagueMatchesCounted: number; 
  leagueMatchesAsGK: number;
  leagueMatchesAsGKCounted: number;

  // Averages
  goalsAvg: string;
  leagueGoalsAvg: string;
  assistsAvg: string;
  leagueAssistsAvg: string;
  concededAvg: string;
  leagueConcededAvg: string;

  disciplineScore: number;
}

const formatAvg = (val: number, matches: number) => {
   if (matches <= 0) return '-';
   const avg = val / matches;
   return avg.toFixed(2);
};

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

const checkIsBirthdayToday = (birthday?: string): boolean => {
  if (!birthday) return false;
  const birthDate = new Date(birthday);
  const today = new Date();
  return birthDate.getMonth() === today.getMonth() && birthDate.getDate() === today.getDate();
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

const StatWithAvgCell = ({ val, pVal, avg, color = "text-slate-800" }: { val: number, pVal?: number, avg: string, color?: string }) => {
  if (val === 0) return <span className="text-slate-200">-</span>;
  return (
    <div className="flex flex-col leading-tight items-center">
      <span className={`font-bold text-sm ${color}`}>
        {val}{pVal && pVal > 0 ? `(${pVal})` : ''}
      </span>
      <span className="text-[10px] text-slate-400 font-medium tracking-tight">({avg})</span>
    </div>
  );
};

const SimpleStatCell = ({ val, color = "text-slate-800" }: { val: number, color?: string }) => {
   if (val === 0) return <span className="text-slate-200">-</span>;
   return <span className={`font-bold text-sm ${color}`}>{val}</span>;
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

  // 核心改动：计算“生涯总计”数据，不随外部筛选变化
  const lifetimeStats = useMemo(() => {
    const s = {
       matchesPlayed: 0, leagueMatchesPlayed: 0,
       matchesCounted: 0, leagueMatchesCounted: 0,
       starts: 0, leagueStarts: 0,
       goals: 0, leagueGoals: 0,
       penaltyGoals: 0, leaguePenaltyGoals: 0,
       assists: 0, leagueAssists: 0,
       penaltiesWon: 0, leaguePenaltiesWon: 0,
       yellowCards: 0, leagueYellowCards: 0,
       redCards: 0, leagueRedCards: 0,
       penaltiesMissed: 0, leaguePenaltiesMissed: 0,
       conceded: 0, leagueConceded: 0,
       matchesAsGK: 0, matchesAsGKCounted: 0,
       leagueMatchesAsGK: 0, leagueMatchesAsGKCounted: 0,
       ownGoals: 0, leagueOwnGoals: 0
    };

    matches.forEach(m => {
       const inSquad = m.squad?.includes(player.name);
       if (!inSquad) return;
       
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
          if (goal.scorer === player.name) { 
             s.goals++; 
             if (isLeague) s.leagueGoals++; 
             if (goal.isPenalty) {
                s.penaltyGoals++;
                if (isLeague) s.leaguePenaltyGoals++;
             }
          }
          if (goal.assist === player.name) { s.assists++; if (isLeague) s.leagueAssists++; }
       });

       if (m.penaltiesWon?.includes(player.name)) { s.penaltiesWon++; if (isLeague) s.leaguePenaltiesWon++; }
       if (m.penaltiesMissed?.includes(player.name)) { s.penaltiesMissed++; if (isLeague) s.leaguePenaltiesMissed++; }
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
    return s;
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
            penaltyGoals: 0, leaguePenaltyGoals: 0,
            assists: 0, leagueAssists: 0,
            penaltiesWon: 0, leaguePenaltiesWon: 0,
            yellowCards: 0, leagueYellowCards: 0,
            redCards: 0, leagueRedCards: 0,
            penaltiesMissed: 0, leaguePenaltiesMissed: 0,
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
          if (goal.scorer === player.name) { 
             s.goals++; 
             if (isLeague) s.leagueGoals++; 
             if (goal.isPenalty) {
                s.penaltyGoals++;
                if (isLeague) s.leaguePenaltyGoals++;
             }
          }
          if (goal.assist === player.name) { s.assists++; if (isLeague) s.leagueAssists++; }
       });

       if (m.penaltiesWon?.includes(player.name)) { s.penaltiesWon++; if (isLeague) s.leaguePenaltiesWon++; }
       if (m.penaltiesMissed?.includes(player.name)) { s.penaltiesMissed++; if (isLeague) s.leaguePenaltiesMissed++; }
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
      {/* 优化后的顶部卡片：采用响应式布局，解决移动端错位，并为 PC 端增加左边距避开返回按钮 */}
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 relative p-6 md:p-8 md:pl-32 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 min-h-[220px] md:h-64 transition-all duration-300">
           {/* 背景装饰：移动端隐藏大数字 */}
           <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none hidden md:block">
              <span className="text-[12rem] lg:text-[15rem] font-black leading-none text-white italic tracking-tighter select-none">
                {player.number || 'PS'}
              </span>
           </div>
           
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
           
           {/* 返回按钮 */}
           <button onClick={onBack} className="absolute top-4 left-4 md:top-8 md:left-8 p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-white backdrop-blur-md border border-white/20 shadow-xl group z-20">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
           </button>

           {/* 头像 - 响应式尺寸 */}
           <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl md:rounded-[2.5rem] bg-white p-1.5 md:p-2 shadow-2xl ring-4 ring-slate-800 shrink-0 z-10 relative">
              <div className="w-full h-full rounded-[1.8rem] md:rounded-[2.1rem] bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-50 font-black text-slate-300 text-4xl md:text-6xl">
                 {player.avatar ? <img src={player.avatar} className="w-full h-full object-cover" /> : player.number || '#'}
              </div>
           </div>

           {/* 球员信息 - 响应式对齐方式 */}
           <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 w-full md:pb-4"> 
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-5">
                 <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg">{player.name}</h1>
                    {player.isBirthdayToday && (
                       <div className="bg-rose-500 text-white p-1.5 rounded-full shadow-lg animate-bounce border-2 border-white" title="今天是球员生日！">
                          <Cake className="w-4 h-4 md:w-6 md:h-6" />
                       </div>
                    )}
                 </div>
                 {player.number && (
                   <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-40"></div>
                      <span className="relative bg-emerald-500 text-white px-4 py-1 md:px-5 md:py-1.5 rounded-xl md:rounded-2xl text-lg md:text-2xl font-black shadow-2xl">#{player.number}</span>
                   </div>
                 )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-4 w-full">
                 <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 md:px-5 md:py-2 rounded-full text-slate-100 font-bold text-xs md:text-sm border border-white/10">
                    <Cake className="w-4 h-4 text-emerald-400" /> {player.birthday || '未设生日'} {player.age ? `(${player.age}岁)` : ''}
                 </span>
                 {player.status && player.status !== '正常' && (
                    <span className={`flex items-center gap-2 backdrop-blur-md px-4 py-1.5 md:px-5 md:py-2 rounded-full font-bold text-xs md:text-sm border ${player.status === '伤停' ? 'bg-red-500/20 text-red-600 border-red-500/30' : 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                       {player.status === '伤停' ? <Plus className="w-4 h-4 stroke-[4px]" /> : <UserX className="w-4 h-4" />}
                       {player.status}
                    </span>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* 生涯核心数据面板 - 始终计算全量数据 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
         {/* 1. 出场专栏 */}
         <div className="bg-white p-5 rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-4 shadow-inner">
               <Activity className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">生涯出场 (总/联赛)</div>
            <div className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
               {lifetimeStats.matchesPlayed} <span className="text-sm text-slate-300 font-bold">/</span> <span className="text-indigo-600">{lifetimeStats.leagueMatchesPlayed}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
               <div className="text-[10px] font-bold text-slate-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">
                  生涯首发率: {lifetimeStats.matchesPlayed > 0 ? Math.round((lifetimeStats.starts / lifetimeStats.matchesPlayed) * 100) : 0}%
               </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] transform rotate-12 group-hover:rotate-0 transition-transform">
               <Activity className="w-20 h-20" />
            </div>
         </div>

         {/* 2. 进攻专栏 */}
         <div className="bg-white p-5 rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
               <Trophy className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">进攻贡献 (球/助)</div>
            <div className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
               <span className="text-emerald-600">{lifetimeStats.goals}</span> <span className="text-sm text-slate-300 font-bold">/</span> <span className="text-blue-600">{lifetimeStats.assists}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
               <div className="text-[10px] font-bold text-slate-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                  场均制造: {formatAvg(lifetimeStats.goals + lifetimeStats.assists, lifetimeStats.matchesCounted)}
               </div>
               <div className="text-[10px] font-bold text-slate-500 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-100/50">
                  造点: {lifetimeStats.penaltiesWon}
               </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] transform rotate-12 group-hover:rotate-0 transition-transform">
               <Zap className="w-20 h-20" />
            </div>
         </div>

         {/* 3. 防守专栏 */}
         <div className="bg-white p-5 rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 mb-4 shadow-inner">
               <Shield className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">失球统计 (总/联赛)</div>
            <div className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
               {lifetimeStats.conceded} <span className="text-sm text-slate-300 font-bold">/</span> <span className="text-slate-500">{lifetimeStats.leagueConceded}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
               <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-100/50">
                  生涯场均失球: {formatAvg(lifetimeStats.conceded, lifetimeStats.matchesAsGKCounted)}
               </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] transform rotate-12 group-hover:rotate-0 transition-transform">
               <Shield className="w-20 h-20" />
            </div>
         </div>

         {/* 4. 纪律专栏 */}
         <div className="bg-white p-5 rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-inner">
               <Award className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">纪律与失误 (黄/红)</div>
            <div className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
               <span className="text-amber-500">{lifetimeStats.yellowCards}</span> <span className="text-sm text-slate-300 font-bold">/</span> <span className="text-rose-600">{lifetimeStats.redCards}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
               <div className="text-[10px] font-bold text-slate-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100/50">
                  失点: {lifetimeStats.penaltiesMissed}
               </div>
               <div className="text-[10px] font-bold text-slate-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100/50">
                  乌龙: {lifetimeStats.ownGoals}
               </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] transform rotate-12 group-hover:rotate-0 transition-transform">
               <HeartCrack className="w-20 h-20" />
            </div>
         </div>
      </div>

      {/* 优化后的生涯数据明细 - 移动端卡片化，消除滚动条 */}
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
         <div className="px-6 py-6 md:px-10 md:py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
               <div className="p-2 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm"><Calendar className="w-5 h-5 md:w-7 md:h-7 text-slate-400" /></div>
               <div>
                  <h3 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">生涯数据明细</h3>
                  <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">点击赛季展开单场详情</p>
               </div>
            </div>
         </div>

         {/* 桌面端：保持原有表格结构 */}
         <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
               <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr className="border-b border-slate-100">
                     <th rowSpan={2} className="pl-10 pr-4 py-5 sticky left-0 bg-slate-50 z-30 font-black text-slate-900 text-xs">赛季信息</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-indigo-50/30">参与活动</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-amber-50/30">首发率</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-emerald-50/30 text-emerald-700">进球(点球)</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-blue-50/30 text-blue-700">助攻(均)</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-cyan-50/30 text-cyan-700">造点</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-slate-100/50 text-slate-700">失球(均)</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100">红黄牌</th>
                     <th colSpan={2} className="px-4 py-3 text-center border-l border-slate-100 bg-orange-50/30 text-orange-700">失点</th>
                     <th colSpan={2} className="pr-10 pl-4 py-3 text-center border-l border-slate-100 bg-rose-50/30 text-rose-700">乌龙</th>
                  </tr>
                  <tr className="bg-white/50 font-black">
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="px-2 py-3 text-center">联赛</th>
                     <th className="px-2 py-3 text-center border-l border-slate-100">总计</th>
                     <th className="pr-10 pl-2 py-3 text-center">联赛</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {seasonStats.map((s, index) => {
                     const isExpanded = expandedSeason === s.season;
                     const isEven = index % 2 !== 0; 
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
                              
                              <td className="px-2 py-6 border-l border-slate-100 bg-indigo-50/10">
                                 <AppearanceCell val={s.matchesPlayed} total={totals.total} color="bg-[#10B981]" />
                              </td>
                              <td className="px-2 py-6 bg-indigo-50/10">
                                 <AppearanceCell val={s.leagueMatchesPlayed} total={totals.league} color="bg-[#3B82F6]" />
                              </td>
                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-amber-50/10">
                                 <StarterCell val={s.starts} matches={s.matchesPlayed} />
                              </td>
                              <td className="px-2 py-6 text-center bg-amber-50/10">
                                 <StarterCell val={s.leagueStarts} matches={s.leagueMatchesPlayed} color="text-amber-500" />
                              </td>
                              
                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-emerald-50/10">
                                 <StatWithAvgCell val={s.goals} pVal={s.penaltyGoals} avg={formatAvg(s.goals, s.matchesCounted)} />
                              </td>
                              <td className="px-2 py-6 text-center bg-emerald-50/10">
                                 <StatWithAvgCell val={s.leagueGoals} pVal={s.leaguePenaltyGoals} avg={formatAvg(s.leagueGoals, s.leagueMatchesCounted)} color="text-emerald-600" />
                              </td>
                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-blue-50/10">
                                 <StatWithAvgCell val={s.assists} avg={formatAvg(s.assists, s.matchesCounted)} />
                              </td>
                              <td className="px-2 py-6 text-center bg-blue-50/10">
                                 <StatWithAvgCell val={s.leagueAssists} avg={formatAvg(s.leagueAssists, s.leagueMatchesCounted)} color="text-blue-600" />
                              </td>
                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-cyan-50/10">
                                 <SimpleStatCell val={s.penaltiesWon} />
                              </td>
                              <td className="px-2 py-6 text-center bg-cyan-50/10">
                                 <SimpleStatCell val={s.leaguePenaltiesWon} color="text-cyan-600" />
                              </td>

                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-slate-100/30">
                                 {s.matchesAsGK > 0 ? <StatWithAvgCell val={s.conceded} avg={formatAvg(s.conceded, s.matchesAsGKCounted)} color="text-slate-500" /> : <span className="text-slate-200">-</span>}
                              </td>
                              <td className="px-2 py-6 text-center bg-slate-100/30">
                                 {s.leagueMatchesAsGK > 0 ? <StatWithAvgCell val={s.leagueConceded} avg={formatAvg(s.leagueConceded, s.leagueMatchesAsGKCounted)} color="text-slate-400" /> : <span className="text-slate-200">-</span>}
                              </td>
                              
                              <td className="px-2 py-6 text-center border-l border-slate-100">
                                 <div className="flex justify-center gap-1.5">
                                    <CardIcon type="yellow" count={s.yellowCards} />
                                    <CardIcon type="red" count={s.redCards} />
                                    {!(s.yellowCards || s.redCards) && <span className="text-slate-200">-</span>}
                                 </div>
                              </td>
                              <td className="px-2 py-6 text-center">
                                 <div className="flex justify-center gap-1.5">
                                    <CardIcon type="yellow" count={s.leagueYellowCards} />
                                    <CardIcon type="red" count={s.redCards} />
                                    {!(s.leagueYellowCards || s.redCards) && <span className="text-slate-200">-</span>}
                                 </div>
                              </td>
                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-orange-50/10">
                                 <SimpleStatCell val={s.penaltiesMissed} />
                              </td>
                              <td className="px-2 py-6 text-center bg-orange-50/10">
                                 <SimpleStatCell val={s.leaguePenaltiesMissed} color="text-orange-600" />
                              </td>

                              <td className="px-2 py-6 text-center border-l border-slate-100 bg-rose-50/10">
                                 <SimpleStatCell val={s.ownGoals} />
                              </td>
                              <td className="pr-10 pl-2 py-6 text-center bg-rose-50/10">
                                 <SimpleStatCell val={s.leagueOwnGoals} color="text-rose-600" />
                              </td>
                           </tr>

                           {isExpanded && (
                             <tr>
                                <td colSpan={20} className="p-0 bg-slate-50">
                                   <div className="p-6 space-y-4 animate-slide-up border-b border-slate-200 shadow-inner">
                                      <div className="flex items-center gap-2 mb-2">
                                         <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">{s.season} 赛季详细赛果</h4>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                         {seasonMatches.map(match => {
                                            const isWin = match.result === 'Win';
                                            const isLoss = match.result === 'Loss';
                                            
                                            const isStarter = match.starters?.includes(player.name);
                                            const matchGoals = match.goalsDetails?.filter(g => g.scorer === player.name).length || 0;
                                            const matchPenaltyGoals = match.goalsDetails?.filter(g => g.scorer === player.name && g.isPenalty).length || 0;
                                            const matchAssists = match.goalsDetails?.filter(g => g.assist === player.name).length || 0;
                                            const matchPenaltiesWon = match.penaltiesWon?.filter(name => name === player.name).length || 0;
                                            const matchPenaltiesMissed = match.penaltiesMissed?.filter(name => name === player.name).length || 0;
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
                                                        {isStarter && <span className="bg-amber-50 text-amber-600 px-1 py-0.5 rounded flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-current" /> 首发</span>}
                                                        {match.countForStats === false && (
                                                           <span className="bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded border border-rose-100/50">
                                                              未统
                                                           </span>
                                                        )}
                                                     </div>
                                                     <div className="font-black text-slate-800 truncate text-sm group-hover/match:text-indigo-600 transition-colors">vs {match.opponent}</div>
                                                     <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs font-mono font-black ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-amber-500'}`}>
                                                           {match.ourScore}:{match.opponentScore}
                                                        </span>
                                                     </div>
                                                  </div>
                                                  
                                                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-4 border-l border-slate-100 min-w-[70px]">
                                                     <div className="flex flex-wrap justify-end gap-1.5">
                                                        {gkStat && <span className="text-[10px] font-black text-indigo-600" title="守门员失球">🧤 -{gkStat.conceded}</span>}
                                                        {matchGoals > 0 && <span className="text-[10px] font-black text-emerald-600" title="进球">⚽ x{matchGoals}{matchPenaltyGoals > 0 ? `(${matchPenaltyGoals}P)` : ''}</span>}
                                                        {matchAssists > 0 && <span className="text-[10px] font-black text-blue-600" title="助攻">👟 x{matchAssists}</span>}
                                                        {matchPenaltiesWon > 0 && <span className="text-[10px] font-black text-cyan-600" title="造点">🎯 x{matchPenaltiesWon}</span>}
                                                        {matchPenaltiesMissed > 0 && <span className="text-[10px] font-black text-orange-600" title="失点">❌ x{matchPenaltiesMissed}</span>}
                                                        {matchOwnGoals > 0 && <span className="text-[10px] font-black text-rose-600" title="乌龙球">💀 x{matchOwnGoals}</span>}
                                                        {hasYellow && <div className="w-1.5 h-2.5 bg-yellow-400 rounded-sm border border-black/10" title="黄牌"></div>}
                                                        {hasRed && <div className="w-1.5 h-2.5 bg-red-500 rounded-sm border border-black/10" title="红牌"></div>}
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

         {/* 移动端：显示卡片布局，彻底消除横向滚动 */}
         <div className="md:hidden divide-y divide-slate-100">
            {seasonStats.map((s) => {
               const isExpanded = expandedSeason === s.season;
               const seasonMatches = getSeasonMatchHistory(s.season);
               
               return (
                  <div key={s.season} className="flex flex-col">
                     <div 
                        onClick={() => toggleSeason(s.season)}
                        className={`p-5 flex items-center justify-between transition-colors ${isExpanded ? 'bg-indigo-50/40' : 'bg-white'}`}
                     >
                        <div className="flex items-center gap-3">
                           <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-indigo-500' : 'text-slate-300'}`} />
                           <span className="font-black text-slate-800">{s.season}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="text-right">
                              <div className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">进/助</div>
                              <div className="text-sm font-black text-slate-700 leading-none">{s.goals}/{s.assists}</div>
                           </div>
                           <div className="w-px h-6 bg-slate-100"></div>
                           <div className="text-right">
                              <div className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">出场</div>
                              <div className="text-sm font-black text-slate-700 leading-none">{s.matchesPlayed}</div>
                           </div>
                        </div>
                     </div>

                     {isExpanded && (
                        <div className="bg-slate-50 px-4 py-6 space-y-6 animate-fade-in shadow-inner">
                           {/* 移动端展开后的数据网格 */}
                           <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm">
                                 <div className="text-[9px] font-bold text-slate-400 uppercase mb-2">出场/联赛/首发</div>
                                 <div className="flex justify-between items-end">
                                    <div className="text-lg font-black text-indigo-600">{s.matchesPlayed}<span className="text-[10px] text-slate-300 font-bold ml-1">/{s.leagueMatchesPlayed}</span></div>
                                    <div className="text-[10px] font-bold text-slate-400">首发 {Math.round((s.starts/s.matchesPlayed)*100)}%</div>
                                 </div>
                              </div>
                              <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm">
                                 <div className="text-[9px] font-bold text-slate-400 uppercase mb-2">进球 (点球)</div>
                                 <div className="flex justify-between items-end">
                                    <div className="text-lg font-black text-emerald-600">{s.goals}<span className="text-[10px] text-slate-300 font-bold ml-1">{s.penaltyGoals > 0 ? `(${s.penaltyGoals}P)` : ''}</span></div>
                                    <div className="text-[10px] font-bold text-slate-400">均 {formatAvg(s.goals, s.matchesCounted)}</div>
                                 </div>
                              </div>
                              <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm">
                                 <div className="text-[9px] font-bold text-slate-400 uppercase mb-2">助攻 / 造点</div>
                                 <div className="flex justify-between items-end">
                                    <div className="text-lg font-black text-blue-600">{s.assists}</div>
                                    <div className="text-[10px] font-bold text-cyan-600">{s.penaltiesWon} 造点</div>
                                 </div>
                              </div>
                              <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm">
                                 <div className="text-[9px] font-bold text-slate-400 uppercase mb-2">红黄牌 / 失点</div>
                                 <div className="flex justify-between items-end">
                                    <div className="flex gap-1">
                                       <CardIcon type="yellow" count={s.yellowCards} />
                                       <CardIcon type="red" count={s.redCards} />
                                    </div>
                                    <div className="text-[10px] font-bold text-orange-600">{s.penaltiesMissed} 失点</div>
                                 </div>
                              </div>
                           </div>

                           {/* 单场记录列表 */}
                           <div className="space-y-2 pt-2">
                              <div className="flex items-center gap-2 mb-2 pl-1">
                                 <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">赛季单场详情</span>
                              </div>
                              {seasonMatches.map(match => {
                                 const isStarter = match.starters?.includes(player.name);
                                 const mGoals = match.goalsDetails?.filter(g => g.scorer === player.name).length || 0;
                                 const mAssists = match.goalsDetails?.filter(g => g.assist === player.name).length || 0;

                                 return (
                                    <div 
                                       key={match.id}
                                       onClick={() => onViewMatch && onViewMatch(match)}
                                       className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center"
                                    >
                                       <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2 mb-0.5">
                                             <span className="text-[8px] font-bold text-slate-300 uppercase">{match.date}</span>
                                             {isStarter && <span className="bg-amber-50 text-amber-600 px-1 rounded text-[8px] font-bold">首发</span>}
                                          </div>
                                          <div className="text-xs font-black text-slate-700 truncate">vs {match.opponent}</div>
                                       </div>
                                       <div className="flex items-center gap-3 pl-4 shrink-0 border-l border-slate-50">
                                          <div className="text-[10px] font-mono font-black text-slate-800">{match.ourScore}:{match.opponentScore}</div>
                                          <div className="flex gap-1">
                                             {mGoals > 0 && <span className="text-[9px] font-black text-emerald-500">⚽{mGoals}</span>}
                                             {mAssists > 0 && <span className="text-[9px] font-black text-blue-500">👟{mAssists}</span>}
                                          </div>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     )}
                  </div>
               );
            })}
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
            <div className="flex items-center gap-1.5 mt-0.5 pr-2">
               <h4 className="text-lg font-black text-slate-800 leading-tight truncate">
                  {player?.name || '暂无'}
               </h4>
               {player?.isBirthdayToday && <Cake className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />}
            </div>
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
  const [formStatus, setFormStatus] = useState<PlayerStatus>('正常');
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

  const playerStats = useMemo(() => {
    const statsMap: Record<string, PlayerStats> = {};
    players.forEach(p => {
      statsMap[p.name] = { 
        name: p.name, number: p.number, avatar: p.avatar, birthday: p.birthday, age: calculateAge(p.birthday),
        status: p.status || '正常',
        isBirthdayToday: checkIsBirthdayToday(p.birthday),
        goals: 0, penaltyGoals: 0, assists: 0, penaltiesWon: 0, starts: 0, ownGoals: 0, yellowCards: 0, redCards: 0, penaltiesMissed: 0, conceded: 0, 
        matchesPlayed: 0, matchesCounted: 0, 
        matchesAsGK: 0, matchesAsGKCounted: 0,
        leagueGoals: 0, leaguePenaltyGoals: 0, leagueAssists: 0, leaguePenaltiesWon: 0, leagueStarts: 0, leagueOwnGoals: 0, leagueYellowCards: 0, leagueRedCards: 0, leaguePenaltiesMissed: 0, leagueConceded: 0, 
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
        if (statsMap[g.scorer]) { 
           statsMap[g.scorer].goals++; if (isLeague) statsMap[g.scorer].leagueGoals++; 
           if (g.isPenalty) {
              statsMap[g.scorer].penaltyGoals++;
              if (isLeague) statsMap[g.scorer].leaguePenaltyGoals++;
           }
        }
        if (g.assist && statsMap[g.assist]) { statsMap[g.assist].assists++; if (isLeague) statsMap[g.assist].leagueAssists++; }
      });

      m.penaltiesWon?.forEach(p => { if (statsMap[p]) { statsMap[p].penaltiesWon++; if (isLeague) statsMap[p].leaguePenaltiesWon++; } });
      m.penaltiesMissed?.forEach(p => { if (statsMap[p]) { statsMap[p].penaltiesMissed++; if (isLeague) statsMap[p].leaguePenaltiesMissed++; } });
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
            stats.matchesAsGKCounted += isCounted ? 1 : 0;
            stats.conceded += specificGkStat.conceded;
            if (isLeague) { 
                stats.leagueMatchesAsGK++; 
                stats.leagueMatchesAsGKCounted += isCounted ? 1 : 0;
                stats.leagueConceded += specificGkStat.conceded; 
            }
         } else if (isInLegacyGkList) {
            const val = m.opponentScore || 0;
            stats.matchesAsGK++;
            stats.matchesAsGKCounted += isCounted ? 1 : 0;
            stats.conceded += val;
            if (isLeague) { 
                stats.leagueMatchesAsGK++; 
                stats.leagueMatchesAsGKCounted += isCounted ? 1 : 0;
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
     
     // Correct GK sorting: lowest conceded/match, minimum 1 match
     const topGK = [...playerStats]
        .filter(p => p.matchesAsGKCounted > 0)
        .sort((a, b) => (a.conceded / a.matchesAsGKCounted) - (b.conceded / b.matchesAsGKCounted) || b.matchesAsGKCounted - a.matchesAsGKCounted)[0];
     const topLeagueGK = [...playerStats]
        .filter(p => p.leagueMatchesAsGKCounted > 0)
        .sort((a, b) => (a.leagueConceded / a.leagueMatchesAsGKCounted) - (b.leagueConceded / b.leagueMatchesAsGKCounted) || b.leagueMatchesAsGKCounted - a.matchesAsGKCounted)[0];
     
     const unluckyGuy = [...playerStats].sort((a, b) => b.ownGoals - a.ownGoals)[0];
     const badLuckPenalty = [...playerStats].sort((a,b) => b.penaltiesMissed - a.penaltiesMissed)[0];
     
     return { 
       topScorer: topScorer?.goals > 0 ? topScorer : null, 
       topLeagueScorer: topLeagueScorer?.leagueGoals > 0 ? topLeagueScorer : null, 
       topAssist: topAssist?.assists > 0 ? topAssist : null, 
       topLeagueAssist: topLeagueAssist?.leagueAssists > 0 ? topLeagueAssist : null, 
       topGK: topGK || null, 
       topLeagueGK: topLeagueGK || null, 
       unluckyGuy: unluckyGuy?.ownGoals > 0 ? unluckyGuy : null,
       badLuckPenalty: badLuckPenalty?.penaltiesMissed > 0 ? badLuckPenalty : null
     };
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
    setFormStatus('正常');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PlayerProfile) => {
    setEditingPlayer(p);
    setFormName(p.name);
    setFormNumber(p.number || '');
    setFormBirthday(p.birthday || '');
    setFormAvatar(p.avatar || '');
    setFormStatus(p.status || '正常');
    setFormError(null);
    setIsModalOpen(true);
  };

  const savePlayer = () => {
    if (!formName.trim()) { setFormError('姓名不能为空'); return; }
    const newProfile: PlayerProfile = {
      name: formName.trim(),
      number: formNumber.trim(),
      birthday: formBirthday,
      avatar: formAvatar,
      status: formStatus
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
             本赛季: 总 {totalMatchesCount} 场 / 联赛 {totalLeagueMatchesCount} 场 
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
            {(honors.topScorer || honors.topLeagueScorer) && (
              <HonorSection title="射手榜">
                 {honors.topScorer && (
                   <PlayerHonorCard 
                      title="最佳射手" 
                      stat={`${honors.topScorer.goals} 进球`}
                      player={honors.topScorer}
                      icon={Trophy}
                      colorClass="bg-amber-400"
                      onPlayerClick={setViewingPlayer}
                   />
                 )}
                 {honors.topLeagueScorer && (
                   <PlayerHonorCard 
                      title="联赛最佳射手" 
                      stat={`${honors.topLeagueScorer.leagueGoals} 进球`}
                      player={honors.topLeagueScorer}
                      icon={Crown}
                      colorClass="bg-emerald-400"
                      onPlayerClick={setViewingPlayer}
                   />
                 )}
              </HonorSection>
            )}
            
            {(honors.topAssist || honors.topLeagueAssist) && (
              <HonorSection title="组织榜">
                 {honors.topAssist && (
                   <PlayerHonorCard 
                      title="助攻王" 
                      stat={`${honors.topAssist.assists} 助攻`}
                      player={honors.topAssist}
                      icon={Zap}
                      colorClass="bg-blue-400"
                      onPlayerClick={setViewingPlayer}
                   />
                 )}
                 {honors.topLeagueAssist && (
                   <PlayerHonorCard 
                      title="联赛助攻王" 
                      stat={`${honors.topLeagueAssist.leagueAssists} 助攻`}
                      player={honors.topLeagueAssist}
                      icon={Star}
                      colorClass="bg-sky-400"
                      onPlayerClick={setViewingPlayer}
                   />
                 )}
              </HonorSection>
            )}

            {(honors.topGK || honors.topLeagueGK) && (
              <HonorSection title="守门员">
                 {honors.topGK && (
                   <PlayerHonorCard 
                      title="最佳守门员" 
                      stat={`场均失球 ${(honors.topGK.conceded / honors.topGK.matchesAsGKCounted).toFixed(2)}`}
                      player={honors.topGK}
                      icon={Shield}
                      colorClass="bg-indigo-400"
                      onPlayerClick={setViewingPlayer}
                   />
                 )}
                 {honors.topLeagueGK && (
                   <PlayerHonorCard 
                      title="联赛最佳守门员" 
                      stat={`场均失球 ${(honors.topLeagueGK.leagueConceded / honors.topLeagueGK.leagueMatchesAsGKCounted).toFixed(2)}`}
                      player={honors.topLeagueGK}
                      icon={Award}
                      colorClass="bg-cyan-400"
                      onPlayerClick={setViewingPlayer}
                   />
                 )}
              </HonorSection>
            )}

            {(honors.badLuckPenalty || honors.unluckyGuy) && (
              <HonorSection title="倒霉蛋">
                 {honors.badLuckPenalty && (
                   <PlayerHonorCard 
                      title="失点记录" 
                      stat={`${honors.badLuckPenalty.penaltiesMissed} 次`}
                      player={honors.badLuckPenalty}
                      icon={HeartCrack}
                      colorClass="bg-orange-400"
                      onPlayerClick={setViewingPlayer}
                   />
                 )}
                 {honors.unluckyGuy && (
                   <PlayerHonorCard 
                      title="乌龙记录" 
                      stat={`${honors.unluckyGuy.ownGoals} 次`}
                      player={honors.unluckyGuy}
                      icon={Shirt}
                      colorClass="bg-rose-400"
                      onPlayerClick={setViewingPlayer}
                   />
                 )}
              </HonorSection>
            )}
         </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[10px] md:text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr className="border-b border-slate-100">
                <th rowSpan={2} className="px-2 py-4 sticky left-0 bg-slate-50 z-30 min-w-[90px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">球员</th>
                <th rowSpan={2} className="px-1 py-4 text-center">年龄</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-indigo-50/30">参与活动(率)</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-amber-50/30">首发(率)</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-emerald-50/30 text-emerald-700">进球(均)</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-blue-50/30 text-blue-700">助攻(均)</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-cyan-50/30 text-cyan-700">造点</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-slate-100/50 text-slate-700">失球(均)</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100">红黄牌</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-orange-50/30 text-orange-700">失点</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-slate-100 bg-rose-50/30 text-rose-700">乌龙</th>
                <th rowSpan={2} className="px-4 py-4 text-center">操作</th>
              </tr>
              <tr>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('matchesPlayed')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leagueMatchesPlayed')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('starts')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leagueStarts')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('goals')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leagueGoals')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('assists')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leagueAssists')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('penaltiesWon')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leaguePenaltiesWon')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('conceded')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leagueConceded')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100">总计</th>
                <th className="px-2 py-2 text-center">联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('penaltiesMissed')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leaguePenaltiesMissed')}>联赛</th>
                <th className="px-2 py-2 text-center border-l border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('ownGoals')}>总计</th>
                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leagueOwnGoals')}>联赛</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStats.map((player, index) => {
                const isEven = index % 2 !== 0; 

                return (
                  <tr key={player.name} className={`hover:bg-slate-50 transition-colors group ${isEven ? 'bg-slate-50/50' : 'bg-white'}`}>
                    <td className={`px-2 py-3 sticky left-0 group-hover:bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100 ${isEven ? 'bg-slate-50' : 'bg-white'}`}>
                       <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 font-bold text-slate-400 text-[10px]">
                             {player.avatar ? <img src={player.avatar} className="w-full h-full object-cover" alt={player.name}/> : player.number || '#'}
                          </div>
                          <div className="flex items-center gap-1 min-w-0">
                             <div className="font-black text-slate-800 truncate max-w-[64px] text-xs md:text-sm">{player.name}</div>
                             <div className="flex items-center gap-0.5 shrink-0">
                                {player.isBirthdayToday && <span title="今天是球员生日！"><Cake className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" /></span>}
                                {player.status === '伤停' && <span title="伤停"><Plus className="w-3.5 h-3.5 text-red-600 stroke-[4px] shrink-0" /></span>}
                                {player.status === '已离队' && <span title="已离队"><UserX className="w-3.5 h-3.5 text-slate-400 shrink-0" /></span>}
                             </div>
                          </div>
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
                       <StatWithAvgCell val={player.goals} pVal={player.penaltyGoals} avg={player.goalsAvg} />
                    </td>
                    <td className="px-2 py-3 text-center bg-emerald-50/10">
                       <StatWithAvgCell val={player.leagueGoals} pVal={player.leaguePenaltyGoals} avg={player.leagueGoalsAvg} color="text-emerald-600" />
                    </td>
                    <td className="px-2 py-3 text-center bg-blue-50/10">
                       <StatWithAvgCell val={player.assists} avg={player.assistsAvg} />
                    </td>
                    <td className="px-2 py-3 text-center bg-blue-50/10">
                       <StatWithAvgCell val={player.leagueAssists} avg={player.leagueAssistsAvg} color="text-blue-600" />
                    </td>
                    <td className="px-2 py-3 text-center border-l border-slate-100 bg-cyan-50/10">
                       <SimpleStatCell val={player.penaltiesWon} />
                    </td>
                    <td className="px-2 py-3 text-center bg-cyan-50/10">
                       <SimpleStatCell val={player.leaguePenaltiesWon} color="text-cyan-600" />
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
                    <td className="px-2 py-3 text-center border-l border-slate-100 bg-orange-50/10">
                       <SimpleStatCell val={player.penaltiesMissed} />
                    </td>
                    <td className="px-2 py-3 text-center bg-orange-50/10">
                       <SimpleStatCell val={player.leaguePenaltiesMissed} color="text-orange-600" />
                    </td>
                    <td className="px-2 py-3 text-center border-l border-slate-100 bg-rose-50/10">
                       <SimpleStatCell val={player.ownGoals} />
                    </td>
                    <td className="px-2 py-3 text-center bg-rose-50/10">
                       <SimpleStatCell val={player.leagueOwnGoals} color="text-rose-600" />
                    </td>
                    <td className="px-4 py-3 text-center">
                       <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setViewingPlayer(player)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded border border-slate-200"><Eye className="w-3.5 h-3.5" /></button>
                          {!isReadOnly && (
                             <>
                                <button onClick={() => openEditModal({ name: player.name, number: player.number, avatar: player.avatar, birthday: player.birthday, status: player.status })} className="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded border border-slate-200"><Pencil className="w-3.5 h-3.5" /></button>
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
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">球员姓名</label>
                       <input 
                         type="text" 
                         value={formName} 
                         onChange={(e) => setFormName(e.target.value)} 
                         placeholder="输入姓名" 
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
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">球员状态</label>
                          <select 
                            value={formStatus} 
                            onChange={(e) => setFormStatus(e.target.value as PlayerStatus)} 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 outline-none font-bold text-slate-800 text-sm appearance-none cursor-pointer"
                            style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                          >
                             <option value="正常">正常</option>
                             <option value="伤停">伤停</option>
                             <option value="已离队">已离队</option>
                          </select>
                       </div>
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
