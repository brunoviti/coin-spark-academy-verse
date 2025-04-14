
# Configuración de Supabase para Invertidos

Esta guía detalla los pasos necesarios para configurar correctamente Supabase como backend de la aplicación Invertidos.

## 1. Configuración de la base de datos

La aplicación requiere las siguientes tablas:

- `profiles`: Perfiles de usuario
- `schools`: Escuelas
- `classes`: Clases
- `class_enrollments`: Inscripciones a clases
- `achievement_types`: Tipos de logros
- `achievements`: Logros obtenidos
- `marketplace_categories`: Categorías del mercado
- `marketplace_items`: Productos del mercado
- `marketplace_purchases`: Compras en el mercado
- `exchange_listings`: Listados de intercambio
- `exchange_offers`: Ofertas de intercambio
- `transactions`: Transacciones de monedas

## 2. Autenticación

### Configuración en el panel de Supabase

1. Ir a Authentication > Settings
2. Habilitar Email/Password sign-in
3. (Opcional para desarrollo) Desactivar "Confirm email" para facilitar las pruebas

### URL de redirección

Configurar las URL de redirección en Authentication > URL Configuration:
- Site URL: URL de la aplicación desplegada
- Redirect URLs: URL de la aplicación desplegada y URLs de desarrollo local

## 3. Políticas de seguridad (RLS)

Es necesario configurar las políticas de Row Level Security (RLS) en cada tabla para garantizar que los usuarios solo puedan acceder a los datos que les corresponden según su rol.

Ejemplos de políticas:
- Los estudiantes solo pueden ver sus propios logros
- Los profesores pueden ver los logros de sus estudiantes
- Los administradores pueden ver todos los datos de su escuela

## 4. Triggers y funciones

La aplicación utiliza los siguientes triggers y funciones:

- `handle_new_user_auth()`: Crea automáticamente un perfil de usuario al registrarse
- `process_coin_transaction()`: Gestiona las transacciones de monedas

## 5. Claves de API

Para conectar la aplicación con Supabase:
1. Ir a Settings > API
2. Copiar la URL del proyecto y la anon key
3. Configurar estas claves en el archivo `src/integrations/supabase/client.ts`

## 6. Almacenamiento (opcional)

Para almacenar imágenes de perfil y otros archivos:
1. Crear un bucket llamado 'avatars'
2. Configurar las políticas de acceso adecuadas

## 7. Edge Functions (opcional)

Para funcionalidades avanzadas, se pueden crear Edge Functions en Supabase para ejecutar código en el servidor.
