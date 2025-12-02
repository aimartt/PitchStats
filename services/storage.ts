
import { FullDatabase, STORAGE_KEYS, MatchRecord, User, ThemeColor } from '../types';
import { defaultDb } from '../data/db';

export const storageService = {
  /**
   * Initialize LocalStorage with default data from db.ts if empty or missing critical keys
   */
  initialize: () => {
    // Helper to check if a key exists
    const hasKey = (key: string) => localStorage.getItem(key) !== null;

    // Load critical data points if users are missing, we assume init is needed.
    // Also, we ensure defaultDb is loaded if localStorage is empty to support the request "Get all data from db.json on startup"
    // However, we must respect existing user data if it exists. 
    // The requirement says "Start... get all data from db.json". 
    // We will initialize missing keys from defaultDb.
    
    if (!hasKey(STORAGE_KEYS.USERS)) {
      console.log('Initializing Users from db.ts...');
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultDb.users));
    }

    if (!hasKey(STORAGE_KEYS.TEAMS)) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(defaultDb.teams));
    }
    
    if (!hasKey(STORAGE_KEYS.DATA)) {
       localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(defaultDb.matches));
    }

    if (!hasKey(STORAGE_KEYS.OPPONENTS)) {
       localStorage.setItem(STORAGE_KEYS.OPPONENTS, JSON.stringify(defaultDb.opponents));
    }

    if (!hasKey(STORAGE_KEYS.SEASONS)) {
       localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify(defaultDb.seasons));
    }
    
    if (!hasKey(STORAGE_KEYS.VENUES)) {
       localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(defaultDb.venues));
    }

    if (!hasKey(STORAGE_KEYS.PLAYERS)) {
       localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(defaultDb.players));
    }
    
    // Theme initialization (Requested: load from db.json on startup if needed)
    if (!hasKey(STORAGE_KEYS.THEME)) {
       const theme = defaultDb.theme || 'emerald';
       localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
  },

  /**
   * Export all data to a JSON object
   */
  exportDatabase: (): FullDatabase => {
    return {
      teams: JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]'),
      users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
      matches: JSON.parse(localStorage.getItem(STORAGE_KEYS.DATA) || '[]'),
      opponents: JSON.parse(localStorage.getItem(STORAGE_KEYS.OPPONENTS) || '[]'),
      seasons: JSON.parse(localStorage.getItem(STORAGE_KEYS.SEASONS) || '[]'),
      venues: JSON.parse(localStorage.getItem(STORAGE_KEYS.VENUES) || '[]'),
      players: JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS) || '[]'),
      theme: (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeColor) || 'emerald',
    };
  },

  /**
   * Import data from a JSON object, overwriting current state
   */
  importDatabase: (db: FullDatabase): boolean => {
    try {
      if (db.teams) localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(db.teams));
      if (db.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(db.users));
      if (db.matches) localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(db.matches));
      if (db.opponents) localStorage.setItem(STORAGE_KEYS.OPPONENTS, JSON.stringify(db.opponents));
      if (db.seasons) localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify(db.seasons));
      if (db.venues) localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(db.venues));
      if (db.players) localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(db.players));
      if (db.theme) localStorage.setItem(STORAGE_KEYS.THEME, db.theme);
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  }
};