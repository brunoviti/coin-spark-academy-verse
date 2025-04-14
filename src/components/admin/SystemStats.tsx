
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ShoppingBag, BarChart3, CreditCard, Loader2 } from "lucide-react";
import { getSystemStats } from "@/integrations/supabase/helpers/admin";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const SystemStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.schoolId) return;
    
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const systemStats = await getSystemStats(user.schoolId as string);
        setStats(systemStats);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas del sistema",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [user?.schoolId, toast]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{stats.totalStudents}</p>
              <p className="text-sm text-muted-foreground">activos en el sistema</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Profesores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{stats.totalTeachers}</p>
              <p className="text-sm text-muted-foreground">registrados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{stats.totalTransactions}</p>
              <p className="text-sm text-muted-foreground">realizadas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Monedas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{stats.totalCoinsInCirculation}</p>
              <p className="text-sm text-muted-foreground">
                en circulación 
                {stats.maxSupply > 0 && (
                  <span> ({Math.round((stats.totalCoinsInCirculation / stats.maxSupply) * 100)}% del máximo)</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity: any, index: number) => (
                <div key={activity.id || index} className="flex items-start gap-3 border-b pb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.formattedDate}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Loader2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">Cargando actividad reciente...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SystemStats;
