
import { supabase } from "../client";
import { Database } from "../types";

// Type assertion for database tables
type ExchangeListingType = Database['public']['Tables']['exchange_listings']['Row'];
type ExchangeOfferType = Database['public']['Tables']['exchange_offers']['Row'];

/**
 * Obtiene los listados de intercambio para una escuela
 * @param schoolId ID de la escuela
 * @param active Si es true, solo devuelve los listados activos
 * @returns Array de listados con información del vendedor
 */
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

/**
 * Crea un nuevo listado de intercambio
 * @param sellerId ID del vendedor
 * @param schoolId ID de la escuela
 * @param title Título del listado
 * @param description Descripción del listado
 * @param askingPrice Precio solicitado
 * @returns El listado creado
 */
export const createExchangeListing = async (
  sellerId: string,
  schoolId: string,
  title: string,
  description: string,
  askingPrice: number
): Promise<ExchangeListingType> => {
  const { data, error } = await supabase
    .from('exchange_listings')
    .insert({
      seller_id: sellerId,
      school_id: schoolId,
      title: title,
      description: description,
      asking_price: askingPrice,
      status: 'active'
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Crea una oferta para un listado de intercambio
 * @param listingId ID del listado
 * @param buyerId ID del comprador
 * @param offerAmount Cantidad ofrecida
 * @returns La oferta creada
 */
export const createExchangeOffer = async (
  listingId: string,
  buyerId: string,
  offerAmount: number
): Promise<ExchangeOfferType> => {
  const { data, error } = await supabase
    .from('exchange_offers')
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      offer_amount: offerAmount,
      status: 'pending'
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Acepta una oferta de intercambio
 * @param offerId ID de la oferta
 * @param listingId ID del listado
 * @returns La oferta actualizada
 */
export const acceptExchangeOffer = async (
  offerId: string,
  listingId: string
): Promise<ExchangeOfferType> => {
  // Primero actualizamos la oferta
  const { data: updatedOffer, error: offerError } = await supabase
    .from('exchange_offers')
    .update({
      status: 'accepted'
    })
    .eq('id', offerId)
    .select()
    .single();
    
  if (offerError) throw offerError;
  
  // Luego actualizamos el estado del listado
  const { error: listingError } = await supabase
    .from('exchange_listings')
    .update({
      status: 'completed'
    })
    .eq('id', listingId);
    
  if (listingError) throw listingError;
  
  return updatedOffer;
};
