import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import MatchList from './pages/MatchList';
import MatchDetail from './pages/MatchDetail';
import DataInput from './pages/DataInput';
import Dashboard from './pages/Dashboard';
import AIAnalysis from './pages/AIAnalysis';
import OpponentManager from './pages/OpponentManager';
import SeasonManager from './pages/SeasonManager';
import VenueManager from './pages/VenueManager';
import PlayerManager from './pages/PlayerManager';
import UserManager from './pages/UserManager';
import TeamSelect from './pages/TeamSelect';
import TeamManager from './pages/TeamManager';
import SettingsPage from './pages/Settings';
import { AppRoute, DataItem, User, STORAGE_KEYS, ThemeColor, ThemeConfig, MatchRecord, PlayerProfile, Team, OpponentTeam, TeamAsset } from './types';
import { authService } from './services/auth';
import { defaultDb } from './data/db';
import { storageService } from './services/storage';

// Theme Configuration
const THEMES: Record<ThemeColor, ThemeConfig> = {
  emerald: { primary: '#059669', primaryHover: '#047857', primaryLight: '#ecfdf5', text: '#064e3b' },
  blue: { primary: '#2563eb', primaryHover: '#1d4ed8', primaryLight: '#eff6ff', text: '#1e3a8a' },
  rose: { primary: '#e11d48', primaryHover: '#be123c', primaryLight: '#fff1f2', text: '#881337' },
  violet: { primary: '#7c3aed', primaryHover: '#6d28d9', primaryLight: '#f5f3ff', text: '#4c1d95' },
  orange: { primary: '#ea580c', primaryHover: '#c2410c', primaryLight: '#fff7ed', text: '#7c2d12' },
  slate: { primary: '#475569', primaryHover: '#334155', primaryLight: '#f8fafc', text: '#0f172a' },
  cyan: { primary: '#0891b2', primaryHover: '#0e7490', primaryLight: '#ecfeff', text: '#164e63' },
  sky: { primary: '#0284c7', primaryHover: '#0369a1', primaryLight: '#f0f9ff', text: '#0c4a6e' },
  indigo: { primary: '#4f46e5', primaryHover: '#4338ca', primaryLight: '#eef2ff', text: '#312e81' },
  red: { primary: '#ef4444', primaryHover: '#dc2626', primaryLight: '#fef2f2', text: '#991b1b' },
  amber: { primary: '#f59e0b', primaryHover: '#d97706', primaryLight: '#fffbeb', text: '#92400e' },
  lime: { primary: '#84cc16', primaryHover: '#65a30d', primaryLight: '#f7fee7', text: '#3f6212' },
  green: { primary: '#22c55e', primaryHover: '#16a34a', primaryLight: '#f0fdf4', text: '#14532d' },
  teal: { primary: '#14b8a6', primaryHover: '#0d9488', primaryLight: '#f0fdfa', text: '#134e4a' },
  purple: { primary: '#a855f7', primaryHover: '#9333ea', primaryLight: '#faf5ff', text: '#6b21a8' },
  fuchsia: { primary: '#d946ef', primaryHover: '#c026d3', primaryLight: '#fdf4ff', text: '#86198f' },
  pink: { primary: '#ec4899', primaryHover: '#db2777', primaryLight: '#fdf2f8', text: '#9d174d' },
};

// Initialize storage before app starts
storageService.initialize();

