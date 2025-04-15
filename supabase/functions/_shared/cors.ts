// supabase/functions/_shared/cors.ts

export const corsHeaders = {
    // Permite peticiones desde cualquier origen (conveniente para desarrollo)
    'Access-Control-Allow-Origin': '*',
    // Permite las cabeceras que Supabase necesita (y 'content-type')
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }