
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { createProgrammedTransportRequest } from '@/lib/request-data'; // Assuming this will be created
import type { ProgrammedTransportRequest, TipoServicioProgramado, TipoTrasladoProgramado, MedioRequeridoProgramado, EquipamientoEspecialProgramadoId } from '@/types';
import { ALL_TIPOS_SERVICIO_PROGRAMADO, ALL_TIPOS_TRASLADO_PROGRAMADO, ALL_MEDIOS_REQUERIDOS_PROGRAMADO, EQUIPAMIENTO_ESPECIAL_PROGRAMADO_OPTIONS } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import React from 'react';

const programmedTransportFormSchema = z.object({
  nombrePaciente: z.string().min(3, { message: 'El nombre del paciente debe tener al menos 3 caracteres.' }),
  dniNieSsPaciente: z.string().min(5, { message: 'El DNI/NIE o SS del paciente es obligatorio.' }),
  servicioPersonaResponsable: z.string().optional(),
  tipoServicio: z.enum(ALL_TIPOS_SERVICIO_PROGRAMADO, { required_error: 'El tipo de servicio es obligatorio.' }),
  tipoTraslado: z.enum(ALL_TIPOS_TRASLADO_PROGRAMADO, { required_error: 'El tipo de traslado es obligatorio.' }),
  centroOrigen: z.string().min(5, { message: 'El centro de origen es obligatorio.' }),
  destino: z.string().min(5, { message: 'El destino es obligatorio.' }),
  fechaIda: z.date({ required_error: "La fecha de ida es obligatoria." }),
  horaIda: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Formato de hora inválido (HH:MM)." }),
  medioRequerido: z.enum(ALL_MEDIOS_REQUERIDOS_PROGRAMADO, { required_error: 'El medio requerido es obligatorio.' }),
  equipamientoEspecialRequerido: z.array(z.string()).optional(),
  barrerasArquitectonicas: z.string().optional(),
  necesidadesEspeciales: z.string().optional(),
  observacionesMedicasAdicionales: z.string().optional(),
  autorizacionMedicaPdf: z.any().optional(), // Simplified for now
});

type ProgrammedTransportFormValues = z.infer<typeof programmedTransportFormSchema>;

interface ProgrammedTransportFormProps {
  onFormSubmit?: () => void;
}

export function ProgrammedTransportForm({ onFormSubmit }: ProgrammedTransportFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProgrammedTransportFormValues>({
    resolver: zodResolver(programmedTransportFormSchema),
    defaultValues: {
      nombrePaciente: '',
      dniNieSsPaciente: '',
      servicioPersonaResponsable: '',
      tipoServicio: 'consulta',
      tipoTraslado: 'soloIda',
      centroOrigen: '',
      destino: '',
      horaIda: '10:00',
      medioRequerido: 'andando',
      equipamientoEspecialRequerido: [],
      barrerasArquitectonicas: '',
      necesidadesEspeciales: '',
      observacionesMedicasAdicionales: '',
    },
  });

  async function onSubmit(values: ProgrammedTransportFormValues) {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debe iniciar sesión para crear una solicitud.", variant: "destructive"});
      return;
    }

    const requestData: Omit<ProgrammedTransportRequest, 'id' | 'requesterId' | 'status' | 'createdAt' | 'updatedAt' | 'priority' | 'assignedAmbulanceId'> = {
      ...values,
      fechaIda: values.fechaIda.toISOString().split('T')[0], // Store date as YYYY-MM-DD
      // autorizacionMedicaPdf will be undefined if no file is selected. Actual file handling is complex.
      autorizacionMedicaPdf: values.autorizacionMedicaPdf instanceof File ? values.autorizacionMedicaPdf.name : undefined,
    };
    
    try {
      // await createProgrammedTransportRequest(requestData, user.id); // Assuming this function structure
      console.log("Simulating creation of programmed transport request:", requestData, "by user:", user.id);
      // For demo, directly call mock creation
       await createProgrammedTransportRequest({
        ...requestData,
        requesterId: user.id,
        status: 'pending',
        priority: 'low', // Programmed requests are typically low priority
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });


      toast({ title: "Solicitud de Transporte Enviada", description: "Su solicitud de transporte programado ha sido enviada."});
      form.reset();
      if (onFormSubmit) {
        onFormSubmit();
      } else {
        router.push('/request-management'); // Or a list of programmed requests
      }
    } catch (error) {
      console.error('Error al enviar la solicitud de transporte programado:', error);
      toast({ title: "Envío Fallido", description: "No se pudo enviar su solicitud. Por favor, inténtelo de nuevo.", variant: "destructive"});
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="section-title">Formulario de Solicitud de Transporte</CardTitle>
        <UiCardDescription>Complete todos los campos para solicitar un transporte sanitario programado. Los campos marcados con * son obligatorios.</UiCardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nombrePaciente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del paciente *</FormLabel>
                    <FormControl><Input placeholder="Nombre completo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dniNieSsPaciente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI/NIE o SS del paciente *</FormLabel>
                    <FormControl><Input placeholder="Identificación" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="servicioPersonaResponsable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicio y/o Persona Responsable de la Petición</FormLabel>
                  <FormControl><Input placeholder="Médico, enfermero, etc." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="tipoServicio"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de servicio *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="consulta" /></FormControl>
                          <FormLabel className="font-normal">Consulta</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="alta" /></FormControl>
                          <FormLabel className="font-normal">Alta</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="ingreso" /></FormControl>
                          <FormLabel className="font-normal">Ingreso</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="trasladoEntreCentros" /></FormControl>
                          <FormLabel className="font-normal">Traslado entre centros</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipoTraslado"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de traslado *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="soloIda" /></FormControl>
                          <FormLabel className="font-normal">Solo ida</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="idaYVuelta" /></FormControl>
                          <FormLabel className="font-normal">Ida y vuelta</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="centroOrigen"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Centro de origen *</FormLabel>
                        <FormControl><Input placeholder="Dirección completa o nombre del centro" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="destino"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Destino *</FormLabel>
                        <FormControl><Input placeholder="Dirección completa o nombre del centro" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="fechaIda"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Fecha de ida *</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                ) : (
                                    <span>Seleccione una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date < new Date(new Date().setHours(0,0,0,0)) // Disable past dates
                                }
                                initialFocus
                                locale={es}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="horaIda"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hora de ida *</FormLabel>
                        <FormControl><Input type="time" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="medioRequerido"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Medio requerido *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="camilla" /></FormControl>
                          <FormLabel className="font-normal">Camilla</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="sillaDeRuedas" /></FormControl>
                          <FormLabel className="font-normal">Silla de ruedas</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="andando" /></FormControl>
                          <FormLabel className="font-normal">Andando</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <FormField
              control={form.control}
              name="equipamientoEspecialRequerido"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Equipamiento especial requerido</FormLabel>
                    <FormDescription>
                      Seleccione todo el equipamiento necesario para el traslado.
                    </FormDescription>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                  {EQUIPAMIENTO_ESPECIAL_PROGRAMADO_OPTIONS.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="equipamientoEspecialRequerido"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barrerasArquitectonicas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barreras arquitectónicas</FormLabel>
                  <FormControl><Input placeholder="Escaleras, ascensor no operativo, etc." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="necesidadesEspeciales"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Necesidades especiales</FormLabel>
                  <FormControl><Input placeholder="Oxígeno, monitor, etc." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observacionesMedicasAdicionales"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones médicas adicionales</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Indique cualquier información relevante para el traslado" {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="autorizacionMedicaPdf"
                render={({ field }) => ( // field value will be FileList, we are interested in field.value[0]
                    <FormItem>
                        <FormLabel>Autorización médica (PDF)</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} 
                                // {...field} but we don't want to spread value and ref directly for file inputs
                            />
                        </FormControl>
                        <FormDescription>
                            Para usuarios particulares, es obligatorio adjuntar la autorización médica del traslado en formato PDF.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancelar
                </Button>
                <Button type="submit" variant="default" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
