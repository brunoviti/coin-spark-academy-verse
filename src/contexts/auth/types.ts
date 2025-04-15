
import { Database } from "@/integrations/supabase/types";

// Usar el mismo tipo de rol definido en Supabase
export type UserRole = Database["public"]["Enums"]["user_role"];

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  coins?: number;
  schoolId?: string;
  schoolName?: string;
  email?: string;
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
