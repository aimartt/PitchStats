
import React, { useState, useRef, useEffect } from 'react';
import { AppRoute, User, Team } from '../types';
import { LayoutDashboard, ClipboardList, Bot, Trophy, Users, CalendarRange, MapPin, Shirt, LogOut, User as UserIcon, UserCog, Settings, List, Briefcase, ChevronDown, Check } from 'lucide-react';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  currentUser: User | null;
  currentTeam: Team | null;
  userTeams: Team[];
  onLogout: () => void;
  onSwitchTeam: () => void; // Kept for backward compatibility if needed, but we use onSelectTeam now
  onSelectTeam: (teamId: string) => void; // New prop for direct switching
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentRoute, 
  onNavigate, 
  mobileOpen, 
  setMobileOpen, 
  currentUser, 
  currentTeam,
  userTeams,
  onLogout,
  onSwitchTeam,
  onSelectTeam
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isCaptain = currentUser?.role === 'captain';
  
  const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false);
  const teamMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (teamMenuRef.current && !teamMenuRef.current.contains(event.target as Node)) {
        setIsTeamMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Define all items
  const allNavItems = [
    { id: AppRoute.DASHBOARD, label: '球队统计', icon: Trophy, roles: ['admin', 'captain', 'player'] },
    { id: AppRoute.MATCH_LIST, label: '比赛记录', icon: List, roles: ['admin', 'captain', 'player'] },
    { id: AppRoute.PLAYERS, label: '球员管理', icon: Shirt, roles: ['admin', 'captain', 'player'] }, 
    { id: AppRoute.OPPONENTS, label: '对手管理', icon: Users, roles: ['admin', 'captain'] },
    { id: AppRoute.SEASONS, label: '赛季管理', icon: CalendarRange, roles: ['admin', 'captain'] },
    { id: AppRoute.VENUES, label: '场地管理', icon: MapPin, roles: ['admin', 'captain'] },
    { id: AppRoute.TEAMS_MANAGEMENT, label: '球队管理', icon: Briefcase, roles: ['admin'] }, 
    { id: AppRoute.USERS_MANAGEMENT, label: '用户权限', icon: UserCog, roles: ['admin'] },
    { id: AppRoute.SETTINGS, label: '系统设置', icon: Settings, roles: ['admin'] },
    { id: AppRoute.AI_INSIGHTS, label: 'AI 教练', icon: Bot, roles: ['admin', 'captain', 'player'] },
  ];

  // Filter based on role
  const navItems = allNavItems.filter(item => 
    item.roles.includes(currentUser?.role || 'player')
  );

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col
  `;

  const handleTeamClick = (teamId: string) => {
    onSelectTeam(teamId);
    setIsTeamMenuOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <div className={sidebarClasses}>
        {/* App Title */}
        <div className="flex items-center justify-center h-16 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <div 
              className="p-1.5 rounded-md text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Trophy className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              PitchStats
            </h1>
          </div>
        </div>

        {/* Current Team Info & Switcher (Dropdown) */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 relative" ref={teamMenuRef}>
           <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">当前管理球队</label>
              <button 
                onClick={() => userTeams.length > 1 && setIsTeamMenuOpen(!isTeamMenuOpen)}
                disabled={userTeams.length <= 1}
                className={`flex items-center justify-between bg-slate-800 rounded-lg p-3 border border-slate-700 transition-all ${userTeams.length > 1 ? 'hover:border-slate-500 cursor-pointer hover:bg-slate-700' : 'cursor-default'}`}
              >
                 <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden text-white">
                       {currentTeam?.logo ? (
                         <img src={currentTeam.logo} alt="logo" className="w-full h-full object-cover" />
                       ) : (
                         currentTeam?.name.charAt(0) || 'T'
                       )}
                    </div>
                    <span className="font-bold text-sm truncate">{currentTeam?.name || '选择球队'}</span>
                 </div>
                 {userTeams.length > 1 && (
                   <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isTeamMenuOpen ? 'rotate-180' : ''}`} />
                 )}
              </button>

              {/* Dropdown Menu */}
              {isTeamMenuOpen && (
                <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {userTeams.map(team => {
                      const isActive = currentTeam?.id === team.id;
                      return (
                        <button
                          key={team.id}
                          onClick={() => handleTeamClick(team.id)}
                          className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${isActive ? 'bg-slate-50' : ''}`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                             <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 overflow-hidden border border-slate-200">
                                {team.logo ? (
                                  <img src={team.logo} alt="logo" className="w-full h-full object-cover" />
                                ) : (
                                  team.name.charAt(0)
                                )}
                             </div>
                             <span className={`text-sm truncate ${isActive ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                               {team.name}
                             </span>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* User Info Block */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/50">
           <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2"
                style={{ 
                  backgroundColor: 'var(--primary-hover)',
                  borderColor: 'var(--primary)'
                }}
              >
                 {currentUser?.name?.charAt(0) || <UserIcon className="w-5 h-5" />}
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                 <p className="text-xs text-slate-400 capitalize flex items-center">
                    {isAdmin ? (
                       <span 
                        className="text-[10px] px-1.5 py-0.5 rounded mr-1 text-white opacity-80"
                        style={{ backgroundColor: 'var(--primary)' }}
                       >
                         管理员
                       </span>
                    ) : isCaptain ? (
                       <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[10px] mr-1">队长</span>
                    ) : (
                       <span className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px] mr-1">球员</span>
                    )}
                 </p>
              </div>
           </div>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            
            const activeStyle = {
               backgroundColor: 'var(--primary)',
               color: '#fff',
               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            };

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${!isActive ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : ''}`}
                style={isActive ? activeStyle : {}}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={() => {
               setMobileOpen(false);
               onLogout();
            }}
            className="w-full flex items-center px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
             <LogOut className="w-5 h-5 mr-3" />
             <span className="font-medium">退出登录</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
