
import React, { useState, useMemo, useRef } from 'react';
import { Users, Plus, Trash2, Search, Shield, Pencil, X, Check, Swords, TrendingUp, History, Camera, Eye, Calendar, MapPin, Trophy, Crown, Handshake, Shirt, Ghost, Heart } from 'lucide-react';
import { OpponentManagerProps, OpponentTeam, MatchRecord } from '../types';

interface OpponentStats {
  id: string;
  name: string;
  logo?: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  lastResult?: 'Win' | 'Draw' | 'Loss';
  history: string[];
}

const OpponentManager: React.FC<OpponentManagerProps> = ({ opponents, matches, onAddOpponent, onRemoveOpponent, onEditOpponent, currentTeamName, currentUserRole }) => {
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState<string | undefined>(undefined);
  const [editError, setEditError] = useState<string | null>(null);

  // View Details State
  const [viewingOpponent, setViewingOpponent] = useState<OpponentStats | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const isReadOnly = currentUserRole === 'player';

  // Calculate Stats
  const opponentStats = useMemo(() => {
    const statsMap: Record<string, OpponentStats> = {};
    
    // Init list
    opponents.forEach(team => {
      // Exclude Internal Match Placeholder (if it exists in list)
      if (team.name === '队内对抗') return;

      statsMap[team.name] = {
        id: team.id,
        name: team.name,
        logo: team.logo,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        history: []
      };
    });

    // Sort matches by date ascending to ensure lastResult captures the latest game
    const sortedMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Process sorted matches
    sortedMatches.forEach(m => {
      // Only include matches that are NOT internal matches
      if (m.matchType === '队内赛') return;

      const oppName = m.opponent;
      
      // If we encounter an opponent in matches that isn't in our list (and isn't internal), add a temp record
      if (!statsMap[oppName]) {
         statsMap[oppName] = { id: 'temp', name: oppName, matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, history: [] };
      }

      const stats = statsMap[oppName];
      stats.matchesPlayed++;
      stats.goalsFor += m.ourScore;
      stats.goalsAgainst += m.opponentScore;

      // Determine result
      let result = m.result;
      if (!result) {
        if (m.ourScore > m.opponentScore) result = 'Win';
        else if (m.ourScore < m.opponentScore) result = 'Loss';
        else result = 'Draw';
      }

      if (result === 'Win') stats.wins++;
      else if (result === 'Draw') stats.draws++;
      else if (result === 'Loss') stats.losses++;

      stats.history.push(result as string);
      stats.lastResult = result as 'Win' | 'Draw' | 'Loss';
    });

    return Object.values(statsMap);
  }, [opponents, matches]);

  // Derived Match History for Viewing
  const viewingMatches = useMemo(() => {
    if (!viewingOpponent) return [];
    return matches
      .filter(m => m.opponent === viewingOpponent.name && m.matchType !== '队内赛')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [viewingOpponent, matches]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setLogo: (l: string) => void) => {
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
        // Resize to 150x150
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
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setLogo(base64);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset
  };

  const handleAdd = () => {
    const trimmed = newTeamName.trim();
    if (!trimmed) {
      setError('请输入球队名称');
      return;
    }
    if (opponents.some(o => o.name === trimmed)) {
      setError('该球队已存在');
      return;
    }
    
    // Construct new object
    const newOp: OpponentTeam = {
       id: Date.now().toString(36),
       name: trimmed,
       logo: newTeamLogo,
       teamId: '' // Will be filled by App
    };

    onAddOpponent(newOp);
    setNewTeamName('');
    setNewTeamLogo(undefined);
    setError(null);
  };

  const startEditing = (team: OpponentStats) => {
    if (!team.id || team.id === 'temp') return;
    setEditingId(team.id);
    setEditName(team.name);
    setEditLogo(team.logo);
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditLogo(undefined);
    setEditError(null);
  };

  const saveEdit = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('名称不能为空');
      return;
    }
    const duplicate = opponents.find(o => o.name === trimmed && o.id !== editingId);
    if (duplicate) {
      setEditError('该球队名已存在');
      return;
    }
    
    if (editingId) {
      onEditOpponent(editingId, trimmed, editLogo);
      cancelEditing();
    }
  };

  // --- Helper Functions for Match Styling ---
  const getResultColorClass = (result?: string) => {
    if (result === 'Win') return 'bg-emerald-500 text-white border-emerald-600';
    if (result === 'Loss') return 'bg-red-500 text-white border-red-600';
    if (result === 'Draw') return 'bg-amber-500 text-white border-amber-600';
    return 'bg-slate-400 text-white border-slate-500';
  };
  
  const getResultLabel = (result?: string) => {
     if (result === 'Win') return '胜利';
     if (result === 'Loss') return '失利';
     if (result === 'Draw') return '平局';
     return '完赛';
  };

  const getMatchBackgroundStyle = (matchType?: string) => {
     switch(matchType) {
        case '联赛': return 'bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/40 border-emerald-200';
        case '杯赛': return 'bg-gradient-to-br from-white via-amber-50/40 to-amber-100/40 border-amber-200';
        case '友谊赛': return 'bg-gradient-to-br from-white via-sky-50/40 to-sky-100/40 border-sky-200';
        case '队内赛': return 'bg-slate-50 border-slate-200 border-dashed';
        default: return 'bg-white border-slate-200';
     }
  };

  const getWatermarkIcon = (matchType?: string) => {
    switch(matchType) {
       case '联赛': return <Trophy className="absolute right-[-10px] bottom-[-15px] w-24 h-24 text-emerald-500/10 -rotate-12 pointer-events-none" />;
       case '杯赛': return <Crown className="absolute right-[-10px] bottom-[-15px] w-24 h-24 text-amber-500/10 -rotate-12 pointer-events-none" />;
       case '友谊赛': return <Handshake className="absolute right-[-10px] bottom-[-15px] w-24 h-24 text-sky-500/10 -rotate-12 pointer-events-none" />;
       case '队内赛': return <Shirt className="absolute right-[-10px] bottom-[-15px] w-24 h-24 text-slate-400/10 -rotate-12 pointer-events-none" />;
       default: return null;
    }
  };

  const filteredStats = opponentStats.filter(stat => 
    stat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derived Stats
  const totalMatchesAgainst = filteredStats.reduce((acc, curr) => acc + curr.matchesPlayed, 0);
  const mostFrequentOpponent = [...filteredStats].sort((a,b) => b.matchesPlayed - a.matchesPlayed)[0];

  // Calculate Nemesis and Favorite
  const sortedByNetGoals = useMemo(() => {
     return [...filteredStats]
       .filter(s => s.matchesPlayed > 0)
       .sort((a, b) => (a.goalsFor - a.goalsAgainst) - (b.goalsFor - b.goalsAgainst));
  }, [filteredStats]);

  const nemesis = sortedByNetGoals.length > 0 ? sortedByNetGoals[0] : null;
  const favoriteOpponent = sortedByNetGoals.length > 0 ? sortedByNetGoals[sortedByNetGoals.length - 1] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            对手球队库
          </h2>
          <p className="text-slate-500 mt-1">管理联赛对手并追踪历史交手战绩</p>
        </div>

        {/* Search & Add */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索球队..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 outline-none w-full md:w-64"
              style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
            />
          </div>
          {!isReadOnly && (
            <button 
               onClick={() => document.getElementById('add-team-input')?.focus()}
               className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors hidden md:block"
            >
               添加球队
            </button>
          )}
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
         {/* Count */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3 shrink-0">
               <Shield className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase">在册对手</p>
               <h3 className="text-xl font-bold text-slate-800">{opponents.filter(o => o.name !== '队内对抗').length} <span className="text-xs font-normal text-slate-400">支</span></h3>
            </div>
         </div>

         {/* Total Matches */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mr-3 shrink-0">
               <Swords className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase">已记录交手</p>
               <h3 className="text-xl font-bold text-slate-800">{totalMatchesAgainst} <span className="text-xs font-normal text-slate-400">场</span></h3>
            </div>
         </div>

         {/* Frequent Opponent */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mr-3 shrink-0">
               <TrendingUp className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
               <p className="text-[10px] text-slate-500 font-bold uppercase">老对手</p>
               <h3 className="text-lg font-bold text-slate-800 truncate">{mostFrequentOpponent ? mostFrequentOpponent.name : '-'}</h3>
               <p className="text-[10px] text-slate-400">{mostFrequentOpponent ? `交手 ${mostFrequentOpponent.matchesPlayed} 次` : '暂无数据'}</p>
            </div>
         </div>

         {/* Nemesis (苦主) */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mr-3 shrink-0">
               <Ghost className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
               <p className="text-[10px] text-slate-500 font-bold uppercase">苦主</p>
               <h3 className="text-lg font-bold text-slate-800 truncate">{nemesis ? nemesis.name : '-'}</h3>
               <p className="text-[10px] text-slate-400">
                  {nemesis ? `净负 ${Math.abs(nemesis.goalsFor - nemesis.goalsAgainst)} 球` : '暂无数据'}
               </p>
            </div>
         </div>

         {/* Favorite Opponent (最喜欢的对手) */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mr-3 shrink-0">
               <Heart className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
               <p className="text-[10px] text-slate-500 font-bold uppercase">最喜欢的对手</p>
               <h3 className="text-lg font-bold text-slate-800 truncate">{favoriteOpponent ? favoriteOpponent.name : '-'}</h3>
               <p className="text-[10px] text-slate-400">
                  {favoriteOpponent ? `净胜 ${Math.abs(favoriteOpponent.goalsFor - favoriteOpponent.goalsAgainst)} 球` : '暂无数据'}
               </p>
            </div>
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left: Add Form */}
        {!isReadOnly && (
          <div className="lg:col-span-1">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 sticky top-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                 <Plus className="w-4 h-4 mr-2" />
                 添加对手球队
              </h3>
              <div className="space-y-4">
                <div className="flex justify-center">
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-16 h-16 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden relative group"
                   >
                      {newTeamLogo ? (
                        <img src={newTeamLogo} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-5 h-5 text-slate-400" />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                         <Plus className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                   </div>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     className="hidden" 
                     accept="image/*"
                     onChange={(e) => handleImageUpload(e, setNewTeamLogo)}
                   />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">球队名称</label>
                  <input 
                    id="add-team-input"
                    type="text" 
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="例如：猛虎 FC"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 outline-none text-sm"
                    style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-500 flex items-center"><X className="w-3 h-3 mr-1"/> {error}</p>
                )}
                <button 
                  onClick={handleAdd}
                  className="w-full text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center hover:brightness-110 text-sm shadow-sm"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  确认添加
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                 <p className="text-xs text-slate-400 leading-relaxed">
                    提示：添加球队后，在录入比赛时即可通过下拉菜单快速选择。请尽量保持名称统一，避免重复创建。
                 </p>
              </div>
            </div>
          </div>
        )}

        {/* Right: Team Grid */}
        <div className={isReadOnly ? "lg:col-span-4" : "lg:col-span-3"}>
          {filteredStats.length > 0 ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isReadOnly ? "xl:grid-cols-4" : "xl:grid-cols-3"} gap-4`}>
              {filteredStats.map((team, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all group overflow-hidden flex flex-col relative">
                   <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm overflow-hidden`}
                                 style={{ backgroundColor: 'var(--primary-hover)' }}>
                               {team.logo ? <img src={team.logo} className="w-full h-full object-cover" /> : team.name.charAt(0)}
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-800 text-lg leading-tight cursor-pointer hover:text-blue-600" onClick={() => setViewingOpponent(team)}>
                                  {team.name}
                                </h4>
                               {team.lastResult && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                    team.lastResult === 'Win' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                    team.lastResult === 'Loss' ? 'bg-red-50 text-red-600 border-red-100' : 
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}>
                                    最近: {team.lastResult === 'Win' ? '胜' : team.lastResult === 'Loss' ? '负' : '平'}
                                  </span>
                               )}
                            </div>
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Actions Grouped */}
                            <button 
                               onClick={() => setViewingOpponent(team)} 
                               className="p-1.5 text-slate-400 hover:text-emerald-600 rounded"
                               title="查看比赛详情"
                            >
                               <Eye className="w-3.5 h-3.5" />
                            </button>
                            {!isReadOnly && (
                               <>
                                 <button onClick={() => startEditing(team)} className="p-1.5 text-slate-400 hover:text-blue-500 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                                 <button onClick={() => team.id && onRemoveOpponent(team.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                               </>
                            )}
                         </div>
                      </div>

                      {/* Mini Stats */}
                      <div className="grid grid-cols-3 gap-2 mt-2 cursor-pointer" onClick={() => setViewingOpponent(team)}>
                         <div className="text-center bg-slate-50 rounded p-1.5">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">场次</div>
                            <div className="font-bold text-slate-700">{team.matchesPlayed}</div>
                         </div>
                         <div className="text-center bg-slate-50 rounded p-1.5">
                             <div className="text-[10px] text-slate-400 font-bold uppercase">战绩</div>
                             <div className="font-bold text-slate-700 text-xs mt-0.5">
                                <span className="text-emerald-600">{team.wins}</span>-
                                <span className="text-amber-500">{team.draws}</span>-
                                <span className="text-red-500">{team.losses}</span>
                             </div>
                         </div>
                         <div className="text-center bg-slate-50 rounded p-1.5">
                             <div className="text-[10px] text-slate-400 font-bold uppercase">得失球</div>
                             <div className="font-bold text-slate-700 text-xs mt-0.5">
                                {team.goalsFor}:{team.goalsAgainst}
                             </div>
                         </div>
                      </div>
                   </div>
                   
                   {/* Visual Bar - Chronological Timeline */}
                   {team.matchesPlayed > 0 && (
                      <div className="h-1.5 w-full flex overflow-hidden">
                         {team.history.map((res, i) => (
                           <div 
                             key={i}
                             className={`h-full flex-1 ${
                               res === 'Win' ? 'bg-emerald-400' : 
                               res === 'Draw' ? 'bg-amber-400' : 
                               'bg-red-400'
                             }`}
                             title={`Match ${i+1}: ${res}`} 
                           />
                         ))}
                      </div>
                   )}
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Shield className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium">暂无相关球队</p>
             </div>
          )}
        </div>
      </div>

      {/* Detail Modal (Match History) */}
      {viewingOpponent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
          onClick={() => setViewingOpponent(null)}
        >
           <div 
             className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]"
             onClick={(e) => e.stopPropagation()}
           >
              {/* Modal Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm overflow-hidden border-2 border-white"
                          style={{ backgroundColor: 'var(--primary)' }}>
                        {viewingOpponent.logo ? <img src={viewingOpponent.logo} className="w-full h-full object-cover" /> : viewingOpponent.name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="font-bold text-lg text-slate-800">{viewingOpponent.name}</h3>
                       <p className="text-xs text-slate-500">交战历史详情</p>
                    </div>
                 </div>
                 <button onClick={() => setViewingOpponent(null)} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto p-6">
                 {/* Summary Cards */}
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                       <div className="text-xs text-slate-400 font-bold uppercase mb-1">交手次数</div>
                       <div className="text-xl font-black text-slate-800">{viewingOpponent.matchesPlayed}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                       <div className="text-xs text-slate-400 font-bold uppercase mb-1">胜/平/负</div>
                       <div className="text-xl font-black text-slate-800 flex items-center justify-center gap-1">
                          <span className="text-emerald-600">{viewingOpponent.wins}</span>/
                          <span className="text-amber-500">{viewingOpponent.draws}</span>/
                          <span className="text-red-500">{viewingOpponent.losses}</span>
                       </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                       <div className="text-xs text-slate-400 font-bold uppercase mb-1">胜率</div>
                       <div className="text-xl font-black text-slate-800">
                          {viewingOpponent.matchesPlayed > 0 ? Math.round((viewingOpponent.wins / viewingOpponent.matchesPlayed) * 100) : 0}%
                       </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                       <div className="text-xs text-slate-400 font-bold uppercase mb-1">进/失球</div>
                       <div className="text-xl font-black text-slate-800">
                          {viewingOpponent.goalsFor} <span className="text-slate-300 mx-0.5">/</span> {viewingOpponent.goalsAgainst}
                       </div>
                    </div>
                 </div>

                 {/* Match List */}
                 <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                       <History className="w-4 h-4 mr-2" />
                       比赛记录
                    </h4>
                    {viewingMatches.length > 0 ? (
                       <div className="space-y-4">
                          {viewingMatches.map(match => (
                             <div key={match.id} className={`relative overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md ${getMatchBackgroundStyle(match.matchType)}`}>
                                {/* Watermark */}
                                {getWatermarkIcon(match.matchType)}
                                
                                <div className="relative z-10 p-4">
                                   {/* Header: Meta */}
                                   <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pb-2 border-b border-black/5">
                                      <div className="flex items-center gap-2">
                                         <span className="flex items-center bg-white/60 px-2 py-0.5 rounded backdrop-blur-sm">
                                            <Calendar className="w-3 h-3 mr-1" /> {match.date}
                                         </span>
                                         <span className="flex items-center bg-white/60 px-2 py-0.5 rounded backdrop-blur-sm font-bold">
                                            {match.matchType}
                                         </span>
                                         {match.round && (
                                            <span className="flex items-center bg-white/60 px-2 py-0.5 rounded backdrop-blur-sm text-slate-600">
                                               第{match.round}轮
                                            </span>
                                         )}
                                         {match.format && (
                                            <span className="flex items-center bg-white/60 px-2 py-0.5 rounded backdrop-blur-sm text-slate-500">
                                               {match.format}
                                            </span>
                                         )}
                                      </div>
                                      <span className="font-mono text-slate-400">{match.season}</span>
                                   </div>

                                   {/* Body: Scoreboard */}
                                   <div className="flex items-center justify-between">
                                      {/* Our Team */}
                                      <div className="flex items-center gap-3">
                                         <span className="text-sm font-bold text-slate-800" style={{ color: 'var(--primary-text)' }}>
                                            {currentTeamName || '我方'}
                                         </span>
                                         <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">
                                            H
                                         </div>
                                      </div>

                                      {/* Score */}
                                      <div className={`mx-2 px-3 py-1 rounded-lg border flex flex-col items-center min-w-[80px] bg-white shadow-sm ${getResultColorClass(match.result)}`}>
                                          <div className="text-xl font-black font-mono leading-none tracking-tight">
                                              {match.ourScore} : {match.opponentScore}
                                          </div>
                                          <span className="text-[8px] font-bold uppercase mt-0.5 opacity-90 tracking-widest border-t border-white/20 pt-0.5 w-full text-center">
                                              {getResultLabel(match.result)}
                                          </span>
                                      </div>

                                      {/* Opponent */}
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm overflow-hidden">
                                            {viewingOpponent.logo ? <img src={viewingOpponent.logo} className="w-full h-full object-cover" /> : viewingOpponent.name.charAt(0)}
                                         </div>
                                         <span className="text-sm font-bold text-slate-800 truncate max-w-[80px]">
                                            {match.opponent}
                                         </span>
                                      </div>
                                   </div>

                                   {/* Footer: Venue */}
                                   <div className="mt-3 pt-2 border-t border-black/5 flex justify-center">
                                      <div className="flex items-center text-xs text-slate-500">
                                         <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                                         {match.venue || (match.location === 'Home' ? '主场' : match.location === 'Away' ? '客场' : '中立场地')}
                                      </div>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          暂无正式比赛记录
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">编辑球队</h3>
              <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex justify-center mb-2">
                 <div 
                   onClick={() => editFileInputRef.current?.click()}
                   className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden relative group"
                 >
                    {editLogo ? (
                      <img src={editLogo} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                       <Pencil className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                    </div>
                 </div>
                 <input 
                   type="file" 
                   ref={editFileInputRef} 
                   className="hidden" 
                   accept="image/*"
                   onChange={(e) => handleImageUpload(e, setEditLogo)}
                 />
              </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">球队名称</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 outline-none"
                    style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                  {editError && <p className="text-sm text-red-500 mt-1">{editError}</p>}
                  <p className="text-xs text-slate-400 mt-2 flex items-center">
                    <History className="w-3 h-3 mr-1" />
                    修改名称将同步更新所有历史比赛记录。
                  </p>
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

export default OpponentManager;
