
import { supabase } from "../client";
import { Transaction, Profile, School, Class, MarketplaceItem } from "./index";

/**
 * Generar reporte de transacciones por fecha
 * @param startDate Fecha de inicio (opcional)
 * @param endDate Fecha de fin (opcional)
 * @param schoolId ID de la escuela (opcional)
 * @returns Datos de transacciones para el reporte
 */
export const generateTransactionsReport = async (
  startDate?: Date,
  endDate?: Date,
  schoolId?: string
): Promise<Transaction[]> => {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      sender:sender_id (id, name),
      receiver:receiver_id (id, name)
    `);
    
  // Filtrar por fecha si se proporcionan
  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }
  
  // Filtrar por escuela si se proporciona
  if (schoolId) {
    query = query.eq('school_id', schoolId);
  }
  
  // Ordenar por fecha descendente
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

/**
 * Generar reporte de usuarios por escuela
 * @param schoolId ID de la escuela (opcional)
 * @returns Datos de usuarios para el reporte
 */
export const generateUsersReport = async (schoolId?: string): Promise<Profile[]> => {
  let query = supabase
    .from('profiles')
    .select('*');
    
  // Filtrar por escuela si se proporciona
  if (schoolId) {
    query = query.eq('school_id', schoolId);
  }
  
  // Ordenar por nombre
  query = query.order('name');
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

/**
 * Generar reporte de logros por estudiante o por escuela
 * @param schoolId ID de la escuela (opcional)
 * @param studentId ID del estudiante (opcional)
 * @returns Datos de logros para el reporte
 */
export const generateAchievementsReport = async (
  schoolId?: string,
  studentId?: string
) => {
  let query = supabase
    .from('achievements')
    .select(`
      *,
      student:student_id (id, name),
      teacher:teacher_id (id, name),
      achievement_type:achievement_type_id (*)
    `);
    
  // Filtrar por estudiante si se proporciona
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  // Filtrar por escuela (a través del achievement_type)
  if (schoolId) {
    // Primero necesitamos obtener todos los tipos de logros para esa escuela
    const { data: achievementTypes, error: typesError } = await supabase
      .from('achievement_types')
      .select('id')
      .eq('school_id', schoolId);
      
    if (typesError) throw typesError;
    
    if (achievementTypes && achievementTypes.length > 0) {
      const typeIds = achievementTypes.map(type => type.id);
      query = query.in('achievement_type_id', typeIds);
    }
  }
  
  // Ordenar por fecha descendente
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

/**
 * Exportar datos a formato CSV
 * @param data Datos a exportar
 * @param headers Cabeceras para el CSV
 * @param filename Nombre del archivo
 */
export const exportToCSV = (
  data: any[],
  headers: string[],
  filename: string
): void => {
  // Convertir los datos a filas de CSV
  const rows = data.map(item => {
    return headers.map(header => {
      const value = getNestedProperty(item, header);
      // Escapar comas y comillas
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value !== undefined && value !== null ? value : '';
    });
  });
  
  // Crear el contenido del CSV
  let csvContent = headers.join(",") + "\n";
  rows.forEach(row => {
    csvContent += row.join(",") + "\n";
  });
  
  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Función auxiliar para obtener propiedades anidadas
const getNestedProperty = (obj: any, path: string): any => {
  if (!obj) return '';
  
  const properties = path.split('.');
  let value = obj;
  
  for (const prop of properties) {
    if (value === null || value === undefined) return '';
    value = value[prop];
  }
  
  return value;
};
