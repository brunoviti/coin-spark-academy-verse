
import { supabase } from "./client";
import { Database } from "./types";

// Type assertion for database tables
type Tables = Database['public']['Tables'];

// Utility function to fetch user profile by ID
export const fetchProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

// Function to fetch multiple profiles
export const fetchProfiles = async (schoolId?: string) => {
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

// Function to update user profile
export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// School related functions
export const fetchSchools = async () => {
  const { data, error } = await supabase
    .from('schools')
    .select('*');
    
  if (error) throw error;
  return data;
};

export const fetchSchoolById = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single();
    
  if (error) throw error;
  return data;
};

// Achievement functions
export const fetchAchievementTypes = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('achievement_types')
    .select('*')
    .eq('school_id', schoolId);
    
  if (error) throw error;
  return data;
};

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

// Marketplace functions
export const fetchMarketplaceItems = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select(`
      *,
      category:category_id (name)
    `)
    .eq('school_id', schoolId);
    
  if (error) throw error;
  
  // Process the joined data
  return data.map((item: any) => ({
    ...item,
    categoryName: item.category?.name,
  }));
};

// Exchange functions
export const fetchExchangeListings = async (schoolId: string, active: boolean = true) => {
  const { data, error } = await supabase
    .from('exchange_listings')
    .select(`
      *,
      seller:seller_id (name, avatar_url)
    `)
    .eq('school_id', schoolId)
    .eq('status', active ? 'active' : 'completed');
    
  if (error) throw error;
  
  // Process the joined data
  return data.map((listing: any) => ({
    ...listing,
    sellerName: listing.seller?.name,
    sellerAvatar: listing.seller?.avatar_url,
  }));
};

// Transaction functions
export const createRewardTransaction = async (teacherId: string, studentId: string, amount: number, achievementId: string, schoolId: string) => {
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

// Purchase functions
export const createMarketplacePurchase = async (studentId: string, itemId: string, quantity: number, totalPrice: number) => {
  const { data, error } = await supabase
    .from('marketplace_purchases')
    .insert({
      student_id: studentId,
      item_id: itemId,
      quantity: quantity,
      total_price: totalPrice
    });
    
  if (error) throw error;
  return data;
};

// Update marketplace item stock after purchase
export const updateItemStock = async (itemId: string, quantity: number) => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .update({
      stock: supabase.rpc('get_user_role', { user_id: itemId })
    })
    .eq('id', itemId);
    
  if (error) throw error;
  return data;
};

// Get classroom data for teachers
export const fetchTeacherClasses = async (teacherId: string) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId);
    
  if (error) throw error;
  return data;
};

// Get students in a class
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

// Create achievement and award coins to student
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
