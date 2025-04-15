
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";
import { Calendar, Download, Search, ArrowDownUp, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Definir los tipos de transacción
type TransactionType = 'reward' | 'purchase' | 'p2p_transfer';

// Definir el tipo de transacción
type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  sender?: { name: string; };
  receiver?: { name: string; };
};

const TransactionHistory: React.FC = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Esta función simula la obtención de transacciones de la base de datos
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Aquí se implementaría la lógica real para obtener transacciones de Supabase
      // Por ahora usamos datos de ejemplo
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          sender_id: "teacher1",
          receiver_id: "student1",
          amount: 50,
          transaction_type: "reward",
          created_at: new Date().toISOString(),
          school_id: "school1",
          sender: { name: "Profesor García" },
          receiver: { name: "Estudiante López" },
          description: "Premio por buen comportamiento",
          reference_id: null
        },
        {
          id: "2",
          sender_id: "student2",
          receiver_id: null,
          amount: 30,
          transaction_type: "purchase",
          created_at: new Date(Date.now() - 86400000).toISOString(), // Ayer
          school_id: "school1",
          sender: { name: "Estudiante Martínez" },
          description: "Compra de artículo escolar",
          reference_id: "item1"
        },
        {
          id: "3",
          sender_id: "student1",
          receiver_id: "student3",
          amount: 20,
          transaction_type: "p2p_transfer",
          created_at: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
          school_id: "school1",
          sender: { name: "Estudiante López" },
          receiver: { name: "Estudiante Rodríguez" },
          description: "Transferencia entre estudiantes",
          reference_id: null
        }
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar transacciones al montar el componente
  React.useEffect(() => {
    fetchTransactions();
  }, []);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Función para obtener el color del badge según el tipo de transacción
  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'reward':
        return 'bg-green-100 text-green-800';
      case 'purchase':
        return 'bg-blue-100 text-blue-800';
      case 'p2p_transfer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del tipo de transacción
  const getTransactionTypeText = (type: TransactionType) => {
    switch (type) {
      case 'reward':
        return 'Recompensa';
      case 'purchase':
        return 'Compra';
      case 'p2p_transfer':
        return 'Transferencia';
      default:
        return type;
    }
  };

  // Filtrar transacciones
  const filteredTransactions = transactions
    .filter(transaction => {
      // Filtrar por tipo
      if (filterType !== "all" && transaction.transaction_type !== filterType) {
        return false;
      }
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          transaction.sender?.name?.toLowerCase().includes(searchLower) ||
          transaction.receiver?.name?.toLowerCase().includes(searchLower) ||
          transaction.description?.toLowerCase().includes(searchLower) ||
          transaction.amount.toString().includes(searchLower)
        );
      }
      
      // Filtrar por fecha de inicio
      if (startDate) {
        const transactionDate = new Date(transaction.created_at);
        const filterDate = new Date(startDate);
        if (transactionDate < filterDate) {
          return false;
        }
      }
      
      // Filtrar por fecha de fin
      if (endDate) {
        const transactionDate = new Date(transaction.created_at);
        const filterDate = new Date(endDate);
        filterDate.setHours(23, 59, 59, 999); // Final del día
        if (transactionDate > filterDate) {
          return false;
        }
      }
      
      return true;
    })
    // Ordenar por fecha
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });

  // Función para exportar a CSV
  const exportToCSV = () => {
    const headers = ["ID", "Fecha", "Tipo", "Emisor", "Receptor", "Cantidad", "Descripción"];
    
    const csvData = filteredTransactions.map(transaction => [
      transaction.id,
      formatDate(transaction.created_at),
      getTransactionTypeText(transaction.transaction_type as TransactionType),
      transaction.sender?.name || "Sistema",
      transaction.receiver?.name || "N/A",
      transaction.amount.toString(),
      transaction.description || ""
    ]);
    
    // Crear contenido CSV
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transacciones_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportación exitosa",
      description: "El archivo CSV ha sido generado correctamente"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Historial de Transacciones</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </CardTitle>
        <CardDescription>
          Registro de todas las transacciones realizadas en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, descripción..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="transaction-type">Tipo de Transacción</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="transaction-type">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="reward">Recompensas</SelectItem>
                  <SelectItem value="purchase">Compras</SelectItem>
                  <SelectItem value="p2p_transfer">Transferencias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <div className="w-1/2">
                <Label htmlFor="start-date">Desde</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="end-date">Hasta</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Tabla de transacciones */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">ID</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}>
                    <div className="flex items-center gap-1">
                      Fecha
                      <ArrowDownUp className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Emisor</TableHead>
                  <TableHead className="hidden md:table-cell">Receptor</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead className="hidden lg:table-cell">Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando transacciones...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No se encontraron transacciones con los filtros actuales
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge variant="outline" className={getTransactionColor(transaction.transaction_type as TransactionType)}>
                          {transaction.transaction_type === 'reward' && 'Recompensa'}
                          {transaction.transaction_type === 'purchase' && 'Compra'}
                          {transaction.transaction_type === 'p2p_transfer' && 'Transferencia'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs">
                        {transaction.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        {transaction.sender?.name || "Sistema"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {transaction.receiver?.name || "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.transaction_type === 'purchase' ? (
                          <span className="text-red-600">-{transaction.amount}</span>
                        ) : transaction.transaction_type === 'reward' ? (
                          <span className="text-green-600">+{transaction.amount}</span>
                        ) : (
                          <span>{transaction.amount}</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                        {transaction.description || "Sin descripción"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
