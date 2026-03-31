import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User, LoginCredentials, AuthState } from '../models';
import { authService } from '../services';

interface AuthContextType extends AuthState {
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => { success: boolean; error?: string };
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        loading,
        error,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
