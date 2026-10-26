"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Palette, X } from "lucide-react";

export const THEMES = [
  { id: "classic", name: "Vireon Classic", shortName: "Classic", category: "EDITORIAL NOIR", description: "The original Vireon identity, preserved exactly as it is." },
  { id: "nothing", name: "Nothing × Proton", shortName: "Nothing", category: "MONOCHROME SYSTEM", description: "Pure black and white, Unicode signal glyphs, and rolling numeric readouts." },
  { id: "glass", name: "Liquid Glass", shortName: "Glass", category: "FLOATING CHROME", description: "A content-first canvas with fluid, translucent Apple-inspired controls." },
  { id: "3d", name: "Dimensional 3D", shortName: "3D", category: "SPATIAL OBJECTS", description: "A rotating six-face cube, shaded sphere, and true CSS perspective." },
  { id: "light", name: "Light", shortName: "Light", category: "MODERN GALLERY", description: "Architectural whitespace, a bright gallery canvas, and precise ink contrast." },
  { id: "universe", name: "Universe / Space", shortName: "Universe", category: "DEEP SPACE", description: "A star atlas, a planet with orbital geometry, and observatory telemetry." },
  { id: "paper", name: "Editorial Paper", shortName: "Paper", category: "PRINT EDITION", description: "A tactile journal with serif hierarchy, marginalia, and ruled ledgers." },
  { id: "lunar", name: "Lunar", shortName: "Lunar", category: "INDIGO GLITCH", description: "LunarX-inspired dark surfaces, indigo brand light, and clipped glitch signals." },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
const STORAGE_KEY = "vireon-noctis-theme";

type ThemeContextValue = {
  theme: ThemeId;
  hasPreference: boolean;
  isPickerOpen: boolean;
  previewTheme: (theme: ThemeId) => void;
  applyTheme: () => void;
  openPicker: () => void;
  closePicker: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeId(value: string | null): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>("classic");
  const [hasPreference, setHasPreference] = useState(false);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isThemeId(saved)) {
        setTheme(saved);
        setHasPreference(true);
      } else {
        setPickerOpen(true);
      }
    } catch {
      setPickerOpen(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "light" || theme === "paper" || theme === "glass" ? "light" : "dark";
  }, [theme]);

  const previewTheme = useCallback((nextTheme: ThemeId) => {
    setTheme(nextTheme);
  }, []);

  const applyTheme = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Keep the selected theme for the current session if storage is unavailable.
    }
    setHasPreference(true);
    setPickerOpen(false);
  }, [theme]);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = applyTheme;

  const value = useMemo(
    () => ({ theme, hasPreference, isPickerOpen, previewTheme, applyTheme, openPicker, closePicker }),
    [theme, hasPreference, isPickerOpen, previewTheme, applyTheme, openPicker, closePicker],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <ThemePickerDialog
        open={ready && isPickerOpen}
        theme={theme}
        hasPreference={hasPreference}
        onPreview={previewTheme}
        onApply={applyTheme}
        onClose={closePicker}
      />
    </ThemeContext.Provider>
  );
}

function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("Theme controls must be rendered inside ThemeProvider.");
  return context;
}

export function ThemeSwitcher() {
  const { theme, openPicker } = useThemeContext();
  const selectedIndex = THEMES.findIndex((item) => item.id === theme);
  const selectedTheme = THEMES[selectedIndex] ?? THEMES[0];

  return (
    <button
      type="button"
      className="theme-switcher"
      onClick={openPicker}
      aria-label={`Change website theme. Current theme: ${selectedTheme.name}`}
      aria-haspopup="dialog"
    >
      <Palette size={15} strokeWidth={1.8} aria-hidden="true" />
      <span className="theme-switcher-label">Theme</span>
      <span className="theme-switcher-index" aria-hidden="true" key={theme}>
        {(theme === "nothing" || theme === "lunar") ? <RollingNumber value={selectedIndex + 1} replayKey={theme} /> : String(selectedIndex + 1).padStart(2, "0")}
      </span>
      <span className="theme-switcher-current" key={theme}>{selectedTheme.shortName}</span>
    </button>
  );
}

const UNICODE_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function UnicodeSpinner({ label = "System activity" }: { label?: string }) {
  const [frame, setFrame] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setFrame((current) => (current + 1) % UNICODE_FRAMES.length), 84);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return <span className="unicode-signal" role="img" aria-label={label}>{UNICODE_FRAMES[frame]}</span>;
}

