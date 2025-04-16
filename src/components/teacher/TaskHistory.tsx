
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Clock } from "lucide-react";

interface HistoryTask {
  id: string;
  title: string;
  student: string;
  date: string;
  status: string;
}

interface TaskHistoryProps {
  taskHistory: HistoryTask[];
}

const TaskHistory: React.FC<TaskHistoryProps> = ({ taskHistory }) => {
  return (
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
  );
};

export default TaskHistory;
