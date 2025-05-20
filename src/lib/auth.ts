import type { User, UserRole } from '@/types';

export const MOCK_USERS: Record<string, User> = {
  'admin@gmr.com': { id: 'user-admin', email: 'admin@gmr.com', name: 'Usuario Admin', role: 'admin' },
  'hospital@gmr.com': { id: 'user-hospital', email: 'hospital@gmr.com', name: 'Personal Hospital', role: 'hospital' },
  'individual@gmr.com': { id: 'user-individual', email: 'individual@gmr.com', name: 'Usuario Individual', role: 'individual' },
  'ambulance@gmr.com': { id: 'user-ambulance', email: 'ambulance@gmr.com', name: 'Equipo Ambulancia', role: 'ambulance' },
};

const AUTH_TOKEN_KEY = 'gmrAuthToken';
const USER_INFO_KEY = 'gmrUserInfo';

export async function login(email: string): Promise<User | null> {
  const user = MOCK_USERS[email];
  if (user) {
    // In a real app, you'd get a token from the server
    const mockToken = `mock-token-for-${user.id}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    }
    return user;
  }
  return null;
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
}

export function getStoredUser(): User | null {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem(USER_INFO_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
  return null;
}
