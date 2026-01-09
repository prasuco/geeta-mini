import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { createCanvas, type CanvasRenderingContext2D } from "canvas";
import { drawWrappedText } from "../../../utils/wrapText";


export const GET: APIRoute = async ({ params }) => {
  const { chapter, slok } = params;
  const allSloks = await getCollection("sloks");

  const item = allSloks.find(
    (s) =>
      s.data.chapter_number.toString() === chapter &&
      s.data.verse_number.toString() === slok
  );

  if (!item) return new Response("Slok not found", { status: 404 });

  // Canvas Dimensions
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Background
  ctx.fillStyle = "#14113D";
  ctx.fillRect(0, 0, width, height);

  // Top Accent Bar
  ctx.fillStyle = "#FFCC00";
  ctx.fillRect(0, 0, width, 32);

  // 2. Header: Chapter and Slok Number
  ctx.fillStyle = "white";
  ctx.font = "36px Inter";
  ctx.fillText(`Chapter ${item.data.chapter_number} • Slok ${item.data.verse_number}`, 38, 90);

  // 3. Main Verse (Sanskrit)
  // We start at Y: 170. The function returns where it finished.
  ctx.fillStyle = "#FFCC00";
  ctx.font = "600 48px Inter";
  const verseText = item.data.text || "";


  const postVerseY = drawWrappedText(ctx, verseText.replace("\n", "").replace("\n\n", "\n").trim(), 38, 170, 1100, 65);

  // 4. Transliteration/Translation
  // We use the returned Y value + a small gap (30px) to start the next section
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "500 26px Inter";
  const transliteration = item.data.transliteration || "";

  drawWrappedText(ctx, transliteration.replace("", ""), 38, postVerseY + 2, 1100, 38);

  // 5. Footer (Fixed at bottom)
  ctx.fillStyle = "wheat";
  ctx.font = "600 22px Inter";
  ctx.fillText("geeta.prasuco.com", 38, 590);

  const buffer = canvas.toBuffer("image/png");

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
    },
  });
};

export async function getStaticPaths() {
  const sloks = await getCollection("sloks");
  return sloks.map((item) => ({
    params: {
      chapter: item.data.chapter_number.toString(),
      slok: item.data.verse_number.toString(),
    },
  }));
}