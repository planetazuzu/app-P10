
import type { User, UserFormValues, UserRole } from '@/types';

export const MOCK_USERS: Record<string, User> = {
  'admin@gmr.com': { id: 'user-admin', email: 'admin@gmr.com', name: 'Administrador Principal', role: 'admin', password: 'password123' },
  'hospital@gmr.com': { id: 'user-hospital', email: 'hospital@gmr.com', name: 'Personal Hospitalario General', role: 'hospital', password: 'password123' },
  'individual@gmr.com': { id: 'user-individual', email: 'individual@gmr.com', name: 'Paciente Individual', role: 'individual', password: 'password123' },
  'coordinador@gmr.com': { id: 'user-centro-coordinador-01', email: 'coordinador@gmr.com', name: 'Coordinador de Flota', role: 'centroCoordinador', password: 'password123' },
  'vehiculo.AMB101@gmr.com': { id: 'user-vehiculo-AMB101', email: 'vehiculo.AMB101@gmr.com', name: 'Equipo Móvil (AMB101)', role: 'equipoMovil', password: 'password123'},
};

const AUTH_TOKEN_KEY = 'gmrAuthToken';
const USER_INFO_KEY = 'gmrUserInfo';

export async function login(email: string): Promise<User | null> {
  const user = MOCK_USERS[email];
  if (user) {
    // In a real app, you would verify the password here
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
  MOCK_USERS[newUser.email] = newUser; 
  console.log("Usuario añadido (simulado):", newUser);
  console.log("MOCK_USERS actualizado:", MOCK_USERS);
  return newUser;
}

// Simulates getting a user by ID
export function mockGetUserById(userId: string): User | null {
  const user = Object.values(MOCK_USERS).find(u => u.id === userId);
  return user || null;
}

// Simulates updating a user
export function mockUpdateUser(userId: string, dataToUpdate: Partial<UserFormValues>): User | null {
  const userEmail = Object.keys(MOCK_USERS).find(email => MOCK_USERS[email].id === userId);
  if (userEmail && MOCK_USERS[userEmail]) {
    const updatedUser = { ...MOCK_USERS[userEmail], ...dataToUpdate };
    
    // If password is provided and not empty, update it. Otherwise, keep the old one.
    // For mock purposes, we store it, but in real app, hash it.
    if (dataToUpdate.password && dataToUpdate.password.trim() !== '') {
        updatedUser.password = dataToUpdate.password;
    } else {
        updatedUser.password = MOCK_USERS[userEmail].password; // Keep old password
    }

    MOCK_USERS[userEmail] = updatedUser;
    console.log("Usuario actualizado (simulado):", updatedUser);
    console.log("MOCK_USERS actualizado:", MOCK_USERS);
    return updatedUser;
  }
  return null;
}
