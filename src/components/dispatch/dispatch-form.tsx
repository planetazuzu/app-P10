'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestOptimalDispatch, SuggestOptimalDispatchInput, SuggestOptimalDispatchOutput } from '@/ai/flows/suggest-optimal-dispatch';
import { getAmbulanceLocationsForAI, getVehicleAvailabilityForAI } from '@/lib/ambulance-data';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  patientNeeds: z.string().min(10, { message: 'Las necesidades del paciente deben tener al menos 10 caracteres.' }),
  trafficConditions: z.string().min(5, { message: 'Las condiciones del tráfico deben tener al menos 5 caracteres.' }),
  weatherConditions: z.string().min(5, { message: 'Las condiciones climáticas deben tener al menos 5 caracteres.' }),
});

type DispatchFormValues = z.infer<typeof formSchema>;

interface DispatchFormProps {
  onSuggestion: (suggestion: SuggestOptimalDispatchOutput | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export function DispatchForm({ onSuggestion, setIsLoading }: DispatchFormProps) {
  const { toast } = useToast();
  const form = useForm<DispatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientNeeds: '',
      trafficConditions: 'Normal',
      weatherConditions: 'Despejado',
    },
  });

  async function onSubmit(values: DispatchFormValues) {
    setIsLoading(true);
    onSuggestion(null); 
    try {
      const aiInput: SuggestOptimalDispatchInput = {
        ...values,
        ambulanceLocations: getAmbulanceLocationsForAI(),
        vehicleAvailability: getVehicleAvailabilityForAI(),
      };
      const result = await suggestOptimalDispatch(aiInput);
      onSuggestion(result);
      toast({ title: "Sugerencia de Despacho Lista", description: "La IA ha proporcionado un despacho óptimo." });
    } catch (error) {
      console.error('Error al obtener sugerencia de despacho:', error);
      onSuggestion(null);
      toast({ title: "Error", description: "No se pudo obtener la sugerencia de despacho.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="section-title">Entrada de Despacho</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientNeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Necesidades y Condición del Paciente</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Hombre mayor, sospecha de paro cardíaco, inconsciente..." {...field} rows={3} />
                  </FormControl>
                  <FormDescription>Describa la situación y los requisitos del paciente.</FormDescription>
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Analizando...' : 'Obtener Sugerencia de Despacho'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
