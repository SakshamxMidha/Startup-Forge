import { GoogleGenerativeAI } from '@google/generative-ai';
import { retrieveRelevantChunks, RetrievedChunk } from './rag';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

interface HistoryMessage {
  role: string;
  content: string;
}

export async function generateMentorReply(
  startupId: string,
  userMessage: string,
  history: HistoryMessage[]
): Promise<{ reply: string; usedChunks: RetrievedChunk[] }> {
  const chunks = await retrieveRelevantChunks(startupId, userMessage, 5);

  const contextText =
    chunks.length > 0
      ? chunks.map((c) => `[${c.source}] ${c.content}`).join('\n')
      : 'No specific context found for this question.';

  const historyText = history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'Founder' : 'Mentor'}: ${m.content}`)
    .join('\n');

  const prompt = `You are an experienced startup mentor having a conversation with a founder about their specific startup. Answer conversationally and helpfully, grounding your advice in the context provided below when it's relevant. If the context doesn't cover the question well, say so honestly and answer from general knowledge instead, clearly distinguishing that you're doing so.

RELEVANT CONTEXT (from this startup's own data and general startup advice):
${contextText}

RECENT CONVERSATION:
${historyText || '(this is the first message)'}

Founder's new message: "${userMessage}"

Reply as the mentor, in plain conversational text (not JSON) — 2-5 sentences, direct and specific, not generic.`;

  const result = await model.generateContent(prompt);
  const reply = result.response.text().trim();

  return { reply, usedChunks: chunks };
}