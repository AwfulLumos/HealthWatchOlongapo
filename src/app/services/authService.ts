import type { User, LoginCredentials, AuthState } from '../models';
import { storage } from './storage';

const STORAGE_KEY = 'auth';
const USERS_KEY = 'users';

// Default demo users
const defaultUsers: (User & { password: string })[] = [
  {
    id: 'U-0001',
    username: 'admin',
    password: 'admin123',
    email: 'admin@healthwatch.ph',
    role: 'Admin',
    accountStatus: 'Active',
  },
  {
    id: 'U-0002',
    username: 'doctor',
    password: 'doctor123',
    email: 'doctor@healthwatch.ph',
    role: 'Doctor',
    staffId: 'S-0001',
    accountStatus: 'Active',
  },
  {
    id: 'U-0003',
    username: 'nurse',
    password: 'nurse123',
    email: 'nurse@healthwatch.ph',
    role: 'Nurse',
    staffId: 'S-0002',
    accountStatus: 'Active',
  },
];

function getUsers(): (User & { password: string })[] {
  const stored = storage.get<(User & { password: string })[] | null>(USERS_KEY, null);
  if (stored === null) {
    storage.set(USERS_KEY, defaultUsers);
    return defaultUsers;
  }
  return stored;
}

function getAuthState(): AuthState {
  return storage.get<AuthState>(STORAGE_KEY, { user: null, isAuthenticated: false });
}

function setAuthState(state: AuthState): void {
  storage.set(STORAGE_KEY, state);
}

export const authService = {
  login(credentials: LoginCredentials): { success: boolean; user?: User; error?: string } {
    const users = getUsers();
    const user = users.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    if (user.accountStatus === 'Inactive') {
      return { success: false, error: 'Account is inactive' };
    }

    // Update last login
    const userIndex = users.findIndex(u => u.id === user.id);
    users[userIndex] = { ...user, lastLogin: new Date().toISOString() };
    storage.set(USERS_KEY, users);

    // Create auth state (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    const authState: AuthState = {
      user: userWithoutPassword,
      isAuthenticated: true,
    };
    setAuthState(authState);

    return { success: true, user: userWithoutPassword };
  },

  logout(): void {
    setAuthState({ user: null, isAuthenticated: false });
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

  changePassword(userId: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    if (users[userIndex].password !== oldPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    users[userIndex] = { ...users[userIndex], password: newPassword };
    storage.set(USERS_KEY, users);

    return { success: true };
  },
};
