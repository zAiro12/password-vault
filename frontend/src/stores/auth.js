import { defineStore } from 'pinia';
import api from '../plugins/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    userRole: (state) => state.user?.role || null
  },

  actions: {
    /**
     * Initialize auth state from localStorage
     */
    initAuth() {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('auth_user');

      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
      }
    },

    /**
     * Login user with email and password
     */
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/api/auth/login', credentials);
        const { token, user } = response.data;

        // Save to state
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;

        // Save to localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));

        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Register new user
     */
    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/api/auth/register', userData);
        const { token, user } = response.data;

        // Save to state
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;

        // Save to localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));

        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.error || 'Registration failed';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch current user data from API
     */
    async fetchUser() {
      if (!this.token) {
        return { success: false, error: 'No token available' };
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/api/auth/me');
        this.user = response.data.user;

        // Update localStorage
        localStorage.setItem('auth_user', JSON.stringify(this.user));

        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch user';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logout user
     */
    async logout() {
      try {
        // Call logout endpoint (optional, for server-side tracking)
        await api.post('/api/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear state
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        this.error = null;

        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  }
});
