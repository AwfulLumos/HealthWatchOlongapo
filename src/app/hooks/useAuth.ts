import { useState, useCallback } from 'react';
import type { LoginCredentials, AuthState } from '../models';
import { authService } from '../services';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => authService.getAuthState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback((credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    const result = authService.login(credentials);
    
    if (result.success && result.user) {
      setAuthState({ user: result.user, isAuthenticated: true });
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setAuthState({ user: null, isAuthenticated: false });
  }, []);

  const changePassword = useCallback((oldPassword: string, newPassword: string) => {
    if (!authState.user) {
      return { success: false, error: 'Not logged in' };
    }
    return authService.changePassword(authState.user.id, oldPassword, newPassword);
  }, [authState.user]);

  const refreshAuthState = useCallback(() => {
    setAuthState(authService.getAuthState());
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading,
    error,
    login,
    logout,
    changePassword,
    refreshAuthState,
  };
}
