import { GoogleGenerativeAI } from '@google/generative-ai';
import { withGeminiErrorHandling } from './geminiError';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  generationConfig: {
    temperature: 0,
  },
});

export interface GenerationUsage {
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export async function generateJSON<T>(
  prompt: string
): Promise<{ result: T; usage: GenerationUsage }> {
  const fullPrompt = `${prompt}

CRITICAL: Respond with ONLY valid JSON. No markdown code fences, no explanatory text before or after, no comments. Just the raw JSON object or array.`;

  const result = await withGeminiErrorHandling(() => model.generateContent(fullPrompt));
  const rawText = result.response.text();

  const usage: GenerationUsage = {
    promptTokens: result.response.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: result.response.usageMetadata?.candidatesTokenCount ?? 0,
    totalTokens: result.response.usageMetadata?.totalTokenCount ?? 0,
  };

  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return { result: JSON.parse(cleaned) as T, usage };
  } catch (error) {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }
}