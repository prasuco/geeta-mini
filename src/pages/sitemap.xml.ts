import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const site = "https://geeta.prasuco.com";

export const prerender = true;

function url(loc: string, priority?: string): string {
  return `<url><loc>${site}${loc}</loc>${priority ? `<priority>${priority}</priority>` : ""}</url>`;
}

export const GET: APIRoute = async () => {
  const chapters = await getCollection("chapters");
  const sloks = await getCollection("sloks");

  const staticPages = [
    ["/", "1.0"],
    ["/about", "0.6"],
    ["/bookmarks", "0.5"],
    ["/geeta-mail", "0.8"],
    ["/bhagavad-gita-app", "0.7"],
    ["/bhagavad-gita-chapter-summaries", "0.7"],
    ["/srimadgita-alternative", "0.5"],
  ];

  const chapterUrls = chapters
    .sort((a, b) => a.data.chapter_number - b.data.chapter_number)
    .map((c) => url(`/${c.data.chapter_number}`, "0.8"))
    .join("");

  const slokUrls = sloks
    .sort(
      (a, b) =>
        a.data.chapter_number - b.data.chapter_number ||
        a.data.verse_number - b.data.verse_number,
    )
    .map((s) => url(`/${s.data.chapter_number}/${s.data.verse_number}`, "0.6"))
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(([loc, priority]) => url(loc, priority)).join("")}
  ${chapterUrls}
  ${slokUrls}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
