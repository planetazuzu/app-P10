
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { LoteCreateFormValues } from '@/types';
import { LoteCreateFormSchema } from '@/types';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import { useRouter } from 'next/navigation';

interface LoteFormProps {
  onSubmit: (data: LoteCreateFormValues) => Promise<void>;
  isSaving: boolean;
  initialData?: Partial<LoteCreateFormValues>; 
}

export function LoteForm({ onSubmit, isSaving, initialData }: LoteFormProps) {
  const router = useRouter();
  const form = useForm<LoteCreateFormValues>({
    resolver: zodResolver(LoteCreateFormSchema),
    defaultValues: initialData || {
      fechaServicio: new Date(), // Fecha por defecto: hoy
      destinoPrincipalNombre: '',
      destinoPrincipalDireccion: '',
      notasLote: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fechaServicio"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha del Lote/Servicio <span className="text-red-500">*</span></FormLabel>
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
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Permite hoy, deshabilita pasados
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Fecha para la cual se agruparán los servicios de este lote.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destinoPrincipalNombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Destino Principal <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Ej: Hospital San Pedro, Consultas Externas CARPA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destinoPrincipalDireccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección del Destino Principal <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Ej: Calle Piqueras 98, Logroño" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notasLote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas Adicionales para el Lote</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones generales para este lote, consideraciones especiales, etc. (Máx. 500 caracteres)"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/lotes')} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving || !form.formState.isValid && form.formState.isSubmitted} className="btn-primary">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando Lote...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Crear Lote
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
