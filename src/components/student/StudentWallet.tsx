
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  RefreshCw, 
  Loader2, 
  ChevronsUp,
  Users,
  Calendar,
  Clock
} from "lucide-react";
import { fetchUserTransactions } from "@/integrations/supabase/helpers/transactions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { fetchClassStudents } from "@/integrations/supabase/helpers/classes";
import { assignCoins } from "@/integrations/supabase/helpers/transactions";

const StudentWallet: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    loadTransactions();
    
    // If the user is a teacher, load their classes
    if (user?.role === "teacher" && user?.id) {
      loadClasses();
    }
  }, [user?.id, user?.role]);

  // When a class is selected, load its students
  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      if (!user?.id) return;
      
      const { data: fetchedClasses } = await fetch(`/api/teacher/classes?teacherId=${user.id}`).then(res => res.json());
      setClasses(fetchedClasses || []);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const loadStudents = async (classId: string) => {
    try {
      const students = await fetchClassStudents(classId);
      setStudents(students);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

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

  const handleTransferCoins = async () => {
    if (!user?.id || !user?.schoolId) {
      toast({
        title: "Error",
        description: "No se pudo completar la transacción. Información de usuario incompleta.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Por favor selecciona un estudiante",
        variant: "destructive"
      });
      return;
    }

    const coinAmount = parseInt(amount);
    if (isNaN(coinAmount) || coinAmount <= 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa una cantidad válida de monedas",
        variant: "destructive"
      });
      return;
    }

    setIsTransferring(true);
    
    try {
      await assignCoins(
        user.id,
        selectedStudent,
        coinAmount,
        user.schoolId,
        description || "Asignación de monedas"
      );
      
      toast({
        title: "Transferencia exitosa",
        description: `Se han transferido ${coinAmount} monedas al estudiante`,
      });
      
      // Reset form
      setSelectedStudent("");
      setAmount("");
      setDescription("");
      setIsDialogOpen(false);
      
      // Refresh transactions
      loadTransactions();
    } catch (error) {
      console.error("Error transferring coins:", error);
      toast({
        title: "Error",
        description: "No se pudo completar la transferencia",
        variant: "destructive"
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          
          {user?.role === "teacher" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4" variant="outline">
                  <ChevronsUp className="h-4 w-4 mr-2" />
                  Asignar Monedas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Asignar Monedas a Estudiante</DialogTitle>
                  <DialogDescription>
                    Selecciona un estudiante y la cantidad de monedas a asignar
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Clase</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger id="class">
                        <SelectValue placeholder="Selecciona una clase" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No hay clases disponibles
                          </SelectItem>
                        ) : (
                          classes.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="student">Estudiante</Label>
                    <Select 
                      value={selectedStudent} 
                      onValueChange={setSelectedStudent}
                      disabled={!selectedClass || students.length === 0}
                    >
                      <SelectTrigger id="student">
                        <SelectValue placeholder="Selecciona un estudiante" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No hay estudiantes en esta clase
                          </SelectItem>
                        ) : (
                          students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Cantidad de Monedas</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (Opcional)</Label>
                    <Input 
                      id="description" 
                      placeholder="Motivo de la asignación"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={handleTransferCoins} disabled={isTransferring}>
                    {isTransferring ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ChevronsUp className="h-4 w-4 mr-2" />
                        Asignar Monedas
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
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
                        {formatDate(transaction.created_at)}
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
              
              {transactions.length > 5 && (
                <Button variant="outline" className="w-full mt-2" size="sm">
                  Ver Todas las Transacciones
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentWallet;
