
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, Wallet, Award, ShoppingBag, BarChart3, 
  LogOut, Settings, Menu, User, School, X, Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // En pantallas grandes, detectar el ancho preferido por el usuario para la barra lateral
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState !== null) {
      setIsSidebarCollapsed(savedCollapsedState === 'true');
    }
  }, []);

  // Guardar el estado de la barra lateral cuando cambia
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
    }
  }, [isSidebarCollapsed, isMobile]);
  
  const navItems = [
    { 
      name: "Dashboard", 
      icon: <Home className="w-5 h-5" />, 
      path: "/dashboard", 
      roles: ["student", "teacher", "admin", "super_admin"] 
    },
    { 
      name: "Mi Billetera", 
      icon: <Wallet className="w-5 h-5" />, 
      path: "/wallet", 
      roles: ["student", "teacher"] 
    },
    { 
      name: "Mis Logros", 
      icon: <Award className="w-5 h-5" />, 
      path: "/achievements", 
      roles: ["student"] 
    },
    { 
      name: "Mercado Escolar", 
      icon: <ShoppingBag className="w-5 h-5" />, 
      path: "/marketplace", 
      roles: ["student", "teacher", "admin", "super_admin"] 
    },
    { 
      name: "Zona de Intercambio", 
      icon: <BarChart3 className="w-5 h-5" />, 
      path: "/exchange", 
      roles: ["student"] 
    },
    { 
      name: "Gestión de Clases", 
      icon: <School className="w-5 h-5" />, 
      path: "/classes", 
      roles: ["teacher", "admin"] 
    },
    { 
      name: "Administración", 
      icon: <Settings className="w-5 h-5" />, 
      path: "/admin", 
      roles: ["admin", "super_admin"] 
    },
    { 
      name: "Escuelas", 
      icon: <Building className="w-5 h-5" />, 
      path: "/admin?tab=schools", 
      roles: ["super_admin"] 
    }
  ];
  
  const filteredNavItems = navItems.filter(
    item => user && item.roles.includes(user.role)
  );
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  
  if (!user) {
    return <>{children}</>;
  }
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-invertidos-blue">Invertidos</h2>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-4 w-4" />
                      </Button>
                    </SheetClose>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                      {user.coins !== undefined && user.role === "student" && (
                        <p className="text-sm font-semibold text-green-600">{user.coins} monedas</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <nav className="flex-1 p-4 overflow-y-auto">
                  <ul className="space-y-1">
                    {filteredNavItems.map((item) => (
                      <li key={item.path}>
                        <SheetClose asChild>
                          <Button
                            variant={window.location.pathname === item.path ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => navigate(item.path)}
                          >
                            {item.icon}
                            <span className="ml-2">{item.name}</span>
                          </Button>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </nav>
                
                <div className="p-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold text-invertidos-blue">Invertidos</h1>
        </div>
        <Avatar
          className="cursor-pointer"
          onClick={() => setIsSidebarOpen(true)}
        >
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-sidebar border-r border-sidebar-border shadow-sm fixed top-0 left-0 h-full flex flex-col transition-all duration-300 ease-in-out z-30",
            isSidebarCollapsed ? "w-[70px]" : "w-64"
          )}
        >
          <div className={cn(
            "p-6 flex items-center justify-between",
            isSidebarCollapsed && "p-4 justify-center"
          )}>
            {!isSidebarCollapsed && (
              <h1 className="text-2xl font-bold text-invertidos-blue">Invertidos</h1>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className={cn(
                isSidebarCollapsed ? "ml-0" : "ml-auto"
              )}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className={cn(
            "flex-1 px-4 overflow-y-auto",
            isSidebarCollapsed && "px-2"
          )}>
            <ul className="space-y-1">
              {filteredNavItems.map((item) => (
                <li key={item.path}>
                  <Button
                    variant={window.location.pathname === item.path ? "secondary" : "ghost"}
                    className={cn(
                      "w-full",
                      isSidebarCollapsed
                        ? "justify-center px-2"
                        : "justify-start"
                    )}
                    onClick={() => navigate(item.path)}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    {item.icon}
                    {!isSidebarCollapsed && <span className="ml-2">{item.name}</span>}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className={cn(
            "p-4 border-t border-sidebar-border mt-auto",
            isSidebarCollapsed && "flex justify-center"
          )}>
            {!isSidebarCollapsed ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                    {user.coins !== undefined && user.role === "student" && (
                      <p className="text-sm font-semibold text-green-600">{user.coins} monedas</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={handleLogout}
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </aside>
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "ml-[70px]" : "ml-64"
        )}>
          <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Content */}
      <div className="md:hidden pt-14">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
