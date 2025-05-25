
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, Loader2, Save, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SystemConfig, SystemConfigFormValues } from '@/types';
import { SystemConfigSchema } from '@/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getSystemConfig, updateSystemConfig, getFirstSystemConfig } from '@/lib/config-data';

export default function SystemSettingsPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [initialConfigId, setInitialConfigId] = useState<string | undefined>(undefined);

  const form = useForm<SystemConfigFormValues>({
    resolver: zodResolver(SystemConfigSchema),
    defaultValues: {
      organizationName: '',
      defaultTimezone: 'Europe/Madrid',
      emailNotificationsEnabled: true,
      requestHistoryDays: 90,
    },
  });

  useEffect(() => {
    if (!authIsLoading && user && !['admin', 'centroCoordinador'].includes(user.role)) {
      toast({
        title: 'Acceso Denegado',
        description: 'No tiene permisos para acceder a esta sección.',
        variant: 'destructive',
      });
      router.replace('/dashboard');
    }
  }, [user, authIsLoading, router, toast]);

  useEffect(() => {
    async function loadConfig() {
      if (user && ['admin', 'centroCoordinador'].includes(user.role)) {
        setIsFetchingConfig(true);
        try {
          // Intentar obtener la primera configuración. Asumimos que hay una o ninguna.
          const config = await getFirstSystemConfig();
          if (config) {
            form.reset(config); // Rellenar el formulario con los datos de NocoDB
            setInitialConfigId(config.id); // Guardar el ID para la actualización
          } else {
            // Si no hay config, el formulario mantendrá los defaultValues,
            // y al guardar se intentará crear una nueva (ver lógica en updateSystemConfig)
            toast({
                title: "Configuración Inicial",
                description: "No se encontró configuración previa. Puede rellenar y guardar para crearla.",
                variant: "default",
            });
          }
        } catch (error) {
          toast({
            title: 'Error al Cargar Configuración',
            description: 'No se pudieron obtener los ajustes del sistema desde NocoDB.',
            variant: 'destructive',
          });
        } finally {
          setIsFetchingConfig(false);
        }
      }
    }
    loadConfig();
  }, [user, form, toast]);


  async function onSubmit(values: SystemConfigFormValues) {
    setIsSaving(true);
    toast({
        title: 'Guardando Configuración...',
        description: 'Los cambios se están procesando y enviando a NocoDB.',
    });

    try {
        const configToSave: SystemConfig = {
            ...values,
            id: initialConfigId, // Pasa el ID si estamos actualizando un registro existente.
                                // La función updateSystemConfig en NocoDB debería manejar la creación si el ID no existe
                                // o si el backend prefiere que el ID no se pase en la creación.
        };
        const updatedConfig = await updateSystemConfig(configToSave);
        if (updatedConfig) {
            toast({
                title: 'Configuración Guardada',
                description: 'Los ajustes del sistema han sido actualizados en NocoDB.',
            });
            form.reset(updatedConfig); // Actualizar el formulario con los datos devueltos (puede incluir nuevo ID o updatedAt)
            setInitialConfigId(updatedConfig.id);
        } else {
            throw new Error("La actualización no devolvió una configuración.");
        }
    } catch (error) {
        console.error("Error al guardar configuración:", error);
        toast({
            title: 'Error al Guardar',
            description: 'No se pudo guardar la configuración en NocoDB. Verifique la consola.',
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
  }

  if (authIsLoading || isFetchingConfig) {
    return (
      <div className="rioja-container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">
            {authIsLoading ? "Verificando acceso..." : "Cargando configuración del sistema..."}
        </p>
      </div>
    );
  }

  if (!user || !['admin', 'centroCoordinador'].includes(user.role)) {
    // Esto es un fallback, el useEffect ya debería haber redirigido.
    return (
        <div className="rioja-container text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-2" />
            <p className="text-lg text-destructive">Acceso Denegado.</p>
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
            <h1 className="page-title">Configuración del Sistema</h1>
        </div>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="section-title flex items-center">
                <Settings className="mr-3 h-7 w-7 text-secondary" />
                Configurar Parámetros del Sistema
              </CardTitle>
              <UiCardDescription>
                Ajuste las configuraciones generales de la aplicación. Los cambios se guardarán en NocoDB.
                Si es la primera vez, se creará un registro de configuración.
              </UiCardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Organización</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Mi Organización de Salud" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultTimezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona Horaria por Defecto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar zona horaria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Europe/Madrid">Europa/Madrid</SelectItem>
                          <SelectItem value="Europe/London">Europa/Londres</SelectItem>
                          <SelectItem value="America/New_York">América/Nueva York</SelectItem>
                          <SelectItem value="Etc/UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="requestHistoryDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días para Mantener Historial de Solicitudes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 90"
                        {...field}
                        onChange={event => field.onChange(+event.target.value)} // Convert to number
                      />
                    </FormControl>
                    <FormDescription>
                      Número de días que se conservará el historial de solicitudes completadas o canceladas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Habilitar Notificaciones por Correo</FormLabel>
                      <FormDescription>
                        Permitir el envío de notificaciones importantes por correo electrónico a los usuarios.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end mt-8">
                <Button type="submit" disabled={isSaving || isFetchingConfig} className="btn-primary">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios en NocoDB
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
