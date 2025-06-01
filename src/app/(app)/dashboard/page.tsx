
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Componente de tarjeta KPI adaptado para usar la nueva clase rioja-card
const StatsCard = ({ title, value, icon, description, link, linkText, cardClassName }: { title: string, value: string | number, icon: React.ReactNode, description?: string, link?: string, linkText?: string, cardClassName?: string }) => (
  <Card className={`rioja-card ${cardClassName || ''}`}> {/* Aplicar clase rioja-card */}
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-2">
      <CardTitle className="text-sm font-medium text-secondary">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent className="p-0">
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

// Datos de ejemplo para el gráfico de barras
const barChartData = [
  { name: 'Ene', Solicitudes: 400, Completadas: 240 },
  { name: 'Feb', Solicitudes: 300, Completadas: 139 },
  { name: 'Mar', Solicitudes: 200, Completadas: 380 },
  { name: 'Abr', Solicitudes: 278, Completadas: 190 },
  { name: 'May', Solicitudes: 189, Completadas: 280 },
  { name: 'Jun', Solicitudes: 239, Completadas: 150 },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Cargando datos del usuario...</p>;
  }

  const stats = {
    activeAmbulances: 15,
    pendingRequests: 8,
    activeUsers: 120,
    averageResponseTime: '12 min',
    servicesTodayForEquipoMovil: 5,
    individualPendingRequests: 1,
    individualInProgressRequests: 0,
  };

  const canViewAmbulanceTracking = ['admin', 'hospital', 'centroCoordinador'].includes(user.role);
  const canViewSmartDispatch = ['admin', 'hospital', 'centroCoordinador'].includes(user.role);
  const canViewRequestManagement = ['admin', 'hospital', 'individual', 'centroCoordinador'].includes(user.role);
  const isEquipoMovil = user.role === 'equipoMovil';
  const isAdminOrCoordinator = ['admin', 'centroCoordinador'].includes(user.role);
  const isIndividual = user.role === 'individual';

  return (
    <div>
      <h1 className="page-title mb-6">¡Bienvenido, {user.name}!</h1>
      
      {isIndividual ? (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <StatsCard
            title="Estado de Mis Solicitudes"
            value={`${stats.individualPendingRequests} Pendiente(s), ${stats.individualInProgressRequests} En Curso`}
            icon={<Icons.ListChecks className="h-5 w-5 text-muted-foreground" />}
            description="Revisa el estado de tus transportes solicitados."
            link="/request-management"
            linkText="Ver Mis Solicitudes"
            cardClassName="bg-card" // Asegura fondo gris claro de tarjeta
          />
        </div>
      ) : isEquipoMovil ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
                title="Servicios de Hoy"
                value={stats.servicesTodayForEquipoMovil}
                icon={<Icons.MapIcon className="h-5 w-5 text-muted-foreground" />}
                description="Ruta asignada"
                link="/driver/batch-view/lote-demo-123" 
                linkText="Ver Mi Ruta"
                cardClassName="bg-card"
            />
        </div>
      ) : (
        // Vista para Admin, Hospital, CentroCoordinador
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard 
              title="Ambulancias Activas" 
              value={stats.activeAmbulances}
              icon={<Icons.Ambulance className="h-5 w-5 text-muted-foreground" />}
              description="+2 desde la última hora"
              {...(canViewAmbulanceTracking && { link: "/ambulance-tracking", linkText: "Ver Mapa"})}
              cardClassName="bg-card"
            />
            <StatsCard 
              title="Solicitudes Pendientes" 
              value={stats.pendingRequests}
              icon={<Icons.FileText className="h-5 w-5 text-muted-foreground" />}
              description="Prioridad alta: 3"
              {...(canViewRequestManagement && { link: "/request-management", linkText: "Gestionar Solicitudes"})}
              cardClassName="bg-card"
            />
            {isAdminOrCoordinator && (
                <StatsCard 
                    title="Usuarios Activos" 
                    value={stats.activeUsers}
                    icon={<Icons.Users className="h-5 w-5 text-muted-foreground" />}
                    description="En todos los roles"
                    {...(user.role === 'admin' && { link: "/admin/user-management", linkText: "Gestionar Usuarios"})}
                    cardClassName="bg-card"
                />
            )}
            {user.role === 'admin' && (
               <StatsCard 
                title="Tiempo Medio Respuesta" 
                value={stats.averageResponseTime}
                icon={<Icons.SmartDispatch className="h-5 w-5 text-muted-foreground" />}
                description="Últimas 24 horas"
                {...(canViewSmartDispatch && { link: "/smart-dispatch", linkText: "Optimizar Despacho"})}
                cardClassName="bg-card"
                />
            )}
        </div>
      )}

      {/* Sección de Gráfico de Barras */}
      {!isIndividual && !isEquipoMovil && (
        <Card className="rioja-card mb-6">
          <CardHeader className="p-0 mb-3">
            <CardTitle className="section-title">Rendimiento de Solicitudes (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Solicitudes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Solicitudes" />
                <Bar dataKey="Completadas" fill="hsl(var(--emphasis))" radius={[4, 4, 0, 0]} name="Solicitudes Completadas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="rioja-card"> {/* Aplicar clase rioja-card */}
        <CardHeader className="p-0 mb-3">
          <CardTitle className="section-title">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-0">
          { isEquipoMovil && (
             <Link href="/driver/batch-view/lote-demo-123" passHref>
                <Button className="w-full rioja-button-primary">Ver Mi Ruta de Hoy</Button>
            </Link>
          )}
          { (isIndividual || user.role === 'hospital' || isAdminOrCoordinator) && (
            <Link href="/request-management/new-programmed" passHref> {/* Cambiado a nueva solicitud programada como ejemplo */}
              <Button className="w-full rioja-button-primary">Crear Nueva Solicitud</Button>
            </Link>
          )}
          { canViewAmbulanceTracking && !isIndividual && (
             <Link href="/ambulance-tracking" passHref>
                <Button className="w-full rioja-button-secondary">Seguimiento de Ambulancias</Button>
            </Link>
          )}
          { canViewSmartDispatch && !isIndividual && (
             <Link href="/smart-dispatch" passHref>
                <Button className="w-full rioja-button-outline">Despacho Inteligente IA</Button>
            </Link>
          )}
           { isAdminOrCoordinator && (
             <Link href="/admin" passHref>
                <Button className="w-full rioja-button-primary" variant="default">Panel de Administración</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {!isIndividual && (
        <Card className="rioja-card mt-6"> {/* Aplicar clase rioja-card */}
            <CardHeader className="p-0 mb-3">
            <CardTitle className="section-title">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
            <p className="text-muted-foreground">No hay actividad reciente para mostrar.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
