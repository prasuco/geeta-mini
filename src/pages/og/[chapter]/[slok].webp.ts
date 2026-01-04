import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { createCanvas } from "canvas";

export const GET: APIRoute = async ({ params }) => {
  const { chapter, slok } = params;
  const allSloks = await getCollection("sloks");
  
  // Find the specific slok based on chapter and verse number
  const item = allSloks.find(
    (s) => 
      s.data.chapter_number.toString() === chapter && 
      s.data.verse_number.toString() === slok
  );

  if (!item) return new Response("Slok not found", { status: 404 });

  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Background
  ctx.fillStyle = "#14113D";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#FFCC00";
  ctx.fillRect(0, 0, width, 32);

  // 2. Header: Chapter and Slok Number
  ctx.fillStyle = "white";
  ctx.font = "36px Inter";
  ctx.fillText(`Chapter ${item.data.chapter_number} • Slok ${item.data.verse_number}`, 38, 86);

  // 3. Verse (The Sanskrit/Main text)
  // Increase font size for the main slok text
  ctx.fillStyle = "#FFCC00";
  ctx.font = "600 48px Inter";
  const verseText = item.data.text || ""; // Adjust key based on your schema
  wrapText(ctx, verseText, 38, 160, 1100, 60);

  // 4. Translation/Summary (The secondary text)
  ctx.fillStyle = "white";
  ctx.font = "500 24px Inter";
  // Assuming y starts after the verse; you might need a dynamic Y based on verse length
  const transliteration = item.data.transliteration || ""; 
  wrapText(ctx, transliteration, 38, 380, 1100, 32);

  // 5. Footer
  ctx.fillStyle = "wheat";
  ctx.font = "600 20px Inter";
  ctx.fillText("geeta.prasuco.com", 38, 592);

  const buffer = canvas.toBuffer("image/png");

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png", // Changed to PNG to match toBuffer, or use Sharp to convert to WebP
      "Cache-Control": "public, max-age=31536000",
    },
  });
};

function wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/); // Split by any whitespace
  let line = "";

  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + " ";
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

export async function getStaticPaths() {
  const sloks = await getCollection("sloks");
  return sloks.map((item) => ({
    params: {
      chapter: item.data.chapter_number.toString(),
      slok: item.data.verse_number.toString(),
    },
  }));
}