import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, Wallet, Award, ShoppingBag, BarChart3, 
  LogOut, Settings, Menu, User, School
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "../layout/NavBar";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop and Mobile NavBar */}
      <NavBar />
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed top-10 left-0 right-0 bg-white shadow-sm z-50 px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-bold text-invertidos-blue">Invertidos</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 py-4">
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
              
              <nav className="flex-1">
                <ul className="space-y-2 mt-4">
                  {filteredNavItems.map((item) => (
                    <li key={item.path}>
                      <Button
                        variant={window.location.pathname === item.path ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => navigate(item.path)}
                      >
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </nav>
              
              <Button
                variant="ghost"
                className="mt-auto mb-4 justify-start text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop Nav */}
      <div className="hidden md:flex min-h-screen">
        <aside className="w-64 bg-sidebar border-r border-sidebar-border shadow-sm fixed top-10 left-0 h-full flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-invertidos-blue">Invertidos</h1>
          </div>
          
          <nav className="flex-1 px-4">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => (
                <li key={item.path}>
                  <Button
                    variant={window.location.pathname === item.path ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 border-t border-sidebar-border mt-auto">
            <div className="flex items-center gap-2 mb-4">
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
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </aside>
        
        <main className="flex-1 ml-64 mt-10">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Content */}
      <div className="md:hidden pt-24">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
