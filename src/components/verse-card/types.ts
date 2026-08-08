export type Format = "square" | "horizontal" | "story";
export type Layout =
  | "centered"
  | "verse-first"
  | "translation-first"
  | "bottom-third"
  | "editorial-left"
  | "big-quote";
export type Alignment = "center" | "left";
export type BgKind = "solid" | "gradient" | "pattern" | "photo";
export type Decoration = "om" | "floral" | "none";
export type Ornament = "flourish" | "double" | "dots" | "none";
export type SanskritFontId = "tiro" | "yatra" | "noto";
export type LatinFontId = "sans" | "serif";

export interface DesignConfig {
  format: Format;
  layout: Layout;
  background: {
    kind: BgKind;
    /** solid: hex color · gradient: preset id · pattern: pattern id */
    value: string;
  };
  /** data URL of uploaded photo; never persisted */
  photo: string | null;
  showOverlay: boolean;
  photoFilters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    darken: number;
  };
  fonts: { sanskrit: SanskritFontId; latin: LatinFontId };
  sizes: { sanskrit: number; translation: number };
  colors: { text: string; muted: string; accent: string; footer: string };
  alignment: Alignment;
  decoration: Decoration;
  ornament: Ornament;
  showTranslation: boolean;
  showBrand: boolean;
  frame: boolean;
  /** radial glow behind content for depth */
  glow: boolean;
  /** film-grain texture */
  grain: boolean;
  /** soft edge vignette */
  vignette: boolean;
  padding: number;
  letterSpacing: number;
}

export interface TranslationOption {
  id: string | number;
  label: string;
  description: string;
}

export interface VerseData {
  sanskrit: string;
  translation: string;
  reference: string;
  translationOptions?: TranslationOption[];
}

export const FORMAT_DIMS: Record<Format, { width: number; height: number }> = {
  square: { width: 1440, height: 1440 },
  horizontal: { width: 1600, height: 900 },
  story: { width: 1080, height: 1920 },
};

export const DEFAULT_CONFIG: DesignConfig = {
  format: "square",
  layout: "centered",
  background: { kind: "gradient", value: "saffron-dawn" },
  photo: null,
  showOverlay: true,
  photoFilters: { brightness: 100, contrast: 105, saturation: 110, blur: 0, darken: 45 },
  fonts: { sanskrit: "yatra", latin: "sans" },
  sizes: { sanskrit: 46, translation: 26 },
  colors: {
    text: "#fffaf0",
    muted: "#ffe8c2",
    accent: "#ffd700",
    footer: "#ffdf9e",
  },
  alignment: "center",
  decoration: "om",
  ornament: "flourish",
  showTranslation: true,
  showBrand: true,
  frame: true,
  glow: true,
  grain: true,
  vignette: true,
  padding: 96,
  letterSpacing: 2,
};
