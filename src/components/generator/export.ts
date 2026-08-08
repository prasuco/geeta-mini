import { toBlob as toImageBlob } from "html-to-image";
import html2canvas from "html2canvas-pro";

export async function captureCard(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  try {
    const blob = await toImageBlob(node, {
      cacheBust: true,
      pixelRatio: 1,
      backgroundColor: null,
    });
    if (blob) return blob;
  } catch {
    // fall through to html2canvas
  }
  const canvas = await html2canvas(node, {
    scale: 1,
    backgroundColor: null,
    useCORS: true,
    allowTaint: true,
  });
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function copyImage(blob: Blob): Promise<void> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("Clipboard image copying is not supported on this browser.");
  }
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

export async function shareImage(
  blob: Blob,
  filename: string,
  title: string,
  text: string,
): Promise<void> {
  if (typeof navigator.share === "undefined" || typeof navigator.canShare === "undefined") {
    throw new Error("Native sharing is not supported on this device.");
  }
  const file = new File([blob], filename, { type: "image/png" });
  if (!navigator.canShare({ files: [file] })) {
    throw new Error("This device cannot share image files.");
  }
  await navigator.share({ files: [file], title, text });
}

export function filenameFor(reference: string, format: string): string {
  const slug = reference.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  return `geeta-${slug}-${format}.png`;
}
