
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Wallet, Award, ShoppingBag, BarChart3, Calendar, TrendingUp,
  Users, BookOpen, Star, CheckSquare, PlusCircle 
} from "lucide-react";
import { 
  mockAchievements, 
  mockMarketplaceItems, 
  mockTransactions,
  mockSchoolStats 
} from "@/data/mockData";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    navigate("/");
    return null;
  }

  // Function to calculate wallet balance from transactions
  const calculateBalance = () => {
    return mockTransactions.reduce((total, transaction) => {
      if (transaction.type === "earning") {
        return total + transaction.amount;
      } else if (transaction.type === "spending" || transaction.type === "transfer") {
        return total - transaction.amount;
      }
      return total;
    }, 0);
  };

  const renderStudentDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-invertidos-blue/20 to-invertidos-blue/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Mi Billetera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="coin text-2xl">{user.coins || calculateBalance()}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => navigate("/wallet")}
            >
              Ver detalles
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-invertidos-green/20 to-invertidos-green/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Award className="h-5 w-5" />
              Mis Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-3xl font-bold mb-1">{mockAchievements.length}</p>
              <p className="text-sm text-muted-foreground">logros obtenidos</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => navigate("/achievements")}
            >
              Ver logros
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-invertidos-orange/20 to-invertidos-orange/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-3xl font-bold mb-1">{mockMarketplaceItems.length}</p>
              <p className="text-sm text-muted-foreground">artículos disponibles</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => navigate("/marketplace")}
            >
              Ir al mercado
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Tus últimas transacciones y logros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.slice(0, 4).map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "earning" 
                        ? "bg-green-100 text-green-600" 
                        : transaction.type === "spending"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}>
                      {transaction.type === "earning" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === "earning" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {transaction.type === "earning" ? "+" : "-"}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate("/wallet")}
            >
              Ver todas las transacciones
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Actividades y promociones especiales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Feria de Ciencias</p>
                  <p className="text-sm text-muted-foreground">Mayo 15 - Oportunidad de ganar monedas extra</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Semana de Reconocimientos</p>
                  <p className="text-sm text-muted-foreground">Mayo 20-24 - Logros especiales disponibles</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Ofertas Especiales en el Mercado</p>
                  <p className="text-sm text-muted-foreground">Mayo 30 - Productos exclusivos y descuentos</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Función en desarrollo",
                  description: "El calendario de eventos estará disponible próximamente",
                });
              }}
            >
              Ver calendario completo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );

  const renderTeacherDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-invertidos-blue/20 to-invertidos-blue/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mis Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-3xl font-bold mb-1">124</p>
              <p className="text-sm text-muted-foreground">estudiantes activos</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Función en desarrollo",
                  description: "La gestión de estudiantes estará disponible próximamente",
                });
              }}
            >
              Ver estudiantes
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-invertidos-green/20 to-invertidos-green/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Award className="h-5 w-5" />
              Logros Asignados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-3xl font-bold mb-1">86</p>
              <p className="text-sm text-muted-foreground">este mes</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Función en desarrollo",
                  description: "El historial de logros asignados estará disponible próximamente",
                });
              }}
            >
              Ver historial
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-invertidos-orange/20 to-invertidos-orange/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-3xl font-bold mb-1">3</p>
              <p className="text-sm text-muted-foreground">acciones pendientes</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Función en desarrollo",
                  description: "La lista de acciones pendientes estará disponible próximamente",
                });
              }}
            >
              Resolver pendientes
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asignar Logros</CardTitle>
            <CardDescription>Recompensa a tus estudiantes por sus logros</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="individual">
              <TabsList className="mb-4">
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="group">Grupal</TabsTrigger>
              </TabsList>
              <TabsContent value="individual">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="p-6 flex justify-center">
                      <PlusCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Selecciona un estudiante y asigna un logro con monedas
                    </p>
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Función en desarrollo",
                          description: "La asignación de logros estará disponible próximamente",
                        });
                      }}
                    >
                      Asignar Nuevo Logro
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="group">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="p-6 flex justify-center">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Asigna logros y monedas a un grupo de estudiantes a la vez
                    </p>
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Función en desarrollo",
                          description: "La asignación grupal de logros estará disponible próximamente",
                        });
                      }}
                    >
                      Asignación Grupal
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de la Clase</CardTitle>
            <CardDescription>Estadísticas y tendencias recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Participación en Aumento</p>
                  <p className="text-sm text-muted-foreground">+15% en actividades este mes vs. anterior</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Mejora en Entregas</p>
                  <p className="text-sm text-muted-foreground">92% de tareas entregadas a tiempo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Logros Más Comunes</p>
                  <p className="text-sm text-muted-foreground">Excelencia Académica y Participación en Clase</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Función en desarrollo",
                  description: "El reporte detallado estará disponible próximamente",
                });
              }}
            >
              Ver reporte completo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );

  const renderAdminDashboard = () => (
    <>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Artículos Más Populares</CardTitle>
            <CardDescription>Los artículos más adquiridos del mercado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSchoolStats.mostPopularItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      {index + 1}
                    </div>
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <div className="font-bold text-gray-700">{item.count} usos</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate("/marketplace")}
            >
              Ver todos los artículos
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mejores Estudiantes</CardTitle>
            <CardDescription>Los estudiantes con más monedas acumuladas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSchoolStats.topAchievers.map((student, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                      index === 1 ? 'bg-gray-100 text-gray-600' : 
                      'bg-amber-100 text-amber-600'
                    } flex items-center justify-center`}>
                      {index + 1}
                    </div>
                    <p className="font-medium">{student.name}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="coin w-6 h-6 mr-2 text-xs">
                      <span>C</span>
                    </div>
                    <span className="font-bold text-gray-700">{student.coins}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Función en desarrollo",
                  description: "El ranking completo estará disponible próximamente",
                });
              }}
            >
              Ver ranking completo
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-6">
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
                    <Calendar className="h-5 w-5" />
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
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Función en desarrollo",
                  description: "El registro de actividad completo estará disponible próximamente",
                });
              }}
            >
              Ver todas las actividades
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );

  return (
    <MainLayout title="Panel de Control">
      {user.role === "student" && renderStudentDashboard()}
      {user.role === "teacher" && renderTeacherDashboard()}
      {user.role === "admin" && renderAdminDashboard()}
    </MainLayout>
  );
};

export default Dashboard;
