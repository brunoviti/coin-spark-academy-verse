
import { supabase } from "../client";
import { Database } from "../types";

// Type assertion for database tables
type ClassType = Database['public']['Tables']['classes']['Row'];
type ClassEnrollmentType = Database['public']['Tables']['class_enrollments']['Row'];

/**
 * Obtiene las clases de un profesor
 * @param teacherId ID del profesor
 * @returns Array de clases
 */
export const fetchTeacherClasses = async (teacherId: string): Promise<ClassType[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId);
    
  if (error) throw error;
  return data;
};

/**
 * Obtiene los estudiantes en una clase
 * @param classId ID de la clase
 * @returns Array de estudiantes
 */
export const fetchClassStudents = async (classId: string) => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select(`
      *,
      student:student_id (id, name, avatar_url, coins)
    `)
    .eq('class_id', classId);
    
  if (error) throw error;
  
  // Return just the student data
  return data.map((enrollment: any) => enrollment.student);
};

/**
 * Crea una nueva clase
 * @param teacherId ID del profesor
 * @param schoolId ID de la escuela
 * @param name Nombre de la clase
 * @returns La clase creada
 */
export const createClass = async (
  teacherId: string,
  schoolId: string,
  name: string
): Promise<ClassType> => {
  const { data, error } = await supabase
    .from('classes')
    .insert({
      teacher_id: teacherId,
      school_id: schoolId,
      name: name
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Inscribe a un estudiante en una clase
 * @param classId ID de la clase
 * @param studentId ID del estudiante
 * @returns La inscripción creada
 */
export const enrollStudentInClass = async (
  classId: string,
  studentId: string
): Promise<ClassEnrollmentType> => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .insert({
      class_id: classId,
      student_id: studentId
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
