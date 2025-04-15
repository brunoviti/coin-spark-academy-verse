
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, School, Pencil, Trash2, Coins } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { fetchSchools, createSchool, updateSchool, deleteSchool } from "@/integrations/supabase/helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const SchoolsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isNewSchoolDialogOpen, setIsNewSchoolDialogOpen] = useState(false);
  const [isEditSchoolDialogOpen, setIsEditSchoolDialogOpen] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [coinName, setCoinName] = useState("");
  const [coinSymbol, setCoinSymbol] = useState("");
  const [maxSupply, setMaxSupply] = useState(10000);

  // Fetching schools
  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: fetchSchools,
  });

  // Mutation for creating schools
  const createSchoolMutation = useMutation({
    mutationFn: createSchool,
    onSuccess: () => {
      toast({
        title: "Escuela creada",
        description: "La escuela ha sido creada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setIsNewSchoolDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la escuela",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating schools
  const updateSchoolMutation = useMutation({
    mutationFn: updateSchool,
    onSuccess: () => {
      toast({
        title: "Escuela actualizada",
        description: "La escuela ha sido actualizada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setIsEditSchoolDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la escuela",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting schools
  const deleteSchoolMutation = useMutation({
    mutationFn: deleteSchool,
    onSuccess: () => {
      toast({
        title: "Escuela eliminada",
        description: "La escuela ha sido eliminada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la escuela",
        variant: "destructive",
      });
    },
  });

  // Reset form values
  const resetForm = () => {
    setSchoolName("");
    setCoinName("");
    setCoinSymbol("");
    setMaxSupply(10000);
    setSelectedSchool(null);
  };

  // Handle edit school
  const handleEditSchool = (school) => {
    setSelectedSchool(school);
    setSchoolName(school.name);
    setCoinName(school.coin_name);
    setCoinSymbol(school.coin_symbol || "");
    setMaxSupply(school.max_supply);
    setIsEditSchoolDialogOpen(true);
  };

  // Handle delete school
  const handleDeleteSchool = (schoolId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta escuela? Esta acción no se puede deshacer.")) {
      deleteSchoolMutation.mutate(schoolId);
    }
  };

  // Handle create school form submit
  const handleCreateSchool = (e) => {
    e.preventDefault();
    createSchoolMutation.mutate({
      name: schoolName,
      coin_name: coinName,
      coin_symbol: coinSymbol,
      max_supply: maxSupply,
      admin_id: user?.id
    });
  };

  // Handle update school form submit
  const handleUpdateSchool = (e) => {
    e.preventDefault();
    if (selectedSchool) {
      updateSchoolMutation.mutate({
        id: selectedSchool.id,
        name: schoolName,
        coin_name: coinName,
        coin_symbol: coinSymbol,
        max_supply: maxSupply,
      });
    }
  };

  return (
    <div>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Escuelas</CardTitle>
          <Button onClick={() => setIsNewSchoolDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Escuela
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">Cargando escuelas...</p>
          ) : schools.length === 0 ? (
            <p className="text-center py-4">No hay escuelas registradas. Crea una nueva escuela para comenzar.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schools.map((school) => (
                <Card key={school.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 p-4 flex flex-row items-center justify-between">
                    <div className="flex items-center">
                      <School className="h-5 w-5 mr-2 text-blue-500" />
                      <CardTitle className="text-lg">{school.name}</CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSchool(school)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchool(school.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Moneda:</span>
                        <div className="flex items-center">
                          <Coins className="h-4 w-4 mr-1 text-amber-500" />
                          <span className="font-medium">{school.coin_name}</span>
                          {school.coin_symbol && (
                            <span className="ml-1 text-sm text-muted-foreground">({school.coin_symbol})</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Suministro:</span>
                        <span>{school.current_supply} / {school.max_supply}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para nueva escuela */}
      <Dialog open={isNewSchoolDialogOpen} onOpenChange={setIsNewSchoolDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Escuela</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSchool} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName">Nombre de la Escuela</Label>
              <Input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Ingrese el nombre de la escuela"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coinName">Nombre de la Moneda</Label>
              <Input
                id="coinName"
                value={coinName}
                onChange={(e) => setCoinName(e.target.value)}
                placeholder="Ej: EduCoin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coinSymbol">Símbolo de la Moneda</Label>
              <Input
                id="coinSymbol"
                value={coinSymbol}
                onChange={(e) => setCoinSymbol(e.target.value)}
                placeholder="Ej: EDC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSupply">Suministro Máximo</Label>
              <Input
                id="maxSupply"
                type="number"
                value={maxSupply}
                onChange={(e) => setMaxSupply(Number(e.target.value))}
                min="1000"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNewSchoolDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createSchoolMutation.isPending}>
                {createSchoolMutation.isPending ? "Creando..." : "Crear Escuela"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar escuela */}
      <Dialog open={isEditSchoolDialogOpen} onOpenChange={setIsEditSchoolDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Escuela</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSchool} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editSchoolName">Nombre de la Escuela</Label>
              <Input
                id="editSchoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Ingrese el nombre de la escuela"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCoinName">Nombre de la Moneda</Label>
              <Input
                id="editCoinName"
                value={coinName}
                onChange={(e) => setCoinName(e.target.value)}
                placeholder="Ej: EduCoin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCoinSymbol">Símbolo de la Moneda</Label>
              <Input
                id="editCoinSymbol"
                value={coinSymbol}
                onChange={(e) => setCoinSymbol(e.target.value)}
                placeholder="Ej: EDC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMaxSupply">Suministro Máximo</Label>
              <Input
                id="editMaxSupply"
                type="number"
                value={maxSupply}
                onChange={(e) => setMaxSupply(Number(e.target.value))}
                min="1000"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditSchoolDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateSchoolMutation.isPending}>
                {updateSchoolMutation.isPending ? "Actualizando..." : "Actualizar Escuela"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolsManagement;
