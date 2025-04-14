
import { supabase } from "../client";
import { Database } from "../types";

// Type assertion for database tables
type MarketplaceItemType = Database['public']['Tables']['marketplace_items']['Row'];
type MarketplacePurchaseType = Database['public']['Tables']['marketplace_purchases']['Row'];

/**
 * Obtiene los productos del mercado de una escuela
 * @param schoolId ID de la escuela
 * @returns Array de productos con sus categorías
 */
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

/**
 * Crea una nueva compra en el mercado
 * @param studentId ID del estudiante
 * @param itemId ID del producto
 * @param quantity Cantidad
 * @param totalPrice Precio total
 * @returns La compra creada
 */
export const createMarketplacePurchase = async (
  studentId: string, 
  itemId: string, 
  quantity: number, 
  totalPrice: number
): Promise<MarketplacePurchaseType> => {
  const { data, error } = await supabase
    .from('marketplace_purchases')
    .insert({
      student_id: studentId,
      item_id: itemId,
      quantity: quantity,
      total_price: totalPrice
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Actualiza el stock de un producto después de una compra
 * @param itemId ID del producto
 * @param quantity Nueva cantidad de stock
 * @returns El producto actualizado
 */
export const updateItemStock = async (itemId: string, quantity: number): Promise<MarketplaceItemType> => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .update({
      stock: quantity
    })
    .eq('id', itemId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Obtiene el historial de compras de un usuario
 * @param studentId ID del estudiante
 * @returns Historial de compras del usuario
 */
export const fetchUserPurchaseHistory = async (studentId: string) => {
  const { data, error } = await supabase
    .from('marketplace_purchases')
    .select(`
      *,
      item:item_id (title, description, price, category_id),
      student:student_id (name)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

/**
 * Obtiene todas las compras realizadas en una escuela (para administradores)
 * @param schoolId ID de la escuela
 * @returns Historial de todas las compras
 */
export const fetchAllPurchases = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('marketplace_purchases')
    .select(`
      *,
      item:item_id (title, description, price, category_id, school_id),
      student:student_id (name, email)
    `)
    .eq('item.school_id', schoolId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

/**
 * Crea una nueva categoría de productos
 * @param name Nombre de la categoría
 * @param schoolId ID de la escuela
 * @returns La categoría creada
 */
export const createCategory = async (name: string, schoolId: string) => {
  const { data, error } = await supabase
    .from('marketplace_categories')
    .insert({
      name: name,
      school_id: schoolId
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Crea un nuevo producto en el mercado
 * @param item Datos del producto
 * @returns El producto creado
 */
export const createMarketplaceItem = async (item: {
  title: string;
  description: string;
  price: number;
  stock: number;
  category_id?: string;
  school_id: string;
}) => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .insert(item)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Actualiza un producto existente
 * @param itemId ID del producto
 * @param updates Datos a actualizar
 * @returns El producto actualizado
 */
export const updateMarketplaceItem = async (
  itemId: string,
  updates: Partial<MarketplaceItemType>
) => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Elimina un producto del mercado
 * @param itemId ID del producto
 * @returns Verdadero si se eliminó correctamente
 */
export const deleteMarketplaceItem = async (itemId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('marketplace_items')
    .delete()
    .eq('id', itemId);
    
  if (error) throw error;
  return true;
};
