
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Shirt, Plus, Trash2, Search, Pencil, X, Check, User, Trophy, Zap, Camera, ArrowUpDown, ArrowUp, ArrowDown, Shield, Filter, HeartCrack, Cake, Eye, ArrowLeft, Calendar } from 'lucide-react';
import { PlayerManagerProps, PlayerProfile, MatchRecord } from '../types';

interface PlayerStats {
  name: string;
  number?: string;
  avatar?: string;
  birthday?: string;
  age?: number;
  goals: number;
  penaltiesScored: number;
  ownGoals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  score: number;
  disciplineScore: number;
  
  matchesPlayed: number;
  leagueMatchesPlayed: number;
  starts: number;
  penaltiesWon: number;

  goalsPerGame: number;
  assistsPerGame: number;
  
  matchesAsGK: number;
  conceded: number;
  concededPerGame: number;
}

// Helper to format float with 1 decimal place
const formatStat = (val: number, showZero = false) => {
   if (isNaN(val)) return '-';
   if (val === 0 && !showZero) return '-';
   if (Number.isInteger(val)) return val.toString();
   return val.toFixed(2);
};

// Helper to calculate age
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

// --- Sub-component: Player Detail View ---
interface SeasonStat {
  season: string;
  matchesPlayed: number;
  leagueMatchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  conceded: number;
  matchesAsGK: number;
  starts: number;
  ownGoals: number;
}

