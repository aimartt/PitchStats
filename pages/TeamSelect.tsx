
import React from 'react';
import { Team, User } from '../types';
import { Trophy, ArrowRight, Shield, Activity } from 'lucide-react';

interface TeamSelectProps {
  user: User;
  availableTeams: Team[];
  onSelectTeam: (teamId: string) => void;
}

const TeamSelect: React.FC<TeamSelectProps> = ({ user, availableTeams, onSelectTeam }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="z-10 w-full max-w-5xl animate-fade-in flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-full mb-6">
             <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">PitchStats Workspace</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            欢迎回来, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">{user.name}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            请选择您要进入的球队工作区以开始管理比赛数据。
          </p>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
          {availableTeams.length > 0 ? (
            availableTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => onSelectTeam(team.id)}
                className="group relative flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 text-left overflow-hidden"
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-2xl font-bold text-slate-400 group-hover:text-white group-hover:border-indigo-500/50 shadow-inner overflow-hidden transition-all duration-300 group-hover:scale-105">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      team.name.charAt(0)
                    )}
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/50 text-slate-500 group-hover:text-emerald-400 group-hover:bg-emerald-950/30 transition-colors">
                     <Shield className="w-5 h-5" />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-1 truncate">
                    {team.name}
                  </h3>
                  <div className="flex items-center text-xs text-slate-500 font-medium uppercase tracking-wider">
                    <Activity className="w-3 h-3 mr-1.5" />
                    点击进入管理
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/50 flex items-center justify-between relative z-10">
                   <span className="text-sm font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
                     Enter Workspace
                   </span>
                   <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300 group-hover:translate-x-1">
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                   </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
               <Trophy className="w-16 h-16 mx-auto text-slate-700 mb-4" />
               <p className="text-slate-500 font-medium">暂无可用球队</p>
               <p className="text-sm text-slate-600 mt-2">请联系管理员为您分配球队权限。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSelect;
