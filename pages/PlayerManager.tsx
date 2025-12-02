
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Shirt, Plus, Trash2, Search, Pencil, X, Check, User, Trophy, Zap, Camera, ArrowUpDown, ArrowUp, ArrowDown, Shield, Filter, HeartCrack, Cake } from 'lucide-react';
import { PlayerManagerProps, PlayerProfile } from '../types';

interface PlayerStats {
  name: string;
  number?: string;
  avatar?: string;
  birthday?: string;
  age?: number;
  goals: number;
  penaltiesScored: number; // New: Goals that are penalties
  ownGoals: number; // New: Own Goals
  assists: number;
  yellowCards: number;
  redCards: number;
  score: number;
  disciplineScore: number; // For sorting cards
  
  // Participation
  matchesPlayed: number; // Total appearances (Internal + Formal)
  leagueMatchesPlayed: number; // Formal/Stats-Counting matches only
  starts: number; // All starts (Internal + Formal)
  penaltiesWon: number; // New: Penalties won

  // Advanced Stats (Calculated based on Formal Matches)
  goalsPerGame: number;
  assistsPerGame: number;
  
  // GK Stats (Formal Matches only)
  matchesAsGK: number;
  conceded: number;
  concededPerGame: number;
}

// Helper to format float with 1 decimal place, return '-' if 0 or NaN
const formatStat = (val: number, showZero = false) => {
   if (isNaN(val)) return '-';
   if (val === 0 && !showZero) return '-';
   // Check if integer
   if (Number.isInteger(val)) return val.toString();
   return val.toFixed(2);
};

// Helper to calculate age from birthday
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

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, matches, seasons, onAddPlayer, onRemovePlayer, onEditPlayer, currentUserRole }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [newPlayerBirthday, setNewPlayerBirthday] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null); // Stores name of player being edited
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(undefined);
  const [editError, setEditError] = useState<string | null>(null);

  // Sort State: Default is custom 'default' logic
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'default', direction: 'desc' });
  
  // Season Filter State
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Permission Check: Player role is Read-Only
  const isReadOnly = currentUserRole === 'player';

  useEffect(() => {
     if (!selectedSeason && seasons.length > 0) {
         setSelectedSeason(seasons[0]);
     }
  }, [seasons]);

  // Filter matches based on selected season
  const seasonFilteredMatches = useMemo(() => {
      if (!selectedSeason || selectedSeason === 'all') return matches;
      return matches.filter(m => m.season === selectedSeason);
  }, [matches, selectedSeason]);

  // Calculate Totals for Rates
  const totalMatches = seasonFilteredMatches.length;
  // LOGIC CHANGE: Count 'Formal' matches based on countForStats flag
  const totalLeagueMatches = seasonFilteredMatches.filter(m => !!m.countForStats).length;

  // Stats Calculation
  const playerStats = useMemo(() => {
    const statsMap: Record<string, PlayerStats> = {};
    
    // Initialize
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

    // Compute from matches (Filtered by Season)
    seasonFilteredMatches.forEach(m => {
      // LOGIC CHANGE: Count stats only for matches marked as countForStats
      const isFormal = !!m.countForStats;

      // Participation Tracking
      if (m.squad && Array.isArray(m.squad)) {
          m.squad.forEach(pName => {
              if (statsMap[pName]) {
                  // Always increment total matches played (for attendance)
                  statsMap[pName].matchesPlayed++;
                  
                  // Only increment formal matches if isFormal
                  if (isFormal) {
                      statsMap[pName].leagueMatchesPlayed++;
                  }
              }
          });
      }

      // Starts - Counted for ALL matches now (per user request)
      if (m.starters && Array.isArray(m.starters)) {
          m.starters.forEach(pName => {
              if (statsMap[pName]) {
                  statsMap[pName].starts++;
              }
          });
      }

      // --- CRITICAL UPDATE: Only count stats below for Formal Matches ---
      if (!isFormal) return;

      // Penalties Won
      if (m.penaltiesWon && Array.isArray(m.penaltiesWon)) {
         m.penaltiesWon.forEach(pName => {
             if (statsMap[pName]) statsMap[pName].penaltiesWon++;
         });
      }
      
      // Own Goals
      if (m.ownGoals && Array.isArray(m.ownGoals)) {
         m.ownGoals.forEach(pName => {
            if (statsMap[pName]) statsMap[pName].ownGoals++;
         });
      }

      // Goals & Assists
      m.goalsDetails?.forEach(g => {
        if (statsMap[g.scorer]) {
            statsMap[g.scorer].goals++;
            if (g.isPenalty) {
                statsMap[g.scorer].penaltiesScored++;
            }
        }
        if (g.assist && statsMap[g.assist]) statsMap[g.assist].assists++;
      });

      // Cards
      m.yellowCards?.forEach(p => {
        if (statsMap[p]) statsMap[p].yellowCards++;
      });
      m.redCards?.forEach(p => {
        if (statsMap[p]) statsMap[p].redCards++;
      });

      // GK Stats (Conceded) - UPDATED LOGIC
      // Priority 1: Use specific goalkeeperStats if available
      if (m.goalkeeperStats && m.goalkeeperStats.length > 0) {
          m.goalkeeperStats.forEach(stat => {
              if (statsMap[stat.player]) {
                  statsMap[stat.player].matchesAsGK++;
                  statsMap[stat.player].conceded += stat.conceded;
              }
          });
      } 
      // Priority 2: Fallback to old simple list (assign full score)
      else if (m.goalkeepers && Array.isArray(m.goalkeepers)) {
          m.goalkeepers.forEach(gkName => {
              if (statsMap[gkName]) {
                  statsMap[gkName].matchesAsGK++;
                  statsMap[gkName].conceded += m.opponentScore;
              }
          });
      }
    });

    // Final Calculations
    Object.values(statsMap).forEach(s => {
      // Rates - Denominator is now leagueMatchesPlayed (Formal Matches) for goals/assists
      s.goalsPerGame = s.leagueMatchesPlayed > 0 ? s.goals / s.leagueMatchesPlayed : 0;
      s.assistsPerGame = s.leagueMatchesPlayed > 0 ? s.assists / s.leagueMatchesPlayed : 0;
      
      // GK Stats
      s.concededPerGame = s.matchesAsGK > 0 ? s.conceded / s.matchesAsGK : 0;
      
      // Discipline Score (Red = 3, Yellow = 1) for sorting
      s.disciplineScore = (s.redCards * 3) + s.yellowCards;

      // Simple score (optional usage)
      s.score = (s.goals * 2) + (s.assists * 1.5) + (s.leagueMatchesPlayed * 0.1) - (s.yellowCards * 1) - (s.redCards * 3);
    });

    return Object.values(statsMap);
  }, [players, seasonFilteredMatches]);

  const sortedStats = useMemo(() => {
    const sorted = [...playerStats];
    sorted.sort((a, b) => {
        // Default hierarchical sort
        if (sortConfig.key === 'default') {
             // 1. Total Participation Rate (desc)
             const rateA = totalMatches > 0 ? a.matchesPlayed / totalMatches : 0;
             const rateB = totalMatches > 0 ? b.matchesPlayed / totalMatches : 0;
             if (rateA !== rateB) return rateB - rateA;

             // 2. Formal (League) Participation Rate (desc)
             const lRateA = totalLeagueMatches > 0 ? a.leagueMatchesPlayed / totalLeagueMatches : 0;
             const lRateB = totalLeagueMatches > 0 ? b.leagueMatchesPlayed / totalLeagueMatches : 0;
             if (lRateA !== lRateB) return lRateB - lRateA;

             // 3. Goals (desc)
             if (a.goals !== b.goals) return b.goals - a.goals;

             // 4. Assists (desc)
             if (a.assists !== b.assists) return b.assists - a.assists;

             // 5. Name (asc)
             return a.name.localeCompare(b.name);
        }

        // Standard Sort
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
  
  // Best Goalkeeper Logic: Played > 0 matches as GK, sorted by concededPerGame (ASC), then matchesAsGK (DESC)
  const bestGoalkeeper = useMemo(() => {
      const gks = playerStats.filter(p => p.matchesAsGK > 0);
      if (gks.length === 0) return null;
      
      return gks.sort((a, b) => {
          if (a.concededPerGame !== b.concededPerGame) return a.concededPerGame - b.concededPerGame;
          return b.matchesAsGK - a.matchesAsGK;
      })[0];
  }, [playerStats]);

  // Handlers
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    
    // If clicking same key, toggle
    if (sortConfig.key === key) {
        if (sortConfig.direction === 'desc') direction = 'asc';
    } else {
        // If clicking a new key, string defaults to asc, numbers to desc. 
        // But for simplicity, let's default numbers (stats) to desc. Name to asc.
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

  // Helper for RateBar
  const RateBar = ({ val, total, colorClass = "bg-slate-800" }: { val: number, total: number, colorClass?: string }) => {
     const rate = total > 0 ? Math.round((val / total) * 100) : 0;
     return (
        <div className="flex flex-col gap-1 w-20">
           <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">{val}</span>
              <span className="text-slate-400">{rate}%</span>
           </div>
           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${rate}%` }}></div>
           </div>
        </div>
     );
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
     if (sortConfig.key !== colKey) return <ArrowUpDown className="w-3 h-3 opacity-30 ml-1" />;
     return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-slate-800" /> : <ArrowDown className="w-3 h-3 ml-1 text-slate-800" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative pb-20">
      
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
           {/* Season Filter */}
           <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <select 
                 value={selectedSeason}
                 onChange={(e) => setSelectedSeason(e.target.value)}
                 className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 outline-none w-56 shadow-sm text-sm appearance-none bg-white cursor-pointer"
                 style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              >
                  <option value="all">所有赛季</option>
                  {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>

           <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索姓名或号码..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 outline-none w-48 shadow-sm text-sm"
                style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              />
           </div>
           
           {!isReadOnly && (
               <button 
                  onClick={() => document.getElementById('add-player-row')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center px-4 py-2 text-white rounded-lg shadow-sm font-medium hover:brightness-110 transition-all text-sm"
                  style={{ backgroundColor: 'var(--primary)' }}
               >
                  <Plus className="w-4 h-4 mr-2" />
                  添加球员
               </button>
           )}
        </div>
      </div>

      {/* Hall of Fame */}
      {playerStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
           {/* Top Scorer */}
           <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
               <div className="absolute right-0 bottom-0 opacity-10">
                  <Trophy className="w-24 h-24 text-yellow-500" />
               </div>
               <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold border border-yellow-200 overflow-hidden shrink-0">
                  {topScorer?.avatar ? <img src={topScorer.avatar} className="w-full h-full object-cover"/> : topScorer?.name.charAt(0)}
               </div>
               <div>
                  <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">最佳射手</p>
                  <h3 className="text-lg font-bold text-slate-800 truncate max-w-[120px]">{topScorer?.name || '-'}</h3>
                  <p className="text-sm text-slate-500">{topScorer?.goals || 0} 进球</p>
               </div>
           </div>

           {/* Top Assister */}
           <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
               <div className="absolute right-0 bottom-0 opacity-10">
                  <Zap className="w-24 h-24 text-blue-500" />
               </div>
               <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 overflow-hidden shrink-0">
                  {topAssister?.avatar ? <img src={topAssister.avatar} className="w-full h-full object-cover"/> : topAssister?.name.charAt(0)}
               </div>
               <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">助攻王</p>
                  <h3 className="text-lg font-bold text-slate-800 truncate max-w-[120px]">{topAssister?.name || '-'}</h3>
                  <p className="text-sm text-slate-500">{topAssister?.assists || 0} 助攻</p>
               </div>
           </div>

           {/* Best Goalkeeper */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
               <div className="absolute right-0 bottom-0 opacity-10">
                  <Shield className="w-24 h-24 text-slate-500" />
               </div>
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 overflow-hidden shrink-0">
                  {bestGoalkeeper?.avatar ? <img src={bestGoalkeeper.avatar} className="w-full h-full object-cover"/> : (bestGoalkeeper?.name.charAt(0) || '-')}
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">最佳守门员</p>
                  <h3 className="text-lg font-bold text-slate-800 truncate max-w-[120px]">{bestGoalkeeper?.name || '-'}</h3>
                  <p className="text-sm text-slate-500">
                     场均失 {bestGoalkeeper ? formatStat(bestGoalkeeper.concededPerGame, true) : '-'} 球
                  </p>
               </div>
           </div>

           {/* Unlucky Player */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
               <div className="absolute right-0 bottom-0 opacity-10">
                  <HeartCrack className="w-24 h-24 text-slate-600" />
               </div>
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 overflow-hidden shrink-0">
                  {mostUnlucky?.avatar ? <img src={mostUnlucky.avatar} className="w-full h-full object-cover"/> : (mostUnlucky?.name.charAt(0) || '-')}
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">不幸的球员</p>
                  <h3 className="text-lg font-bold text-slate-800 truncate max-w-[120px]">{mostUnlucky?.name || '-'}</h3>
                  <p className="text-sm text-slate-500">
                     {mostUnlucky ? `${mostUnlucky.ownGoals} 乌龙` : '暂无数据'}
                  </p>
               </div>
           </div>
        </div>
      )}

      {/* Main Table View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                 <tr>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors group sticky left-0 bg-slate-50 z-10 whitespace-nowrap" onClick={() => handleSort('name')}>
                       <div className="flex items-center">球员 <SortIcon colKey="name" /></div>
                    </th>
                    <th className="px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center" onClick={() => handleSort('age')}>
                       <div className="flex items-center justify-center">年龄 <SortIcon colKey="age" /></div>
                    </th>
                    <th className="px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center" onClick={() => handleSort('matchesPlayed')}>
                       <div className="flex items-center justify-center">总场次 <SortIcon colKey="matchesPlayed" /></div>
                    </th>
                    <th className="px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center" onClick={() => handleSort('leagueMatchesPlayed')}>
                       <div className="flex items-center justify-center">正式赛 <SortIcon colKey="leagueMatchesPlayed" /></div>
                    </th>
                    <th className="px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center" onClick={() => handleSort('starts')}>
                       <div className="flex items-center justify-center">首发 <SortIcon colKey="starts" /></div>
                    </th>
                    <th className="px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center bg-slate-100/50" onClick={() => handleSort('goals')}>
                       <div className="flex items-center justify-center">进球 <SortIcon colKey="goals" /></div>
                    </th>
                    <th className="px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center bg-slate-100/50" onClick={() => handleSort('assists')}>
                       <div className="flex items-center justify-center">助攻 <SortIcon colKey="assists" /></div>
                    </th>
                    <th className="px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center" onClick={() => handleSort('ownGoals')}>
                       <div className="flex items-center justify-center">乌龙 <SortIcon colKey="ownGoals" /></div>
                    </th>
                    <th className="px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center" onClick={() => handleSort('disciplineScore')}>
                       <div className="flex items-center justify-center">红黄牌 <SortIcon colKey="disciplineScore" /></div>
                    </th>
                    <th className="px-2 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center" onClick={() => handleSort('conceded')}>
                       <div className="flex items-center justify-center gap-1 text-slate-400 group-hover:text-slate-600" title="仅统计作为守门员时的失球">
                           <Shield className="w-3 h-3" />
                           失球 <SortIcon colKey="conceded" />
                       </div>
                    </th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">操作</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredStats.map((player) => (
                    <tr key={player.name} className="hover:bg-slate-50 transition-colors group">
                       <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 font-bold text-slate-400">
                                {player.avatar ? <img src={player.avatar} className="w-full h-full object-cover"/> : player.number || '#'}
                             </div>
                             <div>
                                <div className="font-bold text-slate-800 text-sm">{player.name}</div>
                                {player.number && <div className="text-[10px] text-slate-400 font-mono">#{player.number}</div>}
                             </div>
                          </div>
                       </td>
                       <td className="px-2 py-3 text-slate-600 text-center">
                          {player.age ? player.age : '-'}
                       </td>
                       <td className="px-2 py-3 flex justify-center">
                          <RateBar val={player.matchesPlayed} total={totalMatches} colorClass="bg-emerald-500" />
                       </td>
                       <td className="px-2 py-3">
                          <div className="flex justify-center">
                              <RateBar val={player.leagueMatchesPlayed} total={totalLeagueMatches} colorClass="bg-blue-500" />
                          </div>
                       </td>
                       <td className="px-2 py-3 text-center">
                          {player.starts > 0 ? (
                              <div className="flex flex-col">
                                  <span className="font-bold text-slate-700">{player.starts}</span>
                                  <span className="text-[10px] text-slate-400">
                                     {player.matchesPlayed > 0 ? Math.round((player.starts / player.matchesPlayed) * 100) : 0}%
                                  </span>
                              </div>
                          ) : (
                              <span className="text-slate-300">-</span>
                          )}
                       </td>
                       <td className="px-2 py-3 text-center bg-slate-50/30">
                          <div className="flex flex-col">
                              <span className="font-bold text-slate-800">
                                 {player.goals} 
                                 {player.penaltiesScored > 0 && <span className="text-slate-400 text-xs ml-1">({player.penaltiesScored})</span>}
                              </span>
                              <span className="text-[10px] text-slate-400">{formatStat(player.goalsPerGame)} / 场</span>
                          </div>
                       </td>
                       <td className="px-2 py-3 text-center bg-slate-50/30">
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{player.assists}</span>
                              <span className="text-[10px] text-slate-400">{formatStat(player.assistsPerGame)} / 场</span>
                          </div>
                       </td>
                       <td className="px-2 py-3 text-center">
                           {player.ownGoals > 0 ? (
                               <span className="font-bold text-slate-700">{player.ownGoals}</span>
                           ) : (
                               <span className="text-slate-300">-</span>
                           )}
                       </td>
                       <td className="px-2 py-3 text-center">
                           <div className="flex items-center justify-center gap-1">
                               {player.yellowCards > 0 && (
                                   <div className="flex items-center bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 text-xs font-bold" title="黄牌">
                                       <div className="w-2 h-3 bg-yellow-400 mr-1 rounded-[1px] border border-black/10"></div>
                                       {player.yellowCards}
                                   </div>
                               )}
                               {player.redCards > 0 && (
                                   <div className="flex items-center bg-red-100 text-red-800 px-1.5 py-0.5 rounded border border-red-200 text-xs font-bold" title="红牌">
                                       <div className="w-2 h-3 bg-red-500 mr-1 rounded-[1px] border border-black/10"></div>
                                       {player.redCards}
                                   </div>
                               )}
                               {player.yellowCards === 0 && player.redCards === 0 && (
                                   <span className="text-slate-300">-</span>
                               )}
                           </div>
                       </td>
                       <td className="px-2 py-3 text-center">
                          {player.matchesAsGK > 0 ? (
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-600">{player.conceded}</span>
                                <span className="text-[10px] text-slate-400">{formatStat(player.concededPerGame)} / 场</span>
                             </div>
                          ) : (
                             <span className="text-slate-200">-</span>
                          )}
                       </td>
                       <td className="px-4 py-3 text-center whitespace-nowrap">
                          {!isReadOnly && (
                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                              </div>
                          )}
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
              <div className="flex flex-col lg:flex-row items-center gap-4 max-w-4xl mx-auto">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-2">快速添加</div>
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
                 <div className="relative w-full md:w-40">
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
