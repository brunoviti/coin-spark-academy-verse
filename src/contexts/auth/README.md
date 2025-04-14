
# Sistema de Autenticación

Este directorio contiene la implementación del sistema de autenticación basado en Supabase.

## Componentes principales

- `AuthContext.tsx`: Define el contexto de autenticación.
- `AuthProvider.tsx`: Implementa el proveedor de autenticación que gestiona el estado del usuario.
- `types.ts`: Define los tipos para el sistema de autenticación.
- `useAuthContext.ts`: Hook personalizado para acceder al contexto de autenticación.
- `mockUsers.ts`: Usuarios de prueba para el modo de demostración.

## Uso

Para utilizar la autenticación en cualquier componente:

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, login, signup, logout, isAuthenticated } = useAuth();
  
  // Acceder a información del usuario
  if (isAuthenticated) {
    console.log(`Usuario autenticado: ${user.name}`);
  }
  
  // Iniciar sesión
  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
    }
  };
  
  // Registrar nuevo usuario
  const handleSignup = async () => {
    try {
      await signup(email, password, name, role);
    } catch (error) {
      console.error("Error en registro:", error);
    }
  };
  
  // Cerrar sesión
  const handleLogout = async () => {
    await logout();
  };
  
  // Resto del componente...
}
```

## Roles de usuario

El sistema soporta los siguientes roles:
- `student`: Estudiante
- `teacher`: Profesor
- `admin`: Administrador
- `super_admin`: Super Administrador

Cada rol tiene diferentes permisos en la aplicación.

## Flujo de autenticación

1. Al cargar la aplicación, se verifica si hay una sesión existente.
2. Si existe una sesión, se recupera la información del perfil del usuario.
3. El estado de autenticación se actualiza y se proporciona a toda la aplicación a través del contexto.
4. Los cambios en el estado de autenticación (inicio de sesión, cierre de sesión) se propagan automáticamente.

## Modo de demostración

Para facilitar las pruebas, existe un modo de demostración que permite iniciar sesión con diferentes roles sin necesidad de credenciales.
