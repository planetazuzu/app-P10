'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, Settings } from 'lucide-react';
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
          <CardDescription>Gestionar usuarios, configuraciones del sistema y monitorear la salud de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <Card className="card-stats border-secondary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Users className="text-secondary"/>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ver, agregar o modificar cuentas de usuario y roles. (Funcionalidad en desarrollo)
              </p>
              <Button variant="secondary" disabled>Gestionar Usuarios</Button>
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
              <Button variant="outline" disabled>Configurar Ajustes</Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
