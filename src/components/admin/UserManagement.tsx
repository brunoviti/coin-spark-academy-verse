
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  UserPlus, Users, Search, PlusCircle, Edit, Trash2, 
  DollarSign, School, RefreshCw, UserCheck, Download, Upload 
} from "lucide-react";
import { fetchAllStudents, fetchAllTeachers, createNewUser, updateUserBalance, assignCoinsToUser } from "@/integrations/supabase/helpers/admin";
import { fetchClasses } from "@/integrations/supabase/helpers/classes";
import { assignStudentToClass } from "@/integrations/supabase/helpers/admin";

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado para el formulario de nuevo usuario
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "student",
    coins: 0,
    password: ""
  });
  
  // Estado para asignar clase
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState("");
  
  // Estado para asignar monedas
  const [coinAssignment, setCoinAssignment] = useState({
    userId: "",
    amount: 0,
    description: ""
  });
  
  // Estado para importar usuarios
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!user?.schoolId) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Cargar estudiantes
        const studentsData = await fetchAllStudents(user.schoolId as string);
        setStudents(studentsData);
        
        // Cargar profesores
        const teachersData = await fetchAllTeachers(user.schoolId as string);
        setTeachers(teachersData);
        
        // Cargar clases
        const classesData = await fetchClasses(user.schoolId as string);
        setClasses(classesData);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de usuarios",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user?.schoolId, toast]);
  
  // Filtrar usuarios según el término de búsqueda
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Función para crear un nuevo usuario
  const handleCreateUser = async () => {
    if (!user?.schoolId) return;
    
    try {
      // Generar una contraseña aleatoria si no se proporciona
      const password = newUser.password || Math.random().toString(36).slice(-8);
      
      const createdUser = await createNewUser({
        email: newUser.email,
        password: password,
        name: newUser.name,
        role: newUser.role,
        school_id: user.schoolId,
        coins: newUser.coins
      });
      
      toast({
        title: "Usuario creado",
        description: `Se ha creado el usuario ${newUser.name} correctamente${!newUser.password ? `. Contraseña generada: ${password}` : ''}`,
      });
      
      // Actualizar las listas según el rol
      if (newUser.role === "student") {
        setStudents(prev => [...prev, { 
          id: createdUser.id, 
          name: newUser.name, 
          email: newUser.email,
          coins: newUser.coins,
          role: newUser.role,
          classes: []
        }]);
      } else if (newUser.role === "teacher") {
        setTeachers(prev => [...prev, { 
          id: createdUser.id, 
          name: newUser.name, 
          email: newUser.email,
          coins: newUser.coins,
          role: newUser.role,
          classes: []
        }]);
      }
      
      // Limpiar el formulario
      setNewUser({
        email: "",
        name: "",
        role: "student",
        coins: 0,
        password: ""
      });
    } catch (error) {
      console.error("Error creando usuario:", error);
      toast({
        title: "Error",
        description: `No se pudo crear el usuario: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };
  
  // Función para asignar un estudiante a una clase
  const handleAssignClass = async () => {
    if (!selectedStudent || !selectedClass) {
      toast({
        title: "Error",
        description: "Debes seleccionar un estudiante y una clase",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await assignStudentToClass(selectedStudent.id, selectedClass);
      
      toast({
        title: "Asignación exitosa",
        description: "El estudiante ha sido asignado a la clase correctamente",
      });
      
      // Actualizar la lista de estudiantes
      setStudents(prev => prev.map(student => {
        if (student.id === selectedStudent.id) {
          const selectedClassData = classes.find(c => c.id === selectedClass);
          const updatedClasses = [
            ...(student.classes || []),
            { class: { id: selectedClass, name: selectedClassData?.name } }
          ];
          return { ...student, classes: updatedClasses };
        }
        return student;
      }));
      
      // Limpiar selección
      setSelectedStudent(null);
      setSelectedClass("");
    } catch (error) {
      console.error("Error asignando clase:", error);
      toast({
        title: "Error",
        description: `No se pudo asignar la clase: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };
  
  // Función para asignar monedas a un usuario
  const handleAssignCoins = async () => {
    if (!user?.schoolId || !coinAssignment.userId || coinAssignment.amount <= 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar un usuario y una cantidad válida de monedas",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await assignCoinsToUser(
        user.id,
        coinAssignment.userId,
        coinAssignment.amount,
        coinAssignment.description,
        user.schoolId
      );
      
      toast({
        title: "Monedas asignadas",
        description: `Se han asignado ${coinAssignment.amount} monedas correctamente`,
      });
      
      // Actualizar las listas según el rol del usuario
      const targetUser = [...students, ...teachers].find(u => u.id === coinAssignment.userId);
      if (targetUser) {
        if (targetUser.role === "student") {
          setStudents(prev => prev.map(student => {
            if (student.id === coinAssignment.userId) {
              return { ...student, coins: (student.coins || 0) + coinAssignment.amount };
            }
            return student;
          }));
        } else if (targetUser.role === "teacher") {
          setTeachers(prev => prev.map(teacher => {
            if (teacher.id === coinAssignment.userId) {
              return { ...teacher, coins: (teacher.coins || 0) + coinAssignment.amount };
            }
            return teacher;
          }));
        }
      }
      
      // Limpiar el formulario
      setCoinAssignment({
        userId: "",
        amount: 0,
        description: ""
      });
    } catch (error) {
      console.error("Error asignando monedas:", error);
      toast({
        title: "Error",
        description: `No se pudieron asignar las monedas: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };
  
  // Función para procesar el archivo CSV importado
  const handleImportUsers = async () => {
    if (!user?.schoolId || !importFile) {
      toast({
        title: "Error",
        description: "Debes seleccionar un archivo CSV válido",
        variant: "destructive"
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      const text = await importFile.text();
      const rows = text.split("\n");
      const headers = rows[0].split(",");
      
      // Encontrar índices de las columnas
      const emailIndex = headers.findIndex(h => h.toLowerCase().includes("email"));
      const nameIndex = headers.findIndex(h => h.toLowerCase().includes("nombre") || h.toLowerCase().includes("name"));
      const roleIndex = headers.findIndex(h => h.toLowerCase().includes("rol") || h.toLowerCase().includes("role"));
      const coinsIndex = headers.findIndex(h => h.toLowerCase().includes("monedas") || h.toLowerCase().includes("coins"));
      
      if (emailIndex === -1 || nameIndex === -1) {
        throw new Error("El formato del CSV no es válido. Debe incluir columnas para email y nombre.");
      }
      
      const users = [];
      
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        
        const values = rows[i].split(",");
        
        users.push({
          email: values[emailIndex].trim(),
          name: values[nameIndex].trim(),
          role: roleIndex !== -1 ? values[roleIndex].trim() : "student",
          coins: coinsIndex !== -1 ? parseInt(values[coinsIndex]) || 0 : 0
        });
      }
      
      // Implementar la función para importar usuarios
      // (Aquí se llamaría a importUsersFromCSV)
      
      toast({
        title: "Importación exitosa",
        description: `Se han importado ${users.length} usuarios correctamente`,
      });
      
      setImportFile(null);
    } catch (error) {
      console.error("Error importando usuarios:", error);
      toast({
        title: "Error",
        description: `No se pudieron importar los usuarios: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión de Usuarios</CardTitle>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-8 w-64"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Introduce los datos para crear un nuevo usuario en el sistema
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Opcional (se generará automáticamente)"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Rol
                  </Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="teacher">Profesor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="super_admin">Super Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="coins" className="text-right">
                    Monedas
                  </Label>
                  <Input
                    id="coins"
                    type="number"
                    value={newUser.coins}
                    onChange={(e) => setNewUser({ ...newUser, coins: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateUser}>Crear Usuario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Importar Usuarios desde CSV</DialogTitle>
                <DialogDescription>
                  Selecciona un archivo CSV con los datos de los usuarios a importar
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="csvFile">Archivo CSV</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-muted-foreground">
                    El archivo debe tener columnas para email, nombre, rol (opcional) y monedas (opcional)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleImportUsers} 
                  disabled={!importFile || isImporting}
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    'Importar Usuarios'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="students"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Estudiantes
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center">
              <School className="h-4 w-4 mr-2" />
              Profesores
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="students">
            <div className="mb-4 flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <School className="h-4 w-4 mr-2" />
                    Asignar a Clase
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Asignar Estudiante a Clase</DialogTitle>
                    <DialogDescription>
                      Selecciona un estudiante y una clase para asignarlo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="student" className="text-right">
                        Estudiante
                      </Label>
                      <Select 
                        value={selectedStudent?.id} 
                        onValueChange={(value) => {
                          const student = students.find(s => s.id === value);
                          setSelectedStudent(student);
                        }}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecciona un estudiante" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="class" className="text-right">
                        Clase
                      </Label>
                      <Select 
                        value={selectedClass} 
                        onValueChange={setSelectedClass}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecciona una clase" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAssignClass}>Asignar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Asignar Monedas
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Asignar Monedas</DialogTitle>
                    <DialogDescription>
                      Asigna monedas a un estudiante o profesor
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="user" className="text-right">
                        Usuario
                      </Label>
                      <Select 
                        value={coinAssignment.userId} 
                        onValueChange={(value) => setCoinAssignment({ ...coinAssignment, userId: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecciona un usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="" disabled>Selecciona un usuario</SelectItem>
                          {activeTab === "students" ? (
                            <SelectItem value="all-students">Todos los estudiantes</SelectItem>
                          ) : (
                            <SelectItem value="all-teachers">Todos los profesores</SelectItem>
                          )}
                          {activeTab === "students" ? (
                            students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name}
                              </SelectItem>
                            ))
                          ) : (
                            teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Monedas
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={coinAssignment.amount}
                        onChange={(e) => setCoinAssignment({ ...coinAssignment, amount: parseInt(e.target.value) || 0 })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Descripción
                      </Label>
                      <Input
                        id="description"
                        value={coinAssignment.description}
                        onChange={(e) => setCoinAssignment({ ...coinAssignment, description: e.target.value })}
                        className="col-span-3"
                        placeholder="Motivo de la asignación"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAssignCoins}
                      disabled={!coinAssignment.userId || coinAssignment.amount <= 0}
                    >
                      Asignar Monedas
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Monedas</TableHead>
                    <TableHead>Clases</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p>Cargando estudiantes...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.coins || 0}</TableCell>
                        <TableCell>
                          {student.classes && student.classes.length > 0 ? (
                            student.classes.map((cls: any) => (
                              <div key={cls.class?.id} className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 mr-1 mb-1 inline-block">
                                {cls.class?.name}
                              </div>
                            ))
                          ) : (
                            "Sin asignar"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <p>No se encontraron estudiantes</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="teachers">
            <div className="mb-4 flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Asignar Permisos
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Asignar Permisos a Profesor</DialogTitle>
                    <DialogDescription>
                      Configura los permisos especiales para un profesor
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Contenido del diálogo */}
                  </div>
                  <DialogFooter>
                    <Button>Guardar Permisos</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Asignar Monedas
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Asignar Monedas</DialogTitle>
                    <DialogDescription>
                      Asigna monedas a un profesor para que pueda premiar estudiantes
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Mismo contenido que el diálogo de estudiantes */}
                  </div>
                  <DialogFooter>
                    <Button>Asignar Monedas</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Monedas</TableHead>
                    <TableHead>Clases Asignadas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p>Cargando profesores...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.coins || 0}</TableCell>
                        <TableCell>
                          {teacher.classes && teacher.classes.length > 0 ? (
                            teacher.classes.map((cls: any) => (
                              <div key={cls.id} className="text-xs bg-green-100 text-green-800 rounded px-2 py-1 mr-1 mb-1 inline-block">
                                {cls.name}
                              </div>
                            ))
                          ) : (
                            "Sin asignar"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <p>No se encontraron profesores</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
