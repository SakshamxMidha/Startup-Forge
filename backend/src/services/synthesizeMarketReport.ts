import { z } from 'zod';
import { generateJSON } from './llm';
import { HnResult } from './hnApi';

const MarketSynthesisSchema = z.object({
  trendDirection: z.enum(['rising', 'flat', 'declining']),
  summary: z.string(),
  keywords: z.array(z.string()).min(3).max(8),
});

export type MarketSynthesisResult = z.infer<typeof MarketSynthesisSchema>;

export async function synthesizeMarketReport(rawIdea: string, hnResults: HnResult[]) {
  const hnContext =
    hnResults.length > 0
      ? hnResults.map((r) => `- "${r.title}" (${r.points} points)`).join('\n')
      : 'No relevant Hacker News discussions were found.';

  const prompt = `You are a market research analyst evaluating a startup idea using real discussion data.

Startup idea: "${rawIdea}"

Here are the actual Hacker News discussions found related to this idea or its space:
${hnContext}

Based on this real discussion data (and your general knowledge of this market), provide:
- trendDirection: "rising", "flat", or "declining" — is interest/momentum in this space growing, stable, or fading?
- summary: 3-5 sentences synthesizing what the HN discussions (if any) reveal about market interest, sentiment, or gaps — and if there's little/no HN data, be honest that signal is thin rather than inventing detail
- keywords: 3-8 relevant search/market keywords for this space

Be honest and grounded — if the HN data is sparse or doesn't clearly indicate momentum, say so rather than overstating confidence.

Return your synthesis in the same JSON shape as this example:
{
  "trendDirection": "rising",
  "summary": "Hacker News discussions show growing interest in subscription-based niche food products, with several threads noting supply chain challenges as a common pain point for small producers. This suggests real demand exists but logistics remain the key operational risk...",
  "keywords": ["subscription box", "artisanal food", "direct-to-consumer", "niche e-commerce"]
}`;

  const { result: rawResult, usage } = await generateJSON<unknown>(prompt);
  const result = MarketSynthesisSchema.parse(rawResult);
  return { result, usage };
}