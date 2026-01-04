import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { createCanvas } from "canvas";


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
  ctx.fillStyle = "#FFCC00";
  ctx.font = "600 44px Inter";
  ctx.fillText(chapter.data.name, 38, 157);

  // 5. Draw Wrapped Summary
  ctx.fillStyle = "white";
  ctx.font = "500 24px Inter";
  const summary = chapter.data.chapter_summary;
  const maxWidth = 1100; // Constrain the text width
  const lineHeight = 32;
  const startX = 38;
  const startY = 220;

  wrapText(ctx, summary, startX, startY, maxWidth, lineHeight);

  // 6. Draw Footer
  ctx.fillStyle = "wheat";
  ctx.font = "600 20px Inter";
  ctx.fillText("geeta.prasuco.com", 38, 592);

  // 7. Export to WebP
  const buffer = canvas.toBuffer("image/png");

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000",
    },
  });
};

/**
 * Helper function to wrap text on Canvas
 */
function wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
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
  const chapters = await getCollection("chapters");
  return chapters.map((c) => ({
    params: { chapter: c.data.chapter_number.toString() },
  }));
}