
'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_USERS } from '@/lib/auth';
import type { User, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit3, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Helper para traducir roles de usuario
const translateUserRole = (role: UserRole): string => {
  switch (role) {
    case 'admin': return 'Administrador';
    case 'hospital': return 'Personal Hospitalario';
    case 'individual': return 'Usuario Individual';
    case 'equipoTraslado': return 'Equipo de Traslado';
    default: return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // En una aplicación real, esto sería una llamada a una API
    setUsers(Object.values(MOCK_USERS));
  }, []);

  const handleEditUser = (userId: string) => {
    toast({ title: 'Editar Usuario (Próximamente)', description: `Funcionalidad para editar el usuario ${userId} aún no implementada.` });
    // router.push(`/admin/user-management/${userId}/edit`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    // Simulación de eliminación
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast({ title: 'Usuario Eliminado (Simulado)', description: `El usuario "${userName}" ha sido eliminado de la lista.` });
    // En una aplicación real, se haría una llamada a la API para eliminar el usuario
  };

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
        <Button disabled className="btn-primary">
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Usuario (Próximamente)
        </Button>
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
                            <DropdownMenuItem onClick={() => handleEditUser(user.id)} disabled>
                              <Edit3 className="mr-2 h-4 w-4" /> Editar (Próximamente)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id, user.name)} className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled>
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
