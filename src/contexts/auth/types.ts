
import { Database } from "@/integrations/supabase/types";

export type UserRole = "student" | "teacher" | "admin" | "super_admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  coins?: number;
  schoolId?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  loginWithRole: (role: UserRole) => void; // For demo purposes
  logout: () => Promise<void>;
  isLoading: boolean;
}
