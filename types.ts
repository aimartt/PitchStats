export interface DataItem {
  [key: string]: string | number | boolean | null | undefined | any;
}

export interface Team {
  id: string;
  name: string;
  logo?: string; // Base64 or Emoji
  createdAt: string;
}

export interface OpponentTeam {
  id: string;
  name: string;
  logo?: string; // Base64 string
  teamId: string; // Data Isolation
}

// New Interface for isolated simple assets
export interface TeamAsset {
  id: string;
  name: string;
  teamId: string;
  sortOrder?: number; // Added for sorting
}

export interface PlayerProfile {
  name: string;
  number?: string;
  position?: string;
  avatar?: string; // Base64 string for profile picture
  teamId?: string; // Data Isolation
}

export interface GoalDetail {
  scorer: string;
  assist?: string;
  isPenalty?: boolean; // New: Is this goal a penalty?
}

// New Interface for detailed GK stats in a match
export interface GoalkeeperStat {
  player: string;
  conceded: number;
}

export interface MatchRecord extends DataItem {
  id?: string; // Unique ID for editing
  teamId?: string; // Data Isolation
  date: string;
  opponent: string; // Stored as name for now
  ourScore: number;
  opponentScore: number;
  location: string; // Home/Away/Neutral
  venue?: string;   // Specific field name (e.g. "Senayan Stadium")
  result?: string;
  
  // Basic Info
  season?: string;
  round?: number;
  matchType?: '友谊赛' | '联赛' | '队内赛' | '杯赛' | string;
  format?: '五人制' | '八人制' | '十一人制' | string;
  
  // Squad Info
  squad?: string[];     // List of player names in the match squad
  starters?: string[];  // List of player names who started
  goalkeepers?: string[]; // Deprecated but kept for backward compatibility: List of player names
  
  // Detailed Stats
  goalsDetails?: GoalDetail[];
  goalkeeperStats?: GoalkeeperStat[]; // New: Detailed GK stats
  yellowCards?: string[]; // List of player names
  redCards?: string[];    // List of player names
  penaltiesWon?: string[]; // List of player names (who won the penalty)
  ownGoals?: string[];    // List of player names (who scored own goal)
  
  notes?: string;
  
  // New Field: Explicitly control if this match counts towards team stats
  countForStats?: boolean; 
}

export interface AnalysisResponse {
  summary: string;
  keyTrends: string[];
  recommendations: string[];
}

export enum AppRoute {
  LOGIN = 'login',
  TEAM_SELECT = 'team-select', 
  DASHBOARD = 'dashboard',
  MATCH_LIST = 'match-list',
  MATCH_DETAIL = 'match-detail', // NEW
  DATA_ENTRY = 'data-entry',
  AI_INSIGHTS = 'ai-insights',
  OPPONENTS = 'opponents',
  SEASONS = 'seasons',
  VENUES = 'venues',
  PLAYERS = 'players',
  USERS_MANAGEMENT = 'users-management',
  TEAMS_MANAGEMENT = 'teams-management', 
  SETTINGS = 'settings'
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

// --- Auth Types ---

export type UserRole = 'admin' | 'captain' | 'player';

export interface User {
  id: string;
  username: string;
  password: string; // In real app, this should be hashed
  name: string;
  role: UserRole;
  teamIds: string[]; // List of Team IDs this user belongs to
  linkedPlayerNames?: Record<string, string>; // Map teamId -> playerName. Binds user to a specific player profile.
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// --- Theme Types ---
export type ThemeColor = 
  'emerald' | 'blue' | 'rose' | 'violet' | 'orange' | 'slate' | 'cyan' | 'sky' | 'indigo' | 
  'red' | 'amber' | 'lime' | 'green' | 'teal' | 'purple' | 'fuchsia' | 'pink';

export interface ThemeConfig {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  text: string;
}

// --- Storage Types ---

export const STORAGE_KEYS = {
  TEAMS: 'pitchstats_teams',
  DATA: 'pitchstats_data',
  OPPONENTS: 'pitchstats_opponents',
  SEASONS: 'pitchstats_seasons',
  VENUES: 'pitchstats_venues',
  PLAYERS: 'pitchstats_players',
  USERS: 'pitchstats_users',
  CURRENT_SESSION: 'pitchstats_session',
  THEME: 'pitchstats_theme'
};

export interface FullDatabase {
  teams: Team[];
  users: User[];
  matches: MatchRecord[];
  opponents: OpponentTeam[]; 
  seasons: TeamAsset[];   // Updated to TeamAsset
  venues: TeamAsset[];    // Updated to TeamAsset
  players: PlayerProfile[];
  theme?: ThemeColor; // Added theme persistence
}

// --- Component Props ---

export interface DashboardProps {
  data: DataItem[];
  seasons: string[]; // Added sorted seasons
}

export interface PlayerManagerProps {
  players: PlayerProfile[]; 
  matches: MatchRecord[];
  seasons: string[]; // Added sorted seasons
  onAddPlayer: (player: PlayerProfile) => void;
  onRemovePlayer: (name: string) => void;
  onEditPlayer: (oldName: string, newProfile: PlayerProfile) => void;
  currentUserRole?: UserRole; // Added to control view/edit permissions
}

export interface OpponentManagerProps {
  opponents: OpponentTeam[];
  matches: MatchRecord[];
  onAddOpponent: (team: OpponentTeam) => void;
  onRemoveOpponent: (id: string) => void;
  onEditOpponent: (id: string, name: string, logo?: string) => void;
  currentTeamName?: string;
}

export interface TeamManagerProps {
  teams: Team[];
  onAddTeam: (name: string, logo?: string) => void;
  onEditTeam: (id: string, name: string, logo?: string) => void;
}

// Updated Manager Props for Seasons/Venues
export interface SeasonManagerProps {
  seasons: TeamAsset[];
  onAddSeason: (name: string, sortOrder?: number) => void;
  onRemoveSeason: (id: string) => void;
  onEditSeason: (id: string, newName: string, sortOrder?: number) => void;
}

export interface VenueManagerProps {
  venues: TeamAsset[];
  onAddVenue: (name: string, sortOrder?: number) => void;
  onRemoveVenue: (id: string) => void;
  onEditVenue: (id: string, newName: string, sortOrder?: number) => void;
}

export interface SettingsPageProps {
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
}

export interface DataInputProps {
  onDataLoaded: (data: DataItem[], isAppend?: boolean) => void;
  opponentList: OpponentTeam[]; 
  seasonList: string[]; // Still passes string names for the dropdown
  venueList: string[];  // Still passes string names for the dropdown
  playerList: PlayerProfile[];
  onBack: () => void;
  initialData?: MatchRecord; 
  currentTeamName?: string;
}