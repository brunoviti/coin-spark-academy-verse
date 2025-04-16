
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Share2 } from "lucide-react";

interface ExchangeListingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ExchangeListingForm: React.FC<ExchangeListingFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!title.trim()) {
      toast({
        title: "Título requerido",
        description: "Por favor ingresa un título para tu anuncio",
        variant: "destructive"
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Por favor ingresa una descripción para tu anuncio",
        variant: "destructive"
      });
      return;
    }
    
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Precio inválido",
        description: "Por favor ingresa un precio válido (mayor a 0)",
        variant: "destructive"
      });
      return;
    }
    
    if (!user || !user.schoolId) {
      toast({
        title: "Error",
        description: "No se encontró información de usuario o escuela",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insertar directamente en la tabla de exchange_listings
      const { data, error } = await supabase
        .from('exchange_listings')
        .insert({
          seller_id: user.id,
          school_id: user.schoolId,
          title: title,
          description: description,
          asking_price: priceNum,
          status: 'active'
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Anuncio creado",
        description: "Tu anuncio ha sido publicado exitosamente",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el anuncio, inténtalo de nuevo",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Nuevo Anuncio
        </CardTitle>
        <CardDescription>
          Publica un anuncio para ofrecer tus conocimientos o habilidades
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Título del anuncio
            </label>
            <Input
              id="title"
              placeholder="Ej: Clases de matemáticas para primaria"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descripción
            </label>
            <Textarea
              id="description"
              placeholder="Describe lo que ofreces, cuándo estás disponible, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Precio (monedas)
            </label>
            <Input
              id="price"
              type="number"
              min="1"
              placeholder="Ej: 10"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                Publicando...
              </div>
            ) : (
              "Publicar Anuncio"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ExchangeListingForm;
