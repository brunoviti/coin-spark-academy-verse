
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

const StudentWallet: React.FC<{
  transactions: any[];
}> = ({ transactions }) => {
  const { user } = useAuth();

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
          <h3 className="text-sm font-medium">Transacciones Recientes</h3>
          
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay transacciones recientes
            </p>
          ) : (
            <>
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === "reward" 
                        ? "bg-green-100 text-green-600" 
                        : transaction.type === "purchase"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}>
                      {transaction.type === "reward" 
                        ? <ArrowUpRight className="h-4 w-4" /> 
                        : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === "reward" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {transaction.type === "reward" ? "+" : "-"}{transaction.amount}
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
