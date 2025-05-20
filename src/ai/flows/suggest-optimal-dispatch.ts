'use server';

/**
 * @fileOverview AI flow to suggest the optimal ambulance dispatch based on
 * real-time location, patient needs, traffic, weather, and vehicle availability.
 *
 * - suggestOptimalDispatch - A function that suggests the optimal ambulance dispatch.
 * - SuggestOptimalDispatchInput - The input type for the suggestOptimalDispatch function.
 * - SuggestOptimalDispatchOutput - The return type for the suggestOptimalDispatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalDispatchInputSchema = z.object({
  patientNeeds: z.string().describe('The patient needs and condition.'),
  trafficConditions: z.string().describe('Real-time traffic conditions.'),
  weatherConditions: z.string().describe('Real-time weather conditions.'),
  vehicleAvailability: z
    .string()
    .describe('Information on available ambulances and their types.'),
  ambulanceLocations: z
    .string()
    .describe('Real-time locations of available ambulances.'),
});
export type SuggestOptimalDispatchInput = z.infer<
  typeof SuggestOptimalDispatchInputSchema
>;

const SuggestOptimalDispatchOutputSchema = z.object({
  optimalAmbulance: z.string().describe('The ID of the optimal ambulance.'),
  reasoning: z.string().describe('The reasoning for choosing this ambulance.'),
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
  prompt: `You are an expert in emergency response coordination. Given the
following information, determine the optimal ambulance to dispatch to the
scene.

Patient Needs: {{{patientNeeds}}}
Traffic Conditions: {{{trafficConditions}}}
Weather Conditions: {{{weatherConditions}}}
Vehicle Availability: {{{vehicleAvailability}}}
Ambulance Locations: {{{ambulanceLocations}}}

Consider all factors to choose the ambulance that can provide the quickest
and most appropriate care. Explain your reasoning.  Respond only with the
ambulance ID and a short explanation.
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
