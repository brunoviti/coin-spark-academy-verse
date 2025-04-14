
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, Search, Download, Filter, RefreshCw, 
  ArrowUpRight, ArrowDownLeft, CreditCard,
  ShoppingBag
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const TransactionHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  
  useEffect(() => {
    if (!user?.schoolId) return;
    
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        // Obtener todas las transacciones de la escuela
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            sender:sender_id (id, name),
            receiver:receiver_id (id, name)
          `)
          .eq('school_id', user.schoolId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Procesar las transacciones para un formato más amigable
        const processedTransactions = data.map((transaction: any) => {
          let description = "";
          
          if (transaction.transaction_type === 'reward') {
            description = `${transaction.sender?.name || 'Sistema'} premió a ${transaction.receiver?.name || 'Usuario'} con ${transaction.amount} monedas`;
          } else if (transaction.transaction_type === 'purchase') {
            description = `${transaction.sender?.name || 'Usuario'} compró un artículo por ${transaction.amount} monedas`;
          } else if (transaction.transaction_type === 'p2p_transfer') {
            description = `${transaction.sender?.name || 'Usuario'} transfirió ${transaction.amount} monedas a ${transaction.receiver?.name || 'Usuario'}`;
          }
          
          if (transaction.description) {
            description += ` - ${transaction.description}`;
          }
          
          return {
            ...transaction,
            formattedDate: formatDate(transaction.created_at),
            description
          };
        });
        
        setTransactions(processedTransactions);
      } catch (error) {
        console.error("Error cargando transacciones:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las transacciones",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTransactions();
  }, [user?.schoolId, toast]);
  
  // Filtrar transacciones según el término de búsqueda y el filtro
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.receiver?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (filter === "all") return matchesSearch;
    return matchesSearch && transaction.transaction_type === filter;
  });
  
  // Función para exportar transacciones a CSV
  const exportTransactionsToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "Error",
        description: "No hay transacciones para exportar",
        variant: "destructive"
      });
      return;
    }
    
    // Crear encabezados del CSV
    const headers = [
      "ID", 
      "Fecha", 
      "Tipo", 
      "Remitente", 
      "Destinatario", 
      "Cantidad", 
      "Descripción"
    ];
    
    // Crear filas de datos
    const rows = filteredTransactions.map(t => [
      t.id,
      t.formattedDate,
      t.transaction_type,
      t.sender?.name || "Sistema",
      t.receiver?.name || "Sistema",
      t.amount,
      t.description
    ]);
    
    // Combinar encabezados y filas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportación exitosa",
      description: `Se han exportado ${filteredTransactions.length} transacciones`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historial de Transacciones</CardTitle>
          <CardDescription>Revisa todas las transacciones realizadas en el sistema</CardDescription>
        </div>
        <Button variant="outline" onClick={exportTransactionsToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-8"
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las transacciones</SelectItem>
                <SelectItem value="reward">Premios</SelectItem>
                <SelectItem value="purchase">Compras</SelectItem>
                <SelectItem value="p2p_transfer">Transferencias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Cargando transacciones...</p>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="whitespace-nowrap">{transaction.formattedDate}</TableCell>
                    <TableCell>
                      {transaction.transaction_type === 'reward' && (
                        <div className="flex items-center">
                          <div className="bg-green-100 text-green-800 rounded-full p-1 mr-2">
                            <ArrowDownLeft className="h-4 w-4" />
                          </div>
                          <span>Premio</span>
                        </div>
                      )}
                      {transaction.transaction_type === 'purchase' && (
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                          <span>Compra</span>
                        </div>
                      )}
                      {transaction.transaction_type === 'p2p_transfer' && (
                        <div className="flex items-center">
                          <div className="bg-purple-100 text-purple-800 rounded-full p-1 mr-2">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                          <span>Transferencia</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      <div className="flex items-center justify-end">
                        <CreditCard className="h-4 w-4 mr-1 text-amber-500" />
                        {transaction.amount}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No se encontraron transacciones</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
