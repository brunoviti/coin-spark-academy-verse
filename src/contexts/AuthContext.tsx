
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithRole: (role: UserRole) => void; // For demo purposes
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo purposes (will be used until auth is fully implemented)
const mockUsers = {
  student: {
    id: "s1",
    name: "Alex Estudiante",
    role: "student" as UserRole,
    avatarUrl: "/avatar-student.png",
    coins: 125,
    schoolId: "school1"
  },
  teacher: {
    id: "t1",
    name: "Prof. García",
    role: "teacher" as UserRole,
    avatarUrl: "/avatar-teacher.png",
    schoolId: "school1"
  },
  admin: {
    id: "a1",
    name: "Admin Escolar",
    role: "admin" as UserRole,
    avatarUrl: "/avatar-admin.png",
    schoolId: "school1"
  },
  super_admin: {
    id: "sa1",
    name: "Super Administrador",
    role: "super_admin" as UserRole,
    avatarUrl: "/avatar-admin.png"
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile from our profiles table
          // Use type casting to avoid TypeScript errors with table names
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) throw error;
          
          if (profile) {
            // Use type assertion to access profile properties
            setUser({
              id: profile.id as string,
              name: profile.name as string,
              role: profile.role as UserRole,
              avatarUrl: profile.avatar_url as string | undefined,
              coins: profile.coins as number | undefined,
              schoolId: profile.school_id as string | undefined
            });
          }
        } else {
          // Check if we have a saved mock role (for demo purposes)
          const savedRole = localStorage.getItem("userRole") as UserRole | null;
          if (savedRole && mockUsers[savedRole]) {
            setUser(mockUsers[savedRole]);
          }
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
        toast({
          title: "Error",
          description: "There was a problem retrieving your session",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile from our profiles table
          // Use type casting to avoid TypeScript errors with table names
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error("Error getting user profile:", error);
            return;
          }
          
          if (profile) {
            // Use type assertion to access profile properties
            setUser({
              id: profile.id as string,
              name: profile.name as string,
              role: profile.role as UserRole,
              avatarUrl: profile.avatar_url as string | undefined,
              coins: profile.coins as number | undefined,
              schoolId: profile.school_id as string | undefined
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente",
      });
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Error al iniciar sesión",
        description: (error as Error).message || "Hubo un problema al iniciar sesión",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified login with role for demo purposes
  const loginWithRole = (role: UserRole) => {
    setUser(mockUsers[role]);
    localStorage.setItem("userRole", role);
    toast({
      title: "Inicio de sesión (demo)",
      description: `Has iniciado sesión como ${role}`,
    });
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Log out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Also clear any local storage mock user
      localStorage.removeItem("userRole");
      setUser(null);
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error al cerrar sesión",
        description: (error as Error).message || "Hubo un problema al cerrar sesión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login,
      loginWithRole,
      logout,
      isLoading
    }}>
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
