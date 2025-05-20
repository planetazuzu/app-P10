'use server';

/**
 * @fileOverview Flujo de IA para sugerir el despacho óptimo de ambulancias basado en
 * la ubicación en tiempo real, necesidades del paciente, tráfico, clima y disponibilidad de vehículos.
 *
 * - suggestOptimalDispatch - Una función que sugiere el despacho óptimo de ambulancias.
 * - SuggestOptimalDispatchInput - El tipo de entrada para la función suggestOptimalDispatch.
 * - SuggestOptimalDispatchOutput - El tipo de retorno para la función suggestOptimalDispatch.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalDispatchInputSchema = z.object({
  patientNeeds: z.string().describe('Las necesidades y condición del paciente.'),
  trafficConditions: z.string().describe('Condiciones del tráfico en tiempo real.'),
  weatherConditions: z.string().describe('Condiciones climáticas en tiempo real.'),
  vehicleAvailability: z
    .string()
    .describe('Información sobre ambulancias disponibles y sus tipos.'),
  ambulanceLocations: z
    .string()
    .describe('Ubicaciones en tiempo real de las ambulancias disponibles.'),
});
export type SuggestOptimalDispatchInput = z.infer<
  typeof SuggestOptimalDispatchInputSchema
>;

const SuggestOptimalDispatchOutputSchema = z.object({
  optimalAmbulance: z.string().describe('El ID de la ambulancia óptima.'),
  reasoning: z.string().describe('El razonamiento para elegir esta ambulancia.'),
});
export type SuggestOptimalDispatchOutput = z.infer<
  typeof SuggestOptimalDispatchOutputSchema
>;

export async function suggestOptimalDispatch(
  input: SuggestOptimalDispatchInput
): Promise<SuggestOptimalDispatchOutput> {
  return suggestOptimalDispatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalDispatchPrompt',
  input: {schema: SuggestOptimalDispatchInputSchema},
  output: {schema: SuggestOptimalDispatchOutputSchema},
  prompt: `Eres un experto en coordinación de respuesta a emergencias. Dada la
siguiente información, determina la ambulancia óptima para despachar al
lugar del incidente.

Necesidades del Paciente: {{{patientNeeds}}}
Condiciones del Tráfico: {{{trafficConditions}}}
Condiciones Climáticas: {{{weatherConditions}}}
Disponibilidad de Vehículos: {{{vehicleAvailability}}}
Ubicaciones de Ambulancias: {{{ambulanceLocations}}}

Considera todos los factores para elegir la ambulancia que pueda proporcionar la
atención más rápida y adecuada. Explica tu razonamiento. Responde solo con el
ID de la ambulancia y una breve explicación.
`,
});

const suggestOptimalDispatchFlow = ai.defineFlow(
  {
    name: 'suggestOptimalDispatchFlow',
    inputSchema: SuggestOptimalDispatchInputSchema,
    outputSchema: SuggestOptimalDispatchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
