import type { CSSProperties } from "react";
import type { BgKind, DesignConfig } from "./types";

const svg = (s: string) =>
  `data:image/svg+xml,${encodeURIComponent(s.trim().replace(/\s+/g, " "))}`;

export const SOLID_SWATCHES = [
  "#ffffff",
  "#faf3e7",
  "#fdf2f8",
  "#f1f5f9",
  "#fff7ed",
  "#0a0a0a",
  "#14113D",
  "#111827",
  "#1e3a8a",
  "#064e3b",
  "#7f1d1d",
  "#f97316",
  "#fbbf24",
  "#f9a8d4",
  "#14b8a6",
];

interface GradientDef {
  label: string;
  css: string;
  glow: string;
}

export const GRADIENTS: Record<string, GradientDef> = {
  "saffron-dawn": {
    label: "Saffron Dawn",
    css: "linear-gradient(150deg,#ff7a18 0%,#ea580c 42%,#b45309 100%)",
    glow: "radial-gradient(120% 85% at 50% 40%, rgba(255,214,130,0.55) 0%, rgba(255,214,130,0) 68%)",
  },
  sunrise: {
    label: "Sunrise",
    css: "linear-gradient(150deg,#7c2d12 0%,#ea580c 48%,#fbbf24 100%)",
    glow: "radial-gradient(120% 85% at 50% 42%, rgba(255,220,140,0.5) 0%, rgba(255,220,140,0) 70%)",
  },
  "temple-maroon": {
    label: "Temple Maroon",
    css: "linear-gradient(150deg,#450a16 0%,#7f1d1d 55%,#9f1239 100%)",
    glow: "radial-gradient(120% 85% at 50% 40%, rgba(255,196,120,0.28) 0%, rgba(255,196,120,0) 70%)",
  },
  midnight: {
    label: "Midnight",
    css: "linear-gradient(150deg,#0d0a33 0%,#1e1b4b 55%,#3b0764 100%)",
    glow: "radial-gradient(120% 85% at 50% 40%, rgba(255,215,130,0.2) 0%, rgba(255,215,130,0) 70%)",
  },
  "royal-purple": {
    label: "Royal Purple",
    css: "linear-gradient(150deg,#2e1065 0%,#5b21b6 55%,#6d28d9 100%)",
    glow: "radial-gradient(120% 85% at 50% 40%, rgba(255,214,130,0.26) 0%, rgba(255,214,130,0) 70%)",
  },
  "krishna-blue": {
    label: "Krishna Blue",
    css: "linear-gradient(160deg,#172554 0%,#1d4ed8 55%,#0e7490 100%)",
    glow: "radial-gradient(120% 85% at 50% 40%, rgba(180,235,255,0.28) 0%, rgba(180,235,255,0) 70%)",
  },
  emerald: {
    label: "Sacred Emerald",
    css: "linear-gradient(150deg,#022c22 0%,#064e3b 55%,#065f46 100%)",
    glow: "radial-gradient(120% 85% at 50% 40%, rgba(180,255,210,0.2) 0%, rgba(180,255,210,0) 70%)",
  },
  gold: {
    label: "Molten Gold",
    css: "linear-gradient(150deg,#451a03 0%,#92400e 50%,#b45309 100%)",
    glow: "radial-gradient(120% 85% at 50% 42%, rgba(255,214,120,0.4) 0%, rgba(255,214,120,0) 72%)",
  },
  obsidian: {
    label: "Obsidian",
    css: "linear-gradient(150deg,#050505 0%,#18181b 55%,#27272a 100%)",
    glow: "radial-gradient(120% 85% at 50% 40%, rgba(255,215,130,0.18) 0%, rgba(255,215,130,0) 72%)",
  },
  rose: {
    label: "Rose Blush",
    css: "linear-gradient(150deg,#fdf2f8 0%,#fbcfe8 50%,#f9a8d4 100%)",
    glow: "radial-gradient(120% 85% at 50% 40%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
  },
  ocean: {
    label: "Ocean Teal",
    css: "linear-gradient(150deg,#134e4a 0%,#0f766e 55%,#14b8a6 100%)",
    glow: "radial-gradient(120% 85% at 50% 40%, rgba(200,255,240,0.24) 0%, rgba(200,255,240,0) 70%)",
  },
  "paper-fade": {
    label: "Parchment",
    css: "linear-gradient(150deg,#faf3e7 0%,#efe0c8 100%)",
    glow: "radial-gradient(120% 85% at 50% 40%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)",
  },
};

