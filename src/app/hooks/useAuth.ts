import { useState, useCallback } from 'react';
import type { LoginCredentials, AuthState } from '../models';
import { authService } from '../services';
import { storage } from '../services/storage';
import { 
  checkRateLimit, 
  resetRateLimit, 
  clearSessionActivity,
  updateLastActivity 
} from '../utils/security';

const LOGIN_RATE_LIMIT_KEY = 'login_attempts';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;  // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000;        // 15 minutes

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => authService.getAuthState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remainingAttempts: number;
    lockedUntil: Date | null;
  }>({ remainingAttempts: MAX_LOGIN_ATTEMPTS, lockedUntil: null });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    // Check rate limit before attempting login
    const rateCheck = checkRateLimit(
      LOGIN_RATE_LIMIT_KEY,
      MAX_LOGIN_ATTEMPTS,
      LOGIN_WINDOW_MS,
      LOCKOUT_MS
    );

    if (!rateCheck.allowed) {
      setLoading(false);
      setError(rateCheck.message || 'Too many failed attempts. Please try again later.');
      setRateLimitInfo({
        remainingAttempts: 0,
        lockedUntil: rateCheck.lockedUntil,
      });
      return { success: false, error: rateCheck.message };
    }

    const result = await authService.login(credentials);
    
    if (result.success && result.user) {
      // Reset rate limit on successful login
      resetRateLimit(LOGIN_RATE_LIMIT_KEY);
      setRateLimitInfo({ remainingAttempts: MAX_LOGIN_ATTEMPTS, lockedUntil: null });
      
      // Update last activity for session timeout
      updateLastActivity();
      
      setAuthState({ user: result.user, isAuthenticated: true });
    } else {
      setError(result.error || 'Login failed');
      
      // Update rate limit info
      const updatedRateCheck = checkRateLimit(
        LOGIN_RATE_LIMIT_KEY,
        MAX_LOGIN_ATTEMPTS,
        LOGIN_WINDOW_MS,
        LOCKOUT_MS
      );
      setRateLimitInfo({
        remainingAttempts: updatedRateCheck.remainingAttempts,
        lockedUntil: updatedRateCheck.lockedUntil,
      });
    }
    
    setLoading(false);
    return result;
  }, []);

  const logout = useCallback(async () => {
    // Clear auth state
    await authService.logout();
    setAuthState({ user: null, isAuthenticated: false });
    
    // Clear all application storage for security
    storage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear session activity tracking
    clearSessionActivity();
    
    // Reset rate limit info
    setRateLimitInfo({ remainingAttempts: MAX_LOGIN_ATTEMPTS, lockedUntil: null });
    
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      }).catch(() => {
        // Silently fail if cache clearing is not supported
      });
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!authState.user) {
      return { success: false, error: 'Not logged in' };
    }
    return await authService.changePassword(authState.user.id, oldPassword, newPassword);
  }, [authState.user]);

  const refreshAuthState = useCallback(() => {
    setAuthState(authService.getAuthState());
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading,
    error,
    rateLimitInfo,
    login,
    logout,
    changePassword,
    refreshAuthState,
  };
}
