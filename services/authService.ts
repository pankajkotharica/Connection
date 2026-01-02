import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface User {
  id: number;
  username: string;
  bhagCode: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

const STORAGE_KEY = 'join_rss_user';

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<User> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, username, bhag_code')
      .eq('username', credentials.username)
      .eq('password', credentials.password)
      .single();

    if (error || !data) {
      throw new Error('Invalid username or password');
    }

    const user: User = {
      id: data.id,
      username: data.username,
      bhagCode: data.bhag_code,
    };

    // Store user in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return user;
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(STORAGE_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
};

