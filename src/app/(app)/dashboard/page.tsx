
'use client';

import React from 'react'; 
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle, AlertTriangle, Users, Ambulance, Waypoints, Settings as SettingsIcon, ListChecks } from 'lucide-react';


// Componente de tarjeta KPI adaptado para el nuevo diseño
const KpiCard = ({ title, value, description, icon, iconColor }: { title: string, value: string | number, description?: string, icon: React.ReactNode, iconColor?: string }) => (
  <Card className="rioja-card p-4 flex flex-col justify-between"> {/* Adjusted padding for KPI cards */}
    <div>
      <div className="flex flex-row items-center justify-between space-y-0 pb-1">
        <h3 className="kpi-title">{title}</h3>
        {React.cloneElement(icon as React.ReactElement, { className: `h-5 w-5 ${iconColor || 'text-muted-foreground'}` })}
      </div>
      <div className="kpi-value">{value}</div>
    </div>
    {description && <p className="kpi-description pt-1">{description}</p>}
  </Card>
);

// Tarjeta de acción rápida adaptada
const ActionCard = ({ title, description, link, linkText, buttonVariant = "default" as "default" | "outline" }: { title: string, description: string, link: string, linkText: string, buttonVariant?: "default" | "outline" }) => (
  <Card className="rioja-card p-6 flex flex-col"> {/* Generous padding for action cards */}
    <CardHeader className="p-0 mb-3">
      <CardTitle className="section-title">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-0 flex-grow">
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
    </CardContent>
    <div className="mt-auto pt-3"> {/* Pushes button to bottom */}
      <Link href={link} passHref>
        <Button variant={buttonVariant} className="w-full"> 
          {linkText}
        </Button>
      </Link>
    </div>
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

  // Simulate dynamic data based on user for KPIs
  const getKpiStats = () => {
    if (user.role === 'individual') {
      return {
        pendingRequests: 1,
        inProgressRequests: 0,
        completedRequests: 3,
      };
    }
    if (user.role === 'ambulancia') {
      return {
        assignedServices: stats.assignedServices || 5, // Example
        nextStopTime: stats.nextStopTime || '10:30 AM',
        activeRouteId: stats.activeRouteId || 'lote-demo-123',
      };
    }
    // Default for admin, hospital, centroCoordinador
    return {
      pendingRequests: 8,
      inProgressRequests: 4,
      completedRequests: 125,
      activeAmbulances: 15,
      activeUsers: 120, // Only for admin/coord
    };
  };
  const stats = getKpiStats();


  const isAdminOrCoordinator = ['admin', 'centroCoordinador'].includes(user.role);
  const isProviderRole = ['admin', 'centroCoordinador', 'hospital'].includes(user.role);


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido, {user.name}</p>
      </div>
      
      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {user.role === 'ambulancia' ? (
          <>
            <KpiCard
              title="Servicios Asignados Hoy"
              value={stats.assignedServices || 0}
              description="Servicios en tu ruta actual"
              icon={<Icons.ClipboardList />}
              iconColor="text-blue-500"
            />
            <KpiCard
              title="Próxima Parada (Estimada)"
              value={stats.nextStopTime || 'N/A'}
              description="Hora estimada para tu siguiente parada"
              icon={<Clock />}
              iconColor="text-orange-500"
            />
            {/* Podemos añadir una tercera tarjeta aquí si es relevante, o dejarla con dos más anchas si usamos lg:grid-cols-2 */}
          </>
        ) : (
          <>
            <KpiCard
              title="Solicitudes Pendientes"
              value={stats.pendingRequests}
              description="Esperando asignación"
              icon={<Clock />}
              iconColor="text-yellow-500"
            />
            <KpiCard
              title="En Proceso"
              value={stats.inProgressRequests}
              description="Asignadas y en ruta"
              icon={<Icons.SmartDispatch />} 
              iconColor="text-blue-500"
            />
            <KpiCard
              title="Completadas"
              value={stats.completedRequests}
              description="Finalizadas correctamente"
              icon={<CheckCircle />}
              iconColor="text-green-500"
            />
            {isProviderRole && !isAdminOrCoordinator && ( // Specific for Hospital
                <KpiCard
                    title="Ambulancias Activas"
                    value={stats.activeAmbulances || 0}
                    description="Disponibles o en servicio"
                    icon={<Ambulance />}
                    iconColor="text-primary"
                />
            )}
          </>
        )}
      </div>

      {/* Action Cards Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {(user.role === 'individual' || isProviderRole) && (
            <ActionCard 
                title="Nueva Solicitud"
                description="Crear una nueva solicitud de transporte sanitario."
                link="/request-management/new-programmed" 
                linkText="Crear Solicitud"
                buttonVariant="default" 
            />
        )}
         {(user.role === 'individual' || isProviderRole) && (
            <ActionCard 
                title="Solicitudes"
                description="Ver y gestionar todas las solicitudes de transporte."
                link="/request-management"
                linkText="Ver Solicitudes"
                buttonVariant="outline" 
            />
        )}
        <ActionCard 
            title="Mensajes"
            description="Comunícate con los usuarios y el centro coordinador."
            link="/messages"
            linkText="Ver Mensajes"
            buttonVariant="outline"
        />
        {isAdminOrCoordinator && (
            <>
            <ActionCard
                title="Usuarios"
                description="Gestionar los usuarios del sistema y sus roles."
                link="/admin/user-management"
                linkText="Gestionar Usuarios"
                buttonVariant="outline"
            />
            <ActionCard
                title="Ambulancias"
                description="Gestionar la flota de vehículos disponibles."
                link="/admin/ambulances"
                linkText="Gestionar Ambulancias"
                buttonVariant="outline"
            />
            <ActionCard
                title="Lotes y Rutas"
                description="Crear, asignar y optimizar lotes de servicios."
                link="/admin/lotes"
                linkText="Gestionar Lotes"
                buttonVariant="outline"
            />
            </>
        )}
         {user.role === 'ambulancia' && (
            <ActionCard 
                title="Mi Ruta de Hoy"
                description="Ver detalles y gestionar las paradas de tu ruta asignada."
                link={`/driver/batch-view/${stats.activeRouteId || 'lote-demo-123'}`}
                linkText="Ver Mi Ruta"
                buttonVariant="default"
            />
        )}
      </div>


      {/* Solicitudes Recientes Section (Simplified) */}
      { (isProviderRole || user.role === 'individual') && (
      <Card className="rioja-card">
        <CardHeader>
          <CardTitle className="section-title">Solicitudes Recientes</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">No hay solicitudes recientes para mostrar. (Simulado)</p>
          <Link href="/request-management" passHref>
            <Button variant="outline">Ver todas las solicitudes</Button>
          </Link>
        </CardContent>
      </Card>
      )}

      {/* Bar Chart - Kept for Admin/Coordinator roles */}
      {isAdminOrCoordinator && (
        <Card className="rioja-card mt-6">
          <CardHeader>
            <CardTitle className="section-title">Rendimiento (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-0">
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
                <Bar dataKey="Solicitudes" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Total Solicitudes" />
                <Bar dataKey="Completadas" fill="hsl(var(--secondary))" radius={[3, 3, 0, 0]} name="Solicitudes Completadas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
