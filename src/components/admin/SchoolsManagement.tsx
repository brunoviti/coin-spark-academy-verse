import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { School, PlusCircle, Trash2, Edit, Users, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { fetchSchools, createSchool, updateSchool, deleteSchool } from "@/integrations/supabase/helpers/schools";
import { fetchSchoolUsers } from "@/integrations/supabase/helpers/users";
import { fetchSchoolClasses } from "@/integrations/supabase/helpers/classes";

const SchoolsManagement = () => {
  const { toast } = useToast();
  
  // Schools state
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSchool, setActiveSchool] = useState<any>(null);
  
  // School users and classes
  const [schoolUsers, setSchoolUsers] = useState<any[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Form state
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolAddress, setNewSchoolAddress] = useState("");
  const [newSchoolCity, setNewSchoolCity] = useState("");
  const [newSchoolState, setNewSchoolState] = useState("");
  const [newSchoolZip, setNewSchoolZip] = useState("");
  const [newSchoolPhone, setNewSchoolPhone] = useState("");
  const [newSchoolEmail, setNewSchoolEmail] = useState("");
  
  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit state
  const [editSchool, setEditSchool] = useState<any>(null);
  
  useEffect(() => {
    loadSchools();
  }, []);
  
  const loadSchools = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSchools();
      setSchools(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading schools:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las escuelas",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  const handleCreateSchool = async () => {
    if (!newSchoolName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la escuela es requerido",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newSchool = {
        name: newSchoolName,
        address: newSchoolAddress,
        city: newSchoolCity,
        state: newSchoolState,
        zip_code: newSchoolZip,
        phone: newSchoolPhone,
        email: newSchoolEmail
      };
      
      await createSchool(newSchool);
      
      toast({
        title: "Escuela creada",
        description: "La escuela ha sido creada exitosamente",
      });
      
      // Reset form
      setNewSchoolName("");
      setNewSchoolAddress("");
      setNewSchoolCity("");
      setNewSchoolState("");
      setNewSchoolZip("");
      setNewSchoolPhone("");
      setNewSchoolEmail("");
      
      // Close dialog
      setShowCreateDialog(false);
      
      // Reload schools
      loadSchools();
    } catch (error) {
      console.error("Error creating school:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la escuela",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditSchool = async () => {
    if (!editSchool || !editSchool.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la escuela es requerido",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateSchool(editSchool.id, editSchool);
      
      toast({
        title: "Escuela actualizada",
        description: "La escuela ha sido actualizada exitosamente",
      });
      
      // Close dialog
      setShowEditDialog(false);
      
      // Reload schools
      loadSchools();
      
      // If the active school was edited, update it
      if (activeSchool && activeSchool.id === editSchool.id) {
        setActiveSchool(editSchool);
      }
    } catch (error) {
      console.error("Error updating school:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la escuela",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteSchool = async () => {
    if (!activeSchool) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteSchool(activeSchool.id);
      
      toast({
        title: "Escuela eliminada",
        description: "La escuela ha sido eliminada exitosamente",
      });
      
      // Close dialog
      setShowDeleteDialog(false);
      
      // Reset active school
      setActiveSchool(null);
      
      // Reload schools
      loadSchools();
    } catch (error) {
      console.error("Error deleting school:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la escuela",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSchoolSelect = (schoolId: string) => {
    const selected = schools.find(school => school.id === schoolId);
    setActiveSchool(selected);
    
    // Load school details
    loadSchoolDetails(schoolId);
  };
  
  const loadSchoolDetails = async (schoolId: string) => {
    setIsLoadingDetails(true);
    
    try {
      // Load users
      const users = await fetchSchoolUsers(schoolId);
      setSchoolUsers(users);
      
      // Load classes
      const classes = await fetchSchoolClasses(schoolId);
      setSchoolClasses(classes);
    } catch (error) {
      console.error("Error loading school details:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la escuela",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };
  
  const handleOpenEditDialog = (school: any) => {
    setEditSchool({...school});
    setShowEditDialog(true);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Gestión de Escuelas
          </CardTitle>
          <CardDescription>Cargando escuelas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Escuelas
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowCreateDialog(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Nueva
              </Button>
            </CardTitle>
            <CardDescription>
              {schools.length} escuelas registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schools.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No hay escuelas registradas</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Crear Escuela
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {schools.map((school) => (
                  <div 
                    key={school.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      activeSchool?.id === school.id 
                        ? 'bg-primary/10 border-primary/20' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSchoolSelect(school.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{school.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {school.city}, {school.state}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditDialog(school);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        {activeSchool ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>{activeSchool.name}</div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </CardTitle>
              <CardDescription>
                {activeSchool.address}, {activeSchool.city}, {activeSchool.state} {activeSchool.zip_code}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="users">
                <TabsList className="mb-4">
                  <TabsTrigger value="users">Usuarios</TabsTrigger>
                  <TabsTrigger value="classes">Clases</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users">
                  {isLoadingDetails ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Usuarios de la Escuela</h3>
                        <Button size="sm">
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Agregar Usuario
                        </Button>
                      </div>
                      
                      {schoolUsers.length === 0 ? (
                        <div className="text-center py-6">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No hay usuarios registrados en esta escuela</p>
                        </div>
                      ) : (
                        <div className="border rounded-md overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {schoolUsers.map((user) => (
                                <tr key={user.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                        {user.name.charAt(0)}
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      user.role === 'teacher' 
                                        ? 'bg-green-100 text-green-800' 
                                        : user.role === 'student'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                    }`}>
                                      {user.role === 'teacher' 
                                        ? 'Profesor' 
                                        : user.role === 'student'
                                        ? 'Estudiante'
                                        : 'Administrador'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="classes">
                  {isLoadingDetails ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Clases de la Escuela</h3>
                      </div>
                      
                      {schoolClasses.length === 0 ? (
                        <div className="text-center py-6">
                          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No hay clases registradas en esta escuela</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {schoolClasses.map((classItem) => (
                            <Card key={classItem.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium">{classItem.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Profesor: {classItem.teacher?.name || 'No asignado'}
                                    </p>
                                  </div>
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <BookOpen className="h-5 w-5" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="details">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre</Label>
                        <p className="font-medium">{activeSchool.name}</p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="font-medium">{activeSchool.email || 'No especificado'}</p>
                      </div>
                      <div>
                        <Label>Teléfono</Label>
                        <p className="font-medium">{activeSchool.phone || 'No especificado'}</p>
                      </div>
                      <div>
                        <Label>Dirección</Label>
                        <p className="font-medium">{activeSchool.address || 'No especificada'}</p>
                      </div>
                      <div>
                        <Label>Ciudad</Label>
                        <p className="font-medium">{activeSchool.city || 'No especificada'}</p>
                      </div>
                      <div>
                        <Label>Estado</Label>
                        <p className="font-medium">{activeSchool.state || 'No especificado'}</p>
                      </div>
                      <div>
                        <Label>Código Postal</Label>
                        <p className="font-medium">{activeSchool.zip_code || 'No especificado'}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline"
                        onClick={() => handleOpenEditDialog(activeSchool)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Información
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[300px] border rounded-lg">
            <div className="text-center">
              <School className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">Selecciona una Escuela</h3>
              <p className="text-muted-foreground max-w-md">
                Selecciona una escuela de la lista para ver sus detalles y administrar sus usuarios y clases
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Create School Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Escuela</DialogTitle>
            <DialogDescription>
              Ingresa la información de la nueva escuela
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Escuela *</Label>
              <Input 
                id="name" 
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="Nombre de la escuela"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input 
                id="address" 
                value={newSchoolAddress}
                onChange={(e) => setNewSchoolAddress(e.target.value)}
                placeholder="Dirección"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input 
                  id="city" 
                  value={newSchoolCity}
                  onChange={(e) => setNewSchoolCity(e.target.value)}
                  placeholder="Ciudad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input 
                  id="state" 
                  value={newSchoolState}
                  onChange={(e) => setNewSchoolState(e.target.value)}
                  placeholder="Estado"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zip">Código Postal</Label>
              <Input 
                id="zip" 
                value={newSchoolZip}
                onChange={(e) => setNewSchoolZip(e.target.value)}
                placeholder="Código Postal"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone" 
                value={newSchoolPhone}
                onChange={(e) => setNewSchoolPhone(e.target.value)}
                placeholder="Teléfono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={newSchoolEmail}
                onChange={(e) => setNewSchoolEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateSchool}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Crear Escuela
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit School Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Escuela</DialogTitle>
            <DialogDescription>
              Modifica la información de la escuela
            </DialogDescription>
          </DialogHeader>
          
          {editSchool && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre de la Escuela *</Label>
                <Input 
                  id="edit-name" 
                  value={editSchool.name}
                  onChange={(e) => setEditSchool({...editSchool, name: e.target.value})}
                  placeholder="Nombre de la escuela"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-address">Dirección</Label>
                <Input 
                  id="edit-address" 
                  value={editSchool.address || ''}
                  onChange={(e) => setEditSchool({...editSchool, address: e.target.value})}
                  placeholder="Dirección"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Ciudad</Label>
                  <Input 
                    id="edit-city" 
                    value={editSchool.city || ''}
                    onChange={(e) => setEditSchool({...editSchool, city: e.target.value})}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">Estado</Label>
                  <Input 
                    id="edit-state" 
                    value={editSchool.state || ''}
                    onChange={(e) => setEditSchool({...editSchool, state: e.target.value})}
                    placeholder="Estado"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-zip">Código Postal</Label>
                <Input 
                  id="edit-zip" 
                  value={editSchool.zip_code || ''}
                  onChange={(e) => setEditSchool({...editSchool, zip_code: e.target.value})}
                  placeholder="Código Postal"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input 
                  id="edit-phone" 
                  value={editSchool.phone || ''}
                  onChange={(e) => setEditSchool({...editSchool, phone: e.target.value})}
                  placeholder="Teléfono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  value={editSchool.email || ''}
                  onChange={(e) => setEditSchool({...editSchool, email: e.target.value})}
                  placeholder="Email"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditSchool}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete School Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la escuela
              <span className="font-semibold"> {activeSchool?.name}</span> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteSchool();
              }}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SchoolsManagement;
