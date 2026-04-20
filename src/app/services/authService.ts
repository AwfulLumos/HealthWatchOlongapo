import type { User, LoginCredentials, AuthState } from '../models';
import { apiClient } from './api';

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

function getAuthState(): AuthState {
  const user = localStorage.getItem(USER_KEY);
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    user: user ? JSON.parse(user) : null,
    isAuthenticated: !!token,
  };
}

function setAuthState(user: User | null, accessToken?: string, refreshToken?: string): void {
  if (user && accessToken) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } else {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await apiClient.post('/api/v1/auth/login', credentials);
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        setAuthState(user, accessToken, refreshToken);
        return { success: true, user };
      }
      
      return { success: false, error: response.data.message || 'Login failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      return { success: false, error: errorMessage };
    }
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState(null);
    }
  },

  getCurrentUser(): User | null {
    return getAuthState().user;
  },

  isAuthenticated(): boolean {
    return getAuthState().isAuthenticated;
  },

  getAuthState(): AuthState {
    return getAuthState();
  },

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken });
      
      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        const currentUser = getAuthState().user;
        if (currentUser) {
          setAuthState(currentUser, accessToken, newRefreshToken);
        }
        return true;
      }
      return false;
    } catch (error) {
      setAuthState(null);
      return false;
    }
  },

  async changePassword(_userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post('/api/v1/auth/change-password', {
        oldPassword,
        newPassword,
      });
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.message || 'Password change failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      return { success: false, error: errorMessage };
    }
  },

  async register(data: { username: string; email: string; password: string; role: string; staffId?: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await apiClient.post('/api/v1/auth/register', data);
      
      if (response.data.success) {
        return { success: true, user: response.data.data };
      }
      
      return { success: false, error: response.data.message || 'Registration failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  },

  async getProfile(): Promise<User | null> {
    try {
      const response = await apiClient.get('/api/v1/auth/profile');
      if (response.data.success) {
        const user = response.data.data;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      return null;
    }
  },
};
