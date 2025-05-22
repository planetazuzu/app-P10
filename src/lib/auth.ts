
import type { User, UserRole } from '@/types';

export const MOCK_USERS: Record<string, User> = {
  'admin@gmr.com': { id: 'user-admin', email: 'admin@gmr.com', name: 'Administrador Principal', role: 'admin' },
  'hospital@gmr.com': { id: 'user-hospital', email: 'hospital@gmr.com', name: 'Personal Hospitalario General', role: 'hospital' },
  'individual@gmr.com': { id: 'user-individual', email: 'individual@gmr.com', name: 'Paciente Individual', role: 'individual' },
  'coordinador@gmr.com': { id: 'user-centro-coordinador-01', email: 'coordinador@gmr.com', name: 'Coordinador de Flota', role: 'centroCoordinador' },
  'vehiculo.AMB101@gmr.com': { id: 'user-vehiculo-AMB101', email: 'vehiculo.AMB101@gmr.com', name: 'Equipo Móvil (AMB101)', role: 'equipoMovil'},
};

const AUTH_TOKEN_KEY = 'gmrAuthToken';
const USER_INFO_KEY = 'gmrUserInfo';

export async function login(email: string): Promise<User | null> {
  const user = MOCK_USERS[email];
  if (user) {
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

// Simulates adding a user to MOCK_USERS for the current session
export function mockAddUser(userData: Omit<User, 'id'>): User {
  const newId = `user-${Date.now().toString().slice(-6)}`;
  const newUser: User = { ...userData, id: newId };
  MOCK_USERS[newUser.email] = newUser; // Add to the in-memory mock
  return newUser;
}
