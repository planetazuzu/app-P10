
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, Settings, Ambulance, Waypoints, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


export default function AdminPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authIsLoading && user && !['admin', 'centroCoordinador'].includes(user.role)) {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para acceder al panel de administración.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
    }
  }, [user, authIsLoading, router, toast]);

  if (authIsLoading || (!user || !['admin', 'centroCoordinador'].includes(user.role))) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title mb-8">Panel de Administración</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <CardTitle>Administración del Sistema</CardTitle>
          </div>
          <CardDescription>Gestionar usuarios, configuraciones del sistema, ambulancias, lotes, rutas y monitorear la salud de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card> {/* Removed card-stats and border-secondary, will use default rioja-card style */}
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Users className="text-secondary"/>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ver, agregar o modificar cuentas de usuario y roles.
              </p>
              <Link href="/admin/user-management" passHref>
                <Button className="btn-secondary">Gestionar Usuarios</Button>
              </Link>
            </CardContent>
          </Card>
          <Card> {/* Removed card-stats and border-secondary */}
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Ambulance className="text-secondary"/>Gestión de Ambulancias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Añadir, ver y editar las unidades de ambulancia del sistema.
              </p>
              <Link href="/admin/ambulances" passHref>
                 <Button className="btn-secondary">Gestionar Ambulancias</Button>
              </Link>
            </CardContent>
          </Card>
           <Card> {/* Removed card-stats and border-secondary */}
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Waypoints className="text-secondary"/>Gestión de Lotes y Rutas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Crear y asignar lotes de servicios programados, y optimizar rutas.
              </p>
              <Link href="/admin/lotes" passHref>
                 <Button className="btn-secondary">Gestionar Lotes</Button>
              </Link>
            </CardContent>
          </Card>
          <Card> {/* Removed card-stats and border-secondary */}
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Settings className="text-secondary"/>Configuración del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configurar parámetros de la aplicación e integraciones. (Funcionalidad en desarrollo)
              </p>
               <Link href="/admin/system-settings" passHref>
                <Button className="btn-outline" disabled>Configurar Ajustes</Button>
              </Link>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
