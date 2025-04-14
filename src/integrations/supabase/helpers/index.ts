
// Exporta todas las funciones auxiliares agrupadas por módulos
export * from './profiles';
export * from './schools';
export * from './achievements';
export * from './marketplace';
export * from './exchange';
export * from './classes';

// Además, podemos exportar tipos útiles aquí para reutilizarlos
import { Database } from '../types';

// Exportación de tipos comunes
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type School = Database['public']['Tables']['schools']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type AchievementType = Database['public']['Tables']['achievement_types']['Row'];
export type MarketplaceItem = Database['public']['Tables']['marketplace_items']['Row'];
export type ExchangeListing = Database['public']['Tables']['exchange_listings']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Class = Database['public']['Tables']['classes']['Row'];