export const PATTERNS: Record<string, { label: string; base: string; image: string }> = {
  dots: {
    label: "Dots",
    base: "#111827",
    image: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><circle cx="2.5" cy="2.5" r="1.5" fill="rgba(255,255,255,0.16)"/></svg>`,
    ),
  },
  mandala: {
    label: "Mandala",
    base: "#14113D",
    image: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="1.5"><circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="72"/><circle cx="100" cy="100" r="52"/><circle cx="100" cy="100" r="32"/></g><circle cx="100" cy="100" r="10" fill="rgba(255,255,255,0.10)"/></svg>`,
    ),
  },
  om: {
    label: "Om",
    base: "#0a0a0a",
    image: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><text x="150" y="170" font-size="120" text-anchor="middle" fill="rgba(255,255,255,0.055)">ॐ</text></svg>`,
    ),
  },
};

export const GRID_IMAGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.07)"/></svg>`,
);

export const GRAIN_IMAGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="saturate" values="0"/></filter><rect width="220" height="220" filter="url(#n)" opacity="0.5"/></svg>`,
);

export const PATTERN_IDS = Object.keys(PATTERNS);
export const GRADIENT_IDS = Object.keys(GRADIENTS);

export function patternPreview(id: string): string {
  return PATTERNS[id]?.base ?? "#111827";
}

export function getBackgroundStyle(config: DesignConfig): CSSProperties {
  const bg = config.background;
  if (bg.kind === "photo") {
    return config.photo
      ? {
          backgroundImage: `url(${config.photo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: "#0a0a0a" };
  }
  if (bg.kind === "gradient") {
    const g = GRADIENTS[bg.value];
    return g ? { backgroundImage: g.css } : { backgroundColor: "#0a0a0a" };
  }
  if (bg.kind === "pattern") {
    const p = PATTERNS[bg.value];
    if (p) {
      return {
        backgroundColor: p.base,
        backgroundImage: p.image,
      };
    }
    return { backgroundColor: "#0a0a0a" };
  }
  return { backgroundColor: bg.value || "#0a0a0a" };
}

/** warm radial glow behind content (gradient/solid/dark backgrounds) */
export function getGlowStyle(config: DesignConfig): CSSProperties {
  if (!config.glow) return {};
  if (config.background.kind === "photo") {
    return {
      backgroundImage:
        "radial-gradient(110% 75% at 50% 44%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 72%)",
    };
  }
  if (config.background.kind === "gradient") {
    const g = GRADIENTS[config.background.value];
    return g ? { backgroundImage: g.glow } : {};
  }
  return {
    backgroundImage:
      "radial-gradient(120% 85% at 50% 40%, rgba(255,215,130,0.16) 0%, rgba(255,215,130,0) 70%)",
  };
}

/** soft dark edge vignette for photographic depth */
export function getVignetteStyle(config: DesignConfig): CSSProperties {
  if (!config.vignette) return {};
  const strong = config.background.kind === "photo";
  return {
    backgroundImage: `radial-gradient(115% 115% at 50% 50%, rgba(0,0,0,0) ${strong ? 48 : 58}%, rgba(0,0,0,${strong ? 0.5 : 0.26}) 100%)`,
  };
}

/** subtle film grain overlay */
export function getGrainStyle(config: DesignConfig): CSSProperties {
  if (!config.grain) return {};
  const dark = isDark(config);
  return {
    backgroundImage: GRAIN_IMAGE,
    opacity: dark ? 0.05 : 0.035,
    mixBlendMode: "overlay" as const,
  };
}

export function getPhotoFilterStyle(config: DesignConfig): CSSProperties {
  const f = config.photoFilters;
  return {
    filter: `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%)${f.blur ? ` blur(${f.blur}px)` : ""}`,
  };
}

/** flat scrim over photos so text stays legible */
export function getPhotoScrimStyle(config: DesignConfig): CSSProperties {
  const d = Math.max(0, Math.min(100, config.photoFilters.darken));
  return {
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,${d * 0.006} ) 0%, rgba(0,0,0,${d * 0.004} ) 55%, rgba(0,0,0,${d * 0.0095}) 100%)`,
  };
}

function isDark(config: DesignConfig): boolean {
  if (config.background.kind === "photo") return true;
  if (config.background.kind === "pattern") return true;
  if (config.background.kind === "gradient") {
    const g = GRADIENTS[config.background.value];
    return g ? !/paper-fade|rose/.test(config.background.value) : true;
  }
  const hex = config.background.value.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  return r * 0.299 + g * 0.587 + b * 0.114 < 150;
}

export function backgroundPreview(config: DesignConfig): string {
  const bg = config.background;
  if (bg.kind === "photo") return config.photo ?? "#0a0a0a";
  if (bg.kind === "gradient") return GRADIENTS[bg.value]?.css ?? "#0a0a0a";
  if (bg.kind === "pattern") return patternPreview(bg.value);
  return bg.value;
}

export const KIND_LABELS: Record<BgKind, string> = {
  solid: "Solid",
  gradient: "Gradient",
  pattern: "Pattern",
  photo: "Photo",
};
