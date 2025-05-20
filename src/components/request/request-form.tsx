
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
import { createRequest } from '@/lib/request-data';
import type { AmbulanceRequest } from '@/types'; // Actualizado a AmbulanceRequest
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

const requestFormSchema = z.object({
  patientDetails: z.string().min(10, { message: 'Los detalles del paciente deben tener al menos 10 caracteres.' }),
  address: z.string().min(5, { message: 'La dirección debe tener al menos 5 caracteres.' }),
  // For simplicity, latitude and longitude will be auto-generated or fixed in mock
  priority: z.enum(['low', 'medium', 'high'], { required_error: 'La prioridad es obligatoria.' }),
  notes: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface RequestFormProps {
  onFormSubmit?: () => void; // Callback after successful submission
  mode?: 'create' | 'edit';
  initialData?: Partial<AmbulanceRequest>; // Actualizado a AmbulanceRequest
}

export function RequestForm({ onFormSubmit, mode = 'create', initialData }: RequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      patientDetails: initialData?.patientDetails || '',
      address: initialData?.location?.address || '',
      priority: initialData?.priority || 'medium',
      notes: initialData?.notes || '',
    },
  });

  async function onSubmit(values: RequestFormValues) {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debe iniciar sesión para crear una solicitud.", variant: "destructive"});
      return;
    }

    // Mock latitude and longitude
    const mockLocation = {
      latitude: 34.0522 + (Math.random() - 0.5) * 0.1,
      longitude: -118.2437 + (Math.random() - 0.5) * 0.1,
      address: values.address,
    };

    const requestData: Omit<AmbulanceRequest, 'id' | 'createdAt' | 'updatedAt'> = { // Actualizado a AmbulanceRequest
      requesterId: user.id,
      patientDetails: values.patientDetails,
      location: mockLocation,
      status: 'pending',
      priority: values.priority,
      notes: values.notes,
    };
    
    try {
      await createRequest(requestData);
      toast({ title: "Solicitud Enviada", description: "Su solicitud de ambulancia ha sido enviada exitosamente."});
      form.reset();
      if (onFormSubmit) {
        onFormSubmit();
      } else {
        router.push('/request-management'); // Default redirect
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      toast({ title: "Envío Fallido", description: "No se pudo enviar su solicitud. Por favor, inténtelo de nuevo.", variant: "destructive"});
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="section-title">{mode === 'create' ? 'Enviar Nueva Solicitud de Ambulancia' : 'Editar Solicitud de Ambulancia'}</CardTitle>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (mode === 'create' ? 'Enviando...' : 'Actualizando...') : (mode === 'create' ? 'Enviar Solicitud' : 'Guardar Cambios')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
