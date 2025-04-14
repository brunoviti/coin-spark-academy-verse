
# Integración con Supabase para Invertidos

Este directorio contiene todos los archivos necesarios para la integración con Supabase, la plataforma de backend utilizada por Invertidos.

## Archivos principales

- `client.ts`: Configuración del cliente de Supabase.
- `types.ts`: Tipos de TypeScript generados desde la base de datos de Supabase.
- `helpers.ts`: Funciones auxiliares para interactuar con Supabase.

## Uso

Para utilizar Supabase en cualquier componente:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Ejemplo de consulta
const { data, error } = await supabase
  .from('profiles')
  .select('*');
```

## Funciones auxiliares

Las funciones auxiliares en `helpers.ts` facilitan las operaciones comunes:

```typescript
import { fetchProfileById, updateProfile } from "@/integrations/supabase/helpers";

// Obtener perfil por ID
const profile = await fetchProfileById(userId);

// Actualizar perfil
await updateProfile(userId, { name: 'Nuevo nombre' });
```

## Manejo de autenticación

La autenticación se gestiona a través del contexto `AuthContext`. Ver `src/contexts/auth` para más detalles.
