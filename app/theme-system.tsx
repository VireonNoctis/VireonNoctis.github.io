"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { NothingWebGL } from "./nothing-webgl";

/** The portfolio has one visual system. There is no theme picker or persisted theme state. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = "nothing";
    document.body.dataset.theme = "nothing";
    document.documentElement.style.colorScheme = "dark";
  }, []);

  return <>{children}</>;
}

const UNICODE_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function UnicodeSpinner({ label = "System activity" }: { label?: string }) {
  const [frame, setFrame] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(
      () => setFrame((current) => (current + 1) % UNICODE_FRAMES.length),
      84,
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <span className="unicode-signal" role="img" aria-label={label}>
      {UNICODE_FRAMES[frame]}
    </span>
  );
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

/** Count-up animation for live metrics arriving from public APIs. */
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
  const reduceMotion = useReducedMotion();
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = window.setInterval(
      () => setCycle((current) => (current + 1) % 100),
      1600,
    );
    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <aside className="nothing-system-strip section-shell" aria-label="Nothing monochrome system readout">
      <div className="nothing-system-cell nothing-system-live">
        <UnicodeSpinner label="Animated Unicode system indicator" />
        <span>SYSTEM ONLINE</span>
      </div>
      <div className="nothing-system-cell">
        <span className="nothing-system-label">THEME INDEX</span>
        <span className="nothing-system-value">
          <RollingNumber value={1} replayKey="nothing" /><span> / 01</span>
        </span>
      </div>
      <div className="nothing-system-cell">
        <span className="nothing-system-label">PROJECT MODULES</span>
        <span className="nothing-system-value">
          <RollingNumber value={4} replayKey="nothing" /><span> ACTIVE</span>
        </span>
      </div>
      <div className="nothing-system-cell nothing-system-unicode">
        <span className="nothing-system-label">SIGNAL CYCLE</span>
        <span className="nothing-system-cycle">
          <RollingNumber value={cycle} replayKey="nothing-cycle" /><span> / 99</span>
        </span>
        <span className="nothing-system-signal" aria-hidden="true">⠿ ⠶ ⣿ ⠿</span>
      </div>
    </aside>
  );
}

export function ThemeHeroArtwork() {
  return (
    <div className="theme-hero-artwork theme-hero-artwork-nothing" aria-hidden="true">
      <NothingWebGL />
      <div className="nothing-webgl-vignette" />
      <div className="nothing-hero-ring nothing-hero-ring-outer" />
      <div className="nothing-hero-ring nothing-hero-ring-inner" />
      <div className="nothing-hero-core"><span>VN</span></div>
      <span className="nothing-hero-code nothing-hero-code-top">NODE / 001 · SIGNAL FIELD</span>
      <span className="nothing-hero-code nothing-hero-code-bottom">WEBGL 2 / SHADER ACTIVE</span>
    </div>
  );
}
