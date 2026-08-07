import type { ReactNode } from 'react';
import { AuthContext, type AuthUser } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const user: AuthUser = { name: 'Mihriban', email: 'admin@adpulse.com' };

  return (
    <AuthContext.Provider value={{ user, demo: true, logout: () => console.log('Çıkış yapıldı') }}>
      {children}
    </AuthContext.Provider>
  );
}
