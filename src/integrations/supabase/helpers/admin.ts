
import { supabase } from "../client";
import { Database } from "../types";
import { formatDate } from "@/lib/utils";

/**
 * Obtiene todos los estudiantes con información detallada
 * @param schoolId ID de la escuela
 * @returns Lista de perfiles de estudiantes con sus datos
 */
export const fetchAllStudents = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      classes:class_enrollments(
        class:class_id(id, name)
      )
    `)
    .eq('role', 'student')
    .eq('school_id', schoolId);
    
  if (error) throw error;
  return data;
};

/**
 * Obtiene todos los profesores con información detallada
 * @param schoolId ID de la escuela
 * @returns Lista de perfiles de profesores con sus datos
 */
export const fetchAllTeachers = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      classes:classes(id, name)
    `)
    .eq('role', 'teacher')
    .eq('school_id', schoolId);
    
  if (error) throw error;
  return data;
};

/**
 * Crea un nuevo usuario en el sistema
 * @param userData Datos del usuario a crear
 * @returns Datos del usuario creado
 */
export const createNewUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: string;
  school_id: string;
  coins?: number;
}) => {
  // Usar el método de registro estándar en lugar de admin.createUser
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        role: userData.role,
        school_id: userData.school_id
      },
      emailRedirectTo: window.location.origin
    }
  });
  
  if (authError) throw authError;
  
  // El perfil se crea automáticamente mediante el trigger handle_new_user_auth
  // Pero podemos actualizar datos adicionales si es necesario
  if (userData.coins && userData.coins > 0 && authData.user) {
    // Esperar un momento para que el trigger complete su ejecución
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins: userData.coins })
      .eq('id', authData.user.id);
      
    if (updateError) throw updateError;
  }
  
  return authData.user;
};

/**
 * Actualiza el saldo de monedas de un usuario
 * @param userId ID del usuario
 * @param amount Nueva cantidad de monedas
 * @returns Perfil actualizado
 */
export const updateUserBalance = async (userId: string, amount: number) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ coins: amount })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Obtiene las estadísticas generales del sistema
 * @param schoolId ID de la escuela
 * @returns Estadísticas generales
 */
export const getSystemStats = async (schoolId: string) => {
  // Total de estudiantes
  const { count: studentsCount, error: studentsError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')
    .eq('school_id', schoolId);
    
  if (studentsError) throw studentsError;
  
  // Total de profesores
  const { count: teachersCount, error: teachersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'teacher')
    .eq('school_id', schoolId);
    
  if (teachersError) throw teachersError;
  
  // Total de transacciones
  const { count: transactionsCount, error: transactionsError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId);
    
  if (transactionsError) throw transactionsError;
  
  // Obtener información de la escuela (monedas en circulación)
  const { data: schoolData, error: schoolError } = await supabase
    .from('schools')
    .select('current_supply, max_supply')
    .eq('id', schoolId)
    .single();
    
  if (schoolError) throw schoolError;
  
  // Actividad reciente (últimas 5 transacciones)
  const { data: recentActivity, error: activityError } = await supabase
    .from('transactions')
    .select(`
      *,
      sender:sender_id(name),
      receiver:receiver_id(name)
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (activityError) throw activityError;
  
  // Procesar la actividad reciente para un formato más amigable
  const formattedActivity = recentActivity.map((activity: any) => {
    let description = "";
    
    if (activity.transaction_type === 'reward') {
      description = `${activity.sender?.name || 'Sistema'} premió a ${activity.receiver?.name || 'Usuario'} con ${activity.amount} monedas`;
    } else if (activity.transaction_type === 'purchase') {
      description = `${activity.sender?.name || 'Usuario'} compró un artículo por ${activity.amount} monedas`;
    } else if (activity.transaction_type === 'p2p_transfer') {
      description = `${activity.sender?.name || 'Usuario'} transfirió ${activity.amount} monedas a ${activity.receiver?.name || 'Usuario'}`;
    }
    
    return {
      id: activity.id,
      description,
      date: activity.created_at,
      formattedDate: formatDate(activity.created_at)
    };
  });
  
  return {
    totalStudents: studentsCount || 0,
    totalTeachers: teachersCount || 0,
    totalTransactions: transactionsCount || 0,
    totalCoinsInCirculation: schoolData?.current_supply || 0,
    maxSupply: schoolData?.max_supply || 0,
    recentActivity: formattedActivity
  };
};

/**
 * Asigna un estudiante a una clase
 * @param studentId ID del estudiante
 * @param classId ID de la clase
 * @returns Datos de la asignación
 */
export const assignStudentToClass = async (studentId: string, classId: string) => {
  const { data, error } = await supabase
    .from('class_enrollments')
    .insert({
      student_id: studentId,
      class_id: classId
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Asigna monedas a un usuario (estudiante o profesor)
 * @param adminId ID del administrador que asigna
 * @param userId ID del usuario que recibe
 * @param amount Cantidad de monedas
 * @param description Descripción de la asignación
 * @param schoolId ID de la escuela
 * @returns Datos de la transacción
 */
export const assignCoinsToUser = async (
  adminId: string,
  userId: string,
  amount: number,
  description: string,
  schoolId: string
) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      sender_id: adminId,
      receiver_id: userId,
      amount: amount,
      transaction_type: 'reward',
      school_id: schoolId,
      description: description || 'Asignación de monedas por administrador'
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Actualizar el saldo del usuario
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', userId)
    .single();
    
  if (profileError) throw profileError;
  
  const newBalance = (profileData?.coins || 0) + amount;
  
  await supabase
    .from('profiles')
    .update({ coins: newBalance })
    .eq('id', userId);
    
  return data;
};

/**
 * Importa usuarios desde un archivo CSV
 * @param users Array de usuarios a importar
 * @param schoolId ID de la escuela
 * @returns Resumen de la importación
 */
export const importUsersFromCSV = async (
  users: Array<{
    email: string;
    name: string;
    role: string;
    coins?: number;
  }>,
  schoolId: string
) => {
  const results = {
    total: users.length,
    success: 0,
    failed: 0,
    errors: [] as Array<{email: string, error: string}>
  };
  
  for (const user of users) {
    try {
      // Generar una contraseña aleatoria para el usuario inicial
      const password = Math.random().toString(36).slice(-8);
      
      await createNewUser({
        email: user.email,
        password: password,
        name: user.name,
        role: user.role,
        school_id: schoolId,
        coins: user.coins || 0
      });
      
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: user.email,
        error: (error as Error).message
      });
    }
  }
  
  return results;
};
