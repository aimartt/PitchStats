import React, { useMemo } from 'react';
import { MatchRecord, PlayerProfile, OpponentTeam } from '../types';
import { ArrowLeft, MapPin, Calendar, Trophy, Flag, Users, Info, Shirt, UserCog } from 'lucide-react';

interface MatchDetailProps {
  match: MatchRecord;
  onBack: () => void;
  currentTeamName?: string;
  opponentList: OpponentTeam[];
  playerList: PlayerProfile[];
}

const MatchDetail: React.FC<MatchDetailProps> = ({ match, onBack, currentTeamName, opponentList, playerList }) => {
  
  const currentOpponent = useMemo(() => 
    opponentList.find(o => o.name === match.opponent), 
  [match.opponent, opponentList]);

  const getResultColor = (result?: string) => {
    if (result === 'Win') return 'bg-emerald-500 text-white';
    if (result === 'Loss') return 'bg-red-500 text-white';
    return 'bg-amber-500 text-white';
  };

  const getResultLabel = (result?: string) => {
    if (result === 'Win') return '胜利';
    if (result === 'Loss') return '失利';
    return '平局';
  };

  const isInternalMatch = match.matchType === '队内赛';

  const hasDisciplineEvents = ((match.yellowCards?.length || 0) + (match.redCards?.length || 0) + (match.penaltiesWon?.length || 0) + (match.penaltiesMissed?.length || 0) + (match.ownGoals?.length || 0)) > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      
      {/* Header / Nav */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">比赛详情</h2>
      </div>

      {/* Main Scoreboard Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-24 md:h-32 bg-slate-900 overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>

        <div className="relative pt-6 pb-6 px-4 md:pt-10 md:pb-8 md:px-6 text-center z-10">
           {/* Date & Meta */}
           <div className="inline-flex flex-wrap justify-center items-center gap-2 md:gap-3 bg-slate-800/80 backdrop-blur-sm text-slate-300 px-3 py-1.5 md:px-4 rounded-full text-xs font-medium mb-6 md:mb-8 border border-slate-700">
              <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{match.date}</span>
              <span className="w-px h-3 bg-slate-600 hidden md:block"></span>
              <span className="flex items-center"><Trophy className="w-3 h-3 mr-1" />{match.season} {match.round ? `· 第${match.round}轮` : ''}</span>
              <span className="w-px h-3 bg-slate-600 hidden md:block"></span>
              <span className="flex items-center"><Flag className="w-3 h-3 mr-1" />{match.matchType}</span>
           </div>

           <div className="flex flex-row items-center justify-between gap-2 md:gap-12 max-w-2xl mx-auto">
              
              {/* Home Team */}
              <div className="flex-1 flex flex-col items-center">
                 <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-white border-4 border-slate-100 shadow-xl flex items-center justify-center mb-2 md:mb-4 text-xl md:text-3xl font-bold text-slate-700">
                    H
                 </div>
                 <h3 className="text-sm md:text-xl font-black text-slate-800 leading-tight">
                    {currentTeamName || '我方'}
                 </h3>
                 <span className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Home</span>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center px-2">
                 {isInternalMatch ? (
                   <div className="bg-slate-100 text-slate-500 px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-lg border border-slate-200 border-dashed whitespace-nowrap">
                      队内赛
                   </div>
                 ) : (
                   <>
                     <div className="text-4xl md:text-6xl font-black text-slate-900 font-mono tracking-tighter leading-none mb-2 drop-shadow-sm">
                        {match.ourScore}:{match.opponentScore}
                     </div>
                     <div className={`px-3 py-0.5 md:px-4 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-sm ${getResultColor(match.result)}`}>
                        {getResultLabel(match.result)}
                     </div>
                   </>
                 )}
              </div>

              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center">
                 <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-white border-4 border-slate-100 shadow-xl flex items-center justify-center mb-2 md:mb-4 text-xl md:text-3xl font-bold text-slate-700 overflow-hidden">
                    {currentOpponent?.logo ? (
                       <img src={currentOpponent.logo} className="w-full h-full object-cover" />
                    ) : (
                       match.opponent.charAt(0)
                    )}
                 </div>
                 <h3 className="text-sm md:text-xl font-black text-slate-800 leading-tight">
                    {match.opponent}
                 </h3>
                 <span className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Away</span>
              </div>

           </div>
           
           {/* Venue & Coach Info Footer */}
           <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6">
              <div className="flex items-center text-xs md:text-sm text-slate-500 font-medium">
                 <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                 {match.venue || (match.location === 'Home' ? '主场' : match.location === 'Away' ? '客场' : '中立场地')}
                 {match.format && (
                    <>
                      <span className="mx-2 md:mx-3 text-slate-300">|</span>
                      <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {match.format}
                    </>
                 )}
              </div>
              
              {match.coach && (
                 <>
                   <div className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></div>
                   <div className="flex items-center text-xs md:text-sm text-slate-600 font-medium bg-indigo-50 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-indigo-100">
                      <UserCog className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                      主教练: {match.coach}
                   </div>
                 </>
              )}
           </div>
        </div>
      </div>

      {/* Match Stats / Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
         
         {/* Goals & Assists */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
            <h3 className="font-bold text-slate-800 mb-3 md:mb-4 flex items-center text-sm md:text-base">
               <span className="mr-2 text-lg">⚽</span> 进球与助攻
            </h3>
            {match.goalsDetails && match.goalsDetails.length > 0 ? (
               <div className="space-y-2 md:space-y-3">
                  {match.goalsDetails.map((goal, idx) => (
                     <div key={idx} className="flex items-center justify-between p-2.5 md:p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-slate-800 text-sm md:text-base">{goal.scorer}</span>
                           {goal.isPenalty ? (
                               <span className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">点球</span>
                           ) : (
                               <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold">进球</span>
                           )}
                        </div>
                        {goal.assist && (
                           <div className="text-xs md:text-sm text-slate-500 flex items-center">
                              <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold mr-1.5">助攻</span>
                              {goal.assist}
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            ) : (
               <div className="text-center py-6 md:py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-sm">
                  本场无进球记录
               </div>
            )}
         </div>

         {/* Squad & Discipline */}
         <div className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
               <h3 className="font-bold text-slate-800 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                  <Shirt className="w-4 h-4 md:w-5 md:h-5 mr-2 text-indigo-500" /> 
                  出场阵容 ({match.squad?.length || 0}人)
               </h3>
               {match.squad && match.squad.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                     {match.squad.map((player, idx) => {
                        const isStarter = match.starters?.includes(player);
                        const isGK = match.goalkeeperStats 
                                     ? match.goalkeeperStats.some(g => g.player === player)
                                     : match.goalkeepers?.includes(player);
                        
                        // Find stats if GK
                        const gkStat = match.goalkeeperStats?.find(g => g.player === player);

                        return (
                           <span key={idx} className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium border flex items-center gap-1 ${isStarter ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                              {player}
                              {isGK && (
                                 <span className="text-[10px] bg-slate-800 text-white px-1 md:px-1.5 rounded ml-0.5 flex items-center gap-0.5" title={gkStat ? `失球: ${gkStat.conceded}` : '守门员'}>
                                    GK
                                    {gkStat && <span className="opacity-70 border-l border-slate-600 pl-0.5 ml-0.5">-{gkStat.conceded}</span>}
                                 </span>
                              )}
                           </span>
                        );
                     })}
                  </div>
               ) : (
                  <div className="text-slate-400 text-sm italic">未记录阵容</div>
               )}
            </div>

            {/* Discipline */}
            {hasDisciplineEvents && (
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                   <h3 className="font-bold text-slate-800 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                      <Info className="w-4 h-4 md:w-5 md:h-5 mr-2 text-amber-500" /> 
                      关键事件
                   </h3>
                   <div className="flex flex-wrap gap-2">
                       {match.yellowCards?.map((p, i) => (
                           <div key={`yc-${i}`} className="flex items-center bg-yellow-50 text-yellow-800 px-2 py-1 rounded-md text-xs font-bold border border-yellow-200">
                               <div className="w-1.5 h-2.5 bg-yellow-400 mr-1.5 rounded-[1px] border border-black/10"></div>
                               {p}
                           </div>
                       ))}
                       {match.redCards?.map((p, i) => (
                           <div key={`rc-${i}`} className="flex items-center bg-red-50 text-red-800 px-2 py-1 rounded-md text-xs font-bold border border-red-200">
                               <div className="w-1.5 h-2.5 bg-red-500 mr-1.5 rounded-[1px] border border-black/10"></div>
                               {p}
                           </div>
                       ))}
                       {match.penaltiesWon?.map((p, i) => (
                           <div key={`pw-${i}`} className="flex items-center bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold border border-slate-200">
                               <div className="w-2 h-2 rounded-full border-2 border-slate-400 mr-1.5"></div>
                               {p} (造点)
                           </div>
                       ))}
                       {match.penaltiesMissed?.map((p, i) => (
                           <div key={`pm-${i}`} className="flex items-center bg-rose-50 text-rose-700 px-2 py-1 rounded-md text-xs font-bold border border-rose-200">
                               <div className="w-2 h-2 rounded-full border-2 border-rose-400 mr-1.5"></div>
                               {p} (失点)
                           </div>
                       ))}
                       {match.ownGoals?.map((p, i) => (
                           <div key={`og-${i}`} className="flex items-center bg-slate-800 text-white px-2 py-1 rounded-md text-xs font-bold border border-slate-700">
                               <span className="mr-1 text-[10px]">⚽</span>
                               {p} (乌龙)
                           </div>
                       ))}
                   </div>
               </div>
            )}
         </div>
      </div>

      {match.notes && (
         <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 md:p-6">
            <h3 className="font-bold text-slate-800 mb-2 text-sm md:text-base">比赛备注</h3>
            <p className="text-slate-600 text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
               {match.notes}
            </p>
         </div>
      )}

    </div>
  );
};

export default MatchDetail;