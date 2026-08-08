import type { LatinFontId, SanskritFontId } from "./types";

export const SANSKRIT_FONTS: Record<
  SanskritFontId,
  { label: string; family: string; weight: number }
> = {
  yatra: {
    label: "Display",
    family: "'Yatra One', 'Tiro Devanagari Sanskrit', serif",
    weight: 400,
  },
  tiro: {
    label: "Classic",
    family: "'Tiro Devanagari Sanskrit', serif",
    weight: 400,
  },
  noto: {
    label: "Modern",
    family: "'Noto Sans Devanagari', 'Tiro Devanagari Sanskrit', sans-serif",
    weight: 500,
  },
};

export const LATIN_FONTS: Record<LatinFontId, { label: string; family: string }> = {
  serif: {
    label: "Serif",
    family: "'EB Garamond', Georgia, 'Times New Roman', serif",
  },
  sans: {
    label: "Sans",
    family: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
};
