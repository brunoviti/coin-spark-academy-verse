import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  Building, Plus, Edit, Trash2, RefreshCw, School, Users, CreditCard, FileText, Download
} from "lucide-react";
import { fetchSchools, createSchool, updateSchool, deleteSchool } from "@/integrations/supabase/helpers/schools";
import { fetchAllClasses } from "@/integrations/supabase/helpers/classes";

// Definición del tipo School para evitar errores
interface School {
  id: string;
  name: string;
  coin_name: string;
  coin_symbol: string;
  max_supply: number;
  current_supply: number;
  created_at: string;
  updated_at: string;
  admin_id: string | null;
}

const SchoolsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingClasses, setIsViewingClasses] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Estado para el formulario de nueva escuela
  const [newSchool, setNewSchool] = useState({
    name: "",
    coin_name: "EduCoin",
    coin_symbol: "EDC",
    max_supply: 10000
  });
  
  useEffect(() => {
    // Comprobar si el usuario es super_admin
    if (user && user.role === 'super_admin') {
      setIsSuperAdmin(true);
    } else {
      setIsSuperAdmin(false);
    }
    
    loadSchools();
  }, [user]);
  
  const loadSchools = async () => {
    setIsLoading(true);
    try {
      const schoolsData = await fetchSchools();
      setSchools(schoolsData);
    } catch (error) {
      console.error("Error cargando escuelas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las escuelas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateSchool = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      // Verificar que el usuario es super_admin
      if (!isSuperAdmin) {
        throw new Error("Solo los super administradores pueden crear escuelas");
      }
      
      const newSchoolData = await createSchool({
        name: newSchool.name,
        coin_name: newSchool.coin_name,
        coin_symbol: newSchool.coin_symbol,
        max_supply: newSchool.max_supply
      });
      
      toast({
        title: "Escuela creada",
        description: `Se ha creado la escuela ${newSchool.name} correctamente`,
      });
      
      // Añadir la nueva escuela a la lista
      setSchools(prev => [...prev, newSchoolData]);
      
      // Limpiar el formulario
      setNewSchool({
        name: "",
        coin_name: "EduCoin",
        coin_symbol: "EDC",
        max_supply: 10000
      });
    } catch (error) {
      console.error("Error creando escuela:", error);
      toast({
        title: "Error",
        description: `No se pudo crear la escuela: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleEditSchool = async () => {
    if (isEditing || !selectedSchool) return;
    
    setIsEditing(true);
    try {
      const updatedSchool = await updateSchool(selectedSchool.id, {
        name: selectedSchool.name,
        coin_name: selectedSchool.coin_name,
        coin_symbol: selectedSchool.coin_symbol,
        max_supply: selectedSchool.max_supply
      });
      
      toast({
        title: "Escuela actualizada",
        description: `Se ha actualizado la escuela ${selectedSchool.name} correctamente`,
      });
      
      // Actualizar la lista de escuelas
      setSchools(prev => prev.map(school => 
        school.id === selectedSchool.id ? updatedSchool : school
      ));
      
      // Limpiar selección
      setSelectedSchool(null);
    } catch (error) {
      console.error("Error actualizando escuela:", error);
      toast({
        title: "Error",
        description: `No se pudo actualizar la escuela: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };
  
  const handleDeleteSchool = async (schoolId: string) => {
    if (!isSuperAdmin) {
      toast({
        title: "Permiso denegado",
        description: "Solo los super administradores pueden eliminar escuelas",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm("¿Estás seguro de que deseas eliminar esta escuela? Esta acción no se puede deshacer.")) {
      return;
    }
    
    try {
      await deleteSchool(schoolId);
      
      toast({
        title: "Escuela eliminada",
        description: "Se ha eliminado la escuela correctamente",
      });
      
      // Actualizar la lista de escuelas
      setSchools(prev => prev.filter(school => school.id !== schoolId));
    } catch (error) {
      console.error("Error eliminando escuela:", error);
      toast({
        title: "Error",
        description: `No se pudo eliminar la escuela: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };
  
  const loadSchoolClasses = async (schoolId: string) => {
    setIsLoading(true);
    try {
      const classesData = await fetchAllClasses(schoolId);
      setClasses(classesData);
      setIsViewingClasses(true);
    } catch (error) {
      console.error("Error cargando clases:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las clases",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportSchoolsToCSV = async () => {
    setIsExporting(true);
    try {
      // Preparar los datos para el CSV
      const headers = ["Nombre", "Moneda", "Símbolo", "Suministro Máximo", "Suministro Actual", "Creada"];
      const rows = schools.map(school => [
        school.name,
        school.coin_name,
        school.coin_symbol,
        school.max_supply.toString(),
        school.current_supply.toString(),
        new Date(school.created_at).toLocaleDateString()
      ]);
      
      // Crear el contenido del CSV
      let csvContent = headers.join(",") + "\n";
      rows.forEach(row => {
        csvContent += row.join(",") + "\n";
      });
      
      // Crear un blob y descargar
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `escuelas-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Reporte generado",
        description: "El reporte de escuelas se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Error exportando datos:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Gestión de Escuelas
        </CardTitle>
        
        <div className="flex space-x-2">
          {isSuperAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Escuela
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Escuela</DialogTitle>
                  <DialogDescription>
                    Configura los detalles para la nueva escuela
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="school-name" className="text-right">
                      Nombre
                    </Label>
                    <Input
                      id="school-name"
                      value={newSchool.name}
                      onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="coin-name" className="text-right">
                      Nombre Moneda
                    </Label>
                    <Input
                      id="coin-name"
                      value={newSchool.coin_name}
                      onChange={(e) => setNewSchool({ ...newSchool, coin_name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="coin-symbol" className="text-right">
                      Símbolo
                    </Label>
                    <Input
                      id="coin-symbol"
                      value={newSchool.coin_symbol}
                      onChange={(e) => setNewSchool({ ...newSchool, coin_symbol: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="max-supply" className="text-right">
                      Suministro Máx.
                    </Label>
                    <Input
                      id="max-supply"
                      type="number"
                      value={newSchool.max_supply}
                      onChange={(e) => setNewSchool({ ...newSchool, max_supply: parseInt(e.target.value) || 10000 })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleCreateSchool} 
                    disabled={isCreating || !newSchool.name}
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Escuela'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button 
            variant="outline" 
            onClick={exportSchoolsToCSV}
            disabled={isExporting || schools.length === 0}
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Exportar CSV
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isViewingClasses ? (
          <div>
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={() => setIsViewingClasses(false)}
              >
                Volver a la lista de escuelas
              </Button>
            </div>
            
            <h3 className="text-lg font-medium mb-4">Clases de la escuela</h3>
            
            {isLoading ? (
              <div className="text-center py-10">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                <p>Cargando clases...</p>
              </div>
            ) : classes.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Profesor</TableHead>
                      <TableHead>Creada</TableHead>
                      <TableHead>Estudiantes</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell>{cls.name}</TableCell>
                        <TableCell>{cls.teacher?.name || "Sin asignar"}</TableCell>
                        <TableCell>{new Date(cls.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Users className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-md">
                <School className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No hay clases en esta escuela</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nueva Clase
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Suministro</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                      <p>Cargando escuelas...</p>
                    </TableCell>
                  </TableRow>
                ) : schools.length > 0 ? (
                  schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>
                        {school.coin_name} ({school.coin_symbol})
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{school.current_supply}</span>
                          <span className="text-gray-500"> / {school.max_supply}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(school.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setSelectedSchool(school)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Editar Escuela</DialogTitle>
                                <DialogDescription>
                                  Modifica los detalles de la escuela
                                </DialogDescription>
                              </DialogHeader>
                              {selectedSchool && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-name" className="text-right">
                                      Nombre
                                    </Label>
                                    <Input
                                      id="edit-name"
                                      value={selectedSchool.name}
                                      onChange={(e) => setSelectedSchool({
                                        ...selectedSchool,
                                        name: e.target.value
                                      })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-coin-name" className="text-right">
                                      Nombre Moneda
                                    </Label>
                                    <Input
                                      id="edit-coin-name"
                                      value={selectedSchool.coin_name}
                                      onChange={(e) => setSelectedSchool({
                                        ...selectedSchool,
                                        coin_name: e.target.value
                                      })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-coin-symbol" className="text-right">
                                      Símbolo
                                    </Label>
                                    <Input
                                      id="edit-coin-symbol"
                                      value={selectedSchool.coin_symbol}
                                      onChange={(e) => setSelectedSchool({
                                        ...selectedSchool,
                                        coin_symbol: e.target.value
                                      })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-max-supply" className="text-right">
                                      Suministro Máx.
                                    </Label>
                                    <Input
                                      id="edit-max-supply"
                                      type="number"
                                      value={selectedSchool.max_supply}
                                      onChange={(e) => setSelectedSchool({
                                        ...selectedSchool,
                                        max_supply: parseInt(e.target.value) || 10000
                                      })}
                                      className="col-span-3"
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button 
                                  onClick={handleEditSchool} 
                                  disabled={isEditing || !selectedSchool}
                                >
                                  {isEditing ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Actualizando...
                                    </>
                                  ) : (
                                    'Guardar Cambios'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => loadSchoolClasses(school.id)}
                          >
                            <School className="h-4 w-4" />
                          </Button>
                          
                          {isSuperAdmin && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteSchool(school.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <Building className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">No hay escuelas registradas</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolsManagement;
