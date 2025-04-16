
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  ClipboardList, 
  Check, 
  X 
} from "lucide-react";

interface PendingTask {
  id: string;
  title: string;
  student: string;
  date: string;
  type: string;
}

interface PendingTasksProps {
  pendingTasks: PendingTask[];
  onResolveTask: (taskId: string) => void;
}

const PendingTasks: React.FC<PendingTasksProps> = ({ pendingTasks, onResolveTask }) => {
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PendingTask | null>(null);

  const handleViewTaskDetails = (task: PendingTask) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  return (
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
                  onClick={() => onResolveTask(selectedTask.id)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marcar como Resuelto
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PendingTasks;
