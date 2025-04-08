
import { supabase } from "./client";
import type { UserRole } from "@/contexts/AuthContext";

export interface SchoolData {
  id: string;
  name: string;
  coin_name: string;
  coin_symbol?: string;
  max_supply: number;
  current_supply: number;
}

export interface ProfileData {
  id: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  coins?: number;
  school_id?: string;
}

export interface TransactionData {
  id: string;
  sender_id?: string;
  receiver_id?: string;
  amount: number;
  transaction_type: "reward" | "p2p_transfer" | "purchase";
  description?: string;
  reference_id?: string;
  created_at: string;
}

export interface AchievementTypeData {
  id: string;
  name: string;
  description?: string;
  coin_value: number;
}

export interface AchievementData {
  id: string;
  student_id: string;
  teacher_id: string;
  achievement_type_id: string;
  description?: string;
  coins_awarded: number;
  created_at: string;
  achievement_type?: AchievementTypeData;
}

export interface MarketplaceItemData {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  category_id?: string;
  category_name?: string;
}

export interface ExchangeListingData {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  asking_price: number;
  status: "active" | "completed" | "cancelled";
  created_at: string;
  seller?: ProfileData;
}

// School operations
export const getSchool = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single();
    
  if (error) throw error;
  return data as SchoolData;
};

// Profile operations
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data as ProfileData;
};

// Transaction operations
export const getUserTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as TransactionData[];
};

// Achievement operations
export const getUserAchievements = async (userId: string) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*, achievement_type:achievement_types(*)')
    .eq('student_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as AchievementData[];
};

// Marketplace operations
export const getMarketplaceItems = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select('*, category:marketplace_categories(name)')
    .eq('school_id', schoolId)
    .gt('stock', 0);
    
  if (error) throw error;
  
  return data.map(item => ({
    ...item,
    category_name: item.category?.name
  })) as MarketplaceItemData[];
};

// Exchange operations
export const getActiveExchangeListings = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('exchange_listings')
    .select('*, seller:profiles(id, name, avatar_url)')
    .eq('school_id', schoolId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data.map(listing => ({
    ...listing,
    seller: listing.seller as ProfileData
  })) as ExchangeListingData[];
};

// Purchase marketplace item
export const purchaseMarketplaceItem = async (
  studentId: string, 
  itemId: string, 
  quantity: number,
  totalPrice: number,
  schoolId: string
) => {
  // Start a transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      sender_id: studentId,
      amount: totalPrice,
      transaction_type: 'purchase',
      reference_id: itemId,
      school_id: schoolId
    });
    
  if (transactionError) throw transactionError;
  
  // Record the purchase
  const { error: purchaseError } = await supabase
    .from('marketplace_purchases')
    .insert({
      student_id: studentId,
      item_id: itemId,
      quantity: quantity,
      total_price: totalPrice
    });
    
  if (purchaseError) throw purchaseError;
  
  // Update the item stock
  const { error: stockError } = await supabase
    .from('marketplace_items')
    .update({ stock: supabase.rpc('decrement', { x: quantity }) })
    .eq('id', itemId);
    
  if (stockError) throw stockError;
};
