
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { planDispatchForBatch, PlanDispatchForBatchInput, PlanDispatchForBatchOutput } from '@/ai/flows/plan-dispatch-for-batch';
import { getAmbulanceLocationsForAI, getVehicleAvailabilityForAI } from '@/lib/ambulance-data';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  servicesDescription: z.string().min(20, { message: 'La descripción del lote de servicios debe tener al menos 20 caracteres.' }),
  trafficConditions: z.string().min(5, { message: 'Las condiciones del tráfico deben tener al menos 5 caracteres.' }),
  weatherConditions: z.string().min(5, { message: 'Las condiciones climáticas deben tener al menos 5 caracteres.' }),
});

type DispatchFormValues = z.infer<typeof formSchema>;

interface DispatchFormProps {
  onSuggestion: (suggestion: PlanDispatchForBatchOutput | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export function DispatchForm({ onSuggestion, setIsLoading }: DispatchFormProps) {
  const { toast } = useToast();
  const form = useForm<DispatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      servicesDescription: '',
      trafficConditions: 'Normal',
      weatherConditions: 'Despejado',
    },
  });

  async function onSubmit(values: DispatchFormValues) {
    setIsLoading(true);
    onSuggestion(null); 
    try {
      const aiInput: PlanDispatchForBatchInput = {
        ...values,
        ambulanceLocations: getAmbulanceLocationsForAI(),
        vehicleAvailability: getVehicleAvailabilityForAI(),
      };
      const result = await planDispatchForBatch(aiInput);
      onSuggestion(result);
      toast({ title: "Plan de Despacho IA Listo", description: "La IA ha proporcionado una planificación para el lote de servicios." });
    } catch (error) {
      console.error('Error al obtener el plan de despacho:', error);
      onSuggestion(null);
      toast({ title: "Error", description: "No se pudo obtener la planificación de despacho.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="section-title">Entrada para Planificación de Lote</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="servicesDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Lote de Servicios</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: 5 traslados para rehabilitación al Hospital San Pedro (mañana), 2 altas desde UVI a domicilio (zona centro), 1 consulta urgente en Calahorra (paciente mayor, dificultad respiratoria)..." {...field} rows={5} />
                  </FormControl>
                  <FormDescription>Describa el conjunto de servicios que necesita planificar.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trafficConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condiciones del Tráfico</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Congestión densa en Calle Principal." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weatherConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condiciones Climáticas</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Despejado, lluvia ligera, nieve intensa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting} className="btn-primary">
              {form.formState.isSubmitting ? 'Analizando Lote...' : 'Obtener Plan de Despacho IA'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
