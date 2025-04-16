
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImportStudentsProps {
  selectedClass: string | null;
  onImportStudents: () => void;
}

const ImportStudents: React.FC<ImportStudentsProps> = ({ selectedClass, onImportStudents }) => {
  if (!selectedClass) return null;
  
  return (
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
        <Button className="w-full" onClick={onImportStudents}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Estudiantes
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImportStudents;
