import { defineStore } from 'pinia';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async register(email: string, password: string, name: string) {
      try {
        this.loading = true;
        this.error = null;
        const { user, token } = await api.register({ email, password, name });
        this.user = user;
        this.token = token;
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Registration failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async login(email: string, password: string) {
      try {
        this.loading = true;
        this.error = null;
        const { user, token } = await api.login({ email, password });
        this.user = user;
        this.token = token;
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      if (!this.token) return;
      
      try {
        this.loading = true;
        this.error = null;
        this.user = await api.getCurrentUser();
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch user data';
        this.logout();
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      api.logout();
    }
  }
});