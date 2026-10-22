import sys

# 1. Update MatchDetail.tsx
with open('pages/MatchDetail.tsx', 'r', encoding='utf-8') as f:
    md_content = f.read()

target1 = '''  const hasDisciplineEvents = ((match.yellowCards?.length || 0) + (match.redCards?.length || 0) + (match.penaltiesWon?.length || 0) + (match.penaltiesMissed?.length || 0) + (match.ownGoals?.length || 0) + (match.penaltySaves?.length || 0)) > 0;'''
repl1 = '''  const hasDisciplineEvents = ((match.yellowCards?.length || 0) + (match.redCards?.length || 0) + (match.penaltiesWon?.length || 0) + (match.penaltiesMissed?.length || 0) + (match.ownGoals?.length || 0) + (match.penaltySaves?.length || 0)) > 0 || !!match.hasPenaltyShootout;'''

target2 = '''                     <div className="text-4xl md:text-6xl font-black text-slate-900 font-mono tracking-tighter leading-none mb-2 drop-shadow-sm">
                        {match.ourScore}:{match.opponentScore}
                     </div>
                     <div className={`px-3 py-0.5 md:px-4 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-sm ${getResultColor(match.result)}`}>'''

repl2 = '''                     <div className="text-4xl md:text-6xl font-black text-slate-900 font-mono tracking-tighter leading-none mb-2 drop-shadow-sm">
                        {match.ourScore}:{match.opponentScore}
                     </div>
                     {match.hasPenaltyShootout && match.penaltyShootoutOurScore !== undefined && match.penaltyShootoutOpponentScore !== undefined && (
                        <div className="mb-2 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs md:text-sm font-bold inline-flex items-center gap-1.5 shadow-xs">
                           <span>点球决胜</span>
                           <span className="font-mono font-black">{match.penaltyShootoutOurScore} : {match.penaltyShootoutOpponentScore}</span>
                           <span className="text-[10px] text-purple-500 font-medium">
                             ({match.penaltyShootoutOurScore > match.penaltyShootoutOpponentScore ? '点球获胜' : match.penaltyShootoutOurScore < match.penaltyShootoutOpponentScore ? '点球告负' : '点球战平'})
                           </span>
                        </div>
                     )}
                     <div className={`px-3 py-0.5 md:px-4 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-sm ${getResultColor(match.result)}`}>'''

target3 = '''                   <div className="flex flex-wrap gap-2">
                        {match.penaltySaves?.map((ps, i) => ('''

repl3 = '''                   <div className="flex flex-wrap gap-2">
                        {match.hasPenaltyShootout && match.penaltyShootoutOurScore !== undefined && match.penaltyShootoutOpponentScore !== undefined && (
                            <div className="flex items-center bg-purple-50 text-purple-800 px-2 py-1 rounded-md text-xs font-bold border border-purple-200">
                                <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
                                点球决胜: {match.penaltyShootoutOurScore}:{match.penaltyShootoutOpponentScore} ({match.penaltyShootoutOurScore > match.penaltyShootoutOpponentScore ? '点球获胜' : match.penaltyShootoutOurScore < match.penaltyShootoutOpponentScore ? '点球告负' : '点球战平'})
                            </div>
                        )}
                        {match.penaltySaves?.map((ps, i) => ('''

assert target1 in md_content, 'target1 not found in MatchDetail.tsx'
assert target2 in md_content, 'target2 not found in MatchDetail.tsx'
assert target3 in md_content, 'target3 not found in MatchDetail.tsx'

md_content = md_content.replace(target1, repl1, 1)
md_content = md_content.replace(target2, repl2, 1)
md_content = md_content.replace(target3, repl3, 1)

with open('pages/MatchDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(md_content)

print('MatchDetail.tsx updated.')

# 2. Update PlayerManager.tsx
with open('pages/PlayerManager.tsx', 'r', encoding='utf-8') as f:
    pm_content = f.read()

# Desktop match row
pm_target1 = '''                                                     <div className="flex items-center gap-2 mt-1">
                                                         <span className={`text-xs font-mono font-black ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-amber-500'}`}>
                                                            {match.ourScore}:{match.opponentScore}
                                                         </span>
                                                      </div>'''

pm_repl1 = '''                                                     <div className="flex items-center gap-2 mt-1">
                                                         <span className={`text-xs font-mono font-black ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-amber-500'}`}>
                                                            {match.ourScore}:{match.opponentScore}
                                                         </span>
                                                         {match.hasPenaltyShootout && match.penaltyShootoutOurScore !== undefined && match.penaltyShootoutOpponentScore !== undefined && (
                                                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.2 rounded font-sans">
                                                               点球 {match.penaltyShootoutOurScore}:{match.penaltyShootoutOpponentScore}
                                                            </span>
                                                         )}
                                                      </div>'''

# Mobile match row
pm_target2 = '''                                        <div className="flex items-center gap-3 pl-4 shrink-0 border-l border-slate-50">
                                           <div className="text-[10px] font-mono font-black text-slate-800">{match.ourScore}:{match.opponentScore}</div>'''

pm_repl2 = '''                                        <div className="flex items-center gap-3 pl-4 shrink-0 border-l border-slate-50">
                                           <div className="text-right">
                                              <div className="text-[10px] font-mono font-black text-slate-800">{match.ourScore}:{match.opponentScore}</div>
                                              {match.hasPenaltyShootout && match.penaltyShootoutOurScore !== undefined && match.penaltyShootoutOpponentScore !== undefined && (
                                                 <div className="text-[8px] font-bold text-purple-600 whitespace-nowrap">
                                                    点球 {match.penaltyShootoutOurScore}:{match.penaltyShootoutOpponentScore}
                                                 </div>
                                              )}
                                           </div>'''

assert pm_target1 in pm_content, 'pm_target1 not found in PlayerManager.tsx'
assert pm_target2 in pm_content, 'pm_target2 not found in PlayerManager.tsx'

pm_content = pm_content.replace(pm_target1, pm_repl1, 1)
pm_content = pm_content.replace(pm_target2, pm_repl2, 1)

with open('pages/PlayerManager.tsx', 'w', encoding='utf-8') as f:
    f.write(pm_content)

print('PlayerManager.tsx updated.')
