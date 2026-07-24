import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  generationConfig: {
    temperature: 0,
  },
});

export async function generateJSON<T>(prompt: string): Promise<T> {
  const fullPrompt = `${prompt}

CRITICAL: Respond with ONLY valid JSON. No markdown code fences, no explanatory text before or after, no comments. Just the raw JSON object or array.`;

  const result = await model.generateContent(fullPrompt);
  const rawText = result.response.text();

  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }
}