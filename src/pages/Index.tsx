
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Graduation, BookOpen, Settings } from "lucide-react";

const Index = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (role: "student" | "teacher" | "admin") => {
    login(role);
    toast({
      title: "Bienvenido de nuevo",
      description: `Has iniciado sesión como ${
        role === "student" ? "estudiante" : role === "teacher" ? "profesor" : "administrador"
      }`,
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-invertidos-blue/10 to-invertidos-green/10">
      <div className="w-full max-w-4xl p-4 lg:p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold text-invertidos-blue mb-2">
              Invertidos
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Un ecosistema digital educativo para reconocer y recompensar los logros estudiantiles.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-invertidos-blue/10 flex items-center justify-center text-invertidos-blue">
                  <Graduation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Logros Reconocidos</h3>
                  <p className="text-gray-600">Convierte tus esfuerzos académicos en recompensas tangibles.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-invertidos-green/10 flex items-center justify-center text-invertidos-green">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Educación Financiera</h3>
                  <p className="text-gray-600">Aprende conceptos básicos de finanzas mientras participas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-invertidos-orange/10 flex items-center justify-center text-invertidos-orange">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Ecosistema Completo</h3>
                  <p className="text-gray-600">Mercado escolar, intercambios y muchas más funcionalidades.</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="w-full shadow-md bg-white">
            <CardHeader>
              <CardTitle>Acceder a Invertidos</CardTitle>
              <CardDescription>
                Selecciona tu rol para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="student">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="student">Estudiante</TabsTrigger>
                  <TabsTrigger value="teacher">Profesor</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>

                <TabsContent value="student">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-invertidos-blue/20 flex items-center justify-center animate-float">
                        <span className="text-2xl font-bold text-invertidos-blue">👨‍🎓</span>
                      </div>
                    </div>
                    <p className="text-sm text-center text-gray-600">
                      Accede como estudiante para ver tus logros, administrar tu billetera y explorar el mercado escolar.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="teacher">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-invertidos-green/20 flex items-center justify-center animate-float">
                        <span className="text-2xl font-bold text-invertidos-green">👩‍🏫</span>
                      </div>
                    </div>
                    <p className="text-sm text-center text-gray-600">
                      Accede como profesor para administrar tus clases, asignar logros y monitorear el progreso.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="admin">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-invertidos-orange/20 flex items-center justify-center animate-float">
                        <span className="text-2xl font-bold text-invertidos-orange">👨‍💼</span>
                      </div>
                    </div>
                    <p className="text-sm text-center text-gray-600">
                      Accede como administrador para configurar el sistema, administrar usuarios y supervisar actividades.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <div className="w-full grid grid-cols-3 gap-2">
                <Button 
                  className="bg-invertidos-blue hover:bg-invertidos-blue/90"
                  onClick={() => handleLogin("student")}
                >
                  Estudiante
                </Button>
                <Button 
                  className="bg-invertidos-green hover:bg-invertidos-green/90"
                  onClick={() => handleLogin("teacher")}
                >
                  Profesor
                </Button>
                <Button 
                  className="bg-invertidos-orange hover:bg-invertidos-orange/90"
                  onClick={() => handleLogin("admin")}
                >
                  Admin
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
