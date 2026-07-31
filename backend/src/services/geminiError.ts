import { GoogleGenerativeAIFetchError } from '@google/generative-ai';

export const GEMINI_UNAVAILABLE_MESSAGE =
  'AI is temporarily rate-limited or unavailable. Please try again in a minute.';

function isRateLimitOrUnavailable(error: unknown): error is GoogleGenerativeAIFetchError {
  return error instanceof GoogleGenerativeAIFetchError && (error.status === 429 || error.status === 503);
}

// Gemini 503s include a RetryInfo detail like { "@type": "...RetryInfo", retryDelay: "20s" }.
function getRetryDelayMs(error: GoogleGenerativeAIFetchError): number | null {
  const retryInfo = error.errorDetails?.find((d: any) => d['@type']?.includes('RetryInfo'));
  const raw = (retryInfo as any)?.retryDelay;
  if (typeof raw !== 'string') return null;
  const seconds = parseFloat(raw);
  return Number.isFinite(seconds) ? seconds * 1000 : null;
}

// Runs a Gemini call, retrying once after the server-suggested delay if it 503s,
// and normalizing 429/503 failures into a friendly, user-facing error message.
export async function withGeminiErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (isRateLimitOrUnavailable(error) && error.status === 503) {
      const delay = getRetryDelayMs(error) ?? 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        return await fn();
      } catch (retryError) {
        if (isRateLimitOrUnavailable(retryError)) {
          throw new Error(GEMINI_UNAVAILABLE_MESSAGE);
        }
        throw retryError;
      }
    }
    if (isRateLimitOrUnavailable(error)) {
      throw new Error(GEMINI_UNAVAILABLE_MESSAGE);
    }
    throw error;
  }
}
