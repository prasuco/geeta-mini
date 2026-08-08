import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  Palette,
  Redo2,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import VerseCard from "../verse-card/VerseCard";
import {
  DEFAULT_CONFIG,
  FORMAT_DIMS,
  type DesignConfig,
  type Format,
  type Layout,
  type SanskritFontId,
} from "../verse-card/types";
import {
  GRADIENT_IDS,
  GRADIENTS,
  GRID_IMAGE,
  PATTERNS,
  SOLID_SWATCHES,
} from "../verse-card/backgrounds";
import { TEMPLATES, templatePreview } from "../verse-card/presets";
import { LATIN_FONTS, SANSKRIT_FONTS } from "../verse-card/fonts";
import {
  captureCard,
  copyImage,
  downloadBlob,
  filenameFor,
  shareImage,
} from "./export";

interface Props {
  sanskrit: string;
  translation: string;
  reference: string;
  translationOptions?: { id: string | number; label: string; description: string }[];
}

const STORAGE_KEY = "geeta-quote-maker-v2";

const TABS = [
  { id: "design", label: "Design", icon: LayoutTemplate },
  { id: "background", label: "Background", icon: Palette },
  { id: "text", label: "Text", icon: Type },
  { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
] as const;

type TabId = (typeof TABS)[number]["id"];

const FORMATS: { id: Format; label: string; sub: string }[] = [
  { id: "square", label: "1:1", sub: "Feed" },
  { id: "horizontal", label: "16:9", sub: "Wide" },
  { id: "story", label: "9:16", sub: "Story" },
];

const LAYOUTS: { id: Layout; label: string }[] = [
  { id: "centered", label: "Centered" },
  { id: "verse-first", label: "Verse first" },
  { id: "translation-first", label: "Meaning first" },
  { id: "bottom-third", label: "Lower third" },
  { id: "editorial-left", label: "Editorial" },
  { id: "big-quote", label: "Big quote" },
];

const ORNAMENTS: { id: DesignConfig["ornament"]; label: string }[] = [
  { id: "flourish", label: "Flourish" },
  { id: "double", label: "Double" },
  { id: "dots", label: "Dots" },
  { id: "none", label: "None" },
];

function cleanSanskrit(s: string): string {
  return s
    .replace(/।।\s*\d+(?:\.\d+)?\s*।।\s*$/g, "")
    .replace(/।\s*॥\d+[\.।]\d+॥/g, "")
    .trim();
}

function loadConfig(): DesignConfig {
  const base = structuredClone(DEFAULT_CONFIG);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<DesignConfig>;
    const merged: DesignConfig = {
      ...base,
      ...saved,
      photo: null,
      background: { ...base.background, ...(saved.background ?? {}) },
      photoFilters: { ...base.photoFilters, ...(saved.photoFilters ?? {}) },
      fonts: { ...base.fonts, ...(saved.fonts ?? {}) },
      sizes: { ...base.sizes, ...(saved.sizes ?? {}) },
      colors: { ...base.colors, ...(saved.colors ?? {}) },
    };
    if (!["square", "horizontal", "story"].includes(merged.format)) merged.format = "square";
    if (
      !["centered", "verse-first", "translation-first", "bottom-third", "editorial-left", "big-quote"].includes(
        merged.layout,
      )
    )
      merged.layout = "centered";
    if (!["solid", "gradient", "pattern", "photo"].includes(merged.background.kind))
      merged.background = { kind: "gradient", value: "saffron-dawn" };
    if (!(merged.fonts.sanskrit in SANSKRIT_FONTS)) merged.fonts.sanskrit = "yatra";
    if (!(merged.fonts.latin in LATIN_FONTS)) merged.fonts.latin = "sans";
    if (!["center", "left"].includes(merged.alignment)) merged.alignment = "center";
    if (!["om", "floral", "none"].includes(merged.decoration)) merged.decoration = "om";
    if (!["flourish", "double", "dots", "none"].includes(merged.ornament)) merged.ornament = "flourish";
    if (merged.background.kind === "photo" && !merged.photo) {
      merged.background = { kind: "gradient", value: "saffron-dawn" };
    }
    return merged;
  } catch {
    return base;
  }
}

