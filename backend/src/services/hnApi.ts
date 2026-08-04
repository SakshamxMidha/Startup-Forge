import axios from 'axios';

export interface HnResult {
  title: string;
  points: number;
  url: string;
}

const MAX_QUERY_LENGTH = 120;

// Algolia rejects queries >= 512 bytes, and a full paragraph-length idea description searches
// worse than a short phrase anyway — so trim to ~120 chars, cut back to the last full word
// rather than slicing mid-word.
function buildSearchQuery(rawIdea: string): string {
  if (rawIdea.length <= MAX_QUERY_LENGTH) return rawIdea;

  const truncated = rawIdea.slice(0, MAX_QUERY_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim();
}

export async function searchHn(rawIdea: string): Promise<HnResult[]> {
  const query = buildSearchQuery(rawIdea);

  try {
    const response = await axios.get('https://hn.algolia.com/api/v1/search', {
      params: {
        query,
        tags: 'story',
        hitsPerPage: 10,
      },
    });

    const hits = response.data.hits as any[];

    return hits
      .filter((hit) => hit.title && typeof hit.points === 'number')
      .map((hit) => ({
        title: hit.title,
        points: hit.points,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      }));
  } catch (error) {
    // Degrade gracefully — HN signal is a nice-to-have, not worth failing market
    // research generation over (Algolia 400s, network errors, timeouts, rate limits, etc.)
    console.error('HN Algolia search failed, continuing with no HN signals:', error);
    return [];
  }
}
