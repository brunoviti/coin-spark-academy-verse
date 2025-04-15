
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School, Plus, Edit, Trash2, Coins, Users, Book, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllClasses } from "@/integrations/supabase/helpers/classes";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import SchoolManagement from "@/components/admin/SchoolManagement";

// Type definitions
type School = {
  id: string;
  name: string;
  coin_name: string;
  coin_symbol: string;
  max_supply: number;
  current_supply: number;
  created_at: string;
};

type SchoolFormData = {
  name: string;
  coin_name: string;
  coin_symbol: string;
  max_supply: number;
};

const SchoolsManagement = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolFormOpen, setSchoolFormOpen] = useState(false);
  const [schoolForm, setSchoolForm] = useState<SchoolFormData>({
    name: "",
    coin_name: "EduCoin",
    coin_symbol: "EDC",
    max_supply: 10000
  });
  const [isEditing, setIsEditing] = useState(false);
  const [schoolClasses, setSchoolClasses] = useState<any[]>([]);
  const [schoolMetrics, setSchoolMetrics] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalTransactions: 0
  });

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  // Fetch school-specific data when a school is selected
  useEffect(() => {
    if (selectedSchool) {
      fetchSchoolDetails(selectedSchool.id);
    }
  }, [selectedSchool]);

  // Fetch all schools
  const fetchSchools = async () => {
    setLoading(true);
    try {
      // This would be a real API call to Supabase in production
      // For now, we'll use mock data
      const mockSchools: School[] = [
        {
          id: "1",
          name: "Colegio San Martín",
          coin_name: "MartiCoin",
          coin_symbol: "MTC",
          max_supply: 50000,
          current_supply: 12500,
          created_at: "2025-01-01T00:00:00Z"
        },
        {
          id: "2",
          name: "Escuela Técnica Nacional",
          coin_name: "TechCoin",
          coin_symbol: "TCH",
          max_supply: 30000,
          current_supply: 8750,
          created_at: "2025-02-15T00:00:00Z"
        },
        {
          id: "3",
          name: "Instituto Educativo Central",
          coin_name: "CentralCoin",
          coin_symbol: "CEC",
          max_supply: 40000,
          current_supply: 15200,
          created_at: "2025-03-10T00:00:00Z"
        }
      ];
      
      setSchools(mockSchools);
      
      // If no school is selected yet, select the first one
      if (!selectedSchool && mockSchools.length > 0) {
        setSelectedSchool(mockSchools[0]);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las escuelas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch school details including classes and metrics
  const fetchSchoolDetails = async (schoolId: string) => {
    try {
      // Fetch classes for the school
      // In a real implementation, this would call fetchSchoolClasses from the API
      // For now, we'll use mock data
      const mockClasses = [
        { id: "c1", name: "Matemáticas 101", teacher: { name: "Prof. García" }, students_count: 28 },
        { id: "c2", name: "Historia Universal", teacher: { name: "Prof. Rodríguez" }, students_count: 32 },
        { id: "c3", name: "Ciencias Naturales", teacher: { name: "Prof. López" }, students_count: 25 }
      ];
      
      setSchoolClasses(mockClasses);
      
      // Set mock metrics
      setSchoolMetrics({
        totalStudents: 85,
        totalTeachers: 12,
        totalClasses: mockClasses.length,
        totalTransactions: 342
      });
    } catch (error) {
      console.error("Error fetching school details:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la escuela",
        variant: "destructive"
      });
    }
  };

  // Create new school
  const createSchool = async () => {
    try {
      // Validate form
      if (!schoolForm.name) {
        toast({
          title: "Error",
          description: "El nombre de la escuela es obligatorio",
          variant: "destructive"
        });
        return;
      }

      // This would be a real API call to Supabase in production
      // For now, we'll simulate adding to our local state
      const newSchool: School = {
        id: `${Date.now()}`, // Generate a temporary ID
        name: schoolForm.name,
        coin_name: schoolForm.coin_name,
        coin_symbol: schoolForm.coin_symbol,
        max_supply: schoolForm.max_supply,
        current_supply: 0,
        created_at: new Date().toISOString()
      };
      
      setSchools([...schools, newSchool]);
      
      toast({
        title: "Escuela creada",
        description: `La escuela ${schoolForm.name} ha sido creada exitosamente`
      });
      
      // Reset form and close dialog
      resetForm();
      setSchoolFormOpen(false);
    } catch (error) {
      console.error("Error creating school:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la escuela",
        variant: "destructive"
      });
    }
  };

  // Update existing school
  const updateSchool = async () => {
    if (!selectedSchool) return;
    
    try {
      // This would be a real API call to Supabase in production
      // For now, we'll simulate updating our local state
      const updatedSchools = schools.map(school => 
        school.id === selectedSchool.id
          ? { 
              ...school, 
              name: schoolForm.name,
              coin_name: schoolForm.coin_name,
              coin_symbol: schoolForm.coin_symbol,
              max_supply: schoolForm.max_supply
            }
          : school
      );
      
      setSchools(updatedSchools);
      
      // Update the selected school as well
      setSelectedSchool({
        ...selectedSchool,
        name: schoolForm.name,
        coin_name: schoolForm.coin_name,
        coin_symbol: schoolForm.coin_symbol,
        max_supply: schoolForm.max_supply
      });
      
      toast({
        title: "Escuela actualizada",
        description: `La escuela ${schoolForm.name} ha sido actualizada exitosamente`
      });
      
      // Reset form and close dialog
      resetForm();
      setSchoolFormOpen(false);
    } catch (error) {
      console.error("Error updating school:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la escuela",
        variant: "destructive"
      });
    }
  };

  // Delete a school
  const deleteSchool = async (schoolId: string) => {
    try {
      // This would be a real API call to Supabase in production
      // For now, we'll simulate removing from our local state
      const filteredSchools = schools.filter(school => school.id !== schoolId);
      
      setSchools(filteredSchools);
      
      // If the deleted school was selected, select another one or null
      if (selectedSchool && selectedSchool.id === schoolId) {
        setSelectedSchool(filteredSchools.length > 0 ? filteredSchools[0] : null);
      }
      
      toast({
        title: "Escuela eliminada",
        description: "La escuela ha sido eliminada exitosamente"
      });
    } catch (error) {
      console.error("Error deleting school:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la escuela",
        variant: "destructive"
      });
    }
  };

  // Initialize the form for editing
  const editSchool = (school: School) => {
    setSchoolForm({
      name: school.name,
      coin_name: school.coin_name,
      coin_symbol: school.coin_symbol,
      max_supply: school.max_supply
    });
    setIsEditing(true);
    setSchoolFormOpen(true);
  };

  // Reset the form
  const resetForm = () => {
    setSchoolForm({
      name: "",
      coin_name: "EduCoin",
      coin_symbol: "EDC",
      max_supply: 10000
    });
    setIsEditing(false);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSchoolForm(prev => ({
      ...prev,
      [name]: name === "max_supply" ? parseInt(value) || 0 : value
    }));
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateSchool();
    } else {
      createSchool();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  // Render school metrics
  const renderSchoolMetrics = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
                <h3 className="text-2xl font-bold">{schoolMetrics.totalStudents}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profesores</p>
                <h3 className="text-2xl font-bold">{schoolMetrics.totalTeachers}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <School className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clases</p>
                <h3 className="text-2xl font-bold">{schoolMetrics.totalClasses}</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Book className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transacciones</p>
                <h3 className="text-2xl font-bold">{schoolMetrics.totalTransactions}</h3>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Schools List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Escuelas</CardTitle>
            <CardDescription>
              Administra todas las escuelas del sistema
            </CardDescription>
          </div>
          <Button onClick={() => {
            resetForm();
            setSchoolFormOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            <span>Nueva Escuela</span>
          </Button>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-6">Cargando escuelas...</div>
          ) : schools.length === 0 ? (
            <div className="text-center py-6">
              <School className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No hay escuelas</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Crea tu primera escuela para comenzar a utilizar el sistema
              </p>
              <Button className="mt-4" onClick={() => {
                resetForm();
                setSchoolFormOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                <span>Nueva Escuela</span>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Moneda</TableHead>
                    <TableHead className="hidden lg:table-cell">Suministro</TableHead>
                    <TableHead className="hidden lg:table-cell">Creada</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow 
                      key={school.id} 
                      className={selectedSchool?.id === school.id ? "bg-muted hover:bg-muted" : ""}
                      onClick={() => setSelectedSchool(school)}
                    >
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {school.coin_name} ({school.coin_symbol})
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatNumber(school.current_supply)} / {formatNumber(school.max_supply)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(school.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              editSchool(school);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSchool(school.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected School Details */}
      {selectedSchool && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Escuela: {selectedSchool.name}</CardTitle>
            <CardDescription>
              Administra la configuración y visualiza estadísticas
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="classes">Clases</TabsTrigger>
                <TabsTrigger value="finances">Finanzas</TabsTrigger>
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                {renderSchoolMetrics()}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Últimas Clases</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {schoolClasses.slice(0, 3).map(cls => (
                          <div key={cls.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                            <div>
                              <p className="font-medium">{cls.name}</p>
                              <p className="text-sm text-muted-foreground">{cls.teacher.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{cls.students_count} estudiantes</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Circulación de Monedas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Suministro Actual</p>
                          <p className="text-2xl font-bold">
                            {formatNumber(selectedSchool.current_supply)} <span className="text-sm font-normal">{selectedSchool.coin_symbol}</span>
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Suministro Máximo</p>
                          <p className="text-lg">
                            {formatNumber(selectedSchool.max_supply)} <span className="text-sm">{selectedSchool.coin_symbol}</span>
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Porcentaje en Circulación</p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${(selectedSchool.current_supply / selectedSchool.max_supply) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-sm">
                            {((selectedSchool.current_supply / selectedSchool.max_supply) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="classes">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Profesor</TableHead>
                        <TableHead className="text-right">Estudiantes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schoolClasses.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">{cls.name}</TableCell>
                          <TableCell>{cls.teacher.name}</TableCell>
                          <TableCell className="text-right">{cls.students_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="finances">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribución de Monedas</CardTitle>
                      <CardDescription>
                        Asignar monedas a usuarios o profesores
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="recipient">Destinatario</Label>
                          <Input id="recipient" placeholder="Buscar usuario..." />
                        </div>
                        <div>
                          <Label htmlFor="amount">Cantidad</Label>
                          <div className="flex gap-2">
                            <Input id="amount" type="number" min="1" placeholder="100" />
                            <Button className="flex-shrink-0 gap-1">
                              <Coins className="h-4 w-4" />
                              <span>Asignar</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Configuración de Suministro</CardTitle>
                      <CardDescription>
                        Ajustar el suministro máximo de monedas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="max-supply">Suministro Máximo</Label>
                          <Input 
                            id="max-supply" 
                            type="number" 
                            min={selectedSchool.current_supply}
                            value={selectedSchool.max_supply} 
                            readOnly
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button className="flex-shrink-0" onClick={() => editSchool(selectedSchool)}>
                            <Edit className="h-4 w-4 mr-2" />
                            <span>Modificar</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <SchoolManagement 
                  school={selectedSchool} 
                  onUpdateSchool={(data) => {
                    const updatedSchool = { ...selectedSchool, ...data };
                    setSelectedSchool(updatedSchool);
                    setSchools(schools.map(s => s.id === selectedSchool.id ? updatedSchool : s));
                  }} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* New/Edit School Dialog */}
      <Dialog open={schoolFormOpen} onOpenChange={setSchoolFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Escuela" : "Nueva Escuela"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Modifica los datos de la escuela existente" 
                : "Completa la información para crear una nueva escuela"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Escuela</Label>
                <Input
                  id="name"
                  name="name"
                  value={schoolForm.name}
                  onChange={handleFormChange}
                  placeholder="Ej: Colegio San Martín"
                  required
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Configuración de la Moneda</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coin_name" className="text-xs">Nombre</Label>
                    <Input
                      id="coin_name"
                      name="coin_name"
                      value={schoolForm.coin_name}
                      onChange={handleFormChange}
                      placeholder="Ej: EduCoin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coin_symbol" className="text-xs">Símbolo</Label>
                    <Input
                      id="coin_symbol"
                      name="coin_symbol"
                      value={schoolForm.coin_symbol}
                      onChange={handleFormChange}
                      placeholder="Ej: EDC"
                      maxLength={5}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_supply">Suministro Máximo</Label>
                <Input
                  id="max_supply"
                  name="max_supply"
                  type="number"
                  min="1"
                  value={schoolForm.max_supply}
                  onChange={handleFormChange}
                />
                <p className="text-xs text-muted-foreground">
                  El número máximo de monedas que pueden existir en el ecosistema escolar
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSchoolFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Guardar Cambios" : "Crear Escuela"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolsManagement;
