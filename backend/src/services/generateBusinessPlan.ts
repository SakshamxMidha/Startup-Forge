import { z } from 'zod';
import { generateJSON } from './llm';

const PersonaSchema = z.object({
  name: z.string(),
  ageRange: z.string(),
  behavior: z.string(),
  painPoints: z.array(z.string()).min(2).max(5),
});

const SwotItemSchema = z.object({
  category: z.enum(['STRENGTH', 'WEAKNESS', 'OPPORTUNITY', 'THREAT']),
  text: z.string(),
});

const RevenueStreamSchema = z.object({
  name: z.string(),
  pricing: z.string(),
});

const BusinessPlanSchema = z.object({
  mission: z.string(),
  vision: z.string(),
  usp: z.string(),
  targetAudience: z.string(),
  businessModel: z.enum(['subscription', 'commission', 'freemium', 'one-time-purchase', 'advertising']),
  persona: PersonaSchema,
  swotItems: z.array(SwotItemSchema).min(4).max(8),
  revenueStreams: z.array(RevenueStreamSchema).min(1).max(4),
  growthStrategy: z.array(z.string()).min(2).max(5),
});

export type BusinessPlanResult = z.infer<typeof BusinessPlanSchema>;

export async function generateBusinessPlan(rawIdea: string) {
  const prompt = `You are a startup strategist creating a full business plan.

Business idea: "${rawIdea}"

Generate a complete business plan with:
- mission: one sentence, what the company does and for whom
- vision: one sentence, long-term aspiration
- usp: the unique selling proposition — what makes this different from alternatives
- targetAudience: 1-2 sentences describing the core customer
- businessModel: one of "subscription", "commission", "freemium", "one-time-purchase", "advertising"
- persona: ONE detailed customer persona with name, ageRange (e.g. "25-34"), behavior (their habits/motivations), and painPoints (2-5 specific frustrations they have today)
- swotItems: 4-8 SWOT items, each with category ("STRENGTH", "WEAKNESS", "OPPORTUNITY", or "THREAT") and text
- revenueStreams: 1-4 revenue streams, each with a name and pricing description
- growthStrategy: 2-5 concrete growth tactics as short strings

Example output shape (for a meal-kit delivery idea):
{
  "mission": "To make home-cooked meals effortless for busy professionals.",
  "vision": "A world where nobody skips a real meal due to lack of time.",
  "usp": "Pre-portioned, chef-designed recipes delivered with zero food waste.",
  "targetAudience": "Working professionals aged 25-45 who want to cook but lack time to plan and shop.",
  "businessModel": "subscription",
  "persona": {
    "name": "Busy Brianna",
    "ageRange": "28-35",
    "behavior": "Orders takeout 3x/week, wants to cook more but dreads grocery planning",
    "painPoints": ["Wastes food that spoils before use", "Spends too much on last-minute takeout", "Doesn't know what to cook each night"]
  },
  "swotItems": [
    { "category": "STRENGTH", "text": "Pre-portioned ingredients reduce food waste significantly" },
    { "category": "WEAKNESS", "text": "Higher cost per meal than grocery store shopping" },
    { "category": "OPPORTUNITY", "text": "Growing demand for convenience-focused food services" },
    { "category": "THREAT", "text": "Established competitors like HelloFresh have strong brand loyalty" }
  ],
  "revenueStreams": [
    { "name": "Weekly subscription box", "pricing": "$60-90/week depending on meal count" }
  ],
  "growthStrategy": ["Referral discounts for existing subscribers", "Partnerships with fitness influencers"]
}

Return your business plan for the actual idea given above, in the same JSON shape.`;

  const { result: rawResult, usage } = await generateJSON<unknown>(prompt);
  const result = BusinessPlanSchema.parse(rawResult);
  return { result, usage };
}