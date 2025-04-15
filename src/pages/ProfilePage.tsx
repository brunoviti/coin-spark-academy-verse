
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, RefreshCw, User } from "lucide-react";
import { supabase } from "@/integrations/supabase";
import { updateProfile } from "@/integrations/supabase/helpers/profiles";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    // Cargar datos iniciales
    setName(user.name || "");
    setAvatarUrl(user.avatarUrl || null);
  }, [user, navigate]);
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Debes seleccionar una imagen");
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Verificar si existe el bucket de avatars, si no, lo creamos
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('avatars');
      
      if (bucketError && bucketError.message.includes('The resource was not found')) {
        // Crear el bucket si no existe
        await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2 // 2MB
        });
      }
      
      // Subir el archivo
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Obtener la URL pública
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      setAvatarUrl(data.publicUrl);
      
      toast({
        title: "Imagen subida",
        description: "Tu foto de perfil se ha subido correctamente",
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Ha ocurrido un error al subir la imagen",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      await updateProfile(user.id, {
        name,
        avatar_url: avatarUrl
      });
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información se ha actualizado correctamente",
      });
      
      // Actualizar el contexto de autenticación
      // Nota: Esto debería provocar un refresco del usuario en el contexto de autenticación
      // a través del listener de AuthState, pero podríamos necesitar una recarga si no funciona
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Ha ocurrido un error al guardar los cambios",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <MainLayout title="Mi Perfil">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <CardDescription>
              Gestiona tu información personal y configuración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={name} />
                ) : null}
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {!uploading ? (
                    <User className="w-10 h-10" />
                  ) : (
                    <Loader2 className="w-10 h-10 animate-spin" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Cambiar Foto
                    </>
                  )}
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="col-span-3 bg-gray-50"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Rol
                </Label>
                <Input
                  id="role"
                  value={user.role || ""}
                  disabled
                  className="col-span-3 bg-gray-50"
                />
              </div>
              
              {user.schoolId && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="school" className="text-right">
                    Escuela
                  </Label>
                  <Input
                    id="school"
                    value={user.schoolName || ""}
                    disabled
                    className="col-span-3 bg-gray-50"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
