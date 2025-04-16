
import { supabase } from "../client";
import { Database } from "../types";

// Type assertion for database tables
type ProfileType = Database['public']['Tables']['profiles']['Row'];

/**
 * Fetch users by school ID
 * @param schoolId School ID to filter by
 * @returns Array of user profiles
 */
export const fetchSchoolUsers = async (schoolId: string): Promise<ProfileType[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('school_id', schoolId);
    
  if (error) throw error;
  return data;
};

/**
 * Fetch user by ID
 * @param userId User ID
 * @returns User profile or throws an error
 */
export const fetchUserById = async (userId: string): Promise<ProfileType> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Create a new user profile
 * @param userData User data
 * @returns The created user profile
 */
export const createUser = async (userData: Partial<ProfileType>): Promise<ProfileType> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(userData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Update a user profile
 * @param userId User ID
 * @param updates Data to update
 * @returns The updated user profile
 */
export const updateUser = async (userId: string, updates: Partial<ProfileType>): Promise<ProfileType> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Delete a user profile
 * @param userId User ID
 * @returns true if successful
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
    
  if (error) throw error;
  return true;
};
