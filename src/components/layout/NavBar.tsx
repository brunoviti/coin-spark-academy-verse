
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, Wallet, Award, ShoppingBag, BarChart3, School, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: "Inicio", path: "/", icon: <Home className="w-4 h-4" /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Mi Billetera", path: "/wallet", icon: <Wallet className="w-4 h-4" />, roles: ["student", "teacher"] },
    { name: "Mis Logros", path: "/achievements", icon: <Award className="w-4 h-4" />, roles: ["student"] },
    { name: "Mercado", path: "/marketplace", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Intercambio", path: "/exchange", icon: <BarChart3 className="w-4 h-4" />, roles: ["student"] },
    { name: "Clases", path: "/classes", icon: <School className="w-4 h-4" />, roles: ["teacher", "admin"] },
    { name: "Admin", path: "/admin", icon: <Settings className="w-4 h-4" />, roles: ["admin", "super_admin"] }
  ];

  // Filtrar elementos de navegación según el rol del usuario
  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center gap-2 overflow-x-auto">
      {filteredNavItems.map((item) => (
        <Button
          key={item.path}
          variant={location.pathname === item.path ? "secondary" : "ghost"}
          size="sm"
          className="flex items-center gap-1"
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          <span>{item.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default NavBar;
