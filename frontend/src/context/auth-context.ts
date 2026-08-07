import { createContext } from 'react';

export type AuthUser = { name: string; email: string };
export type AuthContextValue = { user: AuthUser; demo: boolean; logout: () => void };

export const AuthContext = createContext<AuthContextValue | null>(null);
