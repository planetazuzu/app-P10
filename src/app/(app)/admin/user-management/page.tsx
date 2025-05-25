
'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_USERS } from '@/lib/auth'; 
import type { User, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, PlusCircle, Edit3, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

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

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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
      // Simular carga de datos para ver el skeleton
      // En una app real, aquí iría la llamada para obtener los usuarios
      // y se establecería un estado de carga específico.
      // Por ahora, usamos authIsLoading para simularlo.
      if (!authIsLoading) {
        setUsers(Object.values(MOCK_USERS).sort((a, b) => a.name.localeCompare(b.name)));
      }
    }
  }, [currentUser, authIsLoading]); 

  const openDeleteConfirmDialog = (user: User) => {
    if (currentUser?.id === user.id) {
        toast({ title: 'Acción no Permitida', description: 'No puede eliminarse a sí mismo.', variant: 'destructive' });
        return;
    }
    if (user.email === 'admin@gmr.com') {
        toast({ title: 'Acción no Permitida', description: 'La cuenta principal de administrador no puede ser eliminada.', variant: 'destructive' });
        return;
    }
    setUserToDelete(user);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;

    // Simulate deletion for UI.
    delete MOCK_USERS[Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].id === userToDelete.id) || ''];
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
    toast({ title: 'Usuario Eliminado (Simulado)', description: `El usuario "${userToDelete.name}" ha sido eliminado de la lista (simulación).` });
    
    setUserToDelete(null);
    setIsConfirmDeleteDialogOpen(false);
  };

  if (authIsLoading || (!currentUser || !['admin', 'centroCoordinador'].includes(currentUser.role))) {
    return (
      <div className="rioja-container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-10 w-64" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-6 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <TableRow key={i} className="flex items-center space-x-4 p-2">
                  <TableCell className="w-1/4 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                  <TableCell className="w-1/4 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                  <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                  <TableCell className="w-1/6 p-0"><Skeleton className="h-8 w-full" /></TableCell>
                  <TableCell className="w-1/12 p-0 text-right"><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))}
            </div>
          </CardContent>
        </Card>
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
          {users.length === 0 && !authIsLoading ? ( // Asegura no mostrar "no hay usuarios" mientras aún podría estar cargando
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
                                <Link href={`/admin/user-management/${user.id}/edit`} className="flex items-center cursor-pointer">
                                  <Edit3 className="mr-2 h-4 w-4" /> Editar
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteConfirmDialog(user)} 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                              disabled={user.id === currentUser.id || user.email === 'admin@gmr.com'}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
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

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar al usuario "{userToDelete?.name || ''}"? 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
