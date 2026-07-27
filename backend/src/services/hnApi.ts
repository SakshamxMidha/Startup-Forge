import axios from 'axios';

export interface HnResult {
  title: string;
  points: number;
  url: string;
}

export async function searchHn(query: string): Promise<HnResult[]> {
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
}