
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, School, UserCog, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/contexts/auth/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

const Index = () => {
  const navigate = useNavigate();
  const { loginWithRole, login, signup, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Navigation happens automatically via the useEffect
    } catch (error) {
      // Error is handled in the login function
      console.error("Login failed:", error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !name) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }
    
    if (signupPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }
    
    if (signupPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    try {
      await signup(signupEmail, signupPassword, name, selectedRole);
      setActiveTab("login");
      toast({
        title: "Registro exitoso",
        description: "Por favor inicia sesión con tus nuevas credenciales",
      });
    } catch (error) {
      // Error is handled in signup function
      console.error("Signup failed:", error);
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
                  <TabsTrigger value="demo">Modo Demo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="tu@correo.com" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-invertidos-blue hover:bg-blue-700">
                      Iniciar Sesión
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nombre completo</Label>
                      <Input 
                        id="signup-name" 
                        type="text" 
                        placeholder="Tu nombre" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Correo electrónico</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="tu@correo.com" 
                        value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="Mínimo 6 caracteres"
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="Confirma tu contraseña"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Selecciona tu rol</Label>
                      <RadioGroup 
                        className="flex gap-4 pt-2" 
                        defaultValue="student"
                        value={selectedRole}
                        onValueChange={(value) => setSelectedRole(value as UserRole)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="student" id="student" />
                          <Label htmlFor="student" className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>Estudiante</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="teacher" id="teacher" />
                          <Label htmlFor="teacher" className="flex items-center gap-1">
                            <School className="h-4 w-4" />
                            <span>Profesor</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Button type="submit" className="w-full bg-invertidos-blue hover:bg-blue-700">
                      Crear Cuenta
                    </Button>
                  </form>
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
