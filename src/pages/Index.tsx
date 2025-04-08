
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, School, UserCog } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const { loginWithRole, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleDemoLogin = (role: "student" | "teacher" | "admin") => {
    loginWithRole(role);
    navigate("/dashboard");
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="tu@correo.com" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                    <Button className="w-full bg-invertidos-blue hover:bg-blue-700">
                      Iniciar Sesión
                    </Button>
                  </div>
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
