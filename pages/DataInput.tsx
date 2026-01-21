import React, { useState, useRef, useEffect } from 'react';
import { DataItem, MatchRecord, GoalDetail, PlayerProfile, OpponentTeam, DataInputProps, GoalkeeperStat } from '../types';
import { Plus, CheckCircle, AlertCircle, Save, ChevronDown, Users, Hash, MapPin, Flag, X, ArrowLeft, Shirt, Check, Search, Info, Shield, Crosshair, UserCog } from 'lucide-react';

const MATCH_TYPES = ['联赛', '友谊赛', '杯赛', '队内赛'];
const MATCH_FORMATS = ['八人制', '五人制', '十一人制'];

// Internal Component: Searchable Dropdown for Players
interface SearchablePlayerSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
}

const SearchablePlayerSelect: React.FC<SearchablePlayerSelectProps> = ({ options, value, onChange, placeholder = "选择球员...", icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
       <div 
         className="w-full flex items-center p-2 bg-white border border-slate-300 rounded-lg text-sm focus-within:ring-2 cursor-pointer"
         style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
         onClick={() => setIsOpen(true)}
       >
          {Icon && <Icon className="w-4 h-4 text-slate-400 mr-2 shrink-0" />}
          {isOpen ? (
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="输入名字搜索..."
              className="w-full outline-none bg-transparent"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`w-full truncate ${!value ? 'text-slate-400' : 'text-slate-800'}`}>
               {value || placeholder}
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
       </div>

       {isOpen && (
         <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
               filteredOptions.map(opt => (
                 <div 
                   key={opt}
                   onClick={(e) => { e.stopPropagation(); handleSelect(opt); }}
                   className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                 >
                   {opt}
                 </div>
               ))
            ) : (
               <div className="px-3 py-2 text-sm text-slate-400">无匹配球员</div>
            )}
         </div>
       )}
    </div>
  );
};

const DataInput: React.FC<DataInputProps> = ({ onDataLoaded, opponentList, seasonList, venueList, playerList, onBack, initialData, currentTeamName }) => {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isOppDropdownOpen, setIsOppDropdownOpen] = useState(false);
  const oppDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    season: '',
    round: '',
    matchType: '联赛',
    format: '八人制',
    venue: '',
    opponent: '',
    ourScore: '',
    opponentScore: '',
    location: 'Home', // Default value, UI hidden
    notes: '',
    countForStats: true, // Default true
    coach: ''
  });

  const [selectedSquad, setSelectedSquad] = useState<string[]>([]);
  const [starters, setStarters] = useState<string[]>([]);
  
  // Updated Goalkeeper State: Array of objects with conceded goals
  const [gkStats, setGkStats] = useState<GoalkeeperStat[]>([]);

  const [goals, setGoals] = useState<GoalDetail[]>([]);
  const [tempScorer, setTempScorer] = useState('');
  const [tempAssist, setTempAssist] = useState('');
  const [isPenalty, setIsPenalty] = useState(false);

  const [yellowCards, setYellowCards] = useState<string[]>([]);
  const [redCards, setRedCards] = useState<string[]>([]);
  const [penaltiesWon, setPenaltiesWon] = useState<string[]>([]);
  const [penaltiesMissed, setPenaltiesMissed] = useState<string[]>([]);
  const [ownGoals, setOwnGoals] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        season: initialData.season || '',
        round: initialData.round?.toString() || '',
        matchType: initialData.matchType || '联赛',
        format: initialData.format || '八人制',
        venue: initialData.venue || '',
        opponent: initialData.opponent,
        ourScore: initialData.ourScore.toString(),
        opponentScore: initialData.opponentScore.toString(),
        location: initialData.location || 'Home',
        notes: initialData.notes || '',
        countForStats: initialData.countForStats ?? (initialData.matchType !== '队内赛'),
        coach: initialData.coach || ''
      });
      setSelectedSquad(initialData.squad || []);
      setStarters(initialData.starters || []);
      
      // Load GK Stats
      if (initialData.goalkeeperStats && initialData.goalkeeperStats.length > 0) {
        setGkStats(initialData.goalkeeperStats);
      } else if (initialData.goalkeepers && initialData.goalkeepers.length > 0) {
        // Fallback for legacy data
        const score = initialData.opponentScore || 0;
        if (initialData.goalkeepers.length === 1) {
             setGkStats([{ player: initialData.goalkeepers[0], conceded: score }]);
        } else {
             setGkStats(initialData.goalkeepers.map(name => ({ player: name, conceded: 0 })));
        }
      } else {
        setGkStats([]);
      }

      setGoals(initialData.goalsDetails || []);
      setYellowCards(initialData.yellowCards || []);
      setRedCards(initialData.redCards || []);
      setPenaltiesWon(initialData.penaltiesWon || []);
      setPenaltiesMissed(initialData.penaltiesMissed || []);
      setOwnGoals(initialData.ownGoals || []);
    } else {
      // Only set default season/venue if they are currently empty
      setFormData(prev => {
        const updates: any = {};
        if (!prev.season && seasonList.length > 0) updates.season = seasonList[0];
        if (!prev.venue && venueList.length > 0) updates.venue = venueList[0];
        
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, [initialData, seasonList, venueList]);

  const toggleSquad = (playerName: string) => {
    if (selectedSquad.includes(playerName)) {
      setSelectedSquad(selectedSquad.filter(p => p !== playerName));
      setStarters(starters.filter(p => p !== playerName));
      // Also remove from GK if present
      setGkStats(gkStats.filter(g => g.player !== playerName));
    } else {
      setSelectedSquad([...selectedSquad, playerName]);
    }
  };

  const toggleStarter = (e: React.MouseEvent, playerName: string) => {
    e.stopPropagation(); 
    if (!selectedSquad.includes(playerName)) return;

    if (starters.includes(playerName)) {
      setStarters(starters.filter(p => p !== playerName));
    } else {
      setStarters([...starters, playerName]);
    }
  };

  const addEvent = (list: string[], setList: (l: string[]) => void, player: string) => {
    if (player && player !== "") {
      setList([...list, player]);
    }
  };

  const removeEvent = (list: string[], setList: (l: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const addGoal = () => {
    if (!tempScorer) return;
    setGoals([...goals, { 
       scorer: tempScorer, 
       assist: tempAssist || undefined,
       isPenalty: isPenalty 
    }]);
    setTempScorer('');
    setTempAssist('');
    setIsPenalty(false); // Reset
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  // GK Handlers
  const addGoalkeeper = (player: string) => {
     if (!player || gkStats.find(g => g.player === player)) return;
     setGkStats([...gkStats, { player, conceded: 0 }]);
  };

  const removeGoalkeeper = (player: string) => {
     setGkStats(gkStats.filter(g => g.player !== player));
  };

  const updateGkConceded = (player: string, val: string) => {
     const num = parseInt(val) || 0;
     setGkStats(gkStats.map(g => g.player === player ? { ...g, conceded: num } : g));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (oppDropdownRef.current && !oppDropdownRef.current.contains(event.target as Node)) {
        setIsOppDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => {
        const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
        
        if (name === 'matchType') {
            if (value === '队内赛') {
               newData.countForStats = false;
            } 
        }
        return newData;
    });

    if (error) setError(null);
  };

  const selectOpponent = (name: string) => {
    setFormData({ ...formData, opponent: name });
    setIsOppDropdownOpen(false);
    if (error) setError(null);
  };

  const handleSave = () => {
    setSuccessMsg(null);

    if (!formData.season) {
      setError("请选择赛季。如果没有赛季，请先去赛季管理添加。");
      return;
    }

    if (!formData.opponent) {
        setError("请填写对手名称。");
        return;
    }

    // If counting for stats, require score
    if (formData.countForStats && (formData.ourScore === '' || formData.opponentScore === '')) {
      setError("计入统计的比赛请填写完整比分。");
      return;
    }

    // Process Scores
    const our = formData.ourScore ? parseInt(formData.ourScore) : 0;
    const opp = formData.opponentScore ? parseInt(formData.opponentScore) : 0;
    
    let result = 'Draw';
    if (our > opp) result = 'Win';
    if (our < opp) result = 'Loss';

    const newMatch: MatchRecord = {
      id: initialData?.id || undefined, 
      date: formData.date,
      season: formData.season,
      round: formData.round ? parseInt(formData.round) : undefined,
      matchType: formData.matchType,
      format: formData.format,
      venue: formData.venue,
      opponent: formData.opponent,
      ourScore: our,
      opponentScore: opp,
      location: formData.location,
      result,
      squad: selectedSquad,
      starters: starters,
      goalkeepers: gkStats.map(g => g.player), // Backward compatibility
      goalkeeperStats: gkStats, // New detailed stats
      goalsDetails: goals,
      yellowCards: yellowCards,
      redCards: redCards,
      penaltiesWon: penaltiesWon,
      penaltiesMissed: penaltiesMissed,
      ownGoals: ownGoals,
      notes: formData.notes,
      countForStats: formData.countForStats,
      coach: formData.coach
    };

    onDataLoaded([newMatch], true); 
    
    setSuccessMsg(initialData ? "比赛记录已更新！" : "比赛记录已保存！");
    setTimeout(() => {
      setSuccessMsg(null);
      onBack(); 
    }, 1500);

    setError(null);
  };

  // Find logo for display
  const currentOpponent = opponentList.find(o => o.name === formData.opponent);
  
  const filteredOpponents = opponentList.filter(team => 
    team.name.toLowerCase().includes(formData.opponent.toLowerCase())
  );

  // Filter players for selection grid:
  // 1. Hide "Left" (已离队) players by default.
  // 2. But show them if they are already in the selected squad (for historical record edits).
  const visibleSelectionPlayers = playerList.filter(p => 
    p.status !== '已离队' || selectedSquad.includes(p.name)
  );

  // Available players for stats (Squad only if squad selected, else filtered all)
  const statsPlayerOptions = selectedSquad.length > 0 
    ? selectedSquad 
    : playerList.filter(p => p.status !== '已离队').map(p => p.name);

  // Determine current total conceded entered
  const currentGkConcededTotal = gkStats.reduce((sum, g) => sum + g.conceded, 0);
  const targetConceded = parseInt(formData.opponentScore) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">
           {initialData ? '编辑比赛数据' : '录入比赛数据'}
        </h2>
      </div>

      <div className="space-y-6">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="bg-slate-50 border-b border-slate-100 p-4 md:px-8">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
               <div className="w-full">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">赛季</label>
                  <select name="season" value={formData.season} onChange={handleFormChange} className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-2 outline-none" style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}>
                     {seasonList.length === 0 && <option value="">请添加赛季</option>}
                     {seasonList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
               <div className="w-full">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">日期</label>
                  <input type="date" name="date" value={formData.date} onChange={handleFormChange} className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-2 outline-none" style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties} />
               </div>
               <div className="w-full">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block flex items-center">
                    <Hash className="w-3 h-3 mr-1" /> 轮次
                  </label>
                  <input type="number" name="round" placeholder="例如: 3" value={formData.round} onChange={handleFormChange} className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-2 outline-none" style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties} />
               </div>
               <div className="w-full">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block flex items-center">
                    <UserCog className="w-3 h-3 mr-1" /> 主教练
                  </label>
                  <SearchablePlayerSelect 
                    options={playerList.filter(p => p.status !== '已离队').map(p => p.name)}
                    value={formData.coach} 
                    onChange={(val) => setFormData(prev => ({ ...prev, coach: val }))} 
                    placeholder="选择执教教练" 
                  />
               </div>
             </div>
             
             {/* Stats Toggle */}
             <div className="mt-4 flex justify-end">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="countForStats" checked={formData.countForStats} onChange={handleFormChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-3 text-sm font-bold text-slate-700">计入统计</span>
                </label>
             </div>
          </div>

          <div className="p-6 md:p-10 bg-white">
             {/* Scoreboard Input */}
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                  
                  <div className="flex-1 w-full text-center order-2 md:order-1">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-3 shadow-inner">
                       <span className="font-extrabold text-xl block tracking-tight" style={{ color: 'var(--primary-text)' }}>
                         {currentTeamName || '我方球队'}
                       </span>
                    </div>
                    <input 
                      type="number" 
                      name="ourScore"
                      placeholder="0"
                      min="0"
                      value={formData.ourScore}
                      onChange={handleFormChange}
                      className="w-24 h-20 text-center text-5xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 outline-none transition-all mx-auto block"
                      style={{ '--tw-ring-color': 'var(--primary-light)', '--tw-border-opacity': '1', borderColor: 'var(--primary)' } as React.CSSProperties}
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center order-1 md:order-2">
                     <span className="text-slate-300 font-black text-3xl font-mono">VS</span>
                     <div className="mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Full Time
                     </div>
                  </div>

                  <div className="flex-1 w-full text-center order-3 md:order-3">
                    <div className="relative mb-3" ref={oppDropdownRef}>
                      <div className="relative">
                         {/* Logo preview in input */}
                        {currentOpponent?.logo && (
                           <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-white">
                              <img src={currentOpponent.logo} className="w-full h-full object-cover" />
                           </div>
                        )}
                        <input 
                          type="text" 
                          name="opponent" 
                          placeholder="选择对手" 
                          value={formData.opponent} 
                          onChange={(e) => {
                            handleFormChange(e);
                            setIsOppDropdownOpen(true);
                          }} 
                          onClick={() => setIsOppDropdownOpen(true)}
                          className={`w-full text-center font-bold text-lg p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 outline-none text-slate-800 placeholder-slate-400 ${currentOpponent?.logo ? 'pl-12' : ''}`}
                          style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                          autoComplete="off"
                        />
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      
                      {isOppDropdownOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto text-left">
                          {filteredOpponents.length > 0 ? (
                            filteredOpponents.map((team, idx) => (
                              <div 
                                key={idx}
                                onClick={() => selectOpponent(team.name)}
                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 border-b border-slate-50 last:border-0 flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                                   {team.logo ? <img src={team.logo} className="w-full h-full object-cover" /> : team.name.charAt(0)}
                                </div>
                                {team.name}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-slate-400">
                              按回车添加 "{formData.opponent}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <input 
                      type="number" 
                      name="opponentScore"
                      placeholder="0"
                      min="0"
                      value={formData.opponentScore}
                      onChange={handleFormChange}
                      className="w-24 h-20 text-center text-5xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all mx-auto block"
                    />
                  </div>
                </div>
          </div>

          <div className="bg-slate-50 p-6 md:px-10 border-t border-slate-100">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Flag className="w-3 h-3 mr-1.5" /> 比赛类型
                  </label>
                  <select name="matchType" value={formData.matchType} onChange={handleFormChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 outline-none shadow-sm" style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}>
                    {MATCH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Users className="w-3 h-3 mr-1.5" /> 赛制
                  </label>
                  <select name="format" value={formData.format} onChange={handleFormChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 outline-none shadow-sm" style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}>
                    {MATCH_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <MapPin className="w-3 h-3 mr-1.5" /> 比赛场地
                  </label>
                  <div className="relative">
                    <select 
                      name="venue" 
                      value={formData.venue} 
                      onChange={handleFormChange} 
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 outline-none shadow-sm appearance-none"
                      style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                    >
                       <option value="">请选择场地...</option>
                       {venueList.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
             </div>
          </div>

          <div className="p-6 md:px-10 border-t border-slate-100 bg-white">
             <h4 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span className="flex items-center">
                  <Shirt className="w-5 h-5 mr-2" style={{ color: 'var(--primary)' }} />
                  参赛阵容 ({selectedSquad.length}人)
                </span>
                <div className="flex items-center gap-4 text-xs font-normal">
                   <div className="flex items-center"><div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded mr-1"></div> 未选</div>
                   <div className="flex items-center"><div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: 'var(--primary)' }}></div> 出场</div>
                   <div className="flex items-center"><div className="w-3 h-3 rounded mr-1 border-2 border-amber-400" style={{ backgroundColor: 'var(--primary)' }}></div> 首发</div>
                </div>
             </h4>
             
             {visibleSelectionPlayers.length > 0 ? (
               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                 {visibleSelectionPlayers.map(player => {
                   const isSelected = selectedSquad.includes(player.name);
                   const isStarter = starters.includes(player.name);
                   const isLeft = player.status === '已离队';
                   
                   return (
                     <div 
                       key={player.name}
                       onClick={() => toggleSquad(player.name)}
                       className={`
                         relative cursor-pointer p-2 rounded-lg border transition-all select-none flex flex-col items-center
                         ${isSelected 
                           ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                           : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}
                         ${isLeft && isSelected ? 'opacity-75 grayscale-[0.5]' : ''}
                       `}
                       style={isSelected ? { backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary)', color: 'var(--primary-text)' } : {}}
                     >
                       <div className="w-8 h-8 mb-2 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                          {player.avatar ? (
                             <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                             <span className="text-[10px] font-bold">{player.number || '#'}</span>
                          )}
                       </div>
                       
                       <span className="text-sm font-bold text-center leading-tight truncate w-full">{player.name}</span>
                       
                       {isLeft && (
                         <span className="text-[8px] bg-slate-200 text-slate-500 px-1 rounded absolute top-1 left-1">已离队</span>
                       )}

                       {isSelected && (
                         <div 
                           onClick={(e) => toggleStarter(e, player.name)}
                           className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-sm z-10 ${isStarter ? 'bg-amber-400 border-white text-white' : 'bg-slate-200 border-white text-slate-400'}`}
                           title="标记为首发"
                         >
                           {isStarter && <Check className="w-3 h-3" />}
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
             ) : (
                <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm">
                   暂无球员数据，请先在“球员管理”中添加球员。
                </div>
             )}
             
             {/* Goalkeeper Selection & Stats */}
             {selectedSquad.length > 0 && (
                <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                          <Shield className="w-4 h-4 mr-1.5" />
                          本场守门员 & 失球统计
                      </label>
                      <span className={`text-xs font-bold ${currentGkConcededTotal === targetConceded ? 'text-emerald-600' : 'text-amber-500'}`}>
                         已分配: {currentGkConcededTotal} / 总失球: {targetConceded}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                         {gkStats.map((gk, idx) => (
                             <div key={idx} className="flex items-center justify-between bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm">
                                <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                      {playerList.find(p => p.name === gk.player)?.number || '#'}
                                   </div>
                                   <span className="text-sm font-bold text-slate-800">{gk.player}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-2 text-sm">
                                      <span className="text-slate-400 text-xs">失球:</span>
                                      <input 
                                         type="number" 
                                         min="0"
                                         value={gk.conceded}
                                         onChange={(e) => updateGkConceded(gk.player, e.target.value)}
                                         className="w-12 text-center border border-slate-200 rounded p-1 text-slate-800 font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                      />
                                   </div>
                                   <button 
                                      onClick={() => removeGoalkeeper(gk.player)}
                                      className="text-slate-400 hover:text-red-500 ml-2"
                                   >
                                      <X className="w-4 h-4" />
                                   </button>
                                </div>
                             </div>
                         ))}
                    </div>
                    
                    <div className="mt-3 max-w-xs">
                        <SearchablePlayerSelect 
                            options={selectedSquad.filter(p => !gkStats.find(g => g.player === p))} 
                            value="" 
                            onChange={(val) => addGoalkeeper(val)}
                            placeholder="+ 添加守门员"
                        />
                    </div>
                </div>
             )}
          </div>

          <div className="p-6 md:px-10 border-t border-slate-100 bg-white">
            <h4 className="font-bold text-slate-800 mb-6 flex items-center">
               <Users className="w-5 h-5 mr-2" style={{ color: 'var(--primary)' }} />
               技术统计
            </h4>
            
            <div className="mb-8">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                进球 & 助攻
              </label>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                {goals.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 mb-2 shadow-sm">
                     <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-slate-800 mr-1">{g.scorer}</span>
                        {g.isPenalty ? (
                             <span className="text-xs bg-slate-800 text-white px-2 py-0.5 rounded-full font-bold">点球</span>
                        ) : (
                             <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">进球</span>
                        )}
                        
                        {g.assist && (
                          <>
                            <span className="text-slate-300 mx-1">/</span>
                            <span className="text-slate-600 text-sm mr-1">{g.assist}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">助攻</span>
                          </>
                        )}
                     </div>
                     <button onClick={() => removeGoal(idx)} className="text-slate-400 hover:text-red-500">
                       <X className="w-4 h-4" />
                     </button>
                  </div>
                ))}
                
                <div className="flex flex-col sm:flex-row gap-2 mt-4 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <SearchablePlayerSelect 
                      options={statsPlayerOptions}
                      value={tempScorer}
                      onChange={setTempScorer}
                      placeholder="进球者..."
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <SearchablePlayerSelect 
                      options={statsPlayerOptions}
                      value={tempAssist}
                      onChange={setTempAssist}
                      placeholder="助攻者 (可选)..."
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <label className="flex items-center bg-white px-3 py-2 rounded-lg border border-slate-300 cursor-pointer hover:bg-slate-50">
                        <input 
                           type="checkbox" 
                           checked={isPenalty} 
                           onChange={(e) => setIsPenalty(e.target.checked)}
                           className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" 
                        />
                        <span className="ml-2 text-sm text-slate-600 font-medium">点球</span>
                     </label>

                     <button 
                        onClick={addGoal}
                        disabled={!tempScorer}
                        className="text-white px-4 py-2 rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                        style={{ backgroundColor: 'var(--primary)' }}
                     >
                        添加
                     </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center">
                    <span className="w-3 h-4 bg-yellow-400 rounded-sm mr-2 inline-block border border-yellow-500/20"></span> 黄牌
                 </label>
                 <div className="flex flex-wrap gap-2 mb-2">
                    {yellowCards.map((p, i) => (
                      <div key={i} className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-1 rounded-md text-xs font-bold flex items-center">
                         {p}
                         <button onClick={() => removeEvent(yellowCards, setYellowCards, i)} className="ml-1 text-yellow-600 hover:text-yellow-900"><X className="w-3 h-3"/></button>
                      </div>
                    ))}
                 </div>
                 <SearchablePlayerSelect 
                    options={statsPlayerOptions}
                    value=""
                    onChange={(val) => addEvent(yellowCards, setYellowCards, val)}
                    placeholder="+ 添加黄牌"
                 />
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center">
                    <span className="w-3 h-4 bg-red-500 rounded-sm mr-2 inline-block border border-red-600/20"></span> 红牌
                 </label>
                 <div className="flex flex-wrap gap-2 mb-2">
                    {redCards.map((p, i) => (
                      <div key={i} className="bg-red-50 text-red-800 border border-red-200 px-2 py-1 rounded-md text-xs font-bold flex items-center">
                         {p}
                         <button onClick={() => removeEvent(redCards, setRedCards, i)} className="ml-1 text-red-600 hover:text-red-900"><X className="w-3 h-3"/></button>
                      </div>
                    ))}
                 </div>
                 <SearchablePlayerSelect 
                    options={statsPlayerOptions}
                    value=""
                    onChange={(val) => addEvent(redCards, setRedCards, val)}
                    placeholder="+ 添加红牌"
                 />
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center">
                    <div className="w-3 h-3 rounded-full border-2 border-slate-400 mr-2"></div> 造点
                 </label>
                 <div className="flex flex-wrap gap-2 mb-2">
                    {penaltiesWon.map((p, i) => (
                      <div key={i} className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-1 rounded-md text-xs font-bold flex items-center">
                         {p}
                         <button onClick={() => removeEvent(penaltiesWon, setPenaltiesWon, i)} className="ml-1 text-slate-600 hover:text-slate-900"><X className="w-3 h-3"/></button>
                      </div>
                    ))}
                 </div>
                 <SearchablePlayerSelect 
                    options={statsPlayerOptions}
                    value=""
                    onChange={(val) => addEvent(penaltiesWon, setPenaltiesWon, val)}
                    placeholder="+ 添加造点"
                 />
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center text-rose-600">
                    <div className="w-3 h-3 rounded-full border-2 border-rose-400 mr-2"></div> 失点
                 </label>
                 <div className="flex flex-wrap gap-2 mb-2">
                    {penaltiesMissed.map((p, i) => (
                      <div key={i} className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-md text-xs font-bold flex items-center">
                         {p}
                         <button onClick={() => removeEvent(penaltiesMissed, setPenaltiesMissed, i)} className="ml-1 text-rose-400 hover:text-rose-600"><X className="w-3 h-3"/></button>
                      </div>
                    ))}
                 </div>
                 <SearchablePlayerSelect 
                    options={statsPlayerOptions}
                    value=""
                    onChange={(val) => addEvent(penaltiesMissed, setPenaltiesMissed, val)}
                    placeholder="+ 添加失点"
                 />
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center">
                    <div className="w-3 h-3 bg-slate-800 rounded-full mr-2"></div> 乌龙球
                 </label>
                 <div className="flex flex-wrap gap-2 mb-2">
                    {ownGoals.map((p, i) => (
                      <div key={i} className="bg-slate-800 text-white border border-slate-700 px-2 py-1 rounded-md text-xs font-bold flex items-center">
                         {p}
                         <button onClick={() => removeEvent(ownGoals, setOwnGoals, i)} className="ml-1 text-slate-400 hover:text-white"><X className="w-3 h-3"/></button>
                      </div>
                    ))}
                 </div>
                 <SearchablePlayerSelect 
                    options={statsPlayerOptions}
                    value=""
                    onChange={(val) => addEvent(ownGoals, setOwnGoals, val)}
                    placeholder="+ 添加乌龙"
                 />
              </div>
            </div>

            <div className="mt-8">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                备注 / 战报摘要
              </label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="记录比赛的关键时刻、天气或特殊情况..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 outline-none h-24 resize-none"
                style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              />
            </div>

          </div>
          
          {error && (
            <div className="mx-6 md:mx-10 mt-6 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {successMsg && (
             <div className="mx-6 md:mx-10 mt-6 bg-emerald-50 border border-emerald-100 text-emerald-600 p-3 rounded-lg flex items-center text-sm animate-pulse">
               <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
               {successMsg}
             </div>
          )}

          <div className="p-6 md:p-10 pt-4">
            <button 
              onClick={handleSave}
              className="w-full text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center group"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Save className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
              {initialData ? '更新比赛记录' : '保存比赛记录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInput;