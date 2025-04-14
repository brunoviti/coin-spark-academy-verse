
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  ShoppingBag, Search, PlusCircle, Edit, Trash2, 
  Tags, Package, RefreshCw, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchMarketplaceItems } from "@/integrations/supabase/helpers/marketplace";

const MarketplaceManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado para el formulario de nuevo producto
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    price: 10,
    stock: 1,
    category_id: "",
  });
  
  // Estado para edición de producto
  const [editingItem, setEditingItem] = useState<any>(null);
  
  useEffect(() => {
    if (!user?.schoolId) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Cargar productos del mercado
        const marketplaceItems = await fetchMarketplaceItems(user.schoolId as string);
        setItems(marketplaceItems);
        
        // Cargar categorías
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('marketplace_categories')
          .select('*')
          .eq('school_id', user.schoolId);
          
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos del mercado",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user?.schoolId, toast]);
  
  // Filtrar productos según el término de búsqueda
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Función para crear un nuevo producto
  const handleCreateItem = async () => {
    if (!user?.schoolId) return;
    
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          title: newItem.title,
          description: newItem.description,
          price: newItem.price,
          stock: newItem.stock,
          category_id: newItem.category_id || null,
          school_id: user.schoolId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Producto creado",
        description: `Se ha creado el producto "${newItem.title}" correctamente`,
      });
      
      // Añadir categoría al nuevo producto para mostrar en la UI
      const category = categories.find(c => c.id === newItem.category_id);
      const newItemWithCategory = {
        ...data,
        categoryName: category?.name
      };
      
      // Actualizar la lista de productos
      setItems(prev => [...prev, newItemWithCategory]);
      
      // Limpiar el formulario
      setNewItem({
        title: "",
        description: "",
        price: 10,
        stock: 1,
        category_id: "",
      });
    } catch (error) {
      console.error("Error creando producto:", error);
      toast({
        title: "Error",
        description: `No se pudo crear el producto: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };
  
  // Función para actualizar un producto existente
  const handleUpdateItem = async () => {
    if (!user?.schoolId || !editingItem) return;
    
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .update({
          title: editingItem.title,
          description: editingItem.description,
          price: editingItem.price,
          stock: editingItem.stock,
          category_id: editingItem.category_id || null
        })
        .eq('id', editingItem.id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Producto actualizado",
        description: `Se ha actualizado el producto "${editingItem.title}" correctamente`,
      });
      
      // Añadir categoría al producto actualizado para mostrar en la UI
      const category = categories.find(c => c.id === editingItem.category_id);
      const updatedItemWithCategory = {
        ...data,
        categoryName: category?.name
      };
      
      // Actualizar la lista de productos
      setItems(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return updatedItemWithCategory;
        }
        return item;
      }));
      
      // Limpiar el estado de edición
      setEditingItem(null);
    } catch (error) {
      console.error("Error actualizando producto:", error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el producto: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };
  
  // Función para eliminar un producto
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      });
      
      // Actualizar la lista de productos
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error eliminando producto:", error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el producto: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };
  
  // Función para crear una nueva categoría
  const handleCreateCategory = async (name: string) => {
    if (!user?.schoolId || !name.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .insert({
          name: name.trim(),
          school_id: user.schoolId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Categoría creada",
        description: `Se ha creado la categoría "${name}" correctamente`,
      });
      
      // Actualizar la lista de categorías
      setCategories(prev => [...prev, data]);
      
      return data;
    } catch (error) {
      console.error("Error creando categoría:", error);
      toast({
        title: "Error",
        description: `No se pudo crear la categoría: ${(error as Error).message}`,
        variant: "destructive"
      });
      return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión del Mercado</CardTitle>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-8 w-64"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Introduce los datos para crear un nuevo producto en el mercado
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Precio
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoría
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Select 
                      value={newItem.category_id} 
                      onValueChange={(value) => setNewItem({ ...newItem, category_id: value })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin categoría</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Crear Nueva Categoría</DialogTitle>
                          <DialogDescription>
                            Introduce el nombre para la nueva categoría
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="categoryName" className="text-right">
                              Nombre
                            </Label>
                            <Input
                              id="categoryName"
                              className="col-span-3"
                              placeholder="Nombre de la categoría"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => {
                            const input = document.getElementById('categoryName') as HTMLInputElement;
                            if (input) {
                              handleCreateCategory(input.value);
                            }
                          }}>
                            Crear Categoría
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateItem}>Crear Producto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Cargando productos...</p>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>
                      {item.stock <= 3 ? (
                        <div className="flex items-center">
                          <span className={`mr-2 ${item.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                            {item.stock}
                          </span>
                          {item.stock === 0 ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      ) : (
                        item.stock
                      )}
                    </TableCell>
                    <TableCell>
                      {item.categoryName ? (
                        <div className="flex items-center">
                          <Tags className="h-4 w-4 mr-1" />
                          {item.categoryName}
                        </div>
                      ) : (
                        "Sin categoría"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                              <DialogTitle>Editar Producto</DialogTitle>
                              <DialogDescription>
                                Modifica los datos del producto
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-title" className="text-right">
                                  Nombre
                                </Label>
                                <Input
                                  id="edit-title"
                                  value={editingItem?.title || ""}
                                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-description" className="text-right">
                                  Descripción
                                </Label>
                                <Textarea
                                  id="edit-description"
                                  value={editingItem?.description || ""}
                                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                  className="col-span-3"
                                  rows={3}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-price" className="text-right">
                                  Precio
                                </Label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  value={editingItem?.price || 0}
                                  onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-stock" className="text-right">
                                  Stock
                                </Label>
                                <Input
                                  id="edit-stock"
                                  type="number"
                                  value={editingItem?.stock || 0}
                                  onChange={(e) => setEditingItem({ ...editingItem, stock: parseInt(e.target.value) || 0 })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-category" className="text-right">
                                  Categoría
                                </Label>
                                <Select 
                                  value={editingItem?.category_id || ""} 
                                  onValueChange={(value) => setEditingItem({ ...editingItem, category_id: value })}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecciona una categoría" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Sin categoría</SelectItem>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleUpdateItem}>Guardar Cambios</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <Package className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p>No se encontraron productos</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketplaceManagement;
