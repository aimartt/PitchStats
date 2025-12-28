
import React, { useState } from 'react';
import { MatchRecord, AppRoute, UserRole, MatchListProps } from '../types';
import { Plus, Calendar, MapPin, Search, Filter, Pencil, Trophy, Flag, Handshake, Shirt, ChevronRight, Crown, Users } from 'lucide-react';

const MatchList: React.FC<MatchListProps> = ({ matches, onNavigate, currentUserRole, seasons, onEditMatch, onViewMatch, currentTeamName, currentTeamLogo }) => {
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort matches by date descending (newest first)
  const safeMatches = Array.isArray(matches) ? matches : [];
  const sortedMatches = [...safeMatches].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    // Defensive check for invalid dates
    const validA = isNaN(dateA) ? 0 : dateA;
    const validB = isNaN(dateB) ? 0 : dateB;
    return validB - validA;
  });

  const filteredMatches = sortedMatches.filter(match => {
    const matchesSeason = selectedSeason === 'all' || match.season === selectedSeason;
    
    // Defensive check: Ensure strings exist before calling toLowerCase()
    const opponentName = match.opponent ? match.opponent.toLowerCase() : '';
    const venueName = match.venue ? match.venue.toLowerCase() : '';
    const term = searchTerm.toLowerCase();

    const matchesSearch = opponentName.includes(term) || venueName.includes(term);
    return matchesSeason && matchesSearch;
  });

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

  // Helper for background style based on match type
  const getMatchBackgroundStyle = (matchType?: string) => {
     switch(matchType) {
        case '联赛': return 'bg-gradient-to-br from-white via-emerald-50/30 to-emerald-50/60 border-emerald-200';
        case '杯赛': return 'bg-gradient-to-br from-white via-amber-50/30 to-amber-50/60 border-amber-200';
        case '友谊赛': return 'bg-gradient-to-br from-white via-sky-50/30 to-sky-50/60 border-sky-200';
        case '队内赛': return 'bg-slate-50 border-slate-200 border-dashed';
        default: return 'bg-white border-slate-200';
     }
  };

  const getWatermarkIcon = (matchType?: string) => {
    switch(matchType) {
       case '联赛': return <Trophy className="absolute right-[-10px] bottom-[-20px] w-32 h-32 md:w-40 md:h-40 text-emerald-100/50 -rotate-12 pointer-events-none" />;
       case '杯赛': return <Crown className="absolute right-[-10px] bottom-[-20px] w-32 h-32 md:w-40 md:h-40 text-amber-100/50 -rotate-12 pointer-events-none" />;
       case '友谊赛': return <Handshake className="absolute right-[-10px] bottom-[-20px] w-32 h-32 md:w-40 md:h-40 text-sky-100/50 -rotate-12 pointer-events-none" />;
       case '队内赛': return <Shirt className="absolute right-[-10px] bottom-[-20px] w-32 h-32 md:w-40 md:h-40 text-slate-200/50 -rotate-12 pointer-events-none" />;
       default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
             比赛记录
             <span className="text-xs md:text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
               {filteredMatches.length !== matches.length 
                 ? `显示 ${filteredMatches.length} / 共 ${matches.length} 场`
                 : `共 ${matches.length} 场`
               }
             </span>
           </h2>
           <p className="text-slate-500 text-sm mt-1">点击比赛卡片查看详情</p>
        </div>

        {currentUserRole === 'admin' && (
          <button 
            onClick={() => onNavigate(AppRoute.DATA_ENTRY)}
            className="flex items-center justify-center px-5 py-2.5 rounded-lg text-white font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            录入新比赛
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索对手或场地..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 outline-none"
              style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
            />
         </div>
         <div className="w-full md:w-48 relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none outline-none focus:ring-2 cursor-pointer"
              style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
            >
               <option value="all">所有赛季</option>
               {seasons.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
         </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match, idx) => (
            <div 
               key={match.id || idx} 
               onClick={() => onViewMatch && onViewMatch(match)}
               className={`rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all flex flex-col group relative cursor-pointer ${getMatchBackgroundStyle(match.matchType)}`}
            >
               
               {/* Watermark */}
               {getWatermarkIcon(match.matchType)}

               {/* Card Content */}
               <div className="px-4 py-3 md:pl-8 md:pr-6 md:py-5 w-full relative z-10">
                  
                  {/* Top Meta Row */}
                  <div className="flex flex-wrap items-center justify-between text-[10px] md:text-xs text-slate-500 mb-3 pb-2 border-b border-slate-900/5 gap-y-2">
                     <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                        <span className="font-bold text-slate-700 flex items-center bg-white/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                           <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 text-slate-400" />
                           {match.season} {match.round ? `· 第${match.round}轮` : ''}
                        </span>
                        
                        <span className="flex items-center text-slate-600 bg-white/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                           <Flag className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 opacity-80" />
                           {match.matchType || '友谊赛'}
                        </span>

                        {match.format && (
                           <span className="flex items-center text-slate-600 bg-white/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                              <Users className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 opacity-80" />
                              {match.format}
                           </span>
                        )}
                     </div>
                     <div className="font-medium text-slate-400 bg-white/60 px-2 py-0.5 rounded-md">
                        {new Date(match.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                     </div>
                  </div>

                  {/* Match Info (Scoreboard) */}
                  <div className="flex items-center justify-between mb-3">
                      {/* Home Team */}
                      <div className="flex-1 text-right flex items-center justify-end gap-2 md:gap-3">
                         <span className="font-bold text-slate-900 text-sm md:text-lg truncate max-w-[80px] sm:max-w-none" style={{ color: 'var(--primary-text)' }}>
                           {currentTeamName || '我方'}
                         </span>
                         <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs md:text-base text-slate-500 shrink-0 shadow-sm overflow-hidden">
                            {currentTeamLogo ? (
                               <img src={currentTeamLogo} alt="logo" className="w-full h-full object-cover" />
                            ) : (
                               'H'
                            )}
                         </div>
                      </div>

                      {/* Score Badge (High Contrast) */}
                      <div className={`mx-1.5 md:mx-6 px-2 md:px-4 py-1 md:py-2 rounded-xl border flex flex-col items-center min-w-[70px] md:min-w-[100px] shadow-sm transform group-hover:scale-105 transition-transform ${getResultColorClass(match.result)}`}>
                         <div className="text-xl md:text-3xl font-black font-mono leading-none tracking-tight">
                            {match.matchType === '队内赛' && match.ourScore === 0 && match.opponentScore === 0 ? (
                               <span className="text-xs md:text-sm font-sans font-bold uppercase tracking-wider">VS</span>
                            ) : (
                               `${match.ourScore} : ${match.opponentScore}`
                            )}
                         </div>
                         {match.matchType !== '队内赛' && (
                           <span className="text-[8px] md:text-[10px] font-bold uppercase mt-0.5 md:mt-1 opacity-90 tracking-widest border-t border-white/20 pt-0.5 w-full text-center">
                              {getResultLabel(match.result)}
                           </span>
                         )}
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 text-left flex items-center justify-start gap-2 md:gap-3">
                         <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs md:text-base text-slate-500 shrink-0 overflow-hidden shadow-sm">
                            {match.opponent ? match.opponent.charAt(0) : '?'}
                         </div>
                         <span className="font-bold text-slate-900 text-sm md:text-lg truncate max-w-[80px] sm:max-w-none">
                            {match.opponent || '未知对手'}
                         </span>
                      </div>
                  </div>

                  {/* Combined Stats: Goals, Assists, Cards, Events */}
                  {( (match.goalsDetails && match.goalsDetails.length > 0) || 
                     (((match.redCards?.length || 0) + (match.yellowCards?.length || 0) + (match.penaltiesWon?.length || 0) + (match.penaltiesMissed?.length || 0) + (match.ownGoals?.length || 0)) > 0)
                   ) && (
                     <div className="mt-3 pt-2 border-t border-dashed border-slate-200/60 space-y-1.5">
                        {/* Goals */}
                        {match.goalsDetails && match.goalsDetails.length > 0 && (
                           <div className="flex flex-wrap items-center gap-y-1 text-xs md:text-sm">
                               {match.goalsDetails.map((goal, idx) => (
                                  <div key={idx} className="flex items-center text-slate-700 mr-2 md:mr-3 last:mr-0">
                                     <span className="mr-1" role="img" aria-label="goal">⚽</span>
                                     <span className="font-bold">{goal.scorer}</span>
                                     {goal.isPenalty && <span className="text-[10px] text-red-500 ml-0.5 font-bold" title="点球">P</span>}
                                     {goal.assist && (
                                        <span className="text-[10px] md:text-xs text-slate-400 ml-1">
                                           (助:{goal.assist})
                                        </span>
                                     )}
                                     {idx < (match.goalsDetails?.length || 0) - 1 && (
                                        <span className="mx-1 md:mx-2 text-slate-300">·</span>
                                     )}
                                  </div>
                               ))}
                           </div>
                        )}

                        {/* Cards & Events */}
                        {((match.redCards?.length || 0) + (match.yellowCards?.length || 0) + (match.penaltiesWon?.length || 0) + (match.penaltiesMissed?.length || 0) + (match.ownGoals?.length || 0)) > 0 && (
                           <div className="flex flex-wrap gap-1.5 md:gap-2 text-[10px] md:text-xs">
                              {match.redCards?.map((p, i) => (
                                 <span key={`rc-${i}`} className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-100 font-bold" title="红牌">
                                    <div className="w-1.5 h-2.5 md:w-2 md:h-3 bg-red-500 mr-1 rounded-[1px] border border-black/10"></div>
                                    {p}
                                 </span>
                              ))}
                              {match.yellowCards?.map((p, i) => (
                                 <span key={`yc-${i}`} className="inline-flex items-center px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-100 font-bold" title="黄牌">
                                    <div className="w-1.5 h-2.5 md:w-2 md:h-3 bg-yellow-400 mr-1 rounded-[1px] border border-black/10"></div>
                                    {p}
                                 </span>
                              ))}
                              {match.penaltiesWon?.map((p, i) => (
                                 <span key={`pw-${i}`} className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold" title="造点">
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full border-2 border-slate-400 mr-1"></div>
                                    {p}(造点)
                                 </span>
                              ))}
                              {match.penaltiesMissed?.map((p, i) => (
                                 <span key={`pm-${i}`} className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-bold" title="失点">
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full border-2 border-rose-400 mr-1"></div>
                                    {p}(失点)
                                 </span>
                              ))}
                              {match.ownGoals?.map((p, i) => (
                                 <span key={`og-${i}`} className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-white border border-slate-700 font-bold" title="乌龙球">
                                    <span className="mr-1">⚽</span>
                                    {p}(乌龙)
                                 </span>
                              ))}
                           </div>
                        )}
                     </div>
                   )}

                  {/* Footer Meta Row */}
                  <div className="flex items-center justify-between pt-1 mt-2">
                      <div className="flex items-center gap-4 text-[10px] md:text-xs text-slate-500">
                         <div className="flex items-center bg-white/50 px-2 py-1 rounded" title="比赛场地">
                           <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 text-slate-400" />
                           <span className="truncate max-w-[100px] md:max-w-none font-medium">
                              {match.venue || (match.location === 'Home' ? '主场' : match.location === 'Away' ? '客场' : '中立场地')}
                           </span>
                         </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* View Detail Prompt */}
                        <span className="text-[10px] md:text-xs text-slate-400 group-hover:text-slate-600 flex items-center transition-colors">
                           详情 <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>

                        {/* Edit Button (Admin) */}
                        {currentUserRole === 'admin' && onEditMatch && (
                           <button 
                              onClick={(e) => {
                                 e.stopPropagation();
                                 onEditMatch(match);
                              }}
                              className="ml-2 md:ml-3 text-[10px] md:text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all shadow-sm z-20"
                           >
                              <Pencil className="w-3 h-3 md:w-3.5 md:h-3.5" />
                              编辑
                           </button>
                        )}
                      </div>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                <Search className="w-6 h-6 text-slate-300" />
             </div>
             <p className="text-slate-500 font-medium">没有找到符合条件的比赛</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchList;
