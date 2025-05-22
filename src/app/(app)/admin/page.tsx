
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, Settings, Ambulance } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
    <div>
      <h1 className="page-title mb-8">Panel de Administración</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <CardTitle className="section-title">Administración del Sistema</CardTitle>
          </div>
          <CardDescription>Gestionar usuarios, configuraciones del sistema, ambulancias y monitorear la salud de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="card-stats border-secondary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Users className="text-secondary"/>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ver, agregar o modificar cuentas de usuario y roles.
              </p>
              <Link href="/admin/user-management" passHref>
                <Button variant="secondary">Gestionar Usuarios</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="card-stats border-secondary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Ambulance className="text-secondary"/>Gestión de Ambulancias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Añadir, ver y editar las unidades de ambulancia del sistema.
              </p>
              <Link href="/admin/ambulances" passHref>
                 <Button variant="secondary">Gestionar Ambulancias</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="card-stats border-secondary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Settings className="text-secondary"/>Configuración del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configurar parámetros de la aplicación e integraciones. (Funcionalidad en desarrollo)
              </p>
               <Link href="/admin/system-settings" passHref>
                <Button variant="outline" disabled>Configurar Ajustes</Button>
              </Link>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

