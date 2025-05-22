
'use client';

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
import { UserFormSchema, type UserFormValues, ALL_USER_ROLES, type UserRole } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { mockAddUser } from '@/lib/auth'; // Assuming mockAddUser will be created
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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

export function UserForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'individual', // Default role
      password: '',
      confirmPassword: '',
    },
  });

  const [isSaving, setIsSaving] = React.useState(false);

  async function onSubmit(values: UserFormValues) {
    setIsSaving(true);
    try {
      // Simulate saving the user
      // In a real app, this would be an API call.
      // We'll use mockAddUser for this simulation.
      const newUser = mockAddUser({ 
        name: values.name, 
        email: values.email, 
        role: values.role,
        password: values.password, // password won't be stored plain text in real app
      }); 
      
      console.log("Nuevo usuario simulado:", newUser);

      toast({
        title: "Usuario Creado",
        description: `El usuario "${values.name}" ha sido creado exitosamente.`,
      });
      form.reset();
      router.push('/admin/user-management'); // Redirect to the user list
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      toast({
        title: "Error al Crear Usuario",
        description: "No se pudo crear el usuario. Inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
        setIsSaving(false);
    }
  }

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
                <CardTitle className="section-title">Añadir Nuevo Usuario</CardTitle>
            </div>
        </div>
        <UiCardDescription>
          Complete la información para registrar un nuevo usuario en el sistema.
          Todos los campos marcados con <span className="text-red-500">*</span> son obligatorios.
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
                      <Input type="email" placeholder="usuario@example.com" {...field} />
                    </FormControl>
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
                    <FormLabel>Contraseña <span className="text-red-500">*</span></FormLabel>
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
                    <FormLabel>Confirmar Contraseña <span className="text-red-500">*</span></FormLabel>
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
                    {isSaving ? 'Guardando...' : 'Guardar Usuario'}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
