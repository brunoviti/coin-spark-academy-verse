
import React from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, School, UserCog, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/contexts/auth/types";

const DemoLogin: React.FC<{ onLogin?: (role: UserRole) => void }> = ({ onLogin }) => {
  const { loginWithRole } = useAuth();

  const handleDemoLogin = (role: UserRole) => {
    loginWithRole(role);
    if (onLogin) {
      onLogin(role);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        Selecciona un rol para explorar la aplicación en modo demo:
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        <Button 
          variant="outline" 
          className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
          onClick={() => handleDemoLogin("student")}
        >
          <GraduationCap className="h-6 w-6 text-invertidos-blue" />
          <span>Estudiante</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
          onClick={() => handleDemoLogin("teacher")}
        >
          <School className="h-6 w-6 text-invertidos-blue" />
          <span>Profesor</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
          onClick={() => handleDemoLogin("admin")}
        >
          <UserCog className="h-6 w-6 text-invertidos-blue" />
          <span>Administrador</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
          onClick={() => handleDemoLogin("super_admin")}
        >
          <Shield className="h-6 w-6 text-invertidos-blue" />
          <span>Super Administrador</span>
        </Button>
      </div>
    </div>
  );
};

export default DemoLogin;
