import { supabase } from "../client";
import { Database } from "../types";
import { updateProfile } from "./profiles";
import { updateItemStock } from "./marketplace";

// Type assertion for database tables
type TransactionType = Database['public']['Tables']['transactions']['Row'];

/**
 * Crea una transacción y actualiza los balances de los usuarios
 * @param senderId ID del remitente (opcional para premios)
 * @param receiverId ID del destinatario (opcional para compras)
 * @param amount Cantidad de monedas
 * @param transactionType Tipo de transacción
 * @param schoolId ID de la escuela
 * @param referenceId ID de referencia (opcional)
 * @param description Descripción de la transacción (opcional)
 * @returns La transacción creada
 */
export const createTransaction = async (
  senderId: string | null,
  receiverId: string | null,
  amount: number,
  transactionType: 'reward' | 'purchase' | 'p2p_transfer',
  schoolId: string,
  referenceId?: string,
  description?: string
): Promise<TransactionType> => {
  // Validar parámetros según el tipo de transacción
  if (transactionType === 'reward' && !receiverId) {
    throw new Error('receiverId es requerido para transacciones de tipo reward');
  }
  
  if ((transactionType === 'purchase' || transactionType === 'p2p_transfer') && !senderId) {
    throw new Error('senderId es requerido para transacciones de tipo purchase o p2p_transfer');
  }
  
  // Verificar que el usuario tenga saldo suficiente
  if (senderId && (transactionType === 'purchase' || transactionType === 'p2p_transfer')) {
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', senderId)
      .single();
      
    if (!senderProfile || senderProfile.coins < amount) {
      throw new Error('Saldo insuficiente para realizar la transacción');
    }
  }
  
  // Crear la transacción
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      amount,
      transaction_type: transactionType,
      reference_id: referenceId,
      school_id: schoolId,
      description
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Actualizar saldos manualmente (asegurar consistencia)
  // Esto es un extra por si el trigger de la base de datos falla
  try {
    // Si hay destinatario, aumentar su saldo
    if (receiverId) {
      const { data: receiverProfile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', receiverId)
        .single();
        
      if (receiverProfile) {
        await updateProfile(receiverId, {
          coins: (receiverProfile.coins || 0) + amount
        });
      }
    }
    
    // Si hay remitente, disminuir su saldo
    if (senderId && (transactionType === 'purchase' || transactionType === 'p2p_transfer')) {
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', senderId)
        .single();
        
      if (senderProfile) {
        await updateProfile(senderId, {
          coins: Math.max(0, (senderProfile.coins || 0) - amount)
        });
      }
    }
  } catch (updateError) {
    console.error("Error updating balances:", updateError);
    // No revertimos la transacción porque el trigger de la base de datos
    // debería haber actualizado los saldos correctamente
  }
  
  return data;
};

/**
 * Crea una transacción de compra en el mercado y actualiza el stock
 * @param studentId ID del estudiante
 * @param itemId ID del artículo
 * @param quantity Cantidad comprada
 * @param schoolId ID de la escuela
 * @param totalPrice Precio total de la compra
 * @returns La transacción creada
 */
export const createPurchaseTransaction = async (
  studentId: string,
  itemId: string,
  schoolId: string,
  quantity: number = 1,
  totalPrice: number
): Promise<TransactionType> => {
  // Obtener información del artículo
  const { data: item } = await supabase
    .from('marketplace_items')
    .select('stock, title')
    .eq('id', itemId)
    .single();
    
  if (!item) {
    throw new Error('El artículo no existe');
  }
  
  if (item.stock < quantity) {
    throw new Error('No hay suficiente stock disponible');
  }
  
  // Crear el registro de compra
  const { error: purchaseError } = await supabase
    .from('marketplace_purchases')
    .insert({
      student_id: studentId,
      item_id: itemId,
      quantity,
      total_price: totalPrice
    });
    
  if (purchaseError) throw purchaseError;
  
  // Actualizar el stock del artículo
  await updateItemStock(itemId, item.stock - quantity);
  
  // Crear la transacción con la descripción del artículo
  return createTransaction(
    studentId,
    null,
    totalPrice,
    'purchase',
    schoolId,
    itemId,
    `Compra: ${item.title}`
  );
};

/**
 * Obtiene las transacciones de un usuario
 * @param userId ID del usuario
 * @returns Lista de transacciones
 */
export const fetchUserTransactions = async (userId: string): Promise<any[]> => {
  // Obtener transacciones donde el usuario es remitente o destinatario
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
    
  if (error) throw error;

  // Obtener información de remitentes y destinatarios para enriquecer datos
  const uniqueUserIds = new Set<string>();
  data.forEach(tx => {
    if (tx.sender_id) uniqueUserIds.add(tx.sender_id);
    if (tx.receiver_id) uniqueUserIds.add(tx.receiver_id);
  });

  const userIds = Array.from(uniqueUserIds);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds);

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
  }

  const userMap = new Map();
  profiles?.forEach(profile => {
    userMap.set(profile.id, profile);
  });
  
  // Procesar las transacciones para facilitar su uso en la UI
  return data.map((transaction: any) => {
    // Determinar si es una transacción entrante o saliente
    const isIncoming = transaction.receiver_id === userId;
    const senderProfile = transaction.sender_id ? userMap.get(transaction.sender_id) : null;
    const receiverProfile = transaction.receiver_id ? userMap.get(transaction.receiver_id) : null;
    
    return {
      ...transaction,
      type: isIncoming ? 'earning' : 'spending',
      otherPartyName: isIncoming 
        ? (senderProfile?.name || 'Sistema') 
        : (receiverProfile?.name || 'Tienda'),
      isIncoming
    };
  });
};

/**
 * Obtiene todas las transacciones de una escuela
 * @param schoolId ID de la escuela
 * @returns Lista de todas las transacciones
 */
export const fetchAllTransactions = async (schoolId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      sender:sender_id (id, name, email),
      receiver:receiver_id (id, name, email)
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data;
};

/**
 * Asigna monedas a un usuario (recompensa)
 * @param senderId ID del remitente (profesor o admin)
 * @param receiverId ID del destinatario
 * @param amount Cantidad de monedas
 * @param schoolId ID de la escuela
 * @param description Descripción de la asignación (opcional)
 * @returns La transacción creada
 */
export const assignCoins = async (
  senderId: string,
  receiverId: string,
  amount: number,
  schoolId: string,
  description?: string
): Promise<TransactionType> => {
  return createTransaction(
    senderId,
    receiverId,
    amount,
    'reward',
    schoolId,
    undefined,
    description || 'Asignación de monedas'
  );
};
