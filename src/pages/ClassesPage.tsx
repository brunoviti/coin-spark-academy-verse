
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { fetchTeacherClasses, fetchClassStudents, awardStudentAchievement, fetchAchievementTypes } from "@/integrations/supabase/helpers";
import ClassManagement from "@/components/teacher/ClassManagement";
import StudentAchievementForm from "@/components/teacher/StudentAchievementForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Award, 
  Upload, 
  Download, 
  History, 
  ClipboardList,
  AlertCircle,
  Check,
  X,
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

const ClassesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [achievementTypes, setAchievementTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (user.role !== "teacher") {
      navigate("/dashboard");
      return;
    }
    
    const loadClasses = async () => {
      try {
        setIsLoading(true);
        const classes = await fetchTeacherClasses(user.id);
        setClasses(classes);
        
        // Load achievement types
        if (user.schoolId) {
          const types = await fetchAchievementTypes(user.schoolId);
          setAchievementTypes(types);
        }
        
        // Mock pending tasks data
        setPendingTasks([
          { id: '1', title: 'Revisar tarea de matemáticas', student: 'Carlos López', date: '2025-04-12', type: 'assignment' },
          { id: '2', title: 'Evaluar proyecto de ciencias', student: 'Ana Martínez', date: '2025-04-14', type: 'project' },
          { id: '3', title: 'Autorizar salida a museo', student: 'Grupo 5A', date: '2025-04-18', type: 'permission' },
        ]);
        
        // Mock task history
        setTaskHistory([
          { id: '101', title: 'Calificación de examen', student: 'Varios estudiantes', date: '2025-04-01', status: 'completed' },
          { id: '102', title: 'Asignar trabajo grupal', student: 'Grupo 5B', date: '2025-03-28', status: 'completed' },
          { id: '103', title: 'Reunión con padres', student: 'Familia García', date: '2025-03-25', status: 'canceled' },
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading classes:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus clases",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    loadClasses();
  }, [user, navigate, toast]);
  
  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
    }
  }, [selectedClass]);
  
  const loadStudents = async (classId: string) => {
    try {
      const students = await fetchClassStudents(classId);
      setStudents(students);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateClass = async (className: string) => {
    try {
      // Recargar las clases después de crear una nueva
      const updatedClasses = await fetchTeacherClasses(user!.id);
      setClasses(updatedClasses);
    } catch (error) {
      console.error("Error refreshing classes:", error);
    }
  };
  
  const handleSelectClass = (classId: string) => {
    setSelectedClass(classId);
  };
  
  const handleAwardAchievement = async (data: any) => {
    if (!user || !user.schoolId) {
      toast({
        title: "Error",
        description: "No se puede asignar el logro. Información de escuela no disponible.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Find the achievement type to get the coin value
      const achievementType = achievementTypes.find(t => t.id === data.achievementTypeId);
      if (!achievementType) {
        throw new Error("Tipo de logro no encontrado");
      }
      
      await awardStudentAchievement(
        user.id,
        data.studentId,
        data.achievementTypeId,
        data.description,
        achievementType.coin_value,
        user.schoolId
      );
      
      toast({
        title: "Logro asignado",
        description: `El logro fue asignado correctamente con ${achievementType.coin_value} monedas`,
      });
      
      // Refresh student list to update coins
      if (selectedClass) {
        loadStudents(selectedClass);
      }
    } catch (error) {
      console.error("Error awarding achievement:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el logro",
        variant: "destructive"
      });
    }
  };
  
  const handleImportStudents = () => {
    toast({
      title: "Función en desarrollo",
      description: "La importación de estudiantes estará disponible próximamente",
    });
  };
  
  const handleViewTaskDetails = (task: any) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };
  
  const handleResolveTask = (taskId: string) => {
    // Mock task resolution
    setPendingTasks(prev => prev.filter(task => task.id !== taskId));
    setShowTaskDetails(false);
    
    toast({
      title: "Tarea resuelta",
      description: "La tarea ha sido marcada como resuelta correctamente",
    });
  };
  
  const handleViewStudentDetails = (student: any) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };
  
  if (isLoading) {
    return (
      <MainLayout title="Gestión de Clases">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-invertidos-blue mx-auto"></div>
            <p className="mt-4 text-lg text-gray-700">Cargando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title="Gestión de Clases">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Tabs defaultValue="classes">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="classes" className="flex-1">Clases</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">Pendientes</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">Historial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="classes">
              <ClassManagement 
                classes={classes}
                onSelectClass={handleSelectClass}
                onCreateClass={handleCreateClass}
              />
            </TabsContent>
            
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Tareas Pendientes
                  </CardTitle>
                  <CardDescription>
                    {pendingTasks.length} pendientes por resolver
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No tienes tareas pendientes
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingTasks.map((task) => (
                        <div 
                          key={task.id}
                          className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleViewTaskDetails(task)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.student} • {new Date(task.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${
                              task.type === 'assignment' ? 'bg-blue-100 text-blue-800' :
                              task.type === 'project' ? 'bg-purple-100 text-purple-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {task.type === 'assignment' ? 'Tarea' :
                              task.type === 'project' ? 'Proyecto' :
                              'Permiso'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historial de Actividades
                  </CardTitle>
                  <CardDescription>
                    Registro de actividades recientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {taskHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No hay actividades recientes
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {taskHistory.map((task) => (
                        <div 
                          key={task.id}
                          className="p-3 border rounded-md"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.student} • {new Date(task.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {task.status === 'completed' ? 'Completado' : 'Cancelado'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {selectedClass && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Estudiantes
                </CardTitle>
                <CardDescription>
                  Importa estudiantes desde un archivo CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={handleImportStudents}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Estudiantes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-2">
          {selectedClass ? (
            <Tabs defaultValue="students">
              <TabsList className="mb-4">
                <TabsTrigger value="students">Estudiantes</TabsTrigger>
                <TabsTrigger value="award">Asignar Logros</TabsTrigger>
              </TabsList>
              
              <TabsContent value="students">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Estudiantes de la Clase
                    </CardTitle>
                    <CardDescription>
                      {students.length} estudiantes encontrados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {students.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          No hay estudiantes en esta clase
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={handleImportStudents}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Importar Estudiantes
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {students.map((student) => (
                          <div 
                            key={student.id} 
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={student.avatar_url} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  <span className="inline-flex items-center">
                                    <Award className="h-3 w-3 mr-1" />
                                    {student.coins || 0} monedas
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewStudentDetails(student)}
                              >
                                <Users className="h-3.5 w-3.5 mr-1" />
                                Perfil
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-invertidos-blue hover:text-invertidos-blue"
                                onClick={() => {
                                  toast({
                                    title: "Logros del estudiante",
                                    description: "Vista detallada de logros disponible próximamente",
                                  });
                                }}
                              >
                                <Award className="h-3.5 w-3.5 mr-1" />
                                Logros
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="award">
                <StudentAchievementForm 
                  students={students}
                  achievementTypes={achievementTypes}
                  onAwardAchievement={handleAwardAchievement}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-xl font-medium mb-2">Selecciona una Clase</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Selecciona una clase de la lista para ver sus estudiantes y asignar logros
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Task Details Dialog */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Tarea</DialogTitle>
            <DialogDescription>
              Información y opciones de la tarea pendiente
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Asignado a: {selectedTask.student}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fecha límite: {new Date(selectedTask.date).toLocaleDateString()}
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Descripción:</h4>
                <p className="text-sm">
                  {selectedTask.type === 'assignment' 
                    ? 'Revisar y calificar la tarea asignada al estudiante. Proveer retroalimentación constructiva.' 
                    : selectedTask.type === 'project'
                    ? 'Evaluar el proyecto final y determinar si cumple con los criterios establecidos.'
                    : 'Revisar la solicitud de permiso y aprobar o rechazar según corresponda.'}
                </p>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setShowTaskDetails(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleResolveTask(selectedTask.id)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marcar como Resuelto
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Student Details Dialog */}
      <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Perfil del Estudiante</DialogTitle>
            <DialogDescription>
              Información detallada del estudiante
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.avatar_url} />
                  <AvatarFallback className="text-xl">{selectedStudent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {selectedStudent.id.substring(0, 8)}...
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm flex items-center">
                      <Award className="h-4 w-4 mr-2 text-invertidos-green" />
                      Monedas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <p className="text-3xl font-bold">{selectedStudent.coins || 0}</p>
                    <p className="text-xs text-muted-foreground">monedas acumuladas</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm flex items-center">
                      <Users className="h-4 w-4 mr-2 text-invertidos-blue" />
                      Logros
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <p className="text-3xl font-bold">8</p>
                    <p className="text-xs text-muted-foreground">logros obtenidos</p>
                  </CardContent>
                </Card>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Logros Recientes</h4>
                <div className="space-y-2">
                  <div className="p-2 border rounded-md flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-700 p-1 rounded">
                        <Award className="h-4 w-4" />
                      </div>
                      <span>Participación Destacada</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Ayer</span>
                  </div>
                  <div className="p-2 border rounded-md flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-700 p-1 rounded">
                        <Award className="h-4 w-4" />
                      </div>
                      <span>Excelencia Académica</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Hace 3 días</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowStudentDetails(false)}
                >
                  Cerrar
                </Button>
                <Button>
                  <Award className="h-4 w-4 mr-2" />
                  Asignar Logro
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ClassesPage;
