
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, BookOpen, Star, Trophy, User, 
  Search, Filter, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockAchievements } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";

const AchievementsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  if (!user) {
    navigate("/");
    return null;
  }

  // Only student role should access this page
  if (user.role !== "student") {
    navigate("/dashboard");
    return null;
  }

  // Filter achievements based on category
  const filteredAchievements = mockAchievements.filter(achievement => {
    if (filter === "all") return true;
    return achievement.category === filter;
  });

  // Further filter based on search term
  const searchedAchievements = filteredAchievements.filter(achievement => {
    if (!search) return true;
    return (
      achievement.title.toLowerCase().includes(search.toLowerCase()) ||
      achievement.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Calculate totals
  const totalAchievements = mockAchievements.length;
  const totalCoins = mockAchievements.reduce(
    (sum, achievement) => sum + achievement.coins, 
    0
  );
  
  // Group achievements by category for the progress sections
  const academicAchievements = mockAchievements.filter(
    a => a.category === "academic"
  ).length;
  
  const behaviorAchievements = mockAchievements.filter(
    a => a.category === "behavior"
  ).length;
  
  const otherAchievements = mockAchievements.filter(
    a => !["academic", "behavior"].includes(a.category)
  ).length;

  return (
    <MainLayout title="Mis Logros">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-invertidos-blue/20 to-invertidos-blue/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Total de Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold">{totalAchievements}</p>
              <p className="text-sm text-muted-foreground">logros obtenidos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-invertidos-green/20 to-invertidos-green/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-4 w-4" />
              Monedas Ganadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold">{totalCoins}</p>
              <p className="text-sm text-muted-foreground">por logros</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-invertidos-orange/20 to-invertidos-orange/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-4 w-4" />
              Promedio por Logro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {totalAchievements > 0 ? Math.round(totalCoins / totalAchievements) : 0}
              </p>
              <p className="text-sm text-muted-foreground">monedas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Todos Mis Logros</CardTitle>
                <CardDescription>Historial completo de logros obtenidos</CardDescription>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar logros" 
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Tabs value={filter} onValueChange={setFilter} className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="academic">Académicos</TabsTrigger>
                <TabsTrigger value="behavior">Conducta</TabsTrigger>
                <TabsTrigger value="sports">Deportivos</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchedAchievements.length > 0 ? (
                searchedAchievements.map(achievement => (
                  <div key={achievement.id} className="achievement-card flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3 className="font-medium">{achievement.title}</h3>
                        <Badge 
                          variant="outline" 
                          className="w-fit flex items-center gap-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
                        >
                          <span className="text-xs">+{achievement.coins}</span>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No hay logros para mostrar con estos filtros</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progreso</CardTitle>
            <CardDescription>Distribución de tus logros por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-500" />
                    <span>Académicos</span>
                  </div>
                  <span className="font-medium">{academicAchievements}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(academicAchievements / totalAchievements) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span>Conducta y Valores</span>
                  </div>
                  <span className="font-medium">{behaviorAchievements}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${(behaviorAchievements / totalAchievements) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span>Otros Logros</span>
                  </div>
                  <span className="font-medium">{otherAchievements}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${(otherAchievements / totalAchievements) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-4">Próximos Desafíos</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Completar 3 libros</span>
                  </div>
                  <Badge>+30</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Asistencia perfecta</span>
                  </div>
                  <Badge>+25</Badge>
                </div>
              </div>
              <Button 
                className="w-full mt-4"
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Función en desarrollo",
                    description: "El sistema de desafíos estará disponible próximamente",
                  });
                }}
              >
                Ver todos los desafíos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AchievementsPage;