function RollingNumber({ value, replayKey }: { value: number; replayKey: string }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    setDisplay(0);
    const start = window.performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 920);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(progress === 1 ? value : Math.floor(eased * value));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value, replayKey, reduceMotion]);

  return <span className="rolling-number" aria-label={String(value).padStart(2, "0")}>{String(display).padStart(2, "0")}</span>;
}

export function NothingSystemStrip() {
  const { theme } = useThemeContext();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {theme === "nothing" && (
        <motion.aside className="nothing-system-strip section-shell" aria-label="Nothing monochrome system readout"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.3 }}>
          <div className="nothing-system-cell nothing-system-live"><UnicodeSpinner label="Animated Unicode system indicator" /><span>SYSTEM ONLINE</span></div>
          <div className="nothing-system-cell"><span className="nothing-system-label">THEME INDEX</span><span className="nothing-system-value"><RollingNumber value={2} replayKey={theme} /><span> / 08</span></span></div>
          <div className="nothing-system-cell"><span className="nothing-system-label">PROJECT MODULES</span><span className="nothing-system-value"><RollingNumber value={4} replayKey={theme} /><span> ACTIVE</span></span></div>
          <div className="nothing-system-cell nothing-system-unicode"><span className="nothing-system-label">SIGNAL</span><span aria-hidden="true">⠿ ⠶ ⣿ ⠿</span></div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function ThemeSignatureRail() {
  const { theme } = useThemeContext();
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {theme === "universe" && (
        <motion.aside className="universe-signature-rail section-shell" aria-label="Universe observatory readout"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.42 }}>
          <span className="universe-rail-orbit" aria-hidden="true">◎</span>
          <span><small>OBSERVATORY</small> VN-001 / LOCAL SECTOR</span>
          <span><small>STARS MAPPED</small> <RollingNumber value={248} replayKey={theme} /></span>
          <span><small>STATUS</small> <i className="universe-status-dot" /> NOMINAL</span>
          <span className="universe-coordinate">RA 18h 36m · DEC +38° 47′</span>
        </motion.aside>
      )}
      {theme === "lunar" && (
        <motion.aside className="lunar-signature-rail section-shell" aria-label="Lunar visual telemetry"
          initial={reduceMotion ? false : { opacity: 0, y: -8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0)" }} exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.32 }}>
          <span className="lunar-rail-brand"><i /> LUNAR / STYLE SIGNAL</span>
          <span className="lunar-rail-code">BRAND HSL(239 84% 67%)</span>
          <span className="lunar-rail-status"><UnicodeSpinner label="Lunar signal animation" /> SYNCED</span>
          <span className="lunar-rail-index">PROFILE / 0{THEMES.findIndex((entry) => entry.id === theme) + 1}</span>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function useCurrentTheme() {
  return useThemeContext().theme;
}

export function ThemeHeroArtwork() {
  const theme = useCurrentTheme();

  if (theme === "3d") return (
    <div className="theme-hero-artwork theme-hero-artwork-3d" aria-hidden="true">
      <div className="three-d-caption three-d-caption-top"><span>V / OBJECT STUDY</span><span>DEPTH: Z+</span></div>
      <div className="three-d-floor-grid" />
      <div className="three-d-light three-d-light-a" /><div className="three-d-light three-d-light-b" />
      <div className="three-d-ring three-d-ring-a" /><div className="three-d-ring three-d-ring-b" />
      <div className="three-d-orb three-d-orb-large"><i /><b /></div>
      <div className="three-d-cube-wrap"><div className="three-d-cube">
        <div className="three-d-face three-d-front"><span>VN</span></div><div className="three-d-face three-d-back"><span>01</span></div>
        <div className="three-d-face three-d-right" /><div className="three-d-face three-d-left" />
        <div className="three-d-face three-d-top" /><div className="three-d-face three-d-bottom" />
      </div></div>
      <div className="three-d-prism"><span /><span /><span /><span /><span /><span /></div>
      <div className="three-d-caption three-d-caption-bottom"><span>ROTATION / ACTIVE</span><span>001 — ∞</span></div>
    </div>
  );

  if (theme === "universe") return (
    <div className="theme-hero-artwork theme-hero-artwork-universe" aria-hidden="true">
      <div className="universe-starfield" /><div className="universe-orbit universe-orbit-a" />
      <div className="universe-orbit universe-orbit-b" /><div className="universe-orbit universe-orbit-c" />
      <div className="universe-planet">
        <i className="universe-planet-crater universe-crater-a" /><i className="universe-planet-crater universe-crater-b" /><i className="universe-planet-crater universe-crater-c" />
      </div>
      <div className="universe-planet-ring" /><div className="universe-satellite universe-satellite-a" /><div className="universe-satellite universe-satellite-b" />
      <div className="universe-comet"><i /></div>
      <div className="universe-art-label universe-art-label-top">SECTOR 01 / THE UNKNOWN</div>
      <div className="universe-art-label universe-art-label-bottom">A SMALL POINT OF VIEW / AN ENDLESS SKY</div>
    </div>
  );

  if (theme === "lunar") return (
    <div className="theme-hero-artwork theme-hero-artwork-lunar" aria-hidden="true">
      <div className="lunar-css-stars" /><div className="lunar-glitch-orbit lunar-glitch-orbit-a" />
      <div className="lunar-glitch-orbit lunar-glitch-orbit-b" /><div className="lunar-css-moon"><i /><b /></div>
      <div className="lunar-glitch-word" data-text="VIREON">
        <span className="lunar-glitch-main">VIREON</span>
        <span className="lunar-glitch-ghost lunar-glitch-ghost-a">VIREON</span>
        <span className="lunar-glitch-ghost lunar-glitch-ghost-b">VIREON</span>
      </div>
      <div className="lunar-css-code"><span>GLITCH / SIGNAL</span><span>239 · 84 · 67</span></div>
    </div>
  );

  return null;
}

function ThemePreview({ theme }: { theme: ThemeId }) {
  return (
    <div className={`theme-preview theme-preview-${theme}`} aria-hidden="true">
      <div className="theme-preview-top"><i /><i /><i /><span>V / N</span></div>
      <div className="theme-preview-content">
        <span />
        <b />
        <b />
        <em />
      </div>
      <div className="theme-preview-footer"><i /><i /><i /></div>
    </div>
  );
}

function ThemePickerDialog({
  open,
  theme,
  hasPreference,
  onPreview,
  onApply,
  onClose,
}: {
  open: boolean;
  theme: ThemeId;
  hasPreference: boolean;
  onPreview: (theme: ThemeId) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const selectedTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="theme-picker-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
        >
          <motion.section
            className="theme-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-picker-title"
            aria-describedby="theme-picker-description"
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99, filter: "blur(5px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="theme-picker-head">
              <div className="theme-picker-heading">
                <span className="theme-modal-eyebrow"><i /> PERSONALISE YOUR SPACE</span>
                <h2 id="theme-picker-title">{hasPreference ? "Change the atmosphere." : "Make it feel like yours."}</h2>
                <p id="theme-picker-description">
                  Eight visual identities. One website. Pick a theme now, and switch whenever the mood changes.
                </p>
              </div>
              <button type="button" className="theme-picker-close" onClick={onClose} aria-label="Close theme picker">
                <X size={18} />
              </button>
            </div>

            <div className="theme-picker-grid">
              {THEMES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-card${theme === item.id ? " is-active" : ""}`}
                  aria-pressed={theme === item.id}
                  onClick={() => onPreview(item.id)}
                >
                  <ThemePreview theme={item.id} />
                  <span className="theme-card-copy">
                    <span className="theme-card-name">{item.name}</span>
                    <span className="theme-card-description">{item.description}</span>
                    <span className="theme-card-meta">
                      <span className="theme-card-index">{(theme === "nothing" || theme === "lunar") ? <RollingNumber value={index + 1} replayKey={theme} /> : String(index + 1).padStart(2, "0")}</span>
                      <span>{item.category}</span>
                    </span>
                  </span>
                  <span className="theme-card-check" aria-hidden="true">
                    {theme === item.id ? <Check size={14} strokeWidth={2.4} /> : null}
                  </span>
                </button>
              ))}
            </div>

            <div className="theme-picker-footer">
              <p><span className="theme-selected-dot" /> Selected: <strong>{selectedTheme.name}</strong></p>
              <div className="theme-picker-actions">
                <button type="button" className="theme-picker-secondary" onClick={onClose}>
                  {hasPreference ? "Keep this look" : "Start with this look"}
                </button>
                <button type="button" className="theme-picker-apply" onClick={onApply}>
                  Apply theme <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
