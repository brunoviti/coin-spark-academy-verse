
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Users, Award, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Student {
  id: string;
  name: string;
  avatar_url?: string;
  coins: number;
}

interface StudentsListProps {
  students: Student[];
  onImportStudents: () => void;
  selectedClass: string | null;
}

const StudentsList: React.FC<StudentsListProps> = ({ students, onImportStudents, selectedClass }) => {
  const { toast } = useToast();
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleViewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  return (
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
              onClick={onImportStudents}
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
    </Card>
  );
};

export default StudentsList;
