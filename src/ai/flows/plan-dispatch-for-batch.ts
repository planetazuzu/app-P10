
'use server';

/**
 * @fileOverview Flujo de IA para planificar el despacho de ambulancias para un lote de servicios,
 * considerando ubicación en tiempo real, necesidades de los pacientes, tráfico, clima y disponibilidad de vehículos.
 *
 * - planDispatchForBatch - Una función que planifica el despacho para un lote de servicios.
 * - PlanDispatchForBatchInput - El tipo de entrada para la función planDispatchForBatch.
 * - PlanDispatchForBatchOutput - El tipo de retorno para la función planDispatchForBatch.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlanDispatchForBatchInputSchema = z.object({
  servicesDescription: z.string().describe('Descripción detallada del lote de servicios a realizar, incluyendo tipos de pacientes, ubicaciones generales, urgencias vs programados, etc.'),
  trafficConditions: z.string().describe('Condiciones del tráfico en tiempo real.'),
  weatherConditions: z.string().describe('Condiciones climáticas en tiempo real.'),
  vehicleAvailability: z
    .string()
    .describe('Información sobre ambulancias disponibles, sus tipos y capacidades actuales.'),
  ambulanceLocations: z
    .string()
    .describe('Ubicaciones en tiempo real de las ambulancias disponibles (IDs, coordenadas si es posible).'),
});
export type PlanDispatchForBatchInput = z.infer<
  typeof PlanDispatchForBatchInputSchema
>;

const PlanDispatchForBatchOutputSchema = z.object({
  dispatchPlan: z.string().describe('Un plan de despacho textual y detallado, incluyendo sugerencias de asignación de vehículos a servicios o grupos de servicios, consideraciones de ruta y cualquier otro razonamiento relevante.'),
  suggestedAmbulances: z.array(z.object({
    id: z.string().describe("ID o identificador de la ambulancia sugerida (puede ser un tipo genérico si no se especifica una unidad)."),
    assignedServicesSummary: z.string().describe("Breve resumen de los servicios o tipo de tareas asignadas a esta ambulancia dentro del plan."),
  })).optional().describe("Lista opcional de ambulancias específicas (o tipos) sugeridas y un resumen de su asignación en el plan."),
});
export type PlanDispatchForBatchOutput = z.infer<
  typeof PlanDispatchForBatchOutputSchema
>;

export async function planDispatchForBatch(
  input: PlanDispatchForBatchInput
): Promise<PlanDispatchForBatchOutput> {
  return planDispatchForBatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'planDispatchForBatchPrompt',
  input: {schema: PlanDispatchForBatchInputSchema},
  output: {schema: PlanDispatchForBatchOutputSchema},
  prompt: `Eres un experto coordinador de flotas de ambulancias y planificador de rutas para servicios de emergencia y transporte sanitario programado.
Tu tarea es analizar un lote de servicios descrito por el usuario y proponer un plan de despacho óptimo.

Considera la siguiente información:

Descripción del Lote de Servicios:
{{{servicesDescription}}}

Contexto Operacional:
- Condiciones del Tráfico: {{{trafficConditions}}}
- Condiciones Climáticas: {{{weatherConditions}}}
- Disponibilidad de Vehículos (tipos, capacidades, unidades específicas si se conocen): {{{vehicleAvailability}}}
- Ubicaciones Actuales de Ambulancias: {{{ambulanceLocations}}}

Debes generar un 'dispatchPlan' coherente y eficiente. Este plan debe:
1.  Evaluar los servicios descritos en el lote.
2.  Sugerir qué ambulancias (o tipos de ambulancias de las disponibles) serían más adecuadas para cada servicio o grupo de servicios.
3.  Si es posible, proponer agrupaciones lógicas de servicios para optimizar recursos.
4.  Mencionar consideraciones clave para las rutas (ej: evitar zonas congestionadas, priorizar urgencias).
5.  Explicar brevemente tu razonamiento para las asignaciones y agrupaciones.
6.  Si identificas ambulancias específicas del listado de 'vehicleAvailability' o 'ambulanceLocations' que son ideales para ciertos servicios, menciónalas en el campo 'suggestedAmbulances' junto con un resumen de las tareas que les asignarías.

El 'dispatchPlan' debe ser un texto explicativo. El campo 'suggestedAmbulances' es opcional y se usará si puedes hacer recomendaciones específicas de vehículos.
Proporciona un plan detallado y práctico que ayude al usuario a gestionar el lote de servicios de manera eficiente.
`,
});

const planDispatchForBatchFlow = ai.defineFlow(
  {
    name: 'planDispatchForBatchFlow',
    inputSchema: PlanDispatchForBatchInputSchema,
    outputSchema: PlanDispatchForBatchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

