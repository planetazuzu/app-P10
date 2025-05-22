
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ambulance, FileText, Users, Zap, MapIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// This component is created for the `card-stats` styling.
const StatsCard = ({ title, value, icon, description, link, linkText }: { title: string, value: string | number, icon: React.ReactNode, description?: string, link?: string, linkText?: string }) => (
  <Card className="card-stats">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-secondary">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      {link && linkText && (
        <Link href={link} passHref>
          <Button variant="link" className="px-0 pt-2 text-sm text-primary hover:text-primary/80">
            {linkText}
          </Button>
        </Link>
      )}
    </CardContent>
  </Card>
);


export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Cargando datos del usuario...</p>;
  }

  // Mock data for dashboard cards
  const stats = {
    activeAmbulances: 15,
    pendingRequests: 8,
    activeUsers: 120,
    averageResponseTime: '12 min',
    servicesTodayForEquipoMovil: 5, 
  };

  const canViewAmbulanceTracking = ['admin', 'hospital', 'centroCoordinador'].includes(user.role);
  const canViewSmartDispatch = ['admin', 'hospital', 'centroCoordinador'].includes(user.role);
  const canViewRequestManagement = ['admin', 'hospital', 'individual', 'centroCoordinador'].includes(user.role);
  const isEquipoMovil = user.role === 'equipoMovil';
  const isAdminOrCoordinator = ['admin', 'centroCoordinador'].includes(user.role);

  return (
    <div>
      <h1 className="page-title mb-8">¡Bienvenido, {user.name}!</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isEquipoMovil ? (
            <StatsCard
                title="Servicios de Hoy"
                value={stats.servicesTodayForEquipoMovil}
                icon={<MapIcon className="h-5 w-5 text-muted-foreground" />}
                description="Ruta asignada"
                link="/driver/batch-view/lote-demo-123" 
                linkText="Ver Mi Ruta"
            />
        ) : (
            <>
                <StatsCard 
                title="Ambulancias Activas" 
                value={stats.activeAmbulances}
                icon={<Ambulance className="h-5 w-5 text-muted-foreground" />}
                description="+2 desde la última hora"
                {...(canViewAmbulanceTracking && { link: "/ambulance-tracking", linkText: "Ver Mapa"})}
                />
                <StatsCard 
                title="Solicitudes Pendientes" 
                value={stats.pendingRequests}
                icon={<FileText className="h-5 w-5 text-muted-foreground" />}
                description="Prioridad alta: 3"
                {...(canViewRequestManagement && { link: "/request-management", linkText: "Gestionar Solicitudes"})}
                />
                 {isAdminOrCoordinator && (
                    <StatsCard 
                        title="Usuarios Activos" 
                        value={stats.activeUsers}
                        icon={<Users className="h-5 w-5 text-muted-foreground" />}
                        description="En todos los roles"
                        {...(user.role === 'admin' && { link: "/admin/user-management", linkText: "Gestionar Usuarios"})}
                    />
                    )}
                <StatsCard 
                title="Tiempo Medio Respuesta" 
                value={stats.averageResponseTime}
                icon={<Zap className="h-5 w-5 text-muted-foreground" />}
                description="Últimas 24 horas"
                {...(canViewSmartDispatch && { link: "/smart-dispatch", linkText: "Optimizar Despacho"})}
                />
            </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="section-title">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          { isEquipoMovil && (
             <Link href="/driver/batch-view/lote-demo-123" passHref>
                <Button className="w-full btn-primary">Ver Mi Ruta de Hoy</Button>
            </Link>
          )}
          { (user.role === 'individual' || user.role === 'hospital' || isAdminOrCoordinator) && (
            <Link href="/request-management/new" passHref>
              <Button className="w-full btn-primary">Crear Nueva Solicitud</Button>
            </Link>
          )}
          { canViewAmbulanceTracking && (
             <Link href="/ambulance-tracking" passHref>
                <Button className="w-full btn-secondary">Seguimiento de Ambulancias</Button>
            </Link>
          )}
          { canViewSmartDispatch && (
             <Link href="/smart-dispatch" passHref>
                <Button className="w-full btn-outline">Despacho Inteligente IA</Button>
            </Link>
          )}
           { isAdminOrCoordinator && (
             <Link href="/admin" passHref>
                <Button className="w-full btn-primary" variant="default">Panel de Administración</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for recent activity or notifications */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="section-title">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay actividad reciente para mostrar.</p>
        </CardContent>
      </Card>
    </div>
  );
}

    