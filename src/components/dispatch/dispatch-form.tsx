
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { planDispatchForBatch, PlanDispatchForBatchInput, PlanDispatchForBatchOutput } from '@/ai/flows/plan-dispatch-for-batch';
import { getAmbulanceLocationsForAI, getVehicleAvailabilityForAI } from '@/lib/ambulance-data';
import { useToast } from "@/hooks/use-toast";
import type { ProgrammedTransportRequest } from '@/types';
import { Textarea } from '@/components/ui/textarea'; 
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const formSchema = z.object({
  trafficConditions: z.string().min(5, { message: 'Las condiciones del tráfico deben tener al menos 5 caracteres.' }).max(200, {message: "Máximo 200 caracteres."}),
  weatherConditions: z.string().min(5, { message: 'Las condiciones climáticas deben tener al menos 5 caracteres.' }).max(200, {message: "Máximo 200 caracteres."}),
  serviceHistoryNotes: z.string().max(500, {message: "Las notas de historial no deben exceder los 500 caracteres."}).optional(),
});

type DispatchFormValues = z.infer<typeof formSchema>;

interface DispatchFormProps {
  onSuggestion: (suggestion: PlanDispatchForBatchOutput | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  selectedServicesToPlan: ProgrammedTransportRequest[];
}

function formatServicesForAI(services: ProgrammedTransportRequest[]): string {
  if (!services || services.length === 0) {
    return "No hay servicios seleccionados.";
  }
  return services.map((service, index) => {
    const fechaFormateada = service.fechaIda ? format(parseISO(service.fechaIda), "dd/MM/yyyy", { locale: es }) : 'Fecha N/A';
    const horaCita = service.horaConsultaMedica || service.horaIda || 'Hora N/A';
    const notas = service.observacionesMedicasAdicionales || service.barrerasArquitectonicas || service.necesidadesEspeciales || 'Ninguna';
    return `Servicio ${index + 1} (ID: ${service.id.slice(0,8)}...): Paciente: ${service.nombrePaciente}. Origen: ${service.centroOrigen}. Destino: ${service.destino}. Fecha: ${fechaFormateada}. Hora Cita: ${horaCita}. Medio Requerido: ${service.medioRequerido}. Notas: ${notas}.`;
  }).join('\n');
}

export function DispatchForm({ onSuggestion, setIsLoading, selectedServicesToPlan }: DispatchFormProps) {
  const { toast } = useToast();
  const form = useForm<DispatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trafficConditions: 'Normal',
      weatherConditions: 'Despejado',
      serviceHistoryNotes: '',
    },
  });

  async function onSubmit(values: DispatchFormValues) {
    if (selectedServicesToPlan.length === 0) {
        toast({ title: "Error", description: "Debe seleccionar al menos un servicio para planificar.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    onSuggestion(null); 

    const servicesDescriptionForAI = formatServicesForAI(selectedServicesToPlan);

    try {
      const aiInput: PlanDispatchForBatchInput = {
        servicesDescription: servicesDescriptionForAI,
        trafficConditions: values.trafficConditions,
        weatherConditions: values.weatherConditions,
        ambulanceLocations: await getAmbulanceLocationsForAI(), // Make sure these are awaited if they become async
        vehicleAvailability: await getVehicleAvailabilityForAI(), // Make sure these are awaited
        serviceHistoryNotes: values.serviceHistoryNotes || undefined, // Pass if provided, otherwise undefined
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
  
  const servicesPreview = formatServicesForAI(selectedServicesToPlan);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
            <FormLabel>Resumen de Servicios Seleccionados para IA ({selectedServicesToPlan.length})</FormLabel>
            <Textarea
                readOnly
                value={servicesPreview}
                rows={Math.min(8, selectedServicesToPlan.length + 1)} // Max 8 rows for preview
                className="mt-1 bg-muted/30 text-xs"
                placeholder="Los detalles de los servicios seleccionados aparecerán aquí."
            />
            <FormDescription className="text-xs mt-1">Este es el texto que se enviará a la IA como descripción del lote.</FormDescription>
        </div>
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
        <FormField
          control={form.control}
          name="serviceHistoryNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas de Historial de Servicio (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                    placeholder="Ej: Paciente Pérez fue atendido por AMB-001 la semana pasada. Servicio para Martínez suele ser con unidad SVB." 
                    {...field} 
                    rows={3}
                />
              </FormControl>
               <FormDescription className="text-xs">
                Información adicional sobre asignaciones previas o preferencias que la IA deba considerar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting || selectedServicesToPlan.length === 0} className="btn-primary w-full">
          {form.formState.isSubmitting ? 'Analizando Lote...' : `Obtener Plan para ${selectedServicesToPlan.length} Servicio(s)`}
        </Button>
      </form>
    </Form>
  );
}
