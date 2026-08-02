import { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas-pro";

interface GeneratorProps {
  sanskrit: string;
  translation: string;
  reference: string;
}

type Format = "square" | "horizontal" | "story";
type Theme = "light" | "dark" | "saffron" | "minimal";

const themes: Record<
  Theme,
  { bg: string; text: string; muted: string; accent: string; footer: string }
> = {
  light: {
    bg: "#ffffff",
    text: "#111827",
    muted: "#4b5563",
    accent: "#ea580c",
    footer: "#9ca3af",
  },
  dark: {
    bg: "#111827",
    text: "#f9fafb",
    muted: "#d1d5db",
    accent: "#fb923c",
    footer: "#6b7280",
  },
  saffron: {
    bg: "#f97316",
    text: "#ffffff",
    muted: "#ffedd5",
    accent: "#ffffff",
    footer: "#ffedd5",
  },
  minimal: {
    bg: "#f9fafb",
    text: "#374151",
    muted: "#6b7280",
    accent: "#9ca3af",
    footer: "#9ca3af",
  },
};

export default function Generator({
  sanskrit,
  translation,
  reference,
}: GeneratorProps) {
  const [format, setFormat] = useState<Format>("square");
  const [theme, setTheme] = useState<Theme>("light");
  const [customBgColor, setCustomBgColor] = useState("#ffffff");
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [useBgImage, setUseBgImage] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [sanskritSize, setSanskritSize] = useState(28);
  const [translationSize, setTranslationSize] = useState(18);
  const [isExporting, setIsExporting] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = themes[theme];

  const getContainerDimensions = () => {
    switch (format) {
      case "story":
        return { width: 320, height: 568 };
      case "horizontal":
        return { width: 560, height: 315 };
      default:
        return { width: 420, height: 420 };
    }
  };

  const getExportDimensions = () => {
    switch (format) {
      case "story":
        return { width: 1080, height: 1920 };
      case "horizontal":
        return { width: 1600, height: 900 };
      default:
        return { width: 1440, height: 1440 };
    }
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target?.result as string);
        setUseBgImage(true);
        setUseCustomColor(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    const { width, height } = getExportDimensions();
    const preview = previewRef.current;

    const originalWidth = preview.style.width;
    const originalHeight = preview.style.height;
    const originalTransform = preview.style.transform;

    preview.style.width = `${width}px`;
    preview.style.height = `${height}px`;
    preview.style.transform = "none";

    try {
      const canvas = await html2canvas(preview, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `geeta-verse-${format}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      preview.style.width = originalWidth;
      preview.style.height = originalHeight;
      preview.style.transform = originalTransform;
      setIsExporting(false);
    }
  }, [format]);

  const { width: containerWidth, height: containerHeight } =
    getContainerDimensions();

  const getTextColors = () => {
    if (useBgImage && bgImage) {
      return {
        text: "#ffffff",
        muted: "#e5e5e5",
        accent: "#ffffff",
        footer: "#d4d4d4",
      };
    }
    if (useCustomColor) {
      const isDark = isColorDark(customBgColor);
      return {
        text: isDark ? "#ffffff" : "#111827",
        muted: isDark ? "#d1d5db" : "#4b5563",
        accent: "#ea580c",
        footer: isDark ? "#9ca3af" : "#9ca3af",
      };
    }
    return currentTheme;
  };

  const textColors = getTextColors();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🕉</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Create Post</h1>
              <p className="text-sm text-slate-500">Design your verse image</p>
            </div>
          </div>
          <a
            href="javascript:history.back()"
            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ← Back to Verse
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Preview */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Preview
              </h2>
              <div className="flex items-center justify-center bg-slate-100 rounded-xl p-8 min-h-[400px]">
                <div
                  ref={previewRef}
                  className="relative shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center transition-all"
                  style={{
                    width: `${containerWidth}px`,
                    height: `${containerHeight}px`,
                    backgroundColor:
                      useCustomColor && !useBgImage
                        ? customBgColor
                        : useBgImage && bgImage
                          ? "transparent"
                          : currentTheme.bg,
                    backgroundImage:
                      useBgImage && bgImage ? `url(${bgImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {useBgImage && bgImage && showOverlay && (
                    <div className="absolute inset-0 bg-black/50 z-0" />
                  )}

                  <div className="relative z-10 space-y-6 flex flex-col items-center justify-center h-full w-full max-w-[85%]">
                    <div
                      className="text-3xl opacity-50"
                      style={{ color: textColors.accent }}
                    >
                      ❦
                    </div>
                    <div
                      className="font-bold leading-relaxed"
                      style={{
                        fontSize: `${sanskritSize}px`,
                        color: textColors.text,
                      }}
                    >
                      {sanskrit
                        .split("\n\n")
                        .join("\n")
                        .split("\n")
                        .map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                    </div>
                    <div
                      className="w-16 h-1 rounded-full mx-auto opacity-30"
                      style={{ backgroundColor: textColors.accent }}
                    />
                    <div
                      className="leading-relaxed italic"
                      style={{
                        fontSize: `${translationSize}px`,
                        color: textColors.muted,
                      }}
                    >
                      {translation}
                    </div>
                    <div className="pt-4 flex flex-col items-center gap-2">
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: textColors.footer }}
                      >
                        {reference}
                      </span>
                      <span
                        className="text-[10px] tracking-tight uppercase font-medium"
                        style={{ color: textColors.accent, opacity: 0.5 }}
                      >
                        geeta.prasuco.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-6">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full py-5 bg-orange-600 text-white text-lg font-bold rounded-2xl shadow-lg hover:bg-orange-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                {isExporting ? "Creating Image..." : "Download Image"}
              </button>
              <p className="text-center text-sm text-slate-500 mt-3">
                High quality PNG (1440px) for social media
              </p>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Format Selection Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  1
                </span>
                Choose Format
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "square", label: "Square", sub: "1:1", icon: "◻" },
                  { id: "horizontal", label: "Wide", sub: "16:9", icon: "▬" },
                  { id: "story", label: "Tall", sub: "9:16", icon: "▯" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id as Format)}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${format === item.id ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-orange-300"}`}
                  >
                    <span className="text-2xl mb-1 block">{item.icon}</span>
                    <span className="block text-base font-semibold text-slate-800">
                      {item.label}
                    </span>
                    <span className="text-sm text-slate-500">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  2
                </span>
                Choose Theme
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: "light", bg: "#ffffff", label: "Light" },
                  { id: "dark", bg: "#1e293b", label: "Dark" },
                  { id: "saffron", bg: "#f97316", label: "Saffron" },
                  { id: "minimal", bg: "#f1f5f9", label: "Minimal" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTheme(item.id as Theme);
                      setUseCustomColor(false);
                      setUseBgImage(false);
                    }}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === item.id && !useCustomColor && !useBgImage ? "border-orange-500 ring-2 ring-orange-100" : "border-slate-200 hover:border-orange-300"}`}
                    style={{ backgroundColor: item.bg }}
                  >
                    <div
                      className="w-8 h-8 rounded-full border border-slate-300"
                      style={{ backgroundColor: item.bg }}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Background Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  3
                </span>
                Background Options
              </h3>

              {/* Custom Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Custom Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={customBgColor}
                    onChange={(e) => {
                      setCustomBgColor(e.target.value);
                      setUseCustomColor(true);
                      setUseBgImage(false);
                    }}
                    className="w-14 h-14 rounded-xl border-2 border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customBgColor}
                    onChange={(e) => {
                      setCustomBgColor(e.target.value);
                      setUseCustomColor(true);
                      setUseBgImage(false);
                    }}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl text-base font-mono uppercase"
                  />
                </div>
              </div>

              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Your Photo
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {bgImage ? "Change Photo" : "Upload Photo"}
                </button>
                {bgImage && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={bgImage}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => {
                        setBgImage(null);
                        setUseBgImage(false);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {useBgImage && bgImage && (
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOverlay}
                      onChange={(e) => setShowOverlay(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded"
                    />
                    <span className="text-base text-slate-700">
                      Add dark overlay for readable text
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Font Size Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  4
                </span>
                Text Size
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      Sanskrit Text
                    </label>
                    <span className="text-sm text-slate-500">
                      {sanskritSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="52"
                    value={sanskritSize}
                    onChange={(e) => setSanskritSize(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      Translation
                    </label>
                    <span className="text-sm text-slate-500">
                      {translationSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="36"
                    value={translationSize}
                    onChange={(e) => setTranslationSize(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}
