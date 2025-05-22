
'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { UserCreateFormSchema, UserEditFormSchema, type UserFormValues, type UserCreateFormValues, type UserEditFormValues, ALL_USER_ROLES, type UserRole, type User } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { mockAddUser, mockUpdateUser } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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

interface UserFormProps {
  mode: 'create' | 'edit';
  initialData?: User; // Use User interface for initial data consistency
  userId?: string;
}

export function UserForm({ mode, initialData, userId }: UserFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const formSchema = mode === 'create' ? UserCreateFormSchema : UserEditFormSchema;

  const defaultValues: Partial<UserFormValues> = mode === 'create' 
    ? { name: '', email: '', role: 'individual', password: '', confirmPassword: '' }
    : { 
        name: initialData?.name || '', 
        email: initialData?.email || '', 
        role: initialData?.role || 'individual', 
        password: '', // Passwords are not pre-filled for editing
        confirmPassword: '' 
      };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [isSaving, setIsSaving] = React.useState(false);

  async function onSubmit(values: UserFormValues) {
    setIsSaving(true);
    try {
      if (mode === 'create') {
        const createValues = values as UserCreateFormValues;
        mockAddUser({ 
          name: createValues.name, 
          email: createValues.email, 
          role: createValues.role,
          password: createValues.password,
        });
        toast({
          title: "Usuario Creado",
          description: `El usuario "${createValues.name}" ha sido creado exitosamente.`,
        });
      } else if (mode === 'edit' && userId) {
        const editValues = values as UserEditFormValues;
        mockUpdateUser(userId, editValues);
        toast({
          title: "Usuario Actualizado",
          description: `El usuario "${editValues.name}" ha sido actualizado exitosamente.`,
        });
      }
      form.reset(defaultValues); // Reset to defaults or new initial data if applicable
      router.push('/admin/user-management'); 
    } catch (error) {
      console.error(`Error al ${mode === 'create' ? 'crear' : 'actualizar'} el usuario:`, error);
      toast({
        title: `Error al ${mode === 'create' ? 'Crear' : 'Actualizar'} Usuario`,
        description: `No se pudo ${mode === 'create' ? 'crear' : 'actualizar'} el usuario. Inténtelo de nuevo.`,
        variant: "destructive",
      });
    } finally {
        setIsSaving(false);
    }
  }

  const title = mode === 'create' ? 'Añadir Nuevo Usuario' : `Editar Usuario: ${initialData?.name || ''}`;
  const buttonText = mode === 'create' ? 'Guardar Usuario' : 'Guardar Cambios';
  const savingButtonText = mode === 'create' ? 'Guardando...' : 'Guardando Cambios...';

  return (
    <Card className="w-full">
      <CardHeader>
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <Link href="/admin/user-management" passHref>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <CardTitle className="section-title">{title}</CardTitle>
            </div>
        </div>
        <UiCardDescription>
          {mode === 'create' 
            ? 'Complete la información para registrar un nuevo usuario en el sistema.' 
            : 'Modifique la información del usuario. Para la contraseña, déjela en blanco si no desea cambiarla.'}
          Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
        </UiCardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="usuario@example.com" 
                        {...field} 
                        disabled={mode === 'edit'} // Email typically non-editable or handled with care
                      />
                    </FormControl>
                    {mode === 'edit' && <FormDescription>El correo electrónico (ID de usuario) no se puede cambiar.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol para el usuario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_USER_ROLES.map(role => (
                        <SelectItem key={role} value={role}>
                          {translateUserRole(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    El rol determina los permisos del usuario en la aplicación.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                        Contraseña 
                        {mode === 'create' && <span className="text-red-500"> *</span>}
                        {mode === 'edit' && <span className="text-xs text-muted-foreground"> (dejar en blanco para no cambiar)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel>
                        Confirmar Contraseña 
                        {mode === 'create' && <span className="text-red-500"> *</span>}
                         {mode === 'edit' && <span className="text-xs text-muted-foreground"> (dejar en blanco para no cambiar)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/user-management')}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="btn-primary">
                    {isSaving ? savingButtonText : buttonText}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
