import { createContext, useContext } from 'react';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = { name: 'Mihriban', email: 'admin@adpulse.com' };
  
  return (
    <AuthContext.Provider value={{ user, demo: true, logout: () => console.log('Çıkış yapıldı') }}>
      {children}
    </AuthContext.Provider>
  );
}