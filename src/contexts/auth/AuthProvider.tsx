import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "./AuthContext";
import { User, UserRole } from "./types";
import { mockUsers } from "./mockUsers";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Añadir logs en el cuerpo principal
  console.log('[AUTH Provider Render] User State:', user);
  console.log('[AUTH Provider Render] IsLoading State:', isLoading);

  // Check for existing session on component mount
  useEffect(() => {
    // Set up auth state change listener FIRST to prevent issues
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Don't make Supabase calls directly in the callback to prevent deadlocks
          // Use setTimeout to defer the profile fetch
          setTimeout(async () => {
            try {
              // Get user profile from our profiles table
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
                
              // Añadir log antes de actualizar el estado
              console.log('[AUTH] Profile data received:', profile);
              
              if (error) {
                console.error("Error getting user profile:", error);
                return;
              }
              
              if (profile) {
                setUser({
                  id: profile.id as string,
                  name: profile.name as string,
                  role: profile.role as UserRole,
                  avatarUrl: profile.avatar_url as string | undefined,
                  coins: profile.coins as number | undefined,
                  schoolId: profile.school_id as string | undefined
                });
                
                // Añadir log después de actualizar el estado
                console.log('[AUTH] User state updated in AuthProvider');
              }
            } catch (error) {
              console.error("Error in auth state change:", error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile from our profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (error) throw error;
          
          if (profile) {
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

  const signup = async (email: string, password: string, name: string, role: UserRole = "student") => {
    try {
      setIsLoading(true);
      
      console.log("Starting signup process with:", { email, name, role });
      
      // Obtener la primera escuela disponible para el usuario nuevo
      let schoolId = undefined;
      try {
        const { data: schools } = await supabase
          .from('schools')
          .select('id')
          .limit(1);
          
        if (schools && schools.length > 0) {
          schoolId = schools[0].id;
          console.log("Found school for new user:", schoolId);
        }
      } catch (schoolError) {
        console.warn("Error fetching schools:", schoolError);
      }

      // Si no hay escuelas, crear una por defecto
      if (!schoolId) {
        try {
          const { data: newSchool, error: schoolCreateError } = await supabase
            .from('schools')
            .insert({
              name: 'Escuela por Defecto',
              coin_name: 'EduCoin',
              coin_symbol: 'EDC',
              max_supply: 10000,
              current_supply: 0
            })
            .select()
            .single();

          if (schoolCreateError) {
            console.error("Error creating default school:", schoolCreateError);
          } else if (newSchool) {
            schoolId = newSchool.id;
            console.log("Created default school for new user:", schoolId);
          }
        } catch (createSchoolError) {
          console.error("Error creating default school:", createSchoolError);
        }
      }
      
      // Create the user in Supabase Auth with metadata that will be used by the trigger
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            school_id: schoolId, // Incluir school_id en los metadatos
          },
          emailRedirectTo: window.location.origin,
        }
      });
      
      console.log("Auth signup response:", authData, signUpError);
      
      if (signUpError) {
        console.error("Error in signup:", signUpError);
        throw signUpError;
      }
      
      // We rely on the database trigger to create the profile
      // The trigger handle_new_user_auth() will create the profile entry automatically
      
      if (authData.user) {
        // Wait a moment to allow trigger to execute
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Verify that profile was created
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, role')
            .eq('id', authData.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.warn("Error checking profile creation:", profileError);
          } else if (profile) {
            console.log("Profile created successfully:", profile);
          } else {
            console.warn("Profile not found after signup. Attempting manual creation...");
            
            // If profile wasn't created by trigger, create it manually
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                name: name,
                role: role,
                coins: 0,
                school_id: schoolId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error("Failed to create profile manually:", insertError);
            } else {
              console.log("Profile created manually after trigger failure");
            }
          }
        } catch (verifyError) {
          console.error("Error verifying profile creation:", verifyError);
        }
        
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada correctamente",
        });
      }
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Error al crear cuenta",
        description: (error as Error).message || "Hubo un problema al crear la cuenta",
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
      signup,
      loginWithRole,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
