
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingBag, Tag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const StudentMarketplace: React.FC<{
  items: any[];
  onPurchase: (itemId: string) => void;
}> = ({ items, onPurchase }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handlePurchase = (itemId: string, price: number, name: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar compras",
        variant: "destructive"
      });
      return;
    }
    
    if ((user.coins || 0) < price) {
      toast({
        title: "Fondos insuficientes",
        description: "No tienes suficientes monedas para comprar este artículo",
        variant: "destructive"
      });
      return;
    }
    
    // Call the parent purchase handler
    onPurchase(itemId);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Mercado Escolar
        </CardTitle>
        <CardDescription>Productos disponibles para comprar</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay productos disponibles en este momento
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="bg-gray-100 h-32 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <Tag className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="flex items-center font-bold text-sm">
                      {item.price} <span className="ml-1">monedas</span>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    {item.categoryName && (
                      <Badge variant="outline" className="text-xs">
                        {item.categoryName}
                      </Badge>
                    )}
                    <Button 
                      size="sm" 
                      onClick={() => handlePurchase(item.id, item.price, item.title)}
                      disabled={item.stock <= 0 || (user?.coins || 0) < item.price}
                    >
                      Comprar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Need to add Badge component
import { Badge } from "@/components/ui/badge";

export default StudentMarketplace;
