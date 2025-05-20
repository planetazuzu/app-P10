'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Image from 'next/image';

export default function UserManagementPage() {
  return (
    <div>
      <h1 className="page-title mb-8">Gestión de Usuarios</h1>
      <Card>
        <CardHeader>
          <CardTitle className="section-title">Gestionar Usuarios de la Plataforma</CardTitle>
          <CardDescription>
            Esta sección permitirá a los administradores agregar, editar y eliminar usuarios, así como gestionar sus roles y permisos. Esta funcionalidad está actualmente en desarrollo.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="relative w-full max-w-md mx-auto h-64">
                 <Image 
                    src="https://placehold.co/600x400.png"
                    alt="Gestión de Usuarios en Desarrollo" 
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="team collaboration"
                />
            </div>
          <Users className="mx-auto h-16 w-16 text-primary/30 mt-8" />
          <p className="mt-4 text-lg font-semibold text-muted-foreground">
            ¡Gestión de Usuarios Próximamente!
          </p>
          <p className="text-muted-foreground">
            Manténgase atento a las potentes herramientas de administración de usuarios.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
