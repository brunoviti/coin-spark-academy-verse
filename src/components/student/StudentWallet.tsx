
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowDownRight, ArrowUpRight, Wallet, RefreshCw, Loader2 } from "lucide-react";
import { fetchUserTransactions } from "@/integrations/supabase/helpers/transactions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const StudentWallet: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [user?.id]);

  const loadTransactions = async () => {
    if (!user?.id) return;
    
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Mi Billetera
        </CardTitle>
        <CardDescription>Estado actual de tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-4xl font-bold">{user?.coins || 0}</p>
          <p className="text-sm text-muted-foreground">monedas disponibles</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Transacciones Recientes</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadTransactions}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay transacciones recientes
            </p>
          ) : (
            <>
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === "earning" 
                        ? "bg-green-100 text-green-600" 
                        : transaction.transaction_type === "p2p_transfer"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {transaction.type === "earning" 
                        ? <ArrowUpRight className="h-4 w-4" /> 
                        : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description || 
                        (transaction.type === "earning" 
                          ? `Recibido de ${transaction.otherPartyName}` 
                          : `Enviado a ${transaction.otherPartyName}`)}</p>
                      <p className="text-xs text-muted-foreground">
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
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentWallet;
