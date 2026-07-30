import { z } from 'zod';
import { generateJSON } from './llm';

const AnalysisSchema = z.object({
  marketScore: z.number().min(0).max(10),
  difficultyScore: z.number().min(0).max(10),
  revenueScore: z.number().min(0).max(10),
  competitionLevel: z.enum(['Low', 'Medium', 'High']),
  timeToBuildWeeks: z.number().int().positive(),
  recommendation: z.string(),
  reasoning: z.string(),
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

export async function analyzeIdea(rawIdea: string) {
  const prompt = `You are an experienced startup advisor analyzing a business idea.

Analyze this startup idea: "${rawIdea}"

Score it on these dimensions (0-10 scale):
- marketScore: how large/accessible is the target market
- difficultyScore: how hard is this to build and execute (10 = very hard)
- revenueScore: how strong is the potential revenue model

Also determine:
- competitionLevel: "Low", "Medium", or "High"
- timeToBuildWeeks: realistic weeks for a solo/small team MVP
- recommendation: one clear sentence — pursue, pivot, or reconsider
- reasoning: 3-5 sentences explaining the scores, referencing specifics from the idea

Example output for "a subscription box for artisanal coffee beans":
{
  "marketScore": 6,
  "difficultyScore": 3,
  "revenueScore": 6,
  "competitionLevel": "High",
  "timeToBuildWeeks": 4,
  "recommendation": "Pursue with a strong differentiation angle, given how saturated subscription-box coffee already is.",
  "reasoning": "The subscription coffee market is well-established with proven demand, keeping marketScore moderate rather than high since growth requires strong differentiation. Difficulty is low since this is primarily a logistics/fulfillment problem, not a technical one. Revenue potential is solid due to recurring subscription revenue, but competitionLevel is High given many existing players like Trade Coffee and Atlas Coffee Club."
}

Return your analysis for the actual idea given above, in the same JSON shape.`;

  const { result: rawResult, usage } = await generateJSON<unknown>(prompt);
  const result = AnalysisSchema.parse(rawResult);
  return { result, usage };
}