
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Users, ShoppingBag, BarChart3, 
  Upload, PlusCircle, Database, FileText,
  Award, Clock, AlertCircle, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockSchoolStats } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    navigate("/");
    return null;
  }

  // Only admin role should access this page
  if (user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const handleAction = (action: string) => {
    toast({
      title: "Función en desarrollo",
      description: `La funcionalidad '${action}' estará disponible próximamente`,
    });
  };

  return (
    <MainLayout title="Panel de Administración">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{mockSchoolStats.totalStudents}</p>
              <p className="text-sm text-muted-foreground">activos en el sistema</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Profesores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{mockSchoolStats.totalTeachers}</p>
              <p className="text-sm text-muted-foreground">registrados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{mockSchoolStats.totalTransactions}</p>
              <p className="text-sm text-muted-foreground">realizadas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monedas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{mockSchoolStats.totalCoinsInCirculation}</p>
              <p className="text-sm text-muted-foreground">en circulación</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Administración del Sistema</CardTitle>
          <CardDescription>Gestiona todos los aspectos de la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="marketplace">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Mercado
              </TabsTrigger>
              <TabsTrigger value="reports">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reportes
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Gestionar Estudiantes")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Gestionar Estudiantes</h3>
                    <p className="text-sm text-muted-foreground">
                      Administra perfiles, saldos y actividad
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Gestionar Profesores")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Gestionar Profesores</h3>
                    <p className="text-sm text-muted-foreground">
                      Asigna clases y configura permisos
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Importar Usuarios")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Importar Usuarios</h3>
                    <p className="text-sm text-muted-foreground">
                      Carga masiva desde Excel/CSV
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="marketplace">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Gestionar Productos")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Gestionar Productos</h3>
                    <p className="text-sm text-muted-foreground">
                      Edita o elimina artículos del mercado
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Añadir Producto")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                      <PlusCircle className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Añadir Producto</h3>
                    <p className="text-sm text-muted-foreground">
                      Crea nuevos artículos para el mercado
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Historial de Transacciones")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Historial de Transacciones</h3>
                    <p className="text-sm text-muted-foreground">
                      Revisa todas las compras realizadas
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Reportes de Actividad")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Reportes de Actividad</h3>
                    <p className="text-sm text-muted-foreground">
                      Estadísticas de uso y participación
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Logros y Premios")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                      <Award className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Logros y Premios</h3>
                    <p className="text-sm text-muted-foreground">
                      Análisis de logros más populares
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Exportar Datos")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                      <Database className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Exportar Datos</h3>
                    <p className="text-sm text-muted-foreground">
                      Genera reportes en Excel/CSV
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Configuración General")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                      <Settings className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Configuración General</h3>
                    <p className="text-sm text-muted-foreground">
                      Ajustes de la plataforma
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Notificaciones")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                      <Bell className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Notificaciones</h3>
                    <p className="text-sm text-muted-foreground">
                      Configura alertas y mensajes
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAction("Registro de Errores")}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Registro de Errores</h3>
                    <p className="text-sm text-muted-foreground">
                      Historial de problemas detectados
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSchoolStats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 border-b pb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Funciones de administración comunes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start"
              onClick={() => handleAction("Añadir Nuevo Usuario")}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Nuevo Usuario
            </Button>
            <Button 
              className="w-full justify-start"
              onClick={() => handleAction("Añadir Producto al Mercado")}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Añadir Producto al Mercado
            </Button>
            <Button 
              className="w-full justify-start"
              onClick={() => handleAction("Generar Reporte")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
            <Button 
              className="w-full justify-start"
              onClick={() => handleAction("Distribución de Monedas")}
            >
              <Database className="h-4 w-4 mr-2" />
              Distribución de Monedas
            </Button>
            <Button 
              className="w-full justify-start"
              onClick={() => handleAction("Enviar Notificación")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Enviar Notificación
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminPage;
