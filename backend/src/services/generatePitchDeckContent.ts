import { z } from 'zod';
import { generateJSON } from './llm';

const SlideSchema = z.object({
  title: z.string(),
  bullets: z.array(z.string()).min(3).max(4),
});

const PitchDeckContentSchema = z.object({
  companyName: z.string(),
  tagline: z.string(),
  problemSlide: SlideSchema,
  solutionSlide: SlideSchema,
  marketSlide: SlideSchema,
  businessModelSlide: SlideSchema,
  competitionSlide: SlideSchema,
  askSlide: SlideSchema,
});

export type PitchDeckContentResult = z.infer<typeof PitchDeckContentSchema>;

export async function generatePitchDeckContent(rawIdea: string): Promise<PitchDeckContentResult> {
  const prompt = `You are a top-tier startup pitch consultant who has helped companies raise millions. You write pitch decks that are punchy, concrete, and instantly understandable — never vague or jargon-heavy.

Startup idea: "${rawIdea}"

Generate content for a 6-slide investor pitch deck. Follow these rules strictly:

TITLES: Each slide title must be a complete, specific claim — not a vague label.
- BAD title: "The Problem" or "Market Opportunity"
- GOOD title: "Craft hot sauce fans can't find quality outside big cities"
Titles should be 6-12 words, read like a headline, and make a clear point on their own — someone skimming only the titles should understand the whole pitch.

BULLETS: Each bullet must be one concrete, specific fact or claim — never a fragment or vague statement.
- BAD bullet: "Growing market" or "Strong demand"
- GOOD bullet: "Craft/specialty segment growing 7% annually, outpacing mass-market brands"
Every bullet should ideally include a specific number, comparison, or concrete detail. Avoid buzzwords like "leverage," "synergy," "disrupt," "unlock." Write like you're explaining it to a smart friend, not writing a corporate memo.

Generate:
- companyName: a short, memorable, real-sounding company name for this idea
- tagline: one sentence, concrete, explains what the company actually does (not abstract mission language)
- problemSlide: title + 3-4 bullets — the specific pain points customers face today
- solutionSlide: title + 3-4 bullets — exactly what the product/service does and how it solves each pain point
- marketSlide: title + 3-4 bullets — market size with real numbers, growth rate, why now
- businessModelSlide: title + 3-4 bullets — exactly how money is made, real pricing, margins if relevant
- competitionSlide: title + 3-4 bullets — name 1-2 real or plausible competitors, then state the specific differentiation (not just "we're better")
- askSlide: title + 3-4 bullets — specific funding amount, valuation if relevant, and a clear breakdown of what the money is used for

Example output (for a meal-kit delivery idea) showing the level of specificity expected:
{
  "companyName": "FreshFast",
  "tagline": "Pre-portioned dinner kits that take 20 minutes to cook, delivered weekly.",
  "problemSlide": {
    "title": "Busy professionals waste 2+ hours a week just planning dinner",
    "bullets": ["73% of professionals order takeout 3+ times a week despite wanting to cook more", "The average household throws out $1,500 of unused groceries every year", "Meal planning and grocery shopping eat up 2-3 hours weekly for working adults"]
  },
  "solutionSlide": {
    "title": "Exact-portion ingredients and recipes delivered weekly, ready in 20 minutes",
    "bullets": ["Pre-measured ingredients eliminate food waste entirely", "Step-by-step recipe cards cut average cook time to 20 minutes", "New menu of 12 recipes every week, swappable based on dietary needs"]
  },
  "marketSlide": {
    "title": "US meal-kit market is $19B and growing 12% a year",
    "bullets": ["Meal-kit delivery market valued at $19B in the US as of 2024", "Segment growing 12% year-over-year, outpacing traditional grocery", "Mid-size cities remain underserved by current major players"]
  },
  "businessModelSlide": {
    "title": "Weekly subscriptions at $65/box with 68% retention at 6 months",
    "bullets": ["Average order value of $65 per week per household", "68% of customers still subscribed after 6 months", "Premium ingredient upgrades add 15% to average order value"]
  },
  "competitionSlide": {
    "title": "HelloFresh and Blue Apron compete on scale — we compete on local sourcing",
    "bullets": ["HelloFresh and Blue Apron dominate through national distribution", "We partner directly with regional farms, cutting delivery distance by 60%", "Local sourcing lets us offer same-day-harvest produce, a claim competitors can't make"]
  },
  "askSlide": {
    "title": "Raising $500K to expand from 1 to 4 metro markets",
    "bullets": ["$500K seed round at a $4M valuation", "60% of funds go to opening 3 new regional fulfillment hubs", "40% allocated to performance marketing and first-time customer acquisition"]
  }
}

Return your pitch deck content for the actual idea given above, in the same JSON shape, matching this level of specificity.`;

  const rawResult = await generateJSON<unknown>(prompt);
  return PitchDeckContentSchema.parse(rawResult);
}