
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import {
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw, 
  TrendingUp,
  Filter, 
  Download,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchUserTransactions } from "@/integrations/supabase/helpers/transactions";

const WalletPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    // Only student role should access this page
    if (user.role !== "student") {
      navigate("/dashboard");
      return;
    }

    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserTransactions(user.id);
        setTransactions(data);
      } catch (error) {
        console.error("Error loading transactions:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las transacciones",
          variant: "destructive"
        });
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [user, navigate, toast]);

  // Function to calculate wallet stats from transactions
  const getStats = () => {
    let earned = 0;
    let spent = 0;
    let transferred = 0;

    transactions.forEach(transaction => {
      if (transaction.type === "earning") {
        earned += transaction.amount;
      } else if (transaction.type === "spending") {
        if (transaction.transaction_type === "p2p_transfer") {
          transferred += transaction.amount;
        } else {
          spent += transaction.amount;
        }
      }
    });

    return { earned, spent, transferred };
  };

  const stats = getStats();

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === "all") return true;
    return transaction.type === filter;
  });

  return (
    <MainLayout title="Mi Billetera">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-invertidos-blue/20 to-invertidos-blue/10">
          <CardHeader>
            <CardTitle className="text-xl mb-0">Balance Actual</CardTitle>
            <CardDescription>Tu saldo disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative">
                <div className="coin w-24 h-24 text-4xl z-10 relative">{user?.coins || 0}</div>
                <div className="absolute -top-2 -left-2 w-28 h-28 rounded-full bg-yellow-200 animate-pulse opacity-30"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
              Recibido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.earned}</p>
              <p className="text-sm text-muted-foreground">monedas totales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
              Gastado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.spent + stats.transferred}</p>
              <p className="text-sm text-muted-foreground">monedas totales</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Historial de Transacciones</CardTitle>
              <CardDescription>Todas las actividades de tu billetera</CardDescription>
            </div>
            <div className="flex gap-2">
              <Tabs 
                value={filter} 
                onValueChange={setFilter}
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="earning">Recibidas</TabsTrigger>
                  <TabsTrigger value="spending">Gastos</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  toast({
                    title: "Exportar historial",
                    description: "Esta función estará disponible próximamente",
                  });
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Cargando transacciones...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === "earning" 
                          ? "bg-green-100 text-green-600" 
                          : transaction.transaction_type === "p2p_transfer"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {transaction.type === "earning" 
                          ? <ArrowUpCircle className="h-5 w-5" />
                          : transaction.transaction_type === "p2p_transfer" 
                          ? <RefreshCw className="h-5 w-5" />
                          : <ArrowDownCircle className="h-5 w-5" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.description || 
                           (transaction.type === "earning" 
                            ? `Recibido de ${transaction.otherPartyName}` 
                            : `Enviado a ${transaction.otherPartyName}`)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
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
                ))
              ) : (
                <div className="text-center py-6">
                  <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No hay transacciones para mostrar con este filtro</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Análisis</CardTitle>
            <CardDescription>Resumen de tus movimientos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Fuentes de Ingresos</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Logros Académicos</span>
                    </div>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Comportamiento</span>
                    </div>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Otros</span>
                    </div>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Patrones de Gasto</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>Mercado Escolar</span>
                    </div>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Eventos</span>
                    </div>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: "35%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Transferencias</span>
                    </div>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default WalletPage;
