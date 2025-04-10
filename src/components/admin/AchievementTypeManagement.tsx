import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Award, 
  Coins,
  PlusCircle, 
  Search, 
  Trash2,
  Edit
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AchievementTypeManagement: React.FC<{
  achievementTypes: any[];
  onCreateAchievementType: (data: any) => void;
  onUpdateAchievementType: (id: string, data: any) => void;
  onDeleteAchievementType: (id: string) => void;
}> = ({ 
  achievementTypes, 
  onCreateAchievementType, 
  onUpdateAchievementType,
  onDeleteAchievementType
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [newType, setNewType] = useState({
    name: "",
    description: "",
    coinValue: 10
  });
  const [editingType, setEditingType] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleCreateSubmit = () => {
    if (!newType.name) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para el tipo de logro",
        variant: "destructive"
      });
      return;
    }
    
    if (newType.coinValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "El valor en monedas debe ser mayor a cero",
        variant: "destructive"
      });
      return;
    }
    
    onCreateAchievementType({
      name: newType.name,
      description: newType.description,
      coin_value: newType.coinValue
    });
    
    setNewType({
      name: "",
      description: "",
      coinValue: 10
    });
    
    setIsCreateDialogOpen(false);
  };
  
  const handleEditSubmit = () => {
    if (!editingType || !editingType.name) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    
    onUpdateAchievementType(editingType.id, {
      name: editingType.name,
      description: editingType.description,
      coin_value: editingType.coinValue
    });
    
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteConfirm = () => {
    if (!editingType) return;
    
    onDeleteAchievementType(editingType.id);
    setIsDeleteDialogOpen(false);
  };
  
  const startEdit = (type: any) => {
    setEditingType({
      id: type.id,
      name: type.name,
      description: type.description || "",
      coinValue: type.coin_value
    });
    setIsEditDialogOpen(true);
  };
  
  const startDelete = (type: any) => {
    setEditingType(type);
    setIsDeleteDialogOpen(true);
  };
  
  const filteredTypes = achievementTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Tipos de Logros
        </CardTitle>
        <CardDescription>
          Administra los tipos de logros disponibles en la escuela
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tipos de logros..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Tipo de Logro</DialogTitle>
                <DialogDescription>
                  Define un nuevo tipo de logro para tu escuela
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nombre del Logro
                  </label>
                  <Input
                    id="name"
                    value={newType.name}
                    onChange={(e) => setNewType({...newType, name: e.target.value})}
                    placeholder="Ej: Excelencia Académica"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Descripción
                  </label>
                  <Textarea
                    id="description"
                    value={newType.description}
                    onChange={(e) => setNewType({...newType, description: e.target.value})}
                    placeholder="Descripción del logro"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="coinValue" className="text-sm font-medium">
                    Valor en Monedas
                  </label>
                  <Input
                    id="coinValue"
                    type="number"
                    value={newType.coinValue}
                    onChange={(e) => setNewType({
                      ...newType, 
                      coinValue: parseInt(e.target.value) || 0
                    })}
                    min={1}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSubmit}>
                  Crear Logro
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {filteredTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {searchTerm ? "No se encontraron tipos de logros" : "No hay tipos de logros definidos"}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredTypes.map((type) => (
              <div 
                key={type.id} 
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{type.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Coins className="h-3 w-3 mr-1" />
                      {type.coin_value} monedas
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(type)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startDelete(type)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tipo de Logro</DialogTitle>
            </DialogHeader>
            
            {editingType && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">
                    Nombre del Logro
                  </label>
                  <Input
                    id="edit-name"
                    value={editingType.name}
                    onChange={(e) => setEditingType({
                      ...editingType, 
                      name: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="edit-description" className="text-sm font-medium">
                    Descripción
                  </label>
                  <Textarea
                    id="edit-description"
                    value={editingType.description}
                    onChange={(e) => setEditingType({
                      ...editingType, 
                      description: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="edit-coinValue" className="text-sm font-medium">
                    Valor en Monedas
                  </label>
                  <Input
                    id="edit-coinValue"
                    type="number"
                    value={editingType.coinValue}
                    onChange={(e) => setEditingType({
                      ...editingType, 
                      coinValue: parseInt(e.target.value) || 0
                    })}
                    min={1}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditSubmit}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar el tipo de logro "{editingType?.name}"? 
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AchievementTypeManagement;
