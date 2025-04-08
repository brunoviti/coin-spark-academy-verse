import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { School, Settings, Coins } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SchoolManagement: React.FC<{
  school: any;
  onUpdateSchool: (data: any) => void;
}> = ({ school, onUpdateSchool }) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: school?.name || "",
    coinName: school?.coin_name || "EduCoin",
    coinSymbol: school?.coin_symbol || "EDC",
    maxSupply: school?.max_supply || 10000
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "maxSupply" ? parseInt(value) || 0 : value
    });
  };
  
  const handleSubmit = () => {
    if (!formData.name) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para la escuela",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.maxSupply <= 0) {
      toast({
        title: "Suministro inválido",
        description: "El suministro máximo debe ser mayor a cero",
        variant: "destructive"
      });
      return;
    }
    
    onUpdateSchool({
      name: formData.name,
      coin_name: formData.coinName,
      coin_symbol: formData.coinSymbol,
      max_supply: formData.maxSupply
    });
    
    setEditing(false);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="h-5 w-5" />
          Configuración de la Escuela
        </CardTitle>
        <CardDescription>
          Administra los parámetros de tu institución y su moneda digital
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Nombre</h3>
                <p className="font-medium">{school?.name || "No configurado"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                <p className="font-medium">{school?.id || "N/A"}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Información de la Moneda</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nombre</h3>
                  <p className="font-medium">{school?.coin_name || "EduCoin"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Símbolo</h3>
                  <p className="font-medium">{school?.coin_symbol || "EDC"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Suministro Máximo</h3>
                  <p className="font-medium">{school?.max_supply || 0}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Suministro Actual</h3>
                  <p className="font-medium">{school?.current_supply || 0}</p>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4"
              onClick={() => setEditing(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Editar Configuración
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre de la Escuela
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Colegio San Martín"
              />
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Configuración de la Moneda</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="coinName" className="text-sm font-medium">
                    Nombre de la Moneda
                  </label>
                  <Input
                    id="coinName"
                    name="coinName"
                    value={formData.coinName}
                    onChange={handleChange}
                    placeholder="Ej: EduCoin"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="coinSymbol" className="text-sm font-medium">
                    Símbolo
                  </label>
                  <Input
                    id="coinSymbol"
                    name="coinSymbol"
                    value={formData.coinSymbol}
                    onChange={handleChange}
                    placeholder="Ej: EDC"
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <label htmlFor="maxSupply" className="text-sm font-medium">
                    Suministro Máximo
                  </label>
                  <Input
                    id="maxSupply"
                    name="maxSupply"
                    type="number"
                    value={formData.maxSupply}
                    onChange={handleChange}
                    min={0}
                  />
                  <p className="text-xs text-muted-foreground">
                    El número máximo de monedas que pueden existir en tu ecosistema escolar
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="w-full"
                onClick={handleSubmit}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolManagement;
