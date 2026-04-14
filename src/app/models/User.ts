export type UserRole = 'Admin' | 'Employee';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  staffId?: string;
  accountStatus: 'Active' | 'Inactive';
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
