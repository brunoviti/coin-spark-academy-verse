
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { awardStudentAchievement } from "@/integrations/supabase/helpers";
import ClassManagement from "@/components/teacher/ClassManagement";
import StudentAchievementForm from "@/components/teacher/StudentAchievementForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import StudentsList from "@/components/teacher/StudentsList";
import PendingTasks from "@/components/teacher/PendingTasks";
import TaskHistory from "@/components/teacher/TaskHistory";
import ImportStudents from "@/components/teacher/ImportStudents";
import { useClassesData } from "@/hooks/useClassesData";

const ClassesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    classes,
    selectedClass,
    students,
    achievementTypes,
    isLoading,
    pendingTasks,
    taskHistory,
    handleCreateClass,
    handleSelectClass,
    handleResolveTask,
    handleImportStudents
  } = useClassesData();
  
  React.useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (user.role !== "teacher") {
      navigate("/dashboard");
      return;
    }
  }, [user, navigate]);
  
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
    } catch (error) {
      console.error("Error awarding achievement:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el logro",
        variant: "destructive"
      });
    }
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
              <PendingTasks 
                pendingTasks={pendingTasks}
                onResolveTask={handleResolveTask}
              />
            </TabsContent>
            
            <TabsContent value="history">
              <TaskHistory taskHistory={taskHistory} />
            </TabsContent>
          </Tabs>
          
          <ImportStudents 
            selectedClass={selectedClass}
            onImportStudents={handleImportStudents}
          />
        </div>
        
        <div className="lg:col-span-2">
          {selectedClass ? (
            <Tabs defaultValue="students">
              <TabsList className="mb-4">
                <TabsTrigger value="students">Estudiantes</TabsTrigger>
                <TabsTrigger value="award">Asignar Logros</TabsTrigger>
              </TabsList>
              
              <TabsContent value="students">
                <StudentsList 
                  students={students}
                  onImportStudents={handleImportStudents}
                  selectedClass={selectedClass}
                />
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
