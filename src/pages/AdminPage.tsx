
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Users, ShoppingBag, BarChart3, 
  Clock, Database, FileText, Award
} from "lucide-react";

// Importamos los componentes de administración
import SystemStats from "@/components/admin/SystemStats";
import UserManagement from "@/components/admin/UserManagement";
import MarketplaceManagement from "@/components/admin/MarketplaceManagement";
import TransactionHistory from "@/components/admin/TransactionHistory";

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) {
    navigate("/");
    return null;
  }

  // Solo los roles admin y super_admin pueden acceder a esta página
  if (user.role !== "admin" && user.role !== "super_admin") {
    navigate("/dashboard");
    return null;
  }

  return (
    <MainLayout title="Panel de Administración">
      {/* Las estadísticas del sistema siempre se muestran arriba */}
      <SystemStats />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Administración del Sistema</CardTitle>
          <CardDescription>Gestiona todos los aspectos de la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
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
              <UserManagement />
            </TabsContent>

            <TabsContent value="marketplace">
              <MarketplaceManagement />
            </TabsContent>

            <TabsContent value="reports">
              <div className="mb-6">
                <TransactionHistory />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer">
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

                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer">
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

                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer">
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
                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer">
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default AdminPage;
