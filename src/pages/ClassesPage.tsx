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
import { Users, Award, Upload, Download } from "lucide-react";

const ClassesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [achievementTypes, setAchievementTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ClassManagement 
            classes={classes}
            onSelectClass={handleSelectClass}
            onCreateClass={handleCreateClass}
          />
          
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
        
        <div className="md:col-span-2">
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
                      <div className="space-y-2">
                        {students.map((student) => (
                          <div 
                            key={student.id} 
                            className="flex items-center justify-between p-3 border rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={student.avatar_url} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {student.coins || 0} monedas
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                toast({
                                  title: "Función en desarrollo",
                                  description: "El perfil detallado estará disponible próximamente",
                                });
                              }}
                            >
                              <Award className="h-3 w-3" />
                              Logros
                            </Button>
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
    </MainLayout>
  );
};

export default ClassesPage;
