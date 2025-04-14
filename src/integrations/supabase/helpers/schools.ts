
import { supabase } from "../client";
import { Database } from "../types";

// Type assertion for database tables
type SchoolType = Database['public']['Tables']['schools']['Row'];

// Type for creating a new school - name is required, other fields optional
type CreateSchoolType = Pick<SchoolType, 'name'> & Partial<Omit<SchoolType, 'name'>>;

/**
 * Obtiene todas las escuelas
 * @returns Array de escuelas
 */
export const fetchSchools = async (): Promise<SchoolType[]> => {
  const { data, error } = await supabase
    .from('schools')
    .select('*');
    
  if (error) throw error;
  return data;
};

/**
 * Obtiene una escuela por su ID
 * @param schoolId ID de la escuela
 * @returns Datos de la escuela o lanza un error
 */
export const fetchSchoolById = async (schoolId: string): Promise<SchoolType> => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Crea una nueva escuela
 * @param schoolData Datos de la escuela
 * @returns La escuela creada
 */
export const createSchool = async (schoolData: CreateSchoolType): Promise<SchoolType> => {
  const { data, error } = await supabase
    .from('schools')
    .insert(schoolData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Actualiza una escuela existente
 * @param schoolId ID de la escuela
 * @param updates Datos a actualizar
 * @returns La escuela actualizada
 */
export const updateSchool = async (schoolId: string, updates: Partial<SchoolType>): Promise<SchoolType> => {
  const { data, error } = await supabase
    .from('schools')
    .update(updates)
    .eq('id', schoolId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
