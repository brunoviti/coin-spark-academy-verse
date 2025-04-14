
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
