import type { CSSProperties, ReactNode } from "react";
import type { DesignConfig, VerseData } from "./types";
import { FORMAT_DIMS } from "./types";
import { SANSKRIT_FONTS, LATIN_FONTS } from "./fonts";
import {
  getBackgroundStyle,
  getGlowStyle,
  getGrainStyle,
  getPhotoFilterStyle,
  getPhotoScrimStyle,
  getVignetteStyle,
} from "./backgrounds";

interface Props {
  config: DesignConfig;
  verse: VerseData;
}

const DECORATION: Record<string, string> = {
  om: "ॐ",
  floral: "❦",
  none: "",
};

export default function VerseCard({ config, verse }: Props) {
  const { width, height } = FORMAT_DIMS[config.format];
  const skFont = SANSKRIT_FONTS[config.fonts.sanskrit];
  const latinFont = LATIN_FONTS[config.fonts.latin];

  const onPhoto = config.background.kind === "photo" && !!config.photo;
  const textShadow = onPhoto
    ? "0 2px 22px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.55)"
    : undefined;

  const centered = config.alignment === "center";
  const ratio = height / width;
  const maxWidth = !centered ? "100%" : ratio < 0.8 ? "76%" : ratio > 1.4 ? "90%" : "86%";

  const skSize = () => {
    switch (config.layout) {
      case "big-quote":
        return Math.round(config.sizes.sanskrit * 1.25);
      case "verse-first":
        return Math.round(config.sizes.sanskrit * 1.08);
      case "editorial-left":
        return Math.round(config.sizes.sanskrit * 0.96);
      default:
        return config.sizes.sanskrit;
    }
  };

  const trSize = () => {
    switch (config.layout) {
      case "big-quote":
        return Math.round(config.sizes.translation * 0.82);
      case "translation-first":
        return Math.round(config.sizes.translation * 1.22);
      case "bottom-third":
        return Math.round(config.sizes.translation * 1.1);
      default:
        return config.sizes.translation;
    }
  };

  const rootStyle: CSSProperties = {
    width,
    height,
    padding: config.padding,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    ...(onPhoto ? {} : getBackgroundStyle(config)),
  };

  const contentStyle: CSSProperties = {
    position: "relative",
    zIndex: 5,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    maxWidth,
    width: "100%",
  };

  const baseAlign: CSSProperties = centered
    ? { alignItems: "center", textAlign: "center" as const }
    : { alignItems: "flex-start", textAlign: "left" as const };

  const layoutStyle: CSSProperties = { ...baseAlign };
  switch (config.layout) {
    case "verse-first":
      layoutStyle.justifyContent = "flex-start";
      layoutStyle.paddingTop = config.padding * 0.75;
      break;
    case "bottom-third":
      layoutStyle.justifyContent = "flex-end";
      layoutStyle.paddingBottom = config.padding * 0.55;
      break;
    default:
      layoutStyle.justifyContent = "center";
  }

  const deco = DECORATION[config.decoration];

  const sanskritBlock = (
    <div
      style={{
        fontSize: skSize(),
        lineHeight: 1.58,
        fontWeight: skFont.weight,
        color: config.colors.text,
        fontFamily: skFont.family,
        letterSpacing: 0,
        textRendering: "optimizeLegibility",
        whiteSpace: "pre-line",
        textShadow,
      }}
    >
      {verse.sanskrit.split("\n").map((line, i) => (
        <p key={i}>{line || "\u00A0"}</p>
      ))}
    </div>
  );

  const translationBlock = config.showTranslation && (
    <div
      style={{
        fontSize: trSize(),
        color: config.colors.muted,
        lineHeight: 1.55,
        fontFamily: latinFont.family,
        fontStyle: config.fonts.latin === "serif" ? "italic" : "normal",
        fontWeight: config.fonts.latin === "serif" ? 400 : 500,
        letterSpacing: 0.2,
        maxWidth: "94%",
        textShadow,
      }}
    >
      {verse.translation}
    </div>
  );

  const footerBlock = (
    <div
      style={{
        marginTop: Math.max(24, config.sizes.sanskrit * 0.55),
        display: "flex",
        flexDirection: "column",
        alignItems: centered ? "center" : "flex-start",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: config.colors.footer,
        }}
      >
        <Hairline color={config.colors.accent} width={38} />
          <span
            style={{
              fontSize: Math.max(13, Math.round(config.sizes.translation * 0.52)),
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase" as const,
              whiteSpace: "nowrap",
              textShadow,
            }}
          >
            Bhagavad Gita {verse.reference}
          </span>
        <Hairline color={config.colors.accent} width={38} />
      </div>
      {config.showBrand && (
        <span
          style={{
            fontSize: Math.max(11, Math.round(config.sizes.translation * 0.42)),
            letterSpacing: 4,
            textTransform: "uppercase" as const,
            color: config.colors.accent,
            opacity: 0.6,
            textShadow,
          }}
        >
          geeta.prasuco.com
        </span>
      )}
    </div>
  );

  const ornament = config.ornament !== "none" && (
    <OrnamentDivider config={config} />
  );

  let content: ReactNode;
  switch (config.layout) {
    case "translation-first":
      content = (
        <>
          {translationBlock}
          {ornament}
          {sanskritBlock}
          {footerBlock}
        </>
      );
      break;
    case "big-quote":
      content = (
        <>
          {sanskritBlock}
          {ornament}
          {translationBlock}
          {footerBlock}
        </>
      );
      break;
    case "verse-first":
    case "bottom-third":
      content = (
        <>
          {deco && (
            <DecoGlyph
              deco={deco}
              color={config.colors.accent}
              size={skSize()}
              mb={config.sizes.sanskrit * 0.42}
            />
          )}
          {sanskritBlock}
          {ornament}
          {translationBlock}
          {footerBlock}
        </>
      );
      break;
    default:
      content = (
        <>
          {deco && (
            <DecoGlyph
              deco={deco}
              color={config.colors.accent}
              size={skSize()}
              mb={config.sizes.sanskrit * 0.42}
            />
          )}
          {sanskritBlock}
          {ornament}
          {translationBlock}
          {footerBlock}
        </>
      );
  }

  return (
    <div style={rootStyle}>
      {/* photo layer (filtered) */}
      {onPhoto && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${config.photo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            ...getPhotoFilterStyle(config),
          }}
        />
      )}
      {/* depth layers */}
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", ...getGlowStyle(config) }}
      />
      {onPhoto && config.showOverlay && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            ...getPhotoScrimStyle(config),
          }}
        />
      )}
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", ...getGrainStyle(config) }}
      />
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", ...getVignetteStyle(config) }}
      />

      {config.layout === "editorial-left" && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: Math.max(12, Math.round(config.padding * 0.22)),
            backgroundColor: config.colors.accent,
            opacity: 0.92,
            zIndex: 5,
          }}
        />
      )}

      {config.frame && <OrnateFrame config={config} />}

      <div style={{ ...contentStyle, ...layoutStyle }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: config.sizes.sanskrit * 0.2,
            ...baseAlign,
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

function Hairline({ color, width }: { color: string; width: number }) {
  return (
    <span
      style={{
        width,
        height: 1,
        background: `linear-gradient(90deg, ${color}00, ${color}cc, ${color}00)`,
        opacity: 0.8,
      }}
    />
  );
}

function DecoGlyph({
  deco,
  color,
  size,
  mb,
}: {
  deco: string;
  color: string;
  size: number;
  mb: number;
}) {
  return (
    <div
      style={{
        fontSize: Math.round(size * 0.62),
        color,
        opacity: 0.75,
        marginBottom: mb,
        lineHeight: 1,
      }}
    >
      {deco}
    </div>
  );
}

function OrnamentDivider({ config }: { config: DesignConfig }) {
  const c = config.colors.accent;
  const base: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: `${config.sizes.sanskrit * 0.3}px 0`,
    maxWidth: 280,
    width: "100%",
    ...(config.alignment === "center"
      ? {}
      : { marginLeft: 0, marginRight: "auto" }),
  };

  if (config.ornament === "double") {
    return (
      <div style={{ ...base, flexDirection: "column", gap: 4 }}>
        <span style={{ width: "100%", height: 1, background: c, opacity: 0.5 }} />
        <span style={{ width: "72%", height: 1, background: c, opacity: 0.28 }} />
      </div>
    );
  }

  if (config.ornament === "dots") {
    return (
      <div style={base}>
        <span style={{ flex: 1, height: 1, borderTop: `1px dotted ${c}`, opacity: 0.6 }} />
        <Dot color={c} />
        <span style={{ flex: 1, height: 1, borderTop: `1px dotted ${c}`, opacity: 0.6 }} />
      </div>
    );
  }

  return (
    <div style={base}>
      <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${c}00, ${c}88)`, opacity: 0.8 }} />
      <Diamond color={c} />
      <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${c}88, ${c}00)`, opacity: 0.8 }} />
    </div>
  );
}

