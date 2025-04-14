
import { supabase } from "../client";
import { Database } from "../types";

// Type assertion for database tables
type AchievementType = Database['public']['Tables']['achievements']['Row'];
type AchievementTypeType = Database['public']['Tables']['achievement_types']['Row'];

/**
 * Obtiene los tipos de logros disponibles para una escuela
 * @param schoolId ID de la escuela
 * @returns Array de tipos de logros
 */
export const fetchAchievementTypes = async (schoolId: string): Promise<AchievementTypeType[]> => {
  const { data, error } = await supabase
    .from('achievement_types')
    .select('*')
    .eq('school_id', schoolId);
    
  if (error) throw error;
  return data;
};

/**
 * Obtiene los logros de un estudiante
 * @param studentId ID del estudiante
 * @returns Array de logros con sus tipos
 */
export const fetchStudentAchievements = async (studentId: string) => {
  const { data, error } = await supabase
    .from('achievements')
    .select(`
      *,
      achievement_type:achievement_type_id (name, description, coin_value)
    `)
    .eq('student_id', studentId);
    
  if (error) throw error;
  
  // Process the joined data
  return data.map((achievement: any) => ({
    ...achievement,
    achievementType: achievement.achievement_type,
  }));
};

/**
 * Otorga un logro a un estudiante y le asigna monedas
 * @param teacherId ID del profesor
 * @param studentId ID del estudiante
 * @param achievementTypeId ID del tipo de logro
 * @param description Descripción personalizada del logro
 * @param coinsAwarded Cantidad de monedas otorgadas
 * @param schoolId ID de la escuela
 * @returns El logro creado
 */
export const awardStudentAchievement = async (
  teacherId: string, 
  studentId: string, 
  achievementTypeId: string, 
  description: string,
  coinsAwarded: number,
  schoolId: string
) => {
  // First create the achievement
  const { data: achievement, error: achievementError } = await supabase
    .from('achievements')
    .insert({
      student_id: studentId,
      teacher_id: teacherId,
      achievement_type_id: achievementTypeId,
      description: description,
      coins_awarded: coinsAwarded
    })
    .select()
    .single();
    
  if (achievementError) throw achievementError;
  
  // Then create the transaction
  await createRewardTransaction(
    teacherId,
    studentId,
    coinsAwarded,
    achievement.id,
    schoolId
  );
  
  return achievement;
};

/**
 * Crea una transacción de recompensa
 * @param teacherId ID del profesor
 * @param studentId ID del estudiante
 * @param amount Cantidad de monedas
 * @param achievementId ID del logro
 * @param schoolId ID de la escuela
 * @returns La transacción creada
 */
export const createRewardTransaction = async (
  teacherId: string, 
  studentId: string, 
  amount: number, 
  achievementId: string, 
  schoolId: string
) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      sender_id: teacherId,
      receiver_id: studentId,
      amount: amount,
      transaction_type: 'reward',
      reference_id: achievementId,
      school_id: schoolId
    });
    
  if (error) throw error;
  return data;
};