const AppContent: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Set to false as we initialize lazily
  const [authState, setAuthState] = useState<{ user: User | null; isAuthenticated: boolean }>(() => {
    const user = authService.getCurrentUser();
    return {
      user,
      isAuthenticated: !!user,
    };
  });
  
  // Multi-tenancy State
  const [teams, setTeams] = useState<Team[]>(() => {
    const teamsStr = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return teamsStr ? JSON.parse(teamsStr) : defaultDb.teams;
  });
  const [currentTeam, setCurrentTeam] = useState<Team | null>(() => {
    const user = authService.getCurrentUser();
    if (user && user.teamIds && user.teamIds.length > 0) {
      const teamsStr = localStorage.getItem(STORAGE_KEYS.TEAMS);
      const loadedTeams: Team[] = teamsStr ? JSON.parse(teamsStr) : defaultDb.teams;
      const validTeams = loadedTeams.filter(t => user.teamIds.includes(t.id));
      if (validTeams.length > 0) return validTeams[0];
    }
    return null;
  });

  // Global Data State
  const [rawData, setRawData] = useState<MatchRecord[]>(() => {
    const storedData = localStorage.getItem(STORAGE_KEYS.DATA);
    return storedData ? JSON.parse(storedData) : defaultDb.matches;
  });
  const [allOpponents, setAllOpponents] = useState<OpponentTeam[]>(() => {
    const storedOpponents = localStorage.getItem(STORAGE_KEYS.OPPONENTS);
    return storedOpponents ? JSON.parse(storedOpponents) : defaultDb.opponents;
  });
  const [allSeasons, setAllSeasons] = useState<TeamAsset[]>(() => {
    const storedSeasons = localStorage.getItem(STORAGE_KEYS.SEASONS);
    return storedSeasons ? JSON.parse(storedSeasons) : defaultDb.seasons;
  });
  const [allVenues, setAllVenues] = useState<TeamAsset[]>(() => {
    const storedVenues = localStorage.getItem(STORAGE_KEYS.VENUES);
    return storedVenues ? JSON.parse(storedVenues) : defaultDb.venues;
  });
  const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>(() => {
    const storedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return storedPlayers ? JSON.parse(storedPlayers) : defaultDb.players;
  });

  // Theme State
  const [theme, setTheme] = useState<ThemeColor>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeColor;
    if (savedTheme && THEMES[savedTheme]) return savedTheme;
    return (defaultDb.theme as ThemeColor) || 'emerald';
  });

  // Edit / View State
  const [editingMatch, setEditingMatch] = useState<MatchRecord | undefined>(undefined);
  const [viewingMatch, setViewingMatch] = useState<MatchRecord | undefined>(undefined);
  const [matchDetailOrigin, setMatchDetailOrigin] = useState<AppRoute>(AppRoute.MATCH_LIST);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Apply theme to document root
    const config = THEMES[theme] || THEMES.emerald;
    const root = document.documentElement;
    root.style.setProperty('--primary', config.primary);
    root.style.setProperty('--primary-hover', config.primaryHover);
    root.style.setProperty('--primary-light', config.primaryLight);
    root.style.setProperty('--primary-text', config.text);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const filteredMatches = useMemo(() => currentTeam ? rawData.filter(m => m.teamId === currentTeam.id) : [], [rawData, currentTeam]);
  const filteredOpponents = useMemo(() => currentTeam ? allOpponents.filter(o => o.teamId === currentTeam.id) : [], [allOpponents, currentTeam]);
  const filteredSeasons = useMemo(() => currentTeam ? allSeasons.filter(s => s.teamId === currentTeam.id).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : [], [allSeasons, currentTeam]);
  const filteredVenues = useMemo(() => currentTeam ? allVenues.filter(v => v.teamId === currentTeam.id).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : [], [allVenues, currentTeam]);
  const filteredPlayers = useMemo(() => currentTeam ? allPlayers.filter(p => p.teamId === currentTeam.id) : [], [allPlayers, currentTeam]);

  const handleLogin = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setAuthState({ user, isAuthenticated: true });
      const userTeams = teams.filter(t => user.teamIds.includes(t.id));
      if (userTeams.length > 0) {
        setCurrentTeam(userTeams[0]);
        navigate(AppRoute.DASHBOARD);
      } else {
        alert("该账号未分配任何球队，请联系管理员。");
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  const handleTeamSelect = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
      navigate(AppRoute.DASHBOARD);
    }
  };

  const handleDataLoaded = (newItems: DataItem[], isAppend: boolean = false) => {
    if (!currentTeam) return;
    let updatedData: MatchRecord[];
    const records = (newItems as MatchRecord[]).map(r => ({ ...r, teamId: currentTeam.id }));

    if (isAppend) {
      updatedData = [...rawData];
      records.forEach(newRecord => {
         if (newRecord.id) {
           const index = updatedData.findIndex(r => r.id === newRecord.id);
           if (index !== -1) updatedData[index] = newRecord;
           else updatedData.push(newRecord);
         } else {
           updatedData.push({ ...newRecord, id: `match-${Date.now()}` });
         }
      });
    } else {
      updatedData = [...rawData.filter(m => m.teamId !== currentTeam.id), ...records];
    }
    
    setRawData(updatedData);
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(updatedData));
    setEditingMatch(undefined);
  };

  const handleAddOpponent = (team: OpponentTeam) => {
    if (!currentTeam) return;
    const updated = [...allOpponents, { ...team, teamId: currentTeam.id }];
    setAllOpponents(updated);
    localStorage.setItem(STORAGE_KEYS.OPPONENTS, JSON.stringify(updated));
  };

  const handleRemoveOpponent = (id: string) => {
    const updated = allOpponents.filter(o => o.id !== id);
    setAllOpponents(updated);
    localStorage.setItem(STORAGE_KEYS.OPPONENTS, JSON.stringify(updated));
  };

  const handleEditOpponent = (id: string, name: string, logo?: string) => {
    const updated = allOpponents.map(o => o.id === id ? { ...o, name, logo } : o);
    setAllOpponents(updated);
    localStorage.setItem(STORAGE_KEYS.OPPONENTS, JSON.stringify(updated));
  };

  const handleAddSeason = (name: string, sortOrder: number = 0, result?: string) => {
    if (!currentTeam) return;
    const updated = [...allSeasons, { id: `sea-${Date.now()}`, name, teamId: currentTeam.id, sortOrder, result }];
    setAllSeasons(updated);
    localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify(updated));
  };

  const handleRemoveSeason = (id: string) => {
    const updated = allSeasons.filter(s => s.id !== id);
    setAllSeasons(updated);
    localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify(updated));
  };

  const handleEditSeason = (id: string, name: string, sortOrder: number = 0, result?: string) => {
    const updated = allSeasons.map(s => s.id === id ? { ...s, name, sortOrder, result } : s);
    setAllSeasons(updated);
    localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify(updated));
  };

  const handleAddVenue = (name: string, sortOrder: number = 0) => {
    if (!currentTeam) return;
    const updated = [...allVenues, { id: `ven-${Date.now()}`, name, teamId: currentTeam.id, sortOrder }];
    setAllVenues(updated);
    localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(updated));
  };

  const handleRemoveVenue = (id: string) => {
    const updated = allVenues.filter(v => v.id !== id);
    setAllVenues(updated);
    localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(updated));
  };

  const handleEditVenue = (id: string, name: string, sortOrder: number = 0) => {
    const updated = allVenues.map(v => v.id === id ? { ...v, name, sortOrder } : v);
    setAllVenues(updated);
    localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(updated));
  };

  const handleAddPlayer = (player: PlayerProfile) => {
    if (!currentTeam) return;
    const updated = [...allPlayers, { ...player, teamId: currentTeam.id }];
    setAllPlayers(updated);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
  };

  const handleRemovePlayer = (name: string) => {
    if (!currentTeam) return;
    const updated = allPlayers.filter(p => !(p.name === name && p.teamId === currentTeam.id));
    setAllPlayers(updated);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
  };

  const handleEditPlayer = (oldName: string, newProfile: PlayerProfile) => {
    if (!currentTeam) return;
    const updated = allPlayers.map(p => (p.name === oldName && p.teamId === currentTeam.id) ? { ...newProfile, teamId: currentTeam.id } : p);
    setAllPlayers(updated);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
  };

  const handleAddTeam = (name: string, logo?: string) => {
    const updated = [...teams, { id: `team-${Date.now()}`, name, logo, createdAt: new Date().toISOString() }];
    setTeams(updated);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(updated));
  };

  const handleEditTeam = (id: string, name: string, logo?: string) => {
    const updated = teams.map(t => t.id === id ? { ...t, name, logo } : t);
    setTeams(updated);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(updated));
  };

  const handleEditMatch = (match: MatchRecord) => {
    setEditingMatch(match);
    navigate(AppRoute.DATA_ENTRY);
  };

  const handleViewMatch = (match: MatchRecord, origin: AppRoute = AppRoute.MATCH_LIST) => {
    setViewingMatch(match);
    setMatchDetailOrigin(origin);
    navigate(AppRoute.MATCH_DETAIL);
  };

  const handleNavigate = (route: AppRoute) => {
    if (!authState.isAuthenticated && route !== AppRoute.LOGIN) {
       navigate(AppRoute.LOGIN);
       return;
    }
    if (authState.isAuthenticated && !currentTeam && route !== AppRoute.TEAM_SELECT && route !== AppRoute.LOGIN) {
       const userTeams = teams.filter(t => authState.user?.teamIds.includes(t.id));
       if (userTeams.length > 0) setCurrentTeam(userTeams[0]);
       else { navigate(AppRoute.LOGIN); return; }
    }
    const role = authState.user?.role || 'player';
    if ([AppRoute.USERS_MANAGEMENT, AppRoute.TEAMS_MANAGEMENT, AppRoute.SETTINGS].includes(route)) {
       if (role !== 'admin') { alert("无权访问"); return; }
    }
    if ([AppRoute.SEASONS, AppRoute.VENUES].includes(route)) {
      if (role === 'player') { alert("仅队长和管理员可访问"); return; }
    }
    if (route !== AppRoute.DATA_ENTRY) setEditingMatch(undefined);
    navigate(route);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
  if (!authState.isAuthenticated) return <Login onLoginSuccess={handleLogin} />;
  
  const userTeams = authState.user ? teams.filter(t => authState.user!.teamIds.includes(t.id)) : [];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Routes>
        <Route path={AppRoute.TEAM_SELECT} element={ authState.user ? <TeamSelect user={authState.user} availableTeams={userTeams} onSelectTeam={handleTeamSelect} /> : <Navigate to={AppRoute.LOGIN} /> } />
        <Route path="*" element={
          <>
            <Sidebar currentRoute={location.pathname.replace('/', '') as AppRoute} onNavigate={handleNavigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} currentUser={authState.user} currentTeam={currentTeam} userTeams={userTeams} onLogout={handleLogout} onSwitchTeam={() => navigate(AppRoute.TEAM_SELECT)} onSelectTeam={handleTeamSelect} />
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
              <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shrink-0">
                <h1 className="text-lg font-bold text-slate-800">PitchStats 球队助手</h1>
                <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              </div>
              <main className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
                <Routes>
                  <Route path={AppRoute.DASHBOARD} element={<Dashboard data={filteredMatches} seasons={filteredSeasons} />} />
                  <Route path={AppRoute.MATCH_LIST} element={<MatchList matches={filteredMatches} onNavigate={handleNavigate} currentUserRole={authState.user?.role} seasons={filteredSeasons.map(s => s.name)} onEditMatch={handleEditMatch} onViewMatch={(m) => handleViewMatch(m, AppRoute.MATCH_LIST)} currentTeamName={currentTeam?.name} currentTeamLogo={currentTeam?.logo} />} />
                  <Route path={AppRoute.MATCH_DETAIL} element={ viewingMatch ? <MatchDetail match={viewingMatch} onBack={() => navigate(matchDetailOrigin)} currentTeamName={currentTeam?.name} currentTeamLogo={currentTeam?.logo} opponentList={filteredOpponents} playerList={filteredPlayers} /> : <Navigate to={AppRoute.MATCH_LIST} /> } />
                  <Route path={AppRoute.DATA_ENTRY} element={<DataInput onDataLoaded={handleDataLoaded} opponentList={filteredOpponents} seasonList={filteredSeasons.map(s => s.name)} venueList={filteredVenues.map(v => v.name)} playerList={filteredPlayers} onBack={() => handleNavigate(AppRoute.MATCH_LIST)} initialData={editingMatch} currentTeamName={currentTeam?.name} /> } />
                  <Route path={AppRoute.AI_INSIGHTS} element={<AIAnalysis data={filteredMatches} />} />
                  <Route path={AppRoute.OPPONENTS} element={<OpponentManager opponents={filteredOpponents} matches={filteredMatches} onAddOpponent={handleAddOpponent} onRemoveOpponent={handleRemoveOpponent} onEditOpponent={handleEditOpponent} onViewMatch={(m) => handleViewMatch(m, AppRoute.OPPONENTS)} currentTeamName={currentTeam?.name} currentTeamLogo={currentTeam?.logo} currentUserRole={authState.user?.role} />} />
                  <Route path={AppRoute.SEASONS} element={<SeasonManager seasons={filteredSeasons} onAddSeason={handleAddSeason} onRemoveSeason={handleRemoveSeason} onEditSeason={handleEditSeason} />} />
                  <Route path={AppRoute.VENUES} element={<VenueManager venues={filteredVenues} onAddVenue={handleAddVenue} onRemoveVenue={handleRemoveVenue} onEditVenue={handleEditVenue} />} />
                  <Route path={AppRoute.PLAYERS} element={<PlayerManager players={filteredPlayers} matches={filteredMatches} seasons={filteredSeasons.map(s => s.name)} onAddPlayer={handleAddPlayer} onRemovePlayer={handleRemovePlayer} onEditPlayer={handleEditPlayer} onViewMatch={(m) => handleViewMatch(m, AppRoute.PLAYERS)} currentUserRole={authState.user?.role} />} />
                  <Route path={AppRoute.USERS_MANAGEMENT} element={<UserManager currentUser={authState.user!} teams={teams} players={allPlayers} />} />
                  <Route path={AppRoute.TEAMS_MANAGEMENT} element={<TeamManager teams={teams} onAddTeam={handleAddTeam} onEditTeam={handleEditTeam} />} />
                  <Route path={AppRoute.SETTINGS} element={<SettingsPage currentTheme={theme} onThemeChange={setTheme} />} />
                  <Route path="/" element={<Navigate to={AppRoute.DASHBOARD} replace />} />
                </Routes>
              </main>
            </div>
          </>
        } />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;