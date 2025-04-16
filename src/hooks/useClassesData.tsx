
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { fetchTeacherClasses, fetchClassStudents, fetchAchievementTypes } from "@/integrations/supabase/helpers";

export const useClassesData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [achievementTypes, setAchievementTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  
  useEffect(() => {
    if (!user || user.role !== "teacher") return;
    
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
  }, [user, toast]);
  
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
  
  const handleResolveTask = (taskId: string) => {
    // Mock task resolution
    setPendingTasks(prev => prev.filter(task => task.id !== taskId));
    
    toast({
      title: "Tarea resuelta",
      description: "La tarea ha sido marcada como resuelta correctamente",
    });
  };
  
  const handleImportStudents = () => {
    toast({
      title: "Función en desarrollo",
      description: "La importación de estudiantes estará disponible próximamente",
    });
  };
  
  return {
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
    handleImportStudents,
    loadStudents
  };
};
