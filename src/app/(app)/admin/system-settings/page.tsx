
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SystemSettingsPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Mock state for form fields
  const [organizationName, setOrganizationName] = useState('Servicio de Salud Riojano (Ejemplo)');
  const [defaultTimezone, setDefaultTimezone] = useState('Europe/Madrid');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [requestHistoryDays, setRequestHistoryDays] = useState(90);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authIsLoading && user && !['admin', 'centroCoordinador'].includes(user.role)) {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para acceder a esta sección.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
    }
  }, [user, authIsLoading, router, toast]);

  const handleSaveChanges = () => {
    setIsSaving(true);
    toast({
        title: 'Guardando Configuración (Simulado)',
        description: 'Los cambios se están procesando...',
    });
    setTimeout(() => {
        setIsSaving(false);
        toast({
            title: 'Configuración Guardada (Simulado)',
            description: 'Los ajustes del sistema han sido actualizados.',
        });
    }, 1500);
  };

  if (authIsLoading || (!user || !['admin', 'centroCoordinador'].includes(user.role))) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="page-title mb-8">Configuración del Sistema</h1>
      <Card>
        <CardHeader>
          <CardTitle className="section-title flex items-center">
            <Settings className="mr-3 h-7 w-7 text-secondary" />
            Configurar Parámetros del Sistema
          </CardTitle>
          <CardDescription>
            Ajuste las configuraciones generales de la aplicación. Los cambios aquí son simulados y no persistirán.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="orgName">Nombre de la Organización</Label>
              <Input id="orgName" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Ej: Mi Organización de Salud" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria por Defecto</Label>
              <Select value={defaultTimezone} onValueChange={setDefaultTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Seleccionar zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Madrid">Europa/Madrid</SelectItem>
                  <SelectItem value="Europe/London">Europa/Londres</SelectItem>
                  <SelectItem value="America/New_York">América/Nueva York</SelectItem>
                  <SelectItem value="Etc/UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="historyDays">Días para Mantener Historial de Solicitudes</Label>
            <Input id="historyDays" type="number" value={requestHistoryDays} onChange={(e) => setRequestHistoryDays(parseInt(e.target.value) || 0)} placeholder="Ej: 90" />
            <p className="text-xs text-muted-foreground">Número de días que se conservará el historial de solicitudes completadas o canceladas.</p>
          </div>
          
          <div className="flex items-center space-x-3 rounded-md border p-4 shadow-sm">
            <Switch id="emailNotifs" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            <div className="space-y-0.5">
                <Label htmlFor="emailNotifs" className="text-base">Habilitar Notificaciones por Correo</Label>
                <p className="text-xs text-muted-foreground">
                    Permitir el envío de notificaciones importantes por correo electrónico a los usuarios.
                </p>
            </div>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button onClick={handleSaveChanges} disabled={isSaving} className="btn-primary">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