function Diamond({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        transform: "rotate(45deg)",
        background: color,
        opacity: 0.85,
        flexShrink: 0,
      }}
    />
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: color,
        opacity: 0.85,
        flexShrink: 0,
      }}
    />
  );
}

function OrnateFrame({ config }: { config: DesignConfig }) {
  const p = config.padding;
  const m = Math.round(p * 0.16);
  const th = Math.max(2, Math.round(p * 0.035));
  const c = config.colors.accent;
  const size = Math.max(10, Math.round(p * 0.11));

  const corners = [
    { top: m - size / 2, left: m - size / 2 },
    { top: m - size / 2, right: m - size / 2 },
    { bottom: m - size / 2, left: m - size / 2 },
    { bottom: m - size / 2, right: m - size / 2 },
  ];

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: m,
          border: `${th}px solid ${c}`,
          opacity: 0.8,
          zIndex: 6,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: m + th + Math.round(p * 0.07),
          border: "1px solid " + c,
          opacity: 0.35,
          zIndex: 6,
          pointerEvents: "none",
        }}
      />
      {corners.map((pos, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            width: size,
            height: size,
            transform: "rotate(45deg)",
            background: c,
            opacity: 0.9,
            zIndex: 7,
            pointerEvents: "none",
            ...pos,
          }}
        />
      ))}
    </>
  );
}
