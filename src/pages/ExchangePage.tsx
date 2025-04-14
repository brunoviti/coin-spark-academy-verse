import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  BarChart3, Search, Filter, Plus, 
  UserPlus, ArrowLeftRight, Share2, Users, Calendar as CalendarIcon, User as UserIcon, 
  BookOpen as BookOpenIcon, Music as MusicIcon, Laptop as LaptopIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockExchangeListings } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";
import { fetchExchangeListings } from "@/integrations/supabase/helpers/exchange";
import ExchangeListingForm from "@/components/ExchangeListingForm";

const ExchangePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (user.role !== "student") {
      navigate("/dashboard");
      return;
    }

    const loadListings = async () => {
      if (user.schoolId) {
        try {
          setIsLoading(true);
          const data = await fetchExchangeListings(user.schoolId, true);
          setListings(data);
        } catch (error) {
          console.error("Error loading exchange listings:", error);
          setListings(mockExchangeListings);
        } finally {
          setIsLoading(false);
        }
      } else {
        setListings(mockExchangeListings);
        setIsLoading(false);
      }
    };

    loadListings();
  }, [user, navigate]);

  const balance = user?.coins || 125;

  const handleNewListing = () => {
    setShowCreateForm(true);
  };

  const handleFormSuccess = async () => {
    setShowCreateForm(false);
    if (user?.schoolId) {
      try {
        const data = await fetchExchangeListings(user.schoolId, true);
        setListings(data);
      } catch (error) {
        console.error("Error reloading listings:", error);
      }
    }
  };

  const handleAcceptListing = (listing: any) => {
    if (balance < listing.price) {
      toast({
        title: "Saldo insuficiente",
        description: `Necesitas ${listing.price - balance} monedas más para esta transacción`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "¡Transacción exitosa!",
      description: `Has intercambiado con ${listing.studentName || listing.sellerName} por ${listing.price || listing.asking_price} monedas`,
    });
  };

  const filteredListings = listings.filter(listing => {
    if (!searchTerm) return true;
    
    const title = listing.title ? listing.title.toLowerCase() : '';
    const description = listing.description ? listing.description.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    
    return title.includes(search) || description.includes(search);
  });

  if (showCreateForm) {
    return (
      <MainLayout title="Crear Anuncio">
        <ExchangeListingForm 
          onSuccess={handleFormSuccess} 
          onCancel={() => setShowCreateForm(false)} 
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Zona de Intercambio">
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
              placeholder="Buscar en la bolsa" 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="shrink-0" onClick={handleNewListing}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Anuncio
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Zona de Intercambio</CardTitle>
              <CardDescription>Intercambia servicios y conocimientos con otros estudiantes</CardDescription>
            </div>
          </div>
          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="listings">Anuncios Activos</TabsTrigger>
              <TabsTrigger value="my-listings">Mis Anuncios</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando anuncios...</p>
                </div>
              ) : (
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredListings.length > 0 ? (
                    <>
                      {filteredListings.map(listing => (
                        <Card key={listing.id} className="overflow-hidden">
                          <div className="bg-blue-50 p-4">
                            <div className="flex justify-between">
                              <Badge className="bg-blue-500">{`${listing.asking_price || listing.price} monedas`}</Badge>
                              <Badge variant="outline" className="bg-white">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {new Date(listing.created_at).toLocaleDateString()}
                              </Badge>
                            </div>
                            <h3 className="font-bold mt-3 mb-1">{listing.title}</h3>
                            <p className="text-sm text-muted-foreground">{listing.description}</p>
                          </div>
                          <CardFooter className="flex flex-col items-stretch gap-4 pt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{listing.sellerName || listing.studentName}</p>
                                <p className="text-xs text-muted-foreground">Estudiante</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full"
                              onClick={() => handleAcceptListing(listing)}
                              disabled={user?.id === listing.seller_id}
                            >
                              <ArrowLeftRight className="h-4 w-4 mr-2" />
                              {user?.id === listing.seller_id ? "Tu anuncio" : "Intercambiar"}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}

                      <Card className="border-dashed">
                        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center h-full">
                          <Plus className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground text-center">
                            ¿Tienes alguna habilidad o conocimiento para compartir?
                          </p>
                          <Button 
                            className="mt-4" 
                            variant="outline"
                            onClick={handleNewListing}
                          >
                            Crear Nuevo Anuncio
                          </Button>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No hay anuncios que coincidan con tu búsqueda</p>
                      <Button 
                        className="mt-4" 
                        variant="outline"
                        onClick={() => setSearchTerm("")}
                      >
                        Mostrar todos los anuncios
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-listings">
              <div className="pt-6 pb-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Share2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No tienes anuncios activos</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Comparte tus habilidades y conocimientos con otros estudiantes para ganar monedas adicionales.
                </p>
                <Button onClick={handleNewListing}>
                  Crear Mi Primer Anuncio
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="pt-6 pb-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">Aún no tienes intercambios</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Tu historial de intercambios aparecerá aquí una vez que hayas realizado tu primera transacción.
                </p>
                <Button variant="outline" onClick={() => navigate("/exchange")}>
                  Explorar Anuncios
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Más Populares</CardTitle>
            <CardDescription>Las categorías de intercambio más solicitadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <BookOpenIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Tutoría Académica</p>
                    <p className="text-sm text-muted-foreground">Matemáticas, Ciencias, Idiomas</p>
                  </div>
                </div>
                <Badge>32 anuncios</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <MusicIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Música y Arte</p>
                    <p className="text-sm text-muted-foreground">Instrumentos, Técnicas, Estilos</p>
                  </div>
                </div>
                <Badge>25 anuncios</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <LaptopIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Tecnología</p>
                    <p className="text-sm text-muted-foreground">Programación, Diseño, Videojuegos</p>
                  </div>
                </div>
                <Badge>18 anuncios</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cómo Funciona</CardTitle>
            <CardDescription>Guía rápida de la Zona de Intercambio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-invertidos-blue/10 flex items-center justify-center text-invertidos-blue">
                  1
                </div>
                <div>
                  <p className="font-medium">Crea tu anuncio</p>
                  <p className="text-sm text-muted-foreground">
                    Describe tu habilidad, cuánto tiempo ofreces y cuántas monedas pides a cambio.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-invertidos-green/10 flex items-center justify-center text-invertidos-green">
                  2
                </div>
                <div>
                  <p className="font-medium">Responde a solicitudes</p>
                  <p className="text-sm text-muted-foreground">
                    Otros estudiantes pueden contactarte para acordar detalles del intercambio.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-invertidos-orange/10 flex items-center justify-center text-invertidos-orange">
                  3
                </div>
                <div>
                  <p className="font-medium">Realiza el intercambio</p>
                  <p className="text-sm text-muted-foreground">
                    Completa el intercambio y recibe tus monedas automáticamente en tu billetera.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ExchangePage;

const BookOpen = (props) => {
  return (
    <BookOpenIcon {...props} />
  );
};

const Music = (props) => {
  return (
    <MusicIcon {...props} />
  );
};

const Laptop = (props) => {
  return (
    <LaptopIcon {...props} />
  );
};

const User = (props) => {
  return (
    <UserIcon {...props} />
  );
};

const Calendar = (props) => {
  return (
    <CalendarIcon {...props} />
  );
};
