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
  {
    id: "classic",
    name: "Vireon Classic",
    shortName: "Classic",
    category: "EDITORIAL NOIR",
    description: "The existing Vireon identity: quiet, sharp, and atmospheric.",
  },
  {
    id: "nothing",
    name: "Nothing × Proton",
    shortName: "Nothing",
    category: "MONOCHROME SIGNAL",
    description: "Dot-matrix detail, precise controls, and crisp code-switch motion.",
  },
  {
    id: "glass",
    name: "Liquid Glass",
    shortName: "Glass",
    category: "FLUID MATERIAL",
    description: "Translucent surfaces, soft refraction, and luminous layered depth.",
  },
  {
    id: "3d",
    name: "Dimensional 3D",
    shortName: "3D",
    category: "SCULPTED SPACE",
    description: "Perspective, lifted panels, and tactile dimensional surfaces.",
  },
  {
    id: "light",
    name: "Light",
    shortName: "Light",
    category: "CLEAN DAYLIGHT",
    description: "A bright reading canvas with ink-like text and crisp contrast.",
  },
  {
    id: "aurora",
    name: "Aurora",
    shortName: "Aurora",
    category: "COSMIC GRADIENT",
    description: "Deep indigo, violet light, and a more atmospheric night palette.",
  },
  {
    id: "paper",
    name: "Editorial Paper",
    shortName: "Paper",
    category: "ANALOG LUXURY",
    description: "Warm paper, restrained burgundy, and expressive editorial type.",
  },
  {
    id: "emerald",
    name: "Emerald Terminal",
    shortName: "Emerald",
    category: "DEVELOPER MODE",
    description: "Terminal-green signals, technical grids, and focused contrast.",
  },
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
    document.documentElement.style.colorScheme = theme === "light" || theme === "paper" ? "light" : "dark";
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
  const selectedTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0];

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
      <span className="theme-switcher-current" key={theme}>{selectedTheme.shortName}</span>
    </button>
  );
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
                      <span className="theme-card-index">{String(index + 1).padStart(2, "0")}</span>
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