const PlayerDetailView: React.FC<{ 
  player: PlayerStats; 
  matches: MatchRecord[]; 
  seasons: string[]; 
  onBack: () => void 
}> = ({ player, matches, seasons, onBack }) => {

  // 1. Calculate Team Season Totals (Total matches per season for the team)
  const seasonTotals = useMemo(() => {
     const totals: Record<string, { total: number, league: number }> = {};
     matches.forEach(m => {
        if (!totals[m.season]) totals[m.season] = { total: 0, league: 0 };
        totals[m.season].total++;
        if (m.countForStats) totals[m.season].league++;
     });
     return totals;
  }, [matches]);
  
  // 2. Calculate Aggregated Career Stats & Detailed Season Stats for the Player
  const { careerStats, seasonStats } = useMemo(() => {
    const career = {
        matchesPlayed: 0,
        leagueMatchesPlayed: 0,
        goals: 0,
        assists: 0,
        ownGoals: 0
    };

    const stats: Record<string, SeasonStat> = {};
    
    matches.forEach(m => {
       // Check if player participated
       const inSquad = m.squad?.includes(player.name);
       if (!inSquad) return;

       // --- Update Career Stats ---
       career.matchesPlayed++;
       if (m.countForStats) career.leagueMatchesPlayed++;

       let g = 0, a = 0, og = 0;
       m.goalsDetails?.forEach(goal => {
          if (goal.scorer === player.name) g++;
          if (goal.assist === player.name) a++;
       });
       if (m.ownGoals?.includes(player.name)) og++;

       career.goals += g;
       career.assists += a;
       career.ownGoals += og;

       // --- Update Season Stats ---
       if (!stats[m.season]) {
          stats[m.season] = {
             season: m.season,
             matchesPlayed: 0,
             leagueMatchesPlayed: 0,
             goals: 0,
             assists: 0,
             yellowCards: 0,
             redCards: 0,
             conceded: 0,
             matchesAsGK: 0,
             starts: 0,
             ownGoals: 0
          };
       }
       
       const s = stats[m.season];
       s.matchesPlayed++;
       if (m.countForStats) s.leagueMatchesPlayed++;
       if (m.starters?.includes(player.name)) s.starts++;
       
       s.goals += g;
       s.assists += a;
       s.ownGoals += og;

       // Cards
       if (m.yellowCards?.includes(player.name)) s.yellowCards++;
       if (m.redCards?.includes(player.name)) s.redCards++;

       // GK Stats
       const gkStat = m.goalkeeperStats?.find(gk => gk.player === player.name);
       if (gkStat) {
          s.matchesAsGK++;
          s.conceded += gkStat.conceded;
       } else if (m.goalkeepers?.includes(player.name)) {
          s.matchesAsGK++;
          s.conceded += m.opponentScore;
       }
    });

    // Sort by season order
    const sortedStats = Object.values(stats).sort((a, b) => {
       const idxA = seasons.indexOf(a.season);
       const idxB = seasons.indexOf(b.season);
       if (idxA === -1) return 1;
       if (idxB === -1) return -1;
       return idxA - idxB;
    });

    return { careerStats: career, seasonStats: sortedStats };
  }, [matches, player.name, seasons]);

  // Helper for Rate
  const getRate = (val: number, total: number) => {
      if (total === 0) return '0%';
      return Math.round((val / total) * 100) + '%';
  };

  return (
    <div className="animate-fade-in space-y-6">
       <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">球员详情</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Profile Card */}
         <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col relative">
               {/* Decorative Header Background */}
               <div className="h-28 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
               </div>
               
               <div className="px-6 pb-6 flex-1 flex flex-col items-center -mt-14 text-center relative z-10">
                  {/* Avatar */}
                  <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-md mb-3">
                     <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {player.avatar ? <img src={player.avatar} className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-slate-400">{player.number || '#'}</span>}
                     </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800">{player.name}</h3>
                  {player.number && <span className="text-sm font-bold text-slate-400 font-mono mb-1">#{player.number}</span>}
                  
                  {player.birthday && (
                        <div className="mt-2 flex items-center text-slate-500 text-xs bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                           <Cake className="w-3 h-3 mr-1.5" />
                           {player.age} 岁
                        </div>
                  )}

                  <div className="w-full h-px bg-slate-100 my-6"></div>
                  
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 w-full text-left flex items-center">
                     <Trophy className="w-3 h-3 mr-1.5" />生涯数据汇总
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100">
                           <p className="text-xs text-slate-400 mb-1 font-bold">总场次</p>
                           <p className="text-2xl font-black text-slate-800">{careerStats.matchesPlayed}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 transition-colors hover:bg-blue-100">
                           <p className="text-xs text-blue-400 mb-1 font-bold">正式比赛</p>
                           <p className="text-2xl font-black text-blue-600">{careerStats.leagueMatchesPlayed}</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 transition-colors hover:bg-emerald-100">
                           <p className="text-xs text-emerald-600 mb-1 font-bold">总进球</p>
                           <p className="text-2xl font-black text-emerald-700">{careerStats.goals}</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 transition-colors hover:bg-indigo-100">
                           <p className="text-xs text-indigo-500 mb-1 font-bold">总助攻</p>
                           <p className="text-2xl font-black text-indigo-600">{careerStats.assists}</p>
                      </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Season Stats Table */}
         <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
               <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="font-bold text-slate-800 flex items-center">
                     <Calendar className="w-5 h-5 mr-2 text-slate-500" />
                     赛季数据概览
                  </h3>
               </div>
               <div className="overflow-x-auto flex-1">
                  <table className="w-full text-xs md:text-sm text-left">
                     <thead className="text-[10px] md:text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                        <tr>
                           <th className="px-3 md:px-4 py-3 font-bold whitespace-nowrap">赛季</th>
                           <th className="px-2 py-3 text-center whitespace-nowrap">总场次 (率)</th>
                           <th className="px-2 py-3 text-center whitespace-nowrap">正式比赛 (率)</th>
                           <th className="px-2 py-3 text-center whitespace-nowrap">首发 (率)</th>
                           <th className="px-2 py-3 text-center whitespace-nowrap">进球 (场均)</th>
                           <th className="px-2 py-3 text-center whitespace-nowrap">助攻 (场均)</th>
                           <th className="px-2 py-3 text-center whitespace-nowrap">乌龙</th>
                           <th className="px-2 py-3 text-center whitespace-nowrap">红/黄</th>
                           <th className="px-2 py-3 text-center whitespace-nowrap">失球 (场均)</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {seasonStats.length > 0 ? (
                           seasonStats.map((stat) => {
                              const totalMatches = seasonTotals[stat.season]?.total || 0;
                              const totalLeague = seasonTotals[stat.season]?.league || 0;
                              
                              const goalsPerGame = stat.leagueMatchesPlayed > 0 ? stat.goals / stat.leagueMatchesPlayed : 0;
                              const assistsPerGame = stat.leagueMatchesPlayed > 0 ? stat.assists / stat.leagueMatchesPlayed : 0;
                              
                              return (
                                <tr key={stat.season} className="hover:bg-blue-50/30 even:bg-slate-50/50 transition-colors">
                                   <td className="px-3 md:px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                                      {stat.season}
                                   </td>
                                   <td className="px-2 py-3 text-center">
                                      <div className="flex flex-col items-center">
                                          <span className="font-bold text-slate-800">{stat.matchesPlayed}</span>
                                          <span className="text-[10px] text-slate-400">
                                              ({getRate(stat.matchesPlayed, totalMatches)})
                                          </span>
                                      </div>
                                   </td>
                                   <td className="px-2 py-3 text-center">
                                      <div className="flex flex-col items-center">
                                          <span className="font-bold text-blue-600">{stat.leagueMatchesPlayed}</span>
                                          <span className="text-[10px] text-slate-400">
                                              ({getRate(stat.leagueMatchesPlayed, totalLeague)})
                                          </span>
                                      </div>
                                   </td>
                                   <td className="px-2 py-3 text-center">
                                      <div className="flex flex-col items-center">
                                          <span className="font-bold text-amber-600">{stat.starts}</span>
                                          <span className="text-[10px] text-slate-400">
                                             ({getRate(stat.starts, stat.matchesPlayed)})
                                          </span>
                                      </div>
                                   </td>
                                   <td className="px-2 py-3 text-center">
                                      {stat.goals > 0 ? (
                                         <div className="flex flex-col items-center">
                                            <span className="font-bold text-emerald-600">{stat.goals}</span>
                                            <span className="text-[10px] text-slate-400">{formatStat(goalsPerGame, true)}/场</span>
                                         </div>
                                      ) : <span className="text-slate-300">-</span>}
                                   </td>
                                   <td className="px-2 py-3 text-center">
                                      {stat.assists > 0 ? (
                                         <div className="flex flex-col items-center">
                                            <span className="font-bold text-indigo-500">{stat.assists}</span>
                                            <span className="text-[10px] text-slate-400">{formatStat(assistsPerGame, true)}/场</span>
                                         </div>
                                      ) : <span className="text-slate-300">-</span>}
                                   </td>
                                   <td className="px-2 py-3 text-center">
                                      {stat.ownGoals > 0 ? <span className="font-bold text-slate-700">{stat.ownGoals}</span> : <span className="text-slate-300">-</span>}
                                   </td>
                                   <td className="px-2 py-3 text-center">
                                       {(stat.yellowCards > 0 || stat.redCards > 0) ? (
                                          <div className="flex items-center justify-center gap-1">
                                             {stat.yellowCards > 0 && <span className="bg-yellow-100 text-yellow-800 px-1.5 rounded text-xs border border-yellow-200">{stat.yellowCards}</span>}
                                             {stat.redCards > 0 && <span className="bg-red-100 text-red-800 px-1.5 rounded text-xs border border-red-200">{stat.redCards}</span>}
                                          </div>
                                       ) : <span className="text-slate-300">-</span>}
                                   </td>
                                   <td className="px-2 py-3 text-center">
                                      {stat.matchesAsGK > 0 ? (
                                         <div className="flex flex-col items-center">
                                            <span className="font-bold text-slate-600">{stat.conceded}</span>
                                            <span className="text-[10px] text-slate-400">{formatStat(stat.conceded / stat.matchesAsGK, true)}/场</span>
                                         </div>
                                      ) : <span className="text-slate-300">-</span>}
                                   </td>
                                </tr>
                              );
                           })
                        ) : (
                           <tr>
                              <td colSpan={9} className="text-center py-12 text-slate-400 italic bg-slate-50/30">暂无赛季数据</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};


const PlayerManager: React.FC<PlayerManagerProps> = ({ players, matches, seasons, onAddPlayer, onRemovePlayer, onEditPlayer, currentUserRole }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [newPlayerBirthday, setNewPlayerBirthday] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(undefined);
  const [editError, setEditError] = useState<string | null>(null);

  // View Details State
  const [viewingPlayer, setViewingPlayer] = useState<PlayerStats | null>(null);

  // Sort State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'default', direction: 'desc' });
  
  // Season Filter State
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isReadOnly = currentUserRole === 'player';

  useEffect(() => {
     if (!selectedSeason && seasons.length > 0) {
         setSelectedSeason(seasons[0]);
     }
  }, [seasons]);

  const seasonFilteredMatches = useMemo(() => {
      if (!selectedSeason || selectedSeason === 'all') return matches;
      return matches.filter(m => m.season === selectedSeason);
  }, [matches, selectedSeason]);

  const totalMatches = seasonFilteredMatches.length;
  const totalLeagueMatches = seasonFilteredMatches.filter(m => !!m.countForStats).length;

  const playerStats = useMemo(() => {
    const statsMap: Record<string, PlayerStats> = {};
    
    players.forEach(p => {
      statsMap[p.name] = { 
        name: p.name, 
        number: p.number,
        avatar: p.avatar,
        birthday: p.birthday,
        age: calculateAge(p.birthday),
        goals: 0,
        penaltiesScored: 0,
        ownGoals: 0,
        assists: 0, 
        yellowCards: 0, 
        redCards: 0, 
        score: 0,
        disciplineScore: 0,
        matchesPlayed: 0,
        leagueMatchesPlayed: 0,
        starts: 0,
        penaltiesWon: 0,
        goalsPerGame: 0,
        assistsPerGame: 0,
        matchesAsGK: 0,
        conceded: 0,
        concededPerGame: 0
      };
    });

    seasonFilteredMatches.forEach(m => {
      const isFormal = !!m.countForStats;

      if (m.squad && Array.isArray(m.squad)) {
          m.squad.forEach(pName => {
              if (statsMap[pName]) {
                  statsMap[pName].matchesPlayed++;
                  if (isFormal) {
                      statsMap[pName].leagueMatchesPlayed++;
                  }
              }
          });
      }

      if (m.starters && Array.isArray(m.starters)) {
          m.starters.forEach(pName => {
              if (statsMap[pName]) {
                  statsMap[pName].starts++;
              }
          });
      }

      if (!isFormal) return;

      if (m.penaltiesWon && Array.isArray(m.penaltiesWon)) {
         m.penaltiesWon.forEach(pName => {
             if (statsMap[pName]) statsMap[pName].penaltiesWon++;
         });
      }
      
      if (m.ownGoals && Array.isArray(m.ownGoals)) {
         m.ownGoals.forEach(pName => {
            if (statsMap[pName]) statsMap[pName].ownGoals++;
         });
      }

      m.goalsDetails?.forEach(g => {
        if (statsMap[g.scorer]) {
            statsMap[g.scorer].goals++;
            if (g.isPenalty) {
                statsMap[g.scorer].penaltiesScored++;
            }
        }
        if (g.assist && statsMap[g.assist]) statsMap[g.assist].assists++;
      });

      m.yellowCards?.forEach(p => {
        if (statsMap[p]) statsMap[p].yellowCards++;
      });
      m.redCards?.forEach(p => {
        if (statsMap[p]) statsMap[p].redCards++;
      });

      if (m.goalkeeperStats && m.goalkeeperStats.length > 0) {
          m.goalkeeperStats.forEach(stat => {
              if (statsMap[stat.player]) {
                  statsMap[stat.player].matchesAsGK++;
                  statsMap[stat.player].conceded += stat.conceded;
              }
          });
      } else if (m.goalkeepers && Array.isArray(m.goalkeepers)) {
          m.goalkeepers.forEach(gkName => {
              if (statsMap[gkName]) {
                  statsMap[gkName].matchesAsGK++;
                  statsMap[gkName].conceded += m.opponentScore;
              }
          });
      }
    });

    Object.values(statsMap).forEach(s => {
      s.goalsPerGame = s.leagueMatchesPlayed > 0 ? s.goals / s.leagueMatchesPlayed : 0;
      s.assistsPerGame = s.leagueMatchesPlayed > 0 ? s.assists / s.leagueMatchesPlayed : 0;
      s.concededPerGame = s.matchesAsGK > 0 ? s.conceded / s.matchesAsGK : 0;
      s.disciplineScore = (s.redCards * 3) + s.yellowCards;
    });

    return Object.values(statsMap);
  }, [players, seasonFilteredMatches]);

  const sortedStats = useMemo(() => {
    const sorted = [...playerStats];
    sorted.sort((a, b) => {
        if (sortConfig.key === 'default') {
             const rateA = totalMatches > 0 ? a.matchesPlayed / totalMatches : 0;
             const rateB = totalMatches > 0 ? b.matchesPlayed / totalMatches : 0;
             if (rateA !== rateB) return rateB - rateA;

             const lRateA = totalLeagueMatches > 0 ? a.leagueMatchesPlayed / totalLeagueMatches : 0;
             const lRateB = totalLeagueMatches > 0 ? b.leagueMatchesPlayed / totalLeagueMatches : 0;
             if (lRateA !== lRateB) return lRateB - lRateA;

             if (a.goals !== b.goals) return b.goals - a.goals;
             if (a.assists !== b.assists) return b.assists - a.assists;
             return a.name.localeCompare(b.name);
        }

        const valA = a[sortConfig.key as keyof PlayerStats];
        const valB = b[sortConfig.key as keyof PlayerStats];

        if (valA === undefined || valB === undefined) return 0;
        
        if (typeof valA === 'string' && typeof valB === 'string') {
             return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
    return sorted;
  }, [playerStats, sortConfig, totalMatches, totalLeagueMatches]);

  const filteredStats = sortedStats.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.number && p.number.includes(searchTerm))
  );

  const topScorer = useMemo(() => [...playerStats].sort((a, b) => b.goals - a.goals)[0], [playerStats]);
  const topAssister = useMemo(() => [...playerStats].sort((a, b) => b.assists - a.assists)[0], [playerStats]);
  const mostUnlucky = useMemo(() => {
     const unluckiest = [...playerStats].sort((a, b) => b.ownGoals - a.ownGoals)[0];
     return unluckiest && unluckiest.ownGoals > 0 ? unluckiest : null;
  }, [playerStats]);
  
  const bestGoalkeeper = useMemo(() => {
      const gks = playerStats.filter(p => p.matchesAsGK > 0);
      if (gks.length === 0) return null;
      
      return gks.sort((a, b) => {
          if (a.concededPerGame !== b.concededPerGame) return a.concededPerGame - b.concededPerGame;
          return b.matchesAsGK - a.matchesAsGK;
      })[0];
  }, [playerStats]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key) {
        if (sortConfig.direction === 'desc') direction = 'asc';
    } else {
        if (key === 'name') direction = 'asc';
        if (key === 'age') direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("图片太大，请选择小于 2MB 的图片");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_SIZE = 150;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        setEditAvatar(canvas.toDataURL('image/jpeg', 0.8));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (isReadOnly) return;
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) {
      setError('请输入球员姓名');
      return;
    }
    if (players.some(p => p.name === trimmedName)) {
      setError('该球员已存在');
      return;
    }
    onAddPlayer({ name: trimmedName, number: newPlayerNumber.trim(), birthday: newPlayerBirthday });
    setNewPlayerName('');
    setNewPlayerNumber('');
    setNewPlayerBirthday('');
    setError(null);
  };

  const startEditing = (player: PlayerProfile) => {
    if (isReadOnly) return;
    setEditingPlayer(player.name);
    setEditName(player.name);
    setEditNumber(player.number || '');
    setEditBirthday(player.birthday || '');
    setEditAvatar(player.avatar); 
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingPlayer(null);
    setEditName('');
    setEditNumber('');
    setEditBirthday('');
    setEditAvatar(undefined);
    setEditError(null);
  };

  const saveEdit = () => {
    if (isReadOnly) return;
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditError('姓名不能为空');
      return;
    }
    if (trimmedName !== editingPlayer && players.some(p => p.name === trimmedName)) {
      setEditError('该球员名已存在');
      return;
    }
    if (editingPlayer) {
      onEditPlayer(editingPlayer, { 
        name: trimmedName, 
        number: editNumber.trim(),
        avatar: editAvatar,
        birthday: editBirthday
      });
      cancelEditing();
    }
  };

  const RateBar = ({ val, total, colorClass = "bg-slate-800" }: { val: number, total: number, colorClass?: string }) => {
     const rate = total > 0 ? Math.round((val / total) * 100) : 0;
     return (
        <div className="flex flex-col gap-1 w-full max-w-[50px] md:max-w-[80px] mx-auto">
           <div className="flex justify-between text-[10px] md:text-xs">
              <span className="font-bold text-slate-700">{val}</span>
              <span className="text-slate-400">{rate}%</span>
           </div>
           <div className="h-1 md:h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${rate}%` }}></div>
           </div>
        </div>
     );
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
     if (sortConfig.key !== colKey) return <ArrowUpDown className="w-2 h-2 md:w-3 md:h-3 opacity-30 ml-1" />;
     return sortConfig.direction === 'asc' ? <ArrowUp className="w-2 h-2 md:w-3 md:h-3 ml-1 text-slate-800" /> : <ArrowDown className="w-2 h-2 md:w-3 md:h-3 ml-1 text-slate-800" />;
  };

  // If viewing details, show detail component
  if (viewingPlayer) {
    return <PlayerDetailView player={viewingPlayer} matches={matches} seasons={seasons} onBack={() => setViewingPlayer(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shirt className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            球员数据管理
          </h2>
          <p className="text-slate-500 mt-1">
             本赛季共 {seasonFilteredMatches.length} 场比赛（正式比赛 {totalLeagueMatches} 场）
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
           <div className="relative w-full md:w-auto">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <select 
                 value={selectedSeason}
                 onChange={(e) => setSelectedSeason(e.target.value)}
                 className="w-full md:w-56 pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 outline-none shadow-sm text-sm appearance-none bg-white cursor-pointer"
                 style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              >
                  <option value="all">所有赛季</option>
                  {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>

           <div className="relative w-full md:w-auto flex-1 md:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索姓名或号码..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-48 pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 outline-none shadow-sm text-sm"
                style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              />
           </div>
           
           {!isReadOnly && (
               <button 
                  onClick={() => document.getElementById('add-player-row')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hidden md:flex items-center px-4 py-2 text-white rounded-lg shadow-sm font-medium hover:brightness-110 transition-all text-sm"
                  style={{ backgroundColor: 'var(--primary)' }}
               >
                  <Plus className="w-4 h-4 mr-2" />
                  添加球员
               </button>
           )}
        </div>
      </div>

      {/* Hall of Fame - Compact Grid on Mobile */}
      {playerStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
           {/* Top Scorer */}
           <div className="bg-white p-3 md:p-4 rounded-xl border border-yellow-100 shadow-sm flex items-center gap-3 md:gap-4 relative overflow-hidden">
               <div className="absolute right-0 bottom-0 opacity-10">
                  <Trophy className="w-16 h-16 md:w-24 md:h-24 text-yellow-500" />
               </div>
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold border border-yellow-200 overflow-hidden shrink-0">
                  {topScorer?.avatar ? <img src={topScorer.avatar} className="w-full h-full object-cover"/> : topScorer?.name.charAt(0)}
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] md:text-xs font-bold text-yellow-600 uppercase tracking-wider truncate">最佳射手</p>
                  <h3 className="text-sm md:text-lg font-bold text-slate-800 truncate">{topScorer?.name || '-'}</h3>
                  <p className="text-xs md:text-sm text-slate-500">{topScorer?.goals || 0} 进球</p>
               </div>
           </div>

           {/* Top Assister */}
           <div className="bg-white p-3 md:p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3 md:gap-4 relative overflow-hidden">
               <div className="absolute right-0 bottom-0 opacity-10">
                  <Zap className="w-16 h-16 md:w-24 md:h-24 text-blue-500" />
               </div>
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 overflow-hidden shrink-0">
                  {topAssister?.avatar ? <img src={topAssister.avatar} className="w-full h-full object-cover"/> : topAssister?.name.charAt(0)}
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-wider truncate">助攻王</p>
                  <h3 className="text-sm md:text-lg font-bold text-slate-800 truncate">{topAssister?.name || '-'}</h3>
                  <p className="text-xs md:text-sm text-slate-500">{topAssister?.assists || 0} 助攻</p>
               </div>
           </div>

           {/* Best Goalkeeper */}
           <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 relative overflow-hidden">
               <div className="absolute right-0 bottom-0 opacity-10">
                  <Shield className="w-16 h-16 md:w-24 md:h-24 text-slate-500" />
               </div>
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 overflow-hidden shrink-0">
                  {bestGoalkeeper?.avatar ? <img src={bestGoalkeeper.avatar} className="w-full h-full object-cover"/> : (bestGoalkeeper?.name.charAt(0) || '-')}
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">最佳守门员</p>
                  <h3 className="text-sm md:text-lg font-bold text-slate-800 truncate">{bestGoalkeeper?.name || '-'}</h3>
                  <p className="text-xs md:text-sm text-slate-500 truncate">
                     场均失 {bestGoalkeeper ? formatStat(bestGoalkeeper.concededPerGame, true) : '-'} 球
                  </p>
               </div>
           </div>

           {/* Unlucky Player */}
           <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 relative overflow-hidden">
               <div className="absolute right-0 bottom-0 opacity-10">
                  <HeartCrack className="w-16 h-16 md:w-24 md:h-24 text-slate-600" />
               </div>
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 overflow-hidden shrink-0">
                  {mostUnlucky?.avatar ? <img src={mostUnlucky.avatar} className="w-full h-full object-cover"/> : (mostUnlucky?.name.charAt(0) || '-')}
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">不幸的球员</p>
                  <h3 className="text-sm md:text-lg font-bold text-slate-800 truncate">{mostUnlucky?.name || '-'}</h3>
                  <p className="text-xs md:text-sm text-slate-500 truncate">
                     {mostUnlucky ? `${mostUnlucky.ownGoals} 乌龙` : '暂无数据'}
                  </p>
               </div>
           </div>
        </div>
      )}

      {/* Main Table View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-xs md:text-sm text-left">
              <thead className="text-[10px] md:text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                 <tr>
                    <th className="px-2 md:px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors group sticky left-0 bg-slate-50 z-20 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] md:shadow-none" onClick={() => handleSort('name')}>
                       <div className="flex items-center">球员 <SortIcon colKey="name" /></div>
                    </th>
                    <th className="px-1 md:px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center whitespace-nowrap" onClick={() => handleSort('age')}>
                       <div className="flex items-center justify-center">年龄 <SortIcon colKey="age" /></div>
                    </th>
                    <th className="px-1 md:px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center w-20 md:w-28 whitespace-nowrap" onClick={() => handleSort('matchesPlayed')}>
                       <div className="flex items-center justify-center">总场次 <SortIcon colKey="matchesPlayed" /></div>
                    </th>
                    <th className="px-1 md:px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center w-20 md:w-28 whitespace-nowrap" onClick={() => handleSort('leagueMatchesPlayed')}>
                       <div className="flex items-center justify-center">正式比赛 <SortIcon colKey="leagueMatchesPlayed" /></div>
                    </th>
                    <th className="px-1 md:px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center whitespace-nowrap" onClick={() => handleSort('starts')}>
                       <div className="flex items-center justify-center">首发 <SortIcon colKey="starts" /></div>
                    </th>
                    <th className="px-1 md:px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center bg-slate-100/50 whitespace-nowrap" onClick={() => handleSort('goals')}>
                       <div className="flex items-center justify-center">进球 <SortIcon colKey="goals" /></div>
                    </th>
                    <th className="px-1 md:px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center bg-slate-100/50 whitespace-nowrap" onClick={() => handleSort('assists')}>
                       <div className="flex items-center justify-center">助攻 <SortIcon colKey="assists" /></div>
                    </th>
                    <th className="px-1 md:px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center whitespace-nowrap" onClick={() => handleSort('ownGoals')}>
                       <div className="flex items-center justify-center">乌龙 <SortIcon colKey="ownGoals" /></div>
                    </th>
                    <th className="px-1 md:px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center whitespace-nowrap" onClick={() => handleSort('disciplineScore')}>
                       <div className="flex items-center justify-center">红黄牌 <SortIcon colKey="disciplineScore" /></div>
                    </th>
                    <th className="px-1 md:px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center whitespace-nowrap" onClick={() => handleSort('conceded')}>
                       <div className="flex items-center justify-center gap-1 text-slate-400 group-hover:text-slate-600" title="仅统计作为守门员时的失球">
                           <Shield className="w-3 h-3" />
                           失球 <SortIcon colKey="conceded" />
                       </div>
                    </th>
                    <th className="px-2 md:px-4 py-3 text-center whitespace-nowrap">操作</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredStats.map((player) => (
                    <tr key={player.name} className="hover:bg-blue-50/50 even:bg-slate-50/50 transition-colors group">
                       <td className="px-2 md:px-4 py-3 sticky left-0 bg-white group-hover:bg-blue-50/20 group-even:bg-slate-50/50 z-20 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] md:shadow-none border-r border-slate-100 md:border-none">
                          <div className="flex items-center gap-2 md:gap-3">
                             <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 font-bold text-slate-400 text-xs md:text-sm">
                                {player.avatar ? <img src={player.avatar} className="w-full h-full object-cover"/> : player.number || '#'}
                             </div>
                             <div>
                                <div className="font-bold text-slate-800 text-xs md:text-sm">{player.name}</div>
                                {player.number && <div className="text-[10px] text-slate-400 font-mono">#{player.number}</div>}
                             </div>
                          </div>
                       </td>
                       <td className="px-1 md:px-2 py-3 text-slate-600 text-center text-xs md:text-sm">
                          {player.age ? player.age : '-'}
                       </td>
                       <td className="px-1 md:px-2 py-3">
                          <div className="flex justify-center">
                             <RateBar val={player.matchesPlayed} total={totalMatches} colorClass="bg-emerald-500" />
                          </div>
                       </td>
                       <td className="px-1 md:px-2 py-3">
                          <div className="flex justify-center">
                              <RateBar val={player.leagueMatchesPlayed} total={totalLeagueMatches} colorClass="bg-blue-500" />
                          </div>
                       </td>
                       <td className="px-1 md:px-2 py-3 text-center text-xs md:text-sm">
                          {player.starts > 0 ? (
                              <div className="flex flex-col items-center">
                                  <span className="font-bold text-slate-700">{player.starts}</span>
                                  <span className="text-[10px] text-slate-400">
                                     {player.matchesPlayed > 0 ? Math.round((player.starts / player.matchesPlayed) * 100) : 0}%
                                  </span>
                              </div>
                          ) : (
                              <span className="text-slate-300">-</span>
                          )}
                       </td>
                       <td className="px-1 md:px-2 py-3 text-center bg-slate-50/30 text-xs md:text-sm">
                          <div className="flex flex-col">
                              <span className="font-bold text-slate-800">
                                 {player.goals} 
                                 {player.penaltiesScored > 0 && <span className="text-slate-400 text-[10px] ml-0.5">({player.penaltiesScored})</span>}
                              </span>
                              <span className="text-[10px] text-slate-400 hidden md:inline">{formatStat(player.goalsPerGame)} / 场</span>
                          </div>
                       </td>
                       <td className="px-1 md:px-2 py-3 text-center bg-slate-50/30 text-xs md:text-sm">
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{player.assists}</span>
                              <span className="text-[10px] text-slate-400 hidden md:inline">{formatStat(player.assistsPerGame)} / 场</span>
                          </div>
                       </td>
                       <td className="px-1 md:px-2 py-3 text-center text-xs md:text-sm">
                           {player.ownGoals > 0 ? (
                               <span className="font-bold text-slate-700">{player.ownGoals}</span>
                           ) : (
                               <span className="text-slate-300">-</span>
                           )}
                       </td>
                       <td className="px-1 md:px-2 py-3 text-center">
                           <div className="flex items-center justify-center gap-1">
                               {player.yellowCards > 0 && (
                                   <div className="flex items-center bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 text-[10px] md:text-xs font-bold" title="黄牌">
                                       <div className="w-1.5 h-2 md:w-2 md:h-3 bg-yellow-400 mr-1 rounded-[1px] border border-black/10"></div>
                                       {player.yellowCards}
                                   </div>
                               )}
                               {player.redCards > 0 && (
                                   <div className="flex items-center bg-red-100 text-red-800 px-1.5 py-0.5 rounded border border-red-200 text-[10px] md:text-xs font-bold" title="红牌">
                                       <div className="w-1.5 h-2 md:w-2 md:h-3 bg-red-500 mr-1 rounded-[1px] border border-black/10"></div>
                                       {player.redCards}
                                   </div>
                               )}
                               {player.yellowCards === 0 && player.redCards === 0 && (
                                   <span className="text-slate-300">-</span>
                               )}
                           </div>
                       </td>
                       <td className="px-1 md:px-2 py-3 text-center text-xs md:text-sm">
                          {player.matchesAsGK > 0 ? (
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-600">{player.conceded}</span>
                                <span className="text-[10px] text-slate-400 hidden md:inline">{formatStat(player.concededPerGame)} / 场</span>
                             </div>
                          ) : (
                             <span className="text-slate-200">-</span>
                          )}
                       </td>
                       <td className="px-2 md:px-4 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                                <button 
                                    onClick={() => setViewingPlayer(player)}
                                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                                    title="查看详情"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                {!isReadOnly && (
                                    <>
                                        <button 
                                            onClick={() => startEditing({ name: player.name, number: player.number, avatar: player.avatar, birthday: player.birthday })}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="编辑"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onRemovePlayer(player.name)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="删除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                       </td>
                    </tr>
                 ))}
                 {filteredStats.length === 0 && (
                    <tr>
                       <td colSpan={11} className="text-center py-12 text-slate-400">
                          <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p>暂无符合条件的球员</p>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
        
        {/* Quick Add Row (Footer) */}
        {!isReadOnly && (
           <div id="add-player-row" className="bg-slate-50 border-t border-slate-200 p-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 md:gap-4 max-w-4xl mx-auto">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 lg:mr-2 text-center lg:text-left">快速添加</div>
                 
                 <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newPlayerNumber}
                        onChange={(e) => setNewPlayerNumber(e.target.value)}
                        placeholder="#"
                        className="w-16 md:w-20 p-2.5 border border-slate-300 rounded-lg text-sm text-center focus:ring-2 outline-none"
                        style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                    />
                    <input 
                        type="text" 
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="球员姓名"
                        className="flex-1 w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 outline-none"
                        style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                    />
                 </div>
                 
                 <div className="relative w-full lg:w-40">
                    <input 
                       type="date" 
                       value={newPlayerBirthday}
                       onChange={(e) => setNewPlayerBirthday(e.target.value)}
                       className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 outline-none"
                       style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                       placeholder="生日"
                    />
                 </div>
                 <button 
                    onClick={handleAdd}
                    className="w-full lg:w-auto px-6 py-2.5 text-white font-medium rounded-lg shadow-sm hover:brightness-110 transition-all flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--primary)' }}
                 >
                    <Plus className="w-4 h-4 mr-2" />
                    确认添加
                 </button>
              </div>
              {error && <p className="text-center text-xs text-red-500 mt-2">{error}</p>}
           </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">编辑球员</h3>
              <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
               {/* Avatar Upload */}
               <div className="flex flex-col items-center mb-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 relative overflow-hidden group"
                  >
                     {editAvatar ? (
                       <img src={editAvatar} className="w-full h-full object-cover" />
                     ) : (
                       <Camera className="w-6 h-6 text-slate-400" />
                     )}
                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                        {editAvatar && <Pencil className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />}
                     </div>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-600 font-bold mt-2 hover:underline"
                  >
                    {editAvatar ? '更换头像' : '上传头像'}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">球衣号码</label>
                  <input 
                    type="text" 
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                    placeholder="#"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">球员姓名</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                  {editError && <p className="text-sm text-red-500 mt-1">{editError}</p>}
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">生日</label>
                  <input 
                    type="date" 
                    value={editBirthday}
                    onChange={(e) => setEditBirthday(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                  />
               </div>
               <div className="flex gap-3">
                 <button 
                   onClick={cancelEditing}
                   className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                 >
                   取消
                 </button>
                 <button 
                   onClick={saveEdit}
                   className="flex-1 py-2 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                   style={{ backgroundColor: 'var(--primary)' }}
                 >
                   <Check className="w-4 h-4 mr-1" />
                   保存
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
