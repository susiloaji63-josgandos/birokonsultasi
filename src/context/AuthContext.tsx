import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'guru_biro' | 'guru_umum';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string;
  needsPasswordChange?: boolean;
  teacherId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; needsChange?: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  allUsers: User[];
  registerUser: (userData: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
  resetPassword: (userId: string, newPassword?: string) => string;
  changePassword: (userId: string, newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: User = {
  id: 'admin-root',
  username: 'admin',
  name: 'Administrator',
  role: 'admin',
  password: 'admin',
  needsPasswordChange: false,
};

export const DEFAULT_USERS: User[] = [
  DEFAULT_ADMIN,
  { id: 'gb-sarah', username: 'sarah', name: 'Sarah Amelia, S.Pd.', role: 'guru_biro', password: 'admin', teacherId: 't-sarah' },
  { id: 'gb-widya', username: 'widya', name: 'Widya, S.Pd.', role: 'guru_biro', password: 'admin', teacherId: 't-widya' },
  { id: 'gb-joko', username: 'joko', name: 'Joko Susanto, S.Pd.', role: 'guru_biro', password: 'admin', teacherId: 't-joko' },
  { id: 'gb-mega', username: 'mega', name: 'Mega Rahmawati, S.Pd.', role: 'guru_biro', password: 'admin', teacherId: 't-mega' },
  { id: 'gb-rini', username: 'rini', name: 'Rini Astuti, M.Pd.', role: 'guru_biro', password: 'admin', teacherId: 't-rini' },
  { id: 'gb-charir', username: 'charir', name: 'Charir Maulana, S.Pd.', role: 'guru_biro', password: 'admin', teacherId: 't-charir' },
  { id: 'gu-angga', username: 'angga', name: 'Pak Angga', role: 'guru_umum', password: 'admin', teacherId: 't-angga' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hadirin_auth_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hadirin_users');
    if (!saved) return DEFAULT_USERS;
    try {
      const parsed: User[] = JSON.parse(saved);
      const merged = [...parsed];
      DEFAULT_USERS.forEach(def => {
        if (!merged.some(m => m.username.toLowerCase() === def.username.toLowerCase() || m.id === def.id)) {
          merged.push(def);
        }
      });
      return merged;
    } catch {
      return DEFAULT_USERS;
    }
  });

  useEffect(() => {
    localStorage.setItem('hadirin_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('hadirin_auth_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('hadirin_auth_session');
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string; needsChange?: boolean }> => {
    await new Promise(r => setTimeout(r, 800));

    const foundUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!foundUser) {
      return { success: false, message: 'Username tidak terdaftar' };
    }

    if (foundUser.password !== password) {
      return { success: false, message: 'Password salah' };
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    const sessionUser = userWithoutPassword as User;
    
    setUser(sessionUser);
    return { 
      success: true, 
      message: 'Login berhasil', 
      needsChange: foundUser.needsPasswordChange 
    };
  };

  const logout = () => {
    setUser(null);
  };

  const registerUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      needsPasswordChange: false,
    };
    setAllUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (id: string) => {
    if (id === 'admin-root') return;
    setAllUsers(prev => prev.filter(u => u.id !== id));
    if (user?.id === id) {
      logout();
    }
  };

  const resetPassword = (userId: string, newPassword?: string) => {
    const pwd = newPassword || '123456';
    setAllUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, password: pwd } : u
    ));
    return pwd;
  };

  const changePassword = (userId: string, newPassword: string) => {
    setAllUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, password: newPassword, needsPasswordChange: false } : u
    ));
    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, needsPasswordChange: false } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      allUsers,
      registerUser,
      deleteUser,
      resetPassword,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
