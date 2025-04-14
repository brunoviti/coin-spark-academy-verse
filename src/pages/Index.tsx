import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/contexts/auth/types";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import DemoLogin from "@/components/auth/DemoLogin";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Añadir log en el cuerpo principal
  console.log('[Index Render] IsAuthenticated:', isAuthenticated, 'IsLoading:', isLoading);

  // Redirect if already authenticated
  useEffect(() => {
    console.log('[Index Effect] Running redirect check. IsAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('[Index Effect] User is authenticated, navigating to /dashboard...');
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

  const handleDemoLogin = (role: UserRole) => {
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
                  <TabsTrigger value="demo">Modo Demo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                
                <TabsContent value="signup">
                  <SignupForm onSignupSuccess={() => setActiveTab("login")} />
                </TabsContent>
                
                <TabsContent value="demo">
                  <DemoLogin onLogin={handleDemoLogin} />
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
