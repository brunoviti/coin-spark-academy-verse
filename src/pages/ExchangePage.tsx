
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  BarChart3, Search, Filter, Plus, 
  UserPlus, ArrowLeftRight, Share2, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockExchangeListings } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";

const ExchangePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    navigate("/");
    return null;
  }

  // Only student role should access this page
  if (user.role !== "student") {
    navigate("/dashboard");
    return null;
  }

  // Calculate balance
  const balance = user.coins || 125; // Using either the user balance or default to 125 coins

  // Handle making a new listing
  const handleNewListing = () => {
    toast({
      title: "Función en desarrollo",
      description: "La creación de nuevos anuncios estará disponible próximamente",
    });
  };

  // Handle accepting a listing
  const handleAcceptListing = (listing) => {
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
      description: `Has intercambiado con ${listing.studentName} por ${listing.price} monedas`,
    });
  };

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
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockExchangeListings.map(listing => (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="bg-blue-50 p-4">
                      <div className="flex justify-between">
                        <Badge className="bg-blue-500">{`${listing.price} monedas`}</Badge>
                        <Badge variant="outline" className="bg-white">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(listing.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      <h3 className="font-bold mt-3 mb-1">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground">{listing.description}</p>
                    </div>
                    <CardFooter className="flex flex-col items-stretch gap-4 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{listing.studentName}</p>
                          <p className="text-xs text-muted-foreground">Estudiante</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => handleAcceptListing(listing)}
                      >
                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                        Intercambiar
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
              </div>
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
                    <BookOpen className="h-5 w-5" />
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
                    <Music className="h-5 w-5" />
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
                    <Laptop className="h-5 w-5" />
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

// Adding missing icon imports
const BookOpen = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
};

const Music = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
};

const Laptop = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
    </svg>
  );
};

const User = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};

const Calendar = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
};

export default ExchangePage;
