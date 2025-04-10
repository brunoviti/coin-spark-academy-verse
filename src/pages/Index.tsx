
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, School, UserCog, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { loginWithRole, login, signup, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-invertidos-blue mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleDemoLogin = (role: "student" | "teacher" | "admin" | "super_admin") => {
    loginWithRole(role);
    navigate("/dashboard");
  };

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor, introduce tu correo electrónico y contraseña",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      // Si el login es exitoso, el useEffect detectará el cambio en isAuthenticated y redirigirá
    } catch (error) {
      // El error ya se maneja en el contexto de autenticación
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signup(email, password, name);
      toast({
        title: "Registro exitoso",
        description: "Te has registrado correctamente. Por favor verifica tu correo electrónico.",
      });
      setIsRegistering(false); // Volver al formulario de login
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-invertidos-blue to-blue-800 flex flex-col">
      <header className="py-6 px-4 sm:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Invertidos</h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Bienvenido a Invertidos
              </CardTitle>
              <CardDescription className="text-center">
                La plataforma educativa de criptomonedas para escuelas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="demo">Modo Demo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  {isRegistering ? (
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input 
                          id="name" 
                          type="text" 
                          placeholder="Tu nombre" 
                          value={name}
                          onChange={e => setName(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="tu@correo.com" 
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-invertidos-blue hover:bg-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Registrando...
                          </>
                        ) : (
                          "Crear cuenta"
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setIsRegistering(false)}
                        disabled={isSubmitting}
                      >
                        Volver a iniciar sesión
                      </Button>
                    </form>
                  ) : (
                    <>
                      <form onSubmit={handleRealLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Correo electrónico</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="tu@correo.com" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-invertidos-blue hover:bg-blue-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Iniciando...
                            </>
                          ) : (
                            "Iniciar Sesión"
                          )}
                        </Button>
                      </form>
                      <div className="text-center mt-4">
                        <Button 
                          type="button" 
                          variant="link" 
                          onClick={() => setIsRegistering(true)}
                        >
                          ¿No tienes cuenta? Regístrate aquí
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="demo">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Selecciona un rol para explorar la aplicación en modo demo:
                    </p>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
                        onClick={() => handleDemoLogin("student")}
                      >
                        <GraduationCap className="h-6 w-6 text-invertidos-blue" />
                        <span>Estudiante</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
                        onClick={() => handleDemoLogin("teacher")}
                      >
                        <School className="h-6 w-6 text-invertidos-blue" />
                        <span>Profesor</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
                        onClick={() => handleDemoLogin("admin")}
                      >
                        <UserCog className="h-6 w-6 text-invertidos-blue" />
                        <span>Administrador</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
                        onClick={() => handleDemoLogin("super_admin")}
                      >
                        <Shield className="h-6 w-6 text-invertidos-blue" />
                        <span>Super Administrador</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-xs text-center text-muted-foreground">
                Invertidos: Educación Financiera y Cripto para Escuelas
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