function useHistory<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const stateRef = useRef(state);
  stateRef.current = state;
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);
  const lastRef = useRef<{ t: number; key: string | null }>({ t: 0, key: null });

  const commit = useCallback((updater: (prev: T) => T, key?: string) => {
    setState((prev) => {
      const next = updater(prev);
      const now = Date.now();
      if (key && key === lastRef.current.key && now - lastRef.current.t < 800) {
        lastRef.current = { t: now, key };
        return next;
      }
      lastRef.current = { t: now, key };
      pastRef.current = [...pastRef.current.slice(-49), prev];
      futureRef.current = [];
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    const prev = pastRef.current[pastRef.current.length - 1];
    if (!prev) return;
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current.slice(-49), stateRef.current];
    setState(prev);
  }, []);

  const redo = useCallback(() => {
    const next = futureRef.current[futureRef.current.length - 1];
    if (!next) return;
    futureRef.current = futureRef.current.slice(0, -1);
    pastRef.current = [...pastRef.current.slice(-49), stateRef.current];
    setState(next);
  }, []);

  return {
    state,
    commit,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}

export default function Editor({
  sanskrit,
  translation,
  reference,
  translationOptions,
}: Props) {
  const { state: config, commit, undo, redo, canUndo, canRedo } = useHistory<DesignConfig>(loadConfig);
  const [activeTab, setActiveTab] = useState<TabId>("design");
  const [translationIdx, setTranslationIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scale, setScale] = useState(0.2);

  const dims = FORMAT_DIMS[config.format];

  const selectedTranslation =
    translationOptions && translationOptions.length > 0
      ? translationOptions[translationIdx]?.description ?? translation
      : translation;

  const verseData = {
    sanskrit: cleanSanskrit(sanskrit),
    translation: selectedTranslation,
    reference,
    translationOptions,
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...config, photo: null }));
    } catch {
      // storage may be unavailable
    }
  }, [config]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useLayoutEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const measure = () => {
      const { clientWidth, clientHeight } = vp;
      const s = Math.min((clientWidth - 72) / dims.width, (clientHeight - 72) / dims.height);
      setScale(Math.max(0.01, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [config.format, dims.width, dims.height]);

  const patch = useCallback(
    (p: Partial<DesignConfig>, key?: string) => commit((prev) => ({ ...prev, ...p }), key),
    [commit],
  );

  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((t) => t.id === id);
    if (!t) return;
    commit(
      (prev) => ({
        ...structuredClone(t.config),
        photo: prev.photo,
        format: prev.format,
      }),
      "template",
    );
  };

  const onUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      commit(
        (prev) => ({
          ...prev,
          photo: dataUrl,
          background: { kind: "photo", value: "" },
        }),
        "photo",
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removePhoto = () => {
    commit(
      (prev) => ({
        ...prev,
        photo: null,
        background: { kind: "gradient", value: "saffron-dawn" },
      }),
      "photo",
    );
  };

  const showToast = (msg: string) => setToast(msg);

  const capture = useCallback(async (): Promise<Blob> => {
    if (!cardRef.current) throw new Error("Canvas not ready");
    return captureCard(cardRef.current);
  }, []);

  const handleDownload = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const blob = await capture();
      downloadBlob(blob, filenameFor(reference, config.format));
      showToast("Image downloaded");
    } catch {
      showToast("Download failed — try again");
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const blob = await capture();
      const filename = filenameFor(reference, config.format);
      try {
        await shareImage(
          blob,
          filename,
          `Bhagavad Gita ${reference}`,
          `"${verseData.translation}" — Bhagavad Gita ${reference}. Make your own at https://geeta.prasuco.com`,
        );
      } catch {
        downloadBlob(blob, filename);
        showToast("Saved — native share not available");
      }
    } catch {
      showToast("Share failed — try again");
    } finally {
      setExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const blob = await capture();
      await copyImage(blob);
      showToast("Image copied");
    } catch {
      showToast("Couldn't copy image on this browser");
    } finally {
      setExporting(false);
    }
  };

  const handleCopyText = async () => {
    const text = `"${verseData.translation}"\n\n— Bhagavad Gita ${reference}\nhttps://geeta.prasuco.com`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Verse text copied");
    } catch {
      showToast("Copy failed");
    }
  };

  const chipBase =
    "px-3 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed";
  const chipOn = "bg-orange-600 border-orange-500 text-white";
  const chipOff = "border-white/15 text-white/70 hover:bg-white/10";
  const sectionLabel = "text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2";

  return (
    <div className="flex flex-col flex-1 min-h-0 md:flex-row">
      {/* Canvas stage */}
      <div className="relative flex-1 min-h-0 bg-[#0b0d12] flex items-stretch md:min-h-0">
        <div
          ref={viewportRef}
          className="relative flex-1 overflow-hidden"
          style={{
            backgroundImage: GRID_IMAGE ? `url(${GRID_IMAGE})` : undefined,
            backgroundSize: "24px 24px",
          }}
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(90%_70%_at_50%_35%,rgba(255,255,255,0.04),transparent_70%)]" />

          {/* Format switcher */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex rounded-full bg-white/[0.07] border border-white/10 p-1 backdrop-blur-md">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => patch({ format: f.id }, "format")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  config.format === f.id
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-900/40"
                    : "text-white/55 hover:text-white"
                }`}
                title={f.sub}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Card with bezel + shadow (presentation only, not captured) */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: dims.width * scale,
              height: dims.height * scale,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 18,
                padding: 10,
                background: "#000",
                boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxSizing: "border-box",
              }}
            >
              <div
                ref={cardRef}
                style={{
                  width: dims.width,
                  height: dims.height,
                  overflow: "hidden",
                  borderRadius: 8,
                }}
              >
                <VerseCard config={config} verse={verseData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 md:flex-1 md:w-[400px] md:flex-none min-h-0 flex flex-col bg-[#12151c] md:border-l md:border-white/10">
        {/* History row */}
        <div className="flex items-center justify-between px-4 pt-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo"
              className="p-2 rounded-lg text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
              className="p-2 rounded-lg text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() =>
              commit(
                (prev) => ({
                  ...structuredClone(DEFAULT_CONFIG),
                  format: prev.format,
                  photo: prev.photo,
                }),
                "reset",
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mt-2 shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all ${
                  active
                    ? "text-orange-400 border-b-2 border-orange-500 bg-white/[0.03]"
                    : "text-white/45 hover:text-white/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Panel scroll */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "design" && (
            <div>
              <div className={sectionLabel}>Templates</div>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t.id)}
                    className="group rounded-xl overflow-hidden border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all hover:border-white/25"
                  >
                    <div
                      className="h-16 w-full bg-center bg-cover"
                      style={{ background: templatePreview(t.id) }}
                    />
                    <div className="bg-white/[0.04] px-2 py-1.5 text-xs font-medium text-white/60 text-center truncate group-hover:text-white/90">
                      {t.name}
                    </div>
                  </button>
                ))}
              </div>

              <div className={sectionLabel}>Layout</div>
              <div className="grid grid-cols-3 gap-2">
                {LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => patch({ layout: l.id }, "layout")}
                    className={`${chipBase} ${config.layout === l.id ? chipOn : chipOff}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "background" && (
            <div>
              <div className={sectionLabel}>Photo</div>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onUploadPhoto}
                />
                {config.background.kind === "photo" && config.photo ? (
                  <div className="flex flex-col gap-3">
                    <img
                      src={config.photo}
                      alt="Background"
                      className="w-full h-24 object-cover rounded-lg border border-white/10"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`${chipBase} ${chipOff} flex-1`}
                      >
                        Change
                      </button>
                      <button
                        onClick={removePhoto}
                        className={`${chipBase} ${chipOff} flex items-center gap-1.5`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                      <label className="flex items-center gap-1.5 cursor-pointer px-2">
                        <input
                          type="checkbox"
                          checked={config.showOverlay}
                          onChange={(e) => patch({ showOverlay: e.target.checked }, "overlay")}
                          className="w-4 h-4 accent-orange-600"
                        />
                        <span className="text-xs text-white/60">Scrim</span>
                      </label>
                    </div>
                    <Slider
                      label="Darken"
                      value={config.photoFilters.darken}
                      min={0}
                      max={100}
                      onChange={(v) =>
                        commit(
                          (prev) => ({
                            ...prev,
                            photoFilters: { ...prev.photoFilters, darken: v },
                          }),
                          "photoFilters.darken",
                        )
                      }
                    />
                    <Slider
                      label="Brightness"
                      value={config.photoFilters.brightness}
                      min={40}
                      max={160}
                      onChange={(v) =>
                        commit(
                          (prev) => ({
                            ...prev,
                            photoFilters: { ...prev.photoFilters, brightness: v },
                          }),
                          "photoFilters.brightness",
                        )
                      }
                    />
                    <Slider
                      label="Contrast"
                      value={config.photoFilters.contrast}
                      min={60}
                      max={160}
                      onChange={(v) =>
                        commit(
                          (prev) => ({
                            ...prev,
                            photoFilters: { ...prev.photoFilters, contrast: v },
                          }),
                          "photoFilters.contrast",
                        )
                      }
                    />
                    <Slider
                      label="Saturation"
                      value={config.photoFilters.saturation}
                      min={0}
                      max={200}
                      onChange={(v) =>
                        commit(
                          (prev) => ({
                            ...prev,
                            photoFilters: { ...prev.photoFilters, saturation: v },
                          }),
                          "photoFilters.saturation",
                        )
                      }
                    />
                    <Slider
                      label="Blur"
                      value={config.photoFilters.blur}
                      min={0}
                      max={8}
                      onChange={(v) =>
                        commit(
                          (prev) => ({
                            ...prev,
                            photoFilters: { ...prev.photoFilters, blur: v },
                          }),
                          "photoFilters.blur",
                        )
                      }
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`${chipBase} ${chipOff} w-full flex items-center justify-center gap-2 py-3 border-dashed`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    {config.background.kind === "photo" ? "Pick a photo" : "Use your photo"}
                  </button>
                )}
              </div>

              <div className={sectionLabel}>Solid colors</div>
              <div className="grid grid-cols-8 gap-2 mb-6">
                {SOLID_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    onClick={() =>
                      commit(
                        (prev) => ({
                          ...prev,
                          photo: null,
                          background: { kind: "solid", value: hex },
                        }),
                        "bg-solid",
                      )
                    }
                    className={`h-9 rounded-lg border border-white/15 transition-all ${
                      config.background.kind === "solid" && config.background.value === hex
                        ? "ring-2 ring-orange-500 scale-105"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>

              <div className={sectionLabel}>Gradients</div>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {GRADIENT_IDS.map((id) => (
                  <button
                    key={id}
                    onClick={() =>
                      commit(
                        (prev) => ({
                          ...prev,
                          photo: null,
                          background: { kind: "gradient", value: id },
                        }),
                        "bg-gradient",
                      )
                    }
                    className={`h-14 rounded-lg border transition-all ${
                      config.background.kind === "gradient" && config.background.value === id
                        ? "ring-2 ring-orange-500 scale-105 border-transparent"
                        : "border-white/15 hover:scale-105"
                    }`}
                    style={{ background: GRADIENTS[id].css }}
                    title={GRADIENTS[id].label}
                  />
                ))}
              </div>

              <div className={sectionLabel}>Patterns</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(PATTERNS).map((id) => (
                  <button
                    key={id}
                    onClick={() =>
                      commit(
                        (prev) => ({
                          ...prev,
                          photo: null,
                          background: { kind: "pattern", value: id },
                        }),
                        "bg-pattern",
                      )
                    }
                    className={`h-14 rounded-lg border transition-all ${
                      config.background.kind === "pattern" && config.background.value === id
                        ? "ring-2 ring-orange-500 scale-105 border-transparent"
                        : "border-white/15 hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: PATTERNS[id].base,
                      backgroundImage: PATTERNS[id].image,
                    }}
                    title={PATTERNS[id].label}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "text" && (
            <div>
              {translationOptions && translationOptions.length > 0 && (
                <>
                  <div className={sectionLabel}>Translation</div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {translationOptions.map((opt, i) => (
                      <button
                        key={String(opt.id)}
                        onClick={() => setTranslationIdx(i)}
                        className={`${chipBase} ${translationIdx === i ? chipOn : chipOff}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className={sectionLabel}>Devanagari font</div>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {(Object.keys(SANSKRIT_FONTS) as SanskritFontId[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => commit((prev) => ({ ...prev, fonts: { ...prev.fonts, sanskrit: id } }), "fonts")}
                    className={`${chipBase} ${config.fonts.sanskrit === id ? chipOn : chipOff}`}
                    style={{ fontFamily: SANSKRIT_FONTS[id].family, fontSize: 16 }}
                  >
                    {SANSKRIT_FONTS[id].label}
                  </button>
                ))}
              </div>

              <div className={sectionLabel}>Meaning font</div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {(Object.keys(LATIN_FONTS) as (keyof typeof LATIN_FONTS)[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => commit((prev) => ({ ...prev, fonts: { ...prev.fonts, latin: id } }), "fonts")}
                    className={`${chipBase} ${config.fonts.latin === id ? chipOn : chipOff}`}
                    style={{ fontFamily: LATIN_FONTS[id].family }}
                  >
                    {LATIN_FONTS[id].label}
                  </button>
                ))}
              </div>

              <div className={sectionLabel}>Alignment</div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {(
                  [
                    { id: "center", label: "Center" },
                    { id: "left", label: "Left" },
                  ] as const
                ).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => patch({ alignment: a.id }, "alignment")}
                    className={`${chipBase} ${config.alignment === a.id ? chipOn : chipOff}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              <ToggleRow
                label="Show meaning"
                checked={config.showTranslation}
                onChange={(v) => patch({ showTranslation: v }, "showTranslation")}
              />
            </div>
          )}

          {activeTab === "adjust" && (
            <div>
              <div className={sectionLabel}>Text size</div>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-6">
                <Slider
                  label="Devanagari"
                  value={config.sizes.sanskrit}
                  min={26}
                  max={76}
                  onChange={(v) =>
                    commit((prev) => ({ ...prev, sizes: { ...prev.sizes, sanskrit: v } }), "sizes.sanskrit")
                  }
                />
                <Slider
                  label="Meaning"
                  value={config.sizes.translation}
                  min={14}
                  max={38}
                  onChange={(v) =>
                    commit((prev) => ({ ...prev, sizes: { ...prev.sizes, translation: v } }), "sizes.translation")
                  }
                />
              </div>

              <div className={sectionLabel}>Spacing</div>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-6">
                <Slider
                  label="Padding"
                  value={config.padding}
                  min={48}
                  max={160}
                  onChange={(v) => patch({ padding: v }, "padding")}
                />
                <Slider
                  label="Letter spacing"
                  value={config.letterSpacing}
                  min={0}
                  max={8}
                  onChange={(v) => patch({ letterSpacing: v }, "letterSpacing")}
                />
              </div>

              <div className={sectionLabel}>Colors</div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <ColorInput
                  label="Text"
                  value={config.colors.text}
                  onChange={(v) =>
                    commit((prev) => ({ ...prev, colors: { ...prev.colors, text: v } }), "colors.text")
                  }
                />
                <ColorInput
                  label="Meaning"
                  value={config.colors.muted}
                  onChange={(v) =>
                    commit((prev) => ({ ...prev, colors: { ...prev.colors, muted: v } }), "colors.muted")
                  }
                />
                <ColorInput
                  label="Accent"
                  value={config.colors.accent}
                  onChange={(v) =>
                    commit((prev) => ({ ...prev, colors: { ...prev.colors, accent: v } }), "colors.accent")
                  }
                />
                <ColorInput
                  label="Footer"
                  value={config.colors.footer}
                  onChange={(v) =>
                    commit((prev) => ({ ...prev, colors: { ...prev.colors, footer: v } }), "colors.footer")
                  }
                />
              </div>

              <div className={sectionLabel}>Symbol</div>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {(
                  [
                    { id: "om", label: "ॐ" },
                    { id: "floral", label: "❦" },
                    { id: "none", label: "None" },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => patch({ decoration: d.id }, "decoration")}
                    className={`${chipBase} ${config.decoration === d.id ? chipOn : chipOff}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className={sectionLabel}>Divider</div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {ORNAMENTS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => patch({ ornament: o.id }, "ornament")}
                    className={`${chipBase} ${config.ornament === o.id ? chipOn : chipOff}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>

              <div className={sectionLabel}>Effects</div>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-2 mb-6">
                <ToggleRow label="Gold frame" checked={config.frame} onChange={(v) => patch({ frame: v }, "frame")} />
                <ToggleRow label="Glow" checked={config.glow} onChange={(v) => patch({ glow: v }, "glow")} />
                <ToggleRow label="Grain texture" checked={config.grain} onChange={(v) => patch({ grain: v }, "grain")} />
                <ToggleRow label="Vignette" checked={config.vignette} onChange={(v) => patch({ vignette: v }, "vignette")} />
                <ToggleRow label="Brand footer" checked={config.showBrand} onChange={(v) => patch({ showBrand: v }, "showBrand")} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="shrink-0 border-t border-white/10 bg-[#12151c] px-4 py-3 flex items-center gap-2 md:px-6">
        <button
          onClick={handleDownload}
          disabled={exporting}
          className="flex-[1.6] py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base shadow-lg shadow-orange-900/40 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          {exporting ? "Creating..." : "Download PNG"}
        </button>
        <button
          onClick={handleShare}
          disabled={exporting}
          className="flex-1 px-4 py-3.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/10 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={handleCopyImage}
          disabled={exporting}
          title="Copy image"
          className="p-3.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={handleCopyText}
          title="Copy verse text"
          className="p-3.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/10 transition-all"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white text-slate-900 text-sm font-semibold shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-white/70">{label}</span>
        <span className="text-sm text-white/40 tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 appearance-none rounded-full bg-white/10 accent-orange-500"
      />
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 cursor-pointer">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-white/20 cursor-pointer bg-transparent"
      />
      <span className="text-sm text-white/70">{label}</span>
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2.5 cursor-pointer" onClick={() => onChange(!checked)}>
      <span className="text-sm font-medium text-white/70">{label}</span>
      <span
        className={`relative inline-flex items-center rounded-full transition-colors w-10 h-6 ${
          checked ? "bg-orange-500" : "bg-white/15"
        }`}
      >
        <span
          className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </div>
  );
}
