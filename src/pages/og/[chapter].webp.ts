import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { createCanvas, type CanvasRenderingContext2D } from "canvas";
import { drawWrappedText } from "../../utils/wrapText";


export const prerender = true;
export const runtime = "node";

export const GET: APIRoute = async ({ params }) => {
  const chapters = await getCollection("chapters");
  const chapter = chapters.find(
    (c) => c.data.chapter_number.toString() === params.chapter
  );

  if (!chapter) return new Response("Not found", { status: 404 });

  // 1. Setup Canvas 
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 2. Draw Background
  ctx.fillStyle = "#14113D";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#FFCC00";
  ctx.fillRect(0, 0, width, 32);

  // 3. Draw Chapter Number
  ctx.fillStyle = "white";
  ctx.font = "36px Inter";
  ctx.fillText(`Chapter ${chapter.data.chapter_number}`, 38, 86);

  // 4. Draw Chapter Name
  // We place this at a fixed Y, but we could make the summary start relative to this 
  // if the chapter names were multi-line.
  ctx.fillStyle = "#FFCC00";
  ctx.font = "600 52px Inter";
  ctx.fillText(chapter.data.name, 38, 157);

  // 5. Draw Wrapped Summary (Dynamic)
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "500 26px Inter";
  const summary = chapter.data.chapter_summary || "";
  const maxWidth = 1100; 
  const lineHeight = 38;
  const startX = 38;
  const startY = 220;

  // This returns the Y where the text ended
  const endOfSummaryY = drawWrappedText(ctx, summary, startX, startY, maxWidth, lineHeight);

  // 6. Draw Footer
  // Usually the footer stays at the bottom, but you could use endOfSummaryY + 40 
  // if you wanted it to "float" right under the text.
  ctx.fillStyle = "wheat";
  ctx.font = "600 20px Inter";
  ctx.fillText("geeta.prasuco.com", 38, 592);

  // 7. Export
  const buffer = canvas.toBuffer("image/png");

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png", // PNG buffer matches PNG content type
      "Cache-Control": "public, max-age=31536000",
    },
  });
};

export async function getStaticPaths() {
  const chapters = await getCollection("chapters");
  return chapters.map((c) => ({
    params: { chapter: c.data.chapter_number.toString() },
  }));
}