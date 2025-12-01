
import { User, UserRole, STORAGE_KEYS, Team } from '../types';

// Mock Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Get all users from storage
  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  // Save users to storage
  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Register a new user
  register: async (username: string, password: string, name: string, role: UserRole): Promise<{ success: boolean; message?: string; user?: User }> => {
    await delay(500);
    const users = authService.getUsers();
    
    if (users.find(u => u.username === username)) {
      return { success: false, message: '用户名已存在' };
    }

    // Auto-assign to the first available team for demo purposes
    const teamsStr = localStorage.getItem(STORAGE_KEYS.TEAMS);
    const teams: Team[] = teamsStr ? JSON.parse(teamsStr) : [];
    const defaultTeamId = teams.length > 0 ? teams[0].id : 'team-default-001';

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password, // Note: storing plain text for this demo. DO NOT do this in production.
      name,
      role,
      teamIds: [defaultTeamId]
    };

    users.push(newUser);
    authService.saveUsers(users);
    
    // Auto login after register
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  // Create User (Admin Action)
  createUser: async (user: User): Promise<{ success: boolean; message?: string }> => {
    await delay(300);
    const users = authService.getUsers();
    if (users.find(u => u.username === user.username)) {
      return { success: false, message: '用户名已存在' };
    }
    users.push(user);
    authService.saveUsers(users);
    return { success: true };
  },

  // Login
  login: async (username: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    await delay(500);
    const users = authService.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(user));
      return { success: true, user };
    }

    return { success: false, message: '用户名或密码错误' };
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  },

  // Check current session
  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  // --- Management Methods ---
  
  updateUser: async (updatedUser: User): Promise<boolean> => {
    await delay(300);
    const users = authService.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index !== -1) {
      users[index] = updatedUser;
      authService.saveUsers(users);
      
      // If updating current user, update session too
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === updatedUser.id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(updatedUser));
      }
      return true;
    }
    return false;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    await delay(300);
    let users = authService.getUsers();
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    
    if (users.length !== initialLength) {
      authService.saveUsers(users);
      return true;
    }
    return false;
  }
};
