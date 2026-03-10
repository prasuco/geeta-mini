export const prerender = true;
import { getCollection } from 'astro:content';

export async function GET() {
  const sloks = await getCollection('sloks');
  const data = sloks.map((s) => ({
    chapter: s.data.chapter_number,
    verse: s.data.verse_number,
    text: s.data.text,
    id: s.id,
  }));
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
