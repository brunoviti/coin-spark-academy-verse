
import React, { createContext, useContext, useState, useEffect } from "react";

type UserRole = "student" | "teacher" | "admin";

interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  coins?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo purposes
const mockUsers = {
  student: {
    id: "s1",
    name: "Alex Estudiante",
    role: "student" as UserRole,
    avatarUrl: "/avatar-student.png",
    coins: 125
  },
  teacher: {
    id: "t1",
    name: "Prof. García",
    role: "teacher" as UserRole,
    avatarUrl: "/avatar-teacher.png"
  },
  admin: {
    id: "a1",
    name: "Admin Escolar",
    role: "admin" as UserRole,
    avatarUrl: "/avatar-admin.png"
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    setUser(mockUsers[role]);
    localStorage.setItem("userRole", role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userRole");
  };

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole | null;
    if (savedRole && mockUsers[savedRole]) {
      setUser(mockUsers[savedRole]);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
