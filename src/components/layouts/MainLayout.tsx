import React, { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, PackageOpen, BarChart3, Award, 
  Wallet, School, Settings, LogOut, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive"
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Define navigation links based on user role
  const navigationLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["student", "teacher", "admin", "super_admin"] as const
    },
    {
      to: "/marketplace",
      label: "Mercado",
      icon: <PackageOpen className="h-5 w-5" />,
      roles: ["student", "teacher", "admin", "super_admin"] as const
    },
    {
      to: "/exchange",
      label: "Intercambios",
      icon: <BarChart3 className="h-5 w-5" />,
      roles: ["student", "teacher", "admin", "super_admin"] as const
    },
    {
      to: "/achievements",
      label: "Logros",
      icon: <Award className="h-5 w-5" />,
      roles: ["student", "teacher", "admin", "super_admin"] as const
    },
    {
      to: "/wallet",
      label: "Monedero",
      icon: <Wallet className="h-5 w-5" />,
      roles: ["student", "teacher", "admin", "super_admin"] as const
    },
    {
      to: "/classes",
      label: "Clases",
      icon: <School className="h-5 w-5" />,
      roles: ["teacher", "admin", "super_admin"] as const
    },
    {
      to: "/admin",
      label: "Administración",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin", "super_admin"] as const // Updated to exactly match the allowed roles
    }
  ];

  // Filter links based on user role
  const allowedLinks = user
    ? navigationLinks.filter(link => 
        link.roles.includes(user.role as "student" | "teacher" | "admin" | "super_admin")
      )
    : [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-blue-600">EduTokens</h1>
          <p className="text-sm text-gray-500">Sistema de Gestión Escolar</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {allowedLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to}
              className={`flex items-center p-2 rounded-md transition-colors ${
                isActive(link.to) 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.icon}
              <span className="ml-3">{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>
        
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
