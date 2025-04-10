
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Award, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const StudentAchievementForm: React.FC<{
  students: any[];
  achievementTypes: any[];
  onAwardAchievement: (data: {
    studentId: string;
    achievementTypeId: string;
    description: string;
  }) => void;
}> = ({ students, achievementTypes, onAwardAchievement }) => {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState("");
  const [description, setDescription] = useState("");
  
  const handleSubmit = () => {
    if (!selectedStudent) {
      toast({
        title: "Estudiante requerido",
        description: "Por favor selecciona un estudiante",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedAchievement) {
      toast({
        title: "Logro requerido",
        description: "Por favor selecciona un tipo de logro",
        variant: "destructive"
      });
      return;
    }
    
    onAwardAchievement({
      studentId: selectedStudent,
      achievementTypeId: selectedAchievement,
      description: description,
    });
    
    // Reset form
    setSelectedStudent("");
    setSelectedAchievement("");
    setDescription("");
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Asignar Logro
        </CardTitle>
        <CardDescription>Reconoce los logros de tus estudiantes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="student" className="text-sm font-medium">
              Estudiante
            </label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger id="student">
                <SelectValue placeholder="Selecciona un estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No hay estudiantes disponibles
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
            <label htmlFor="achievement" className="text-sm font-medium">
              Tipo de Logro
            </label>
            <Select value={selectedAchievement} onValueChange={setSelectedAchievement}>
              <SelectTrigger id="achievement">
                <SelectValue placeholder="Selecciona un logro" />
              </SelectTrigger>
              <SelectContent>
                {achievementTypes.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No hay tipos de logros disponibles
                  </SelectItem>
                ) : (
                  achievementTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.coin_value} monedas)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descripción (opcional)
            </label>
            <Textarea
              id="description"
              placeholder="Añade un comentario específico sobre este logro"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <Button 
            className="w-full"
            onClick={handleSubmit}
          >
            <Award className="h-4 w-4 mr-2" />
            Asignar Logro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentAchievementForm;
