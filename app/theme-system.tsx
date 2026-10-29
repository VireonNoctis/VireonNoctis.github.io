"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { ArrowRight, Check, Palette, X } from "lucide-react";

export const THEMES = [
  { id: "classic", name: "Vireon Classic", shortName: "Classic", category: "EDITORIAL NOIR", description: "The signature Vireon look: literary display type, restrained details, and deliberate negative space." },
  { id: "nothing", name: "NothingOS", shortName: "NothingOS", category: "MONOCHROME SYSTEM", description: "A hard monochrome interface with IBM Plex Mono labels, rolling number wheels, and an animated signal grid." },
  { id: "light", name: "Light Mode", shortName: "Light", category: "MODERN GALLERY", description: "A bright editorial gallery with centered typography, architectural spacing, and ink-blue details." },
  { id: "cinematic", name: "Cinematic Ink", shortName: "Ink", category: "COMIC CINEMA", description: "A red, black, and paper-white comic world built around moving panels and bold illustrated scenes." },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
const STORAGE_KEY = "vireon-noctis-theme-v2";
const LEGACY_STORAGE_KEY = "vireon-noctis-theme";

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
        // Preserve existing visitors' selection and show the refreshed theme picker once.
        const legacySaved = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (isThemeId(legacySaved)) {
          setTheme(legacySaved);
          setHasPreference(true);
        }

        setPickerOpen(true);
      }
    } catch {
      // If storage is blocked, the picker still works for the current session.
      setPickerOpen(true);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
  }, [theme]);

  const previewTheme = useCallback((nextTheme: ThemeId) => {
    setTheme(nextTheme);
  }, []);

  const applyTheme = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
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
      {ready ? (
        <ThemePickerDialog
          open={isPickerOpen}
          theme={theme}
          hasPreference={hasPreference}
          onPreview={previewTheme}
          onApply={applyTheme}
          onClose={closePicker}
        />
      ) : null}
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
      aria-controls="theme-picker-title"
      title={`Current theme: ${selectedTheme.name}. Click to change.`}
    >
      <Palette size={14} strokeWidth={1.9} aria-hidden="true" />
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
  const [ready, setReady] = useState(false);
  const formatted = String(value).padStart(2, "0");

  useEffect(() => {
    if (reduceMotion) {
      setReady(true);
      return;
    }

    // Animate from the current wheel position to the next value, without snapping to zero.
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [value, replayKey, reduceMotion]);

  return (
    <span className={`rolling-number${reduceMotion ? " is-static" : ""}`} aria-label={formatted}>
      <span className="rolling-number-accessible">{formatted}</span>
      <span className="rolling-number-wheels" aria-hidden="true">
        {[...formatted].reverse().map((digit, index) => (
          <span className="rolling-number-digit" key={index}>
            <span
              className="rolling-number-wheel"
              style={{ transform: `translateY(-${ready ? Number(digit) : 0}em)` }}
            >
              {Array.from({ length: 10 }, (_, number) => (
                <span className="rolling-number-wheel-digit" key={number}>{number}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}


/**
 * Animates any live metric when its data arrives or changes. Unlike the
 * NothingOS digit wheels, this count-up works in every theme and for values
 * loaded asynchronously from AniList, Last.fm, GitHub, and the code snapshot.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1250,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const numberRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(numberRef, { once: true, amount: 0.25 });
  const [displayed, setDisplayed] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    if (!Number.isFinite(value) || !isInView) return;
    if (reduceMotion || current.current === value) {
      current.current = value;
      setDisplayed(value);
      return;
    }

    const start = current.current;
    const span = Math.max(250, duration);
    let startedAt: number | null = null;
    let frame = 0;
    const tick = (now: number) => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / span);
      const eased = 1 - Math.pow(1 - progress, 4);
      const next = start + (value - start) * eased;
      current.current = next;
      setDisplayed(next);
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      } else {
        current.current = value;
        setDisplayed(value);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value, duration, reduceMotion, isInView]);

  const formatter = useMemo(
    () => new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
    [decimals],
  );
  const targetText = formatter.format(value);

  return (
    <span
      ref={numberRef}
      className="animated-number"
      aria-label={`${prefix}${targetText}${suffix}`}
      aria-live="off"
      data-animated-number=""
    >
      {prefix}{formatter.format(displayed)}{suffix}
    </span>
  );
}

export function NothingSystemStrip() {
  const { theme } = useThemeContext();
  const reduceMotion = useReducedMotion();
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (theme !== "nothing" || reduceMotion) return;
    const interval = window.setInterval(() => setCycle((current) => (current + 1) % 100), 1600);
    return () => window.clearInterval(interval);
  }, [theme, reduceMotion]);

  return (
    <AnimatePresence>
      {theme === "nothing" && (
        <motion.aside className="nothing-system-strip section-shell" aria-label="Nothing monochrome system readout"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.3 }}>
          <div className="nothing-system-cell nothing-system-live"><UnicodeSpinner label="Animated Unicode system indicator" /><span>SYSTEM ONLINE</span></div>
          <div className="nothing-system-cell"><span className="nothing-system-label">THEME INDEX</span><span className="nothing-system-value"><RollingNumber value={2} replayKey={theme} /><span> / 03</span></span></div>
          <div className="nothing-system-cell"><span className="nothing-system-label">PROJECT MODULES</span><span className="nothing-system-value"><RollingNumber value={4} replayKey={theme} /><span> ACTIVE</span></span></div>
          <div className="nothing-system-cell nothing-system-unicode"><span className="nothing-system-label">SIGNAL CYCLE</span><span className="nothing-system-cycle"><RollingNumber value={cycle} replayKey="nothing-cycle" /><span> / 99</span></span><span className="nothing-system-signal" aria-hidden="true">⠿ ⠶ ⣿ ⠿</span></div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function ThemeSignatureRail() {
  const { theme } = useThemeContext();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {theme === "classic" && (
        <motion.aside key="classic-rail" className="theme-signature-rail classic-signature-rail section-shell"
          aria-label="Vireon Classic edition note"
          initial={reduceMotion ? false : { opacity: 0, y: -7 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: reduceMotion ? 0 : 0.28 }}>
          <span>VIREON / FIELD NOTES</span>
          <span>THINGS I CAN’T LEAVE ALONE</span>
          <span>EDITION 001 · OPEN INDEX</span>
        </motion.aside>
      )}
      {theme === "light" && (
        <motion.aside key="light-rail" className="theme-signature-rail light-signature-rail section-shell"
          aria-label="Light Mode gallery note"
          initial={reduceMotion ? false : { opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}>
          <span>PERSONAL ARCHIVE</span>
          <span>SELECTED WORK / EDITORIAL VIEW</span>
          <span>CURATED WITH CURIOSITY ↗</span>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}


export function useCurrentTheme() {
  return useThemeContext().theme;
}

export function ThemeHeroArtwork() {
  const theme = useCurrentTheme();
  const reduceMotion = useReducedMotion();
  const [cinematicScene, setCinematicScene] = useState(0);
  const sceneNames = ["Objects", "Curtain call", "The arrival", "The witness", "Title sequence", "The eyes", "Reach", "The pour"];

  useEffect(() => {
    if (theme !== "cinematic" || reduceMotion) return;
    const interval = window.setInterval(() => {
      setCinematicScene((current) => (current + 1) % sceneNames.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [theme, reduceMotion, sceneNames.length]);

  if (theme === "cinematic") return (
    <div className="theme-hero-artwork theme-hero-artwork-cinematic" role="group" aria-label="Cinematic Ink illustrated scene sequence">
      <div className={`cinematic-scene cinematic-scene-bottles${cinematicScene === 0 ? " is-active" : ""}`} aria-hidden="true">
        <div className="cinematic-bottle cinematic-bottle-blue"><i className="cinematic-bottle-neck"/><i className="cinematic-bottle-cap"/></div>
        <div className="cinematic-bottle cinematic-bottle-yellow"><i className="cinematic-bottle-neck"/><i className="cinematic-bottle-cap"/></div>
        <div className="cinematic-bottle cinematic-bottle-lime"><i className="cinematic-bottle-neck"/><i className="cinematic-bottle-cap"/></div>
        <span className="cinematic-shelf cinematic-shelf-top"/>
        <span className="cinematic-shelf cinematic-shelf-bottom"/>
        <span className="cinematic-scene-stamp">OBJECT STUDY / 001</span>
      </div>

      <div className={`cinematic-scene cinematic-scene-curtain${cinematicScene === 1 ? " is-active" : ""}`} aria-hidden="true">
        <div className="cinematic-theatre-curtain cinematic-theatre-curtain-left"/>
        <div className="cinematic-theatre-curtain cinematic-theatre-curtain-right"/>
        <div className="cinematic-stage-opening"><span className="cinematic-stage-orb"/><span className="cinematic-stage-person"><i/><b/></span></div>
        <span className="cinematic-curtain-floor"/>
        <span className="cinematic-scene-stamp">ACT I / THE OPENING</span>
      </div>

      <div className={`cinematic-scene cinematic-scene-arrival${cinematicScene === 2 ? " is-active" : ""}`} aria-hidden="true">
        <div className="cinematic-arrival-paper"/>
        <div className="cinematic-arrival-red"/>
        <div className="cinematic-person cinematic-person-front">
          <span className="cinematic-person-hair"/><span className="cinematic-person-face"/><span className="cinematic-person-neck"/>
          <span className="cinematic-person-coat"/><span className="cinematic-person-shirt"/><span className="cinematic-person-trousers"/>
          <span className="cinematic-person-arm"/>
        </div>
        <span className="cinematic-arrival-caption">A FIGURE ENTERS THE FRAME.</span>
        <span className="cinematic-scene-stamp">CAST / 002</span>
      </div>

      <div className={`cinematic-scene cinematic-scene-witness${cinematicScene === 3 ? " is-active" : ""}`} aria-hidden="true">
        <div className="cinematic-red-velvet"/>
        <div className="cinematic-back-figure"><span className="cinematic-back-hair"/><span className="cinematic-back-coat"/><span className="cinematic-back-trousers"/><span className="cinematic-back-arm"/></div>
        <span className="cinematic-witness-light"/>
        <span className="cinematic-scene-stamp">ACT II / THE WITNESS</span>
      </div>

      <div className={`cinematic-scene cinematic-scene-title${cinematicScene === 4 ? " is-active" : ""}`} aria-hidden="true">
        <span className="cinematic-title-ornament cinematic-title-ornament-left"/>
        <span className="cinematic-title-ornament cinematic-title-ornament-right"/>
        <div className="cinematic-title-lockup"><small>A VIREON ORIGINAL</small><strong>THE</strong><strong>NOCTURNE</strong><strong>EXPERIENCE</strong><i/><span>SOFTWARE · STORIES · SOUND</span></div>
        <div className="cinematic-title-paper"><span/><span/><span/><span/><span/></div>
        <span className="cinematic-scene-stamp">INTERMISSION / 003</span>
      </div>

      <div className={`cinematic-scene cinematic-scene-eyes${cinematicScene === 5 ? " is-active" : ""}`} aria-hidden="true">
        <div className="cinematic-eye-hair"/>
        <div className="cinematic-eye-face">
          <div className="cinematic-eye cinematic-eye-left"><i/><b/></div>
          <div className="cinematic-eye cinematic-eye-right"><i/><b/></div>
        </div>
        <div className="cinematic-eye-shadow"/>
        <span className="cinematic-scene-stamp">CLOSE-UP / 004</span>
      </div>

      <div className={`cinematic-scene cinematic-scene-reach${cinematicScene === 6 ? " is-active" : ""}`} aria-hidden="true">
        <div className="cinematic-reach-velvet"/>
        <div className="cinematic-red-spiral"><i/><i/><i/></div>
        <div className="cinematic-reaching-arm"><span className="cinematic-reaching-hand"><i/><i/><i/><i/><b/></span></div>
        <span className="cinematic-scene-stamp">MOTION / 005</span>
      </div>

      <div className={`cinematic-scene cinematic-scene-pour${cinematicScene === 7 ? " is-active" : ""}`} aria-hidden="true">
        <div className="cinematic-pour-red"/>
        <div className="cinematic-pour-arm"><span className="cinematic-pour-hand"/></div>
        <div className="cinematic-pour-stream"/>
        <div className="cinematic-pour-glass"><i/></div>
        <span className="cinematic-scene-stamp">FINAL FRAME / 006</span>
      </div>

      <span className="cinematic-scene-index" aria-live="off">SCENE {String(cinematicScene + 1).padStart(2, "0")} / 08</span>
      <span className="cinematic-scene-name" aria-live="polite">{sceneNames[cinematicScene]}</span>
      <div className="cinematic-scene-controls" aria-label="Navigate illustrated scenes">
        <button type="button" onClick={() => setCinematicScene((current) => (current + sceneNames.length - 1) % sceneNames.length)} aria-label="Previous cinematic scene"><span aria-hidden="true">←</span></button>
        <button type="button" onClick={() => setCinematicScene((current) => (current + 1) % sceneNames.length)} aria-label="Next cinematic scene"><span aria-hidden="true">→</span></button>
      </div>
      <span className="cinematic-frame-rule cinematic-frame-rule-top" aria-hidden="true"/>
      <span className="cinematic-frame-rule cinematic-frame-rule-bottom" aria-hidden="true"/>
    </div>
  );

  if (theme === "nothing") return (
    <div className="theme-hero-artwork theme-hero-artwork-nothing" aria-hidden="true">
      <div className="nothing-hero-grid" />
      <div className="nothing-hero-ring nothing-hero-ring-outer" />
      <div className="nothing-hero-ring nothing-hero-ring-inner" />
      <div className="nothing-hero-core"><span>N</span></div>
      <div className="nothing-hero-scan" />
      <span className="nothing-hero-code nothing-hero-code-top">SYSTEM / 001</span>
      <span className="nothing-hero-code nothing-hero-code-bottom">SIGNAL PRESENT · 100%</span>
    </div>
  );

  if (theme === "light") return (
    <div className="theme-hero-artwork theme-hero-artwork-light" aria-hidden="true">
      <div className="light-hero-grid" />
      <div className="light-hero-sheet light-hero-sheet-back" />
      <div className="light-hero-sheet light-hero-sheet-front">
        <span>V / N</span><i /><i /><b /><small>SOFTWARE · STORIES · SOUND</small>
      </div>
      <span className="light-hero-index light-hero-index-top">ARCHIVE / 001</span>
      <span className="light-hero-index light-hero-index-bottom">A PERSONAL COLLECTION</span>
    </div>
  );

  return null;
}

function ThemePreview({ theme }: { theme: ThemeId }) {
  if (theme === "cinematic") {
    return (
      <div className="theme-preview theme-preview-cinematic" aria-hidden="true">
        <span className="cinematic-preview-bars" />
        <span className="cinematic-preview-ring" />
        <span className="cinematic-preview-panel" />
        <span className="cinematic-preview-redline" />
      </div>
    );
  }
  if (theme === "nothing") {
    return (
      <div className="theme-preview theme-preview-nothing" aria-hidden="true">
        <div className="preview-system-top"><span>SYS / 001</span><i /><i /><i /></div>
        <div className="preview-system-grid">
          <span>01 <b>BOOT</b></span><span>02 <b>BUILD</b></span><span>03 <b>SHIP</b></span>
        </div>
        <div className="preview-system-readout"><strong>83.6</strong><span> SIGNAL STABLE / RUNNING</span></div>
      </div>
    );
  }
  if (theme === "light") {
    return (
      <div className="theme-preview theme-preview-light" aria-hidden="true">
        <div className="preview-gallery-back" />
        <div className="preview-gallery-sheet">
          <span>VOLUME 001 · NOTES</span>
          <strong>A curious</strong><strong>collection.</strong>
          <i /><small>WORK / WORLDS / SOUND</small>
        </div>
        <span className="preview-gallery-mark">V / N</span>
      </div>
    );
  }
  return (
    <div className="theme-preview theme-preview-classic" aria-hidden="true">
      <div className="preview-classic-index"><span>V / N</span><span>FIELD NOTES</span></div>
      <div className="preview-classic-title">Things I<br /><em>keep</em><br />coming back to.</div>
      <div className="preview-classic-rule" />
      <div className="preview-classic-footer"><span>SOFTWARE</span><span>STORIES</span><span>SOUND</span></div>
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
  const dialogRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const selectedTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    document.body.style.overflow = "hidden";

    const getFocusable = () => Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => element.offsetParent !== null);

    const focusFrame = window.requestAnimationFrame(() => getFocusable()[0]?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  return createPortal(
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
            ref={dialogRef}
            tabIndex={-1}
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
                  Four distinct visual systems. Each has its own typography, spacing, and art direction. Switch whenever the mood changes.
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
                      <span className="theme-card-index">{theme === "nothing" ? <RollingNumber value={index + 1} replayKey={theme} /> : String(index + 1).padStart(2, "0")}</span>
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
    </AnimatePresence>,
    document.body,
  );
}
