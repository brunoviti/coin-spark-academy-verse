
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, School } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { UserRole } from "@/contexts/auth/types";

const SignupForm: React.FC<{ onSignupSuccess?: () => void }> = ({ onSignupSuccess }) => {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");

  // Utilizar los roles disponibles desde el enum de la base de datos
  const availableUserRoles: UserRole[] = ["student", "teacher", "admin", "super_admin"];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    try {
      await signup(email, password, name, selectedRole);
      toast({
        title: "Registro exitoso",
        description: "Por favor inicia sesión con tus nuevas credenciales",
      });
      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nombre completo</Label>
        <Input 
          id="signup-name" 
          type="text" 
          placeholder="Tu nombre" 
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Correo electrónico</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="tu@correo.com" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Contraseña</Label>
        <Input 
          id="signup-password" 
          type="password" 
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
        <Input 
          id="confirm-password" 
          type="password" 
          placeholder="Confirma tu contraseña"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Selecciona tu rol</Label>
        <RadioGroup 
          className="flex gap-4 pt-2" 
          defaultValue="student"
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as UserRole)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="student" id="student" />
            <Label htmlFor="student" className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>Estudiante</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="teacher" id="teacher" />
            <Label htmlFor="teacher" className="flex items-center gap-1">
              <School className="h-4 w-4" />
              <span>Profesor</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <Button type="submit" className="w-full bg-invertidos-blue hover:bg-blue-700">
        Crear Cuenta
      </Button>
    </form>
  );
};

export default SignupForm;
