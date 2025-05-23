
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { createRequest, updateSimpleRequest } from '@/lib/request-data';
import type { AmbulanceRequest } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const requestFormSchema = z.object({
  patientDetails: z.string().min(10, { message: 'Los detalles del paciente deben tener al menos 10 caracteres.' }),
  address: z.string().min(5, { message: 'La dirección debe tener al menos 5 caracteres.' }),
  priority: z.enum(['low', 'medium', 'high'], { required_error: 'La prioridad es obligatoria.' }),
  notes: z.string().optional(),
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;

interface RequestFormProps {
  onFormSubmit?: () => void;
  mode?: 'create' | 'edit';
  initialData?: AmbulanceRequest;
  requestId?: string;
}

export function RequestForm({ onFormSubmit, mode = 'create', initialData, requestId }: RequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      patientDetails: '',
      address: '',
      priority: 'medium',
      notes: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        patientDetails: initialData.patientDetails || '',
        address: initialData.location?.address || '',
        priority: initialData.priority || 'medium',
        notes: initialData.notes || '',
      });
    }
  }, [mode, initialData, form]);

  async function onSubmit(values: RequestFormValues) {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debe iniciar sesión para continuar.", variant: "destructive"});
      return;
    }

    const dataPayload = {
      patientDetails: values.patientDetails,
      location: { 
        // For edit, we might want to preserve existing coords if address doesn't change significantly
        // For simplicity, we'll use new mock coords on edit too if address changes, or keep old if not.
        latitude: initialData?.location.latitude || (34.0522 + (Math.random() - 0.5) * 0.1),
        longitude: initialData?.location.longitude || (-118.2437 + (Math.random() - 0.5) * 0.1),
        address: values.address,
      },
      priority: values.priority,
      notes: values.notes,
    };
    
    try {
      if (mode === 'create') {
        const requestData: Omit<AmbulanceRequest, 'id' | 'createdAt' | 'updatedAt'> = {
          ...dataPayload,
          requesterId: user.id,
          status: 'pending',
        };
        await createRequest(requestData);
        toast({ title: "Solicitud Enviada", description: "Su solicitud de ambulancia ha sido enviada exitosamente."});
      } else if (mode === 'edit' && requestId) {
        // Ensure that the location object has all required fields if it's being updated.
        // For this simulation, we're passing the whole dataPayload which includes location.
        await updateSimpleRequest(requestId, dataPayload);
        toast({ title: "Solicitud Actualizada", description: "La solicitud de ambulancia ha sido actualizada."});
      }
      
      form.reset();
      if (onFormSubmit) {
        onFormSubmit();
      } else {
        router.push('/request-management');
      }
    } catch (error) {
      console.error(`Error al ${mode === 'create' ? 'enviar' : 'actualizar'} la solicitud:`, error);
      toast({ title: "Operación Fallida", description: `No se pudo ${mode === 'create' ? 'enviar' : 'actualizar'} su solicitud. Por favor, inténtelo de nuevo.`, variant: "destructive"});
    }
  }

  const cardTitle = mode === 'create' ? 'Enviar Nueva Solicitud de Ambulancia' : `Editar Solicitud: ${requestId?.substring(0,8) || ''}...`;
  const buttonText = mode === 'create' ? 'Enviar Solicitud' : 'Guardar Cambios';
  const submittingButtonText = mode === 'create' ? 'Enviando...' : 'Guardando...';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="section-title">{cardTitle}</CardTitle>
        <UiCardDescription>Complete los detalles a continuación. Todos los campos marcados con * son obligatorios.</UiCardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalles del Paciente *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describa la condición del paciente, edad, género, si es un traslado programado, etc." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección de Origen *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Calle Principal 123, Ciudad, País" {...field} />
                  </FormControl>
                  <FormDescription>Proporcione la dirección completa donde se recogerá al paciente.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el nivel de prioridad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Baja (Programado)</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta (Urgente)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Cualquier otra información relevante (ej: códigos de acceso, peligros, detalles del destino para programados)." {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
                 <Button type="button" variant="outline" onClick={() => router.push('/request-management')}>
                    Cancelar
                </Button>
                <Button type="submit" className="btn-primary" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? submittingButtonText : buttonText}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
