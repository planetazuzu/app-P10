
'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_USERS } from '@/lib/auth';
import type { User, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit3, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

// Helper para traducir roles de usuario
const translateUserRole = (role: UserRole): string => {
  switch (role) {
    case 'admin': return 'Administrador';
    case 'hospital': return 'Personal Hospitalario';
    case 'individual': return 'Usuario Individual';
    case 'centroCoordinador': return 'Centro Coordinador';
    case 'equipoMovil': return 'Equipo Móvil (Vehículo)';
    default: return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const { user: currentUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && currentUser && !['admin', 'centroCoordinador'].includes(currentUser.role)) {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para acceder a esta sección.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
    }
  }, [currentUser, authIsLoading, router, toast]);

  useEffect(() => {
    if (currentUser && ['admin', 'centroCoordinador'].includes(currentUser.role)) {
      setUsers(Object.values(MOCK_USERS).sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, [currentUser]); 

  const handleDeleteUser = (userId: string, userName: string) => {
    // Simulate deletion for UI. In a real app, this would be an API call.
    // For now, we'll just filter the local state.
    if (currentUser?.id === userId) {
        toast({ title: 'Acción no Permitida', description: 'No puede eliminarse a sí mismo.', variant: 'destructive' });
        return;
    }
    // This won't actually delete from MOCK_USERS as it's re-read on each load.
    // In a real app, you'd call an API and then re-fetch or update state.
    delete MOCK_USERS[Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].id === userId) || ''];
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast({ title: 'Usuario Eliminado (Simulado)', description: `El usuario "${userName}" ha sido eliminado de la lista (simulación).` });
  };

  if (authIsLoading || (!currentUser || !['admin', 'centroCoordinador'].includes(currentUser.role))) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rioja-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <Link href="/admin" passHref>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <h1 className="page-title">Gestión de Usuarios</h1>
        </div>
        <Link href="/admin/user-management/new" passHref>
          <Button className="btn-primary">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Usuario
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="section-title">Listado de Usuarios del Sistema</CardTitle>
          <CardDescription>
            Ver y administrar las cuentas de usuario, roles y permisos de la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay usuarios para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo Electrónico</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>ID de Usuario</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{translateUserRole(user.role)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{user.id}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/user-management/${user.id}/edit`} className="flex items-center">
                                  <Edit3 className="mr-2 h-4 w-4" /> Editar
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id, user.name)} 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              disabled={user.id === currentUser.id || user.email === 'admin@gmr.com'} // Prevent self-deletion and main admin deletion
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar (Próximamente)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
