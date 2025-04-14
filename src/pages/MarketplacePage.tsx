import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingBag, Search, Filter, Tag, Clock, 
  Gift, Coffee, Award, Ticket, CreditCard 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockMarketplaceItems } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";
import { fetchUserPurchaseHistory, createMarketplacePurchase } from "@/api/user";
import PurchaseHistory from "@/components/PurchaseHistory";

const MarketplacePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const loadPurchaseHistory = async () => {
      if (user) {
        try {
          const history = await fetchUserPurchaseHistory(user.id);
          setPurchases(history);
        } catch (error) {
          toast({
            title: "Error",
            description: "No se pudo cargar el historial de compras",
            variant: "destructive"
          });
        }
      }
    };

    loadPurchaseHistory();
  }, [user]);

  if (!user) {
    navigate("/");
    return null;
  }

  // Filter marketplace items based on category
  const filteredItems = mockMarketplaceItems.filter(item => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  // Further filter based on search term
  const searchedItems = filteredItems.filter(item => {
    if (!search) return true;
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Calculate balance
  const balance = user.coins || 125; // Using either the user balance or default to 125 coins

  // Handle purchase
  const handlePurchase = async (item) => {
    try {
      await createMarketplacePurchase(user.id, item.id, 1, item.price);
      // Recargar el historial
      const updatedHistory = await fetchUserPurchaseHistory(user.id);
      setPurchases(updatedHistory);
      toast({
        title: "¡Compra exitosa!",
        description: `Has comprado: ${item.title}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la compra",
        variant: "destructive"
      });
    }
  };

  // Get category icon based on category name
  const getCategoryIcon = (category) => {
    switch (category) {
      case "coupons":
        return <Tag className="h-4 w-4" />;
      case "events":
        return <Ticket className="h-4 w-4" />;
      case "privileges":
        return <Award className="h-4 w-4" />;
      case "certificates":
        return <CreditCard className="h-4 w-4" />;
      case "food":
        return <Coffee className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout title="Mercado Escolar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Card className="w-full md:w-auto px-4 py-2 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
            <div className="coin w-8 h-8 text-sm">{balance}</div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tu Balance</p>
            <p className="font-bold">{balance} monedas</p>
          </div>
        </Card>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar en el mercado" 
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Artículos Disponibles</CardTitle>
              <CardDescription>Articulos que puedes comprar con tus monedas</CardDescription>
            </div>
          </div>
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="coupons">Cupones</TabsTrigger>
              <TabsTrigger value="events">Eventos</TabsTrigger>
              <TabsTrigger value="privileges">Privilegios</TabsTrigger>
              <TabsTrigger value="certificates">Certificados</TabsTrigger>
              <TabsTrigger value="food">Comida</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {searchedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchedItems.map(item => (
                <div key={item.id} className="marketplace-item">
                  <div className="h-40 bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-gray-400" />
                    </div>
                    {item.stock <= 3 && item.stock > 0 && (
                      <Badge className="absolute top-2 right-2 bg-amber-500">
                        ¡Quedan {item.stock}!
                      </Badge>
                    )}
                    {item.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge className="bg-red-500">
                          Agotado
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getCategoryIcon(item.category)}
                        <span className="capitalize text-xs">{item.category}</span>
                      </Badge>
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-800 text-xs font-bold mr-1">
                          C
                        </div>
                        <span className="font-bold">{item.price}</span>
                      </div>
                    </div>
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Disponible ahora</span>
                      </div>
                      <Button 
                        size="sm"
                        disabled={item.stock <= 0 || balance < item.price}
                        onClick={() => handlePurchase(item)}
                      >
                        Comprar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No hay artículos que coincidan con tu búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <PurchaseHistory purchases={purchases} />
      </div>
    </MainLayout>
  );
};

export default MarketplacePage;
