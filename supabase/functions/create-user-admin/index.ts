// supabase/functions/create-user-admin/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts' // Necesitarás crear este archivo o definir los headers aquí

console.log(`Function "create-user-admin" up and running!`)

// Define la estructura esperada del cuerpo de la petición
interface NewUserDetails {
  email: string;
  password?: string; // Hacer la contraseña opcional en la entrada
  name: string;
  role: string; // Recibir como string, validar contra ENUM si es necesario
  school_id: string;
  coins?: number;
}

serve(async (req: Request) => {
  // Manejar CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validar que sea una petición POST
    if (req.method !== 'POST') {
      throw new Error('Method Not Allowed: Only POST requests are accepted.');
    }

    // 2. Extraer datos del cuerpo de la petición
    const userDetails: NewUserDetails = await req.json();
    console.log("Received user details:", userDetails);

    // Validaciones básicas de entrada
    if (!userDetails.email || !userDetails.name || !userDetails.role || !userDetails.school_id) {
        throw new Error('Missing required fields: email, name, role, school_id.');
    }

    // 3. Crear cliente Admin de Supabase (Usa variables de entorno)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // ¡Importante! Usar Service Role Key
    );
    console.log("Supabase Admin client initialized.");

    // 4. Crear usuario en Supabase Auth
    // Generar contraseña si no se proporcionó
    const passwordToUse = userDetails.password || crypto.randomUUID().slice(0, 12); // Genera una contraseña aleatoria segura si no viene

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userDetails.email,
      password: passwordToUse,
      email_confirm: true, // O false si no quieres que confirmen email inicialmente
      user_metadata: {
        name: userDetails.name, // Puedes guardar metadata aquí también si quieres
        role: userDetails.role
        // No pases school_id aquí si no tienes una columna específica en auth.users
      },
    });

    if (authError) {
      console.error("Supabase Auth Error:", authError);
      throw authError; // Lanza el error para que sea capturado por el catch general
    }

    if (!authData || !authData.user) {
        throw new Error('User creation did not return user data.');
    }

    const newUserId = authData.user.id;
    console.log("User created in Auth:", newUserId);

    // 5. Crear perfil en la tabla public.profiles
    // Asegúrate que los nombres de columna coincidan con tu tabla
    // y que el rol sea válido para tu ENUM 'user_role'
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId, // Usar el ID del usuario recién creado
        name: userDetails.name,
        role: userDetails.role, // Asegúrate que este valor sea válido para tu ENUM
        school_id: userDetails.school_id,
        coins: userDetails.coins ?? 0, // Usar 0 si no se especifica
        // created_at y updated_at usualmente tienen default now() en la DB
        avatar_url text null,  // (Permite NULL, el código no lo inserta, está bien)
        created_at timestamp with time zone not null default now(), // (La BD lo maneja, está bien)
        updated_at timestamp with time zone not null default now(), // (La BD lo maneja, está bien)
      })
      .select() // Opcional: devolver el perfil creado
      .single(); // Opcional

    if (profileError) {
      console.error("Supabase Profile Error:", profileError);
      // Considerar si eliminar el usuario de Auth si falla la creación del perfil
      // await supabaseAdmin.auth.admin.deleteUser(newUserId); // Opcional: Rollback
      throw profileError;
    }

    console.log("Profile created successfully:", profileData);

    // 6. Devolver respuesta exitosa
    return new Response(
      JSON.stringify({
        message: `Usuario ${userDetails.name} creado exitosamente.`,
        userId: newUserId,
        // profile: profileData, // Opcional: devolver el perfil
        generatedPassword: userDetails.password ? null : passwordToUse // Devolver contraseña generada si aplica
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(
        JSON.stringify({ error: error.message || "Internal Server Error" }),
        {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: error.message.includes('Method Not Allowed') ? 405 : (error.message.includes('Missing required fields') ? 400 : 500),
        }
    )
  }
})

/* --- Necesitas crear el archivo _shared/cors.ts ---
   Ejemplo para supabase/functions/_shared/cors.ts:

   export const corsHeaders = {
     'Access-Control-Allow-Origin': '*', // O tu dominio específico del frontend
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }
*/

