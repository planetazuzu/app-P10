
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
import { createProgrammedTransportRequest } from '@/lib/request-data';
import type { ProgrammedTransportRequest, TipoServicioProgramado, TipoTrasladoProgramado, MedioRequeridoProgramado, EquipamientoEspecialProgramadoId } from '@/types';
import { ALL_TIPOS_SERVICIO_PROGRAMADO, ALL_TIPOS_TRASLADO_PROGRAMADO, ALL_MEDIOS_REQUERIDOS_PROGRAMADO, EQUIPAMIENTO_ESPECIAL_PROGRAMADO_OPTIONS } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Paperclip, UploadCloud } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress'; // Import Progress component

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
  autorizacionMedicaPdf: z.instanceof(File).optional().nullable(),
});

type ProgrammedTransportFormValues = z.infer<typeof programmedTransportFormSchema>;

interface ProgrammedTransportFormProps {
  onFormSubmit?: () => void;
  mode?: 'create' | 'edit';
  initialData?: ProgrammedTransportRequest;
  requestId?: string; // Added for edit mode
}

export function ProgrammedTransportForm({ onFormSubmit, mode = 'create', initialData, requestId }: ProgrammedTransportFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFilePersisted, setIsFilePersisted] = useState(false); // To know if a file was already there in edit mode


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
      // fechaIda: new Date(), // Let's set this in useEffect for edit mode
      horaIda: '10:00',
      medioRequerido: 'andando',
      equipamientoEspecialRequerido: [],
      barrerasArquitectonicas: '',
      necesidadesEspeciales: '',
      observacionesMedicasAdicionales: '',
      autorizacionMedicaPdf: null,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const defaultVals: Partial<ProgrammedTransportFormValues> = {
        nombrePaciente: initialData.nombrePaciente || '',
        dniNieSsPaciente: initialData.dniNieSsPaciente || '',
        servicioPersonaResponsable: initialData.servicioPersonaResponsable || '',
        tipoServicio: initialData.tipoServicio || 'consulta',
        tipoTraslado: initialData.tipoTraslado || 'soloIda',
        centroOrigen: initialData.centroOrigen || '',
        destino: initialData.destino || '',
        fechaIda: initialData.fechaIda ? parseISO(initialData.fechaIda) : new Date(),
        horaIda: initialData.horaIda || '10:00',
        medioRequerido: initialData.medioRequerido || 'andando',
        equipamientoEspecialRequerido: initialData.equipamientoEspecialRequerido || [],
        barrerasArquitectonicas: initialData.barrerasArquitectonicas || '',
        necesidadesEspeciales: initialData.necesidadesEspeciales || '',
        observacionesMedicasAdicionales: initialData.observacionesMedicasAdicionales || '',
        autorizacionMedicaPdf: null, // File input cannot be pre-filled for security reasons
      };
      form.reset(defaultVals);
      if (initialData.autorizacionMedicaPdf) {
        setSelectedFileName(initialData.autorizacionMedicaPdf); // Display name of existing file
        setIsFilePersisted(true);
      }
    } else {
      // For create mode, ensure fechaIda has a default if not set.
      if (!form.getValues('fechaIda')) {
        form.setValue('fechaIda', new Date());
      }
       setSelectedFileName(null);
       setIsFilePersisted(false);
    }
  }, [mode, initialData, form]);


  async function onSubmit(values: ProgrammedTransportFormValues) {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debe iniciar sesión para crear una solicitud.", variant: "destructive"});
      return;
    }

    let finalAutorizacionMedicaPdfName: string | undefined = selectedFileName;

    if (values.autorizacionMedicaPdf instanceof File) {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      await new Promise(resolve => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve(true);
          }
        }, 200);
      });
      setIsUploading(false);
      finalAutorizacionMedicaPdfName = values.autorizacionMedicaPdf.name; // Use the new file name
      setIsFilePersisted(true); // Mark as "persisted" after simulated upload
    } else if (mode === 'edit' && !selectedFileName && isFilePersisted) {
        // This means the user cleared a previously existing file in edit mode, but we don't have a mechanism
        // to "delete" it from a mock backend here. We'll just assume it's cleared for the UI.
        finalAutorizacionMedicaPdfName = undefined;
    }


    const requestDataPayload = {
      ...values,
      fechaIda: values.fechaIda.toISOString().split('T')[0],
      autorizacionMedicaPdf: finalAutorizacionMedicaPdfName,
    };

    // Remove autorizacionMedicaPdf if it's null (which it would be if it was a File object)
    // The actual file object values.autorizacionMedicaPdf is not sent, only its name after "upload"
    const { autorizacionMedicaPdf, ...dataToSend } = requestDataPayload;


    try {
      if (mode === 'create') {
        const requestData: Omit<ProgrammedTransportRequest, 'id' | 'requesterId' | 'status' | 'createdAt' | 'updatedAt' | 'priority' | 'assignedAmbulanceId'> = {
            ...dataToSend,
        };
        await createProgrammedTransportRequest({
            ...requestData,
            requesterId: user.id,
            status: 'pending',
            priority: 'low',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        toast({ title: "Solicitud de Transporte Enviada", description: "Su solicitud de transporte programado ha sido enviada."});
      } else if (mode === 'edit' && requestId) {
        // await updateProgrammedRequest(requestId, dataToSend);
        console.log("Simulando actualización de solicitud programada:", requestId, dataToSend);
        toast({ title: "Solicitud Actualizada", description: "La solicitud de transporte programado ha sido actualizada (simulado)."});
      }

      form.reset({ // Reset with defaults for create mode or re-initialData for edit
        ...form.control._defaultValues,
        fechaIda: new Date(),
        autorizacionMedicaPdf: null
      });
      setSelectedFileName(null);
      setUploadProgress(0);
      setIsFilePersisted(false);

      if (onFormSubmit) {
        onFormSubmit();
      } else {
        router.push('/request-management');
      }
    } catch (error) {
      console.error('Error al enviar la solicitud de transporte programado:', error);
      toast({ title: "Envío Fallido", description: "No se pudo enviar su solicitud. Por favor, inténtelo de nuevo.", variant: "destructive"});
      setIsUploading(false); // Reset upload state on error too
    }
  }

  const cardTitle = mode === 'create' ? 'Formulario de Solicitud de Transporte' : `Editar Solicitud Programada: ${requestId?.substring(0,8) || ''}...`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="section-title">{cardTitle}</CardTitle>
        <UiCardDescription>Complete todos los campos para solicitar un transporte sanitario programado. Los campos marcados con * son obligatorios.</UiCardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* ... (otros campos del formulario, sin cambios) ... */}
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
                        value={field.value} // Ensure value is controlled
                        className="flex flex-col space-y-1"
                      >
                        {ALL_TIPOS_SERVICIO_PROGRAMADO.map(tipo => (
                            <FormItem key={tipo} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={tipo} /></FormControl>
                                <FormLabel className="font-normal capitalize">
                                    {tipo.replace(/([A-Z])/g, ' $1').toLowerCase()} {/* Auto-format label */}
                                </FormLabel>
                            </FormItem>
                        ))}
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
                        value={field.value} // Ensure value is controlled
                        className="flex flex-col space-y-1"
                      >
                         {ALL_TIPOS_TRASLADO_PROGRAMADO.map(tipo => (
                             <FormItem key={tipo} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={tipo} /></FormControl>
                                <FormLabel className="font-normal capitalize">
                                    {tipo === 'soloIda' ? 'Solo ida' : 'Ida y vuelta'}
                                </FormLabel>
                            </FormItem>
                         ))}
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
                                date < new Date(new Date().setHours(0,0,0,0)) 
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
                        value={field.value} // Ensure value is controlled
                        className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0"
                      >
                        {ALL_MEDIOS_REQUERIDOS_PROGRAMADO.map(medio => (
                            <FormItem key={medio} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={medio} /></FormControl>
                                <FormLabel className="font-normal capitalize">
                                    {medio === 'camilla' ? 'Camilla' : medio === 'sillaDeRuedas' ? 'Silla de ruedas' : 'Andando'}
                                </FormLabel>
                            </FormItem>
                        ))}
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
                render={({ field: { onChange, value, ...restField } }) => (
                    <FormItem>
                        <FormLabel>Autorización médica (PDF)</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept=".pdf"
                                {...restField}
                                onChange={(e) => {
                                    const file = e.target.files ? e.target.files[0] : null;
                                    onChange(file); // Pass File object to react-hook-form
                                    setSelectedFileName(file ? file.name : null);
                                    if (file) setIsFilePersisted(false); // New file selected, not persisted from initialData
                                }}
                            />
                        </FormControl>
                        <FormDescription>
                            {mode === 'create' ? 'Para usuarios particulares, es obligatorio adjuntar la autorización médica.' : 'Puede adjuntar una nueva autorización o dejarla para mantener la existente (si la hay).'}
                        </FormDescription>
                        {selectedFileName && !isUploading && (
                          <div className="mt-2 text-sm text-muted-foreground flex items-center">
                            <Paperclip className="h-4 w-4 mr-2" />
                            Archivo seleccionado: {selectedFileName}
                            {(mode === 'edit' && isFilePersisted && !value) && <span className="text-xs text-green-600 ml-2">(Archivo existente guardado)</span>}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-2 text-red-500 hover:text-red-700"
                                onClick={() => {
                                    form.setValue('autorizacionMedicaPdf', null); // Clear RHF value
                                    setSelectedFileName(null);
                                    setUploadProgress(0);
                                    // If it was an existing file, we just clear the UI indication for now
                                    // The actual deletion from backend would happen on save if confirmed
                                }}
                            >
                                Quitar
                            </Button>
                          </div>
                        )}
                        {isUploading && (
                          <div className="mt-2">
                            <Progress value={uploadProgress} className="w-full h-2" />
                            <p className="text-xs text-muted-foreground text-center mt-1">Cargando: {uploadProgress}%</p>
                          </div>
                        )}
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isUploading}>
                    Cancelar
                </Button>
                <Button type="submit" variant="default" disabled={form.formState.isSubmitting || isUploading}>
                    {form.formState.isSubmitting || isUploading ? 'Procesando...' : (mode === 'create' ? 'Enviar Solicitud' : 'Guardar Cambios')}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

