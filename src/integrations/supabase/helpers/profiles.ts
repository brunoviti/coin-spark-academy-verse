
import { supabase } from "../client";
import { Database } from "../types";

// Type assertion for database tables
type ProfileType = Database['public']['Tables']['profiles']['Row'];

/**
 * Obtiene el perfil de usuario por ID
 * @param userId ID del usuario
 * @returns El perfil del usuario o lanza un error
 */
export const fetchProfileById = async (userId: string): Promise<ProfileType> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Obtiene múltiples perfiles, opcionalmente filtrados por escuela
 * @param schoolId ID de la escuela (opcional)
 * @returns Array de perfiles
 */
export const fetchProfiles = async (schoolId?: string): Promise<ProfileType[]> => {
  let query = supabase
    .from('profiles')
    .select('*');
    
  if (schoolId) {
    query = query.eq('school_id', schoolId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Actualiza el perfil de un usuario
 * @param userId ID del usuario
 * @param updates Datos a actualizar
 * @returns El perfil actualizado
 */
export const updateProfile = async (userId: string, updates: Partial<ProfileType>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
