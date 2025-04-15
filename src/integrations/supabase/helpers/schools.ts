
import { supabase } from "../client";
import { Database } from "../types";

// Definición del tipo School para evitar errores
export type School = Database['public']['Tables']['schools']['Row'];

/**
 * Obtener todas las escuelas registradas
 * @returns Lista de escuelas
 */
export const fetchSchools = async (): Promise<School[]> => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
};

/**
 * Obtener una escuela por su ID
 * @param schoolId ID de la escuela
 * @returns Datos de la escuela
 */
export const fetchSchoolById = async (schoolId: string): Promise<School> => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Crear una nueva escuela (solo super_admin)
 * @param schoolData Datos de la nueva escuela
 * @returns Datos de la escuela creada
 */
export const createSchool = async (schoolData: {
  name: string;
  coin_name: string;
  coin_symbol: string;
  max_supply: number;
}) => {
  const { data, error } = await supabase
    .from('schools')
    .insert({
      name: schoolData.name,
      coin_name: schoolData.coin_name,
      coin_symbol: schoolData.coin_symbol,
      max_supply: schoolData.max_supply,
      current_supply: 0
    })
    .select();
    
  if (error) throw error;
  
  return data[0];
};

/**
 * Actualizar una escuela existente
 * @param schoolId ID de la escuela
 * @param updates Datos a actualizar
 * @returns Datos actualizados de la escuela
 */
export const updateSchool = async (schoolId: string, updates: Partial<School>) => {
  const { data, error } = await supabase
    .from('schools')
    .update(updates)
    .eq('id', schoolId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Eliminar una escuela (solo super_admin)
 * @param schoolId ID de la escuela a eliminar
 */
export const deleteSchool = async (schoolId: string) => {
  const { error } = await supabase
    .from('schools')
    .delete()
    .eq('id', schoolId);
    
  if (error) throw error;
  return true;
};
