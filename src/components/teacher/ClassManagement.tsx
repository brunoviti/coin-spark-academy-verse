
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, School, Search, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ClassManagement: React.FC<{
  classes: any[];
  onSelectClass: (classId: string) => void;
  onCreateClass: (className: string) => void;
}> = ({ classes, onSelectClass, onCreateClass }) => {
  const { toast } = useToast();
  const [newClassName, setNewClassName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para la clase",
        variant: "destructive"
      });
      return;
    }
    
    onCreateClass(newClassName);
    setNewClassName("");
  };
  
  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="h-5 w-5" />
          Gestión de Clases
        </CardTitle>
        <CardDescription>Administra tus grupos y estudiantes</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="classes">
          <TabsList className="mb-4">
            <TabsTrigger value="classes">Mis Clases</TabsTrigger>
            <TabsTrigger value="create">Crear Nueva</TabsTrigger>
          </TabsList>
          
          <TabsContent value="classes">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clases..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {filteredClasses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchTerm ? "No se encontraron clases" : "No tienes clases asignadas"}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredClasses.map((classItem) => (
                    <Card 
                      key={classItem.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => onSelectClass(classItem.id)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{classItem.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {classItem.studentCount || 0} estudiantes
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <Users className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="create">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="className" className="text-sm font-medium">
                  Nombre de la Clase
                </label>
                <Input
                  id="className"
                  placeholder="Ej: Matemáticas 5to A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full"
                onClick={handleCreateClass}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Crear Nueva Clase
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClassManagement;
