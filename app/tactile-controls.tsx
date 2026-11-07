"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";

type TactileMotionProps = Omit<
  HTMLMotionProps<"a">,
  "style" | "onPointerMove" | "onPointerLeave" | "whileHover" | "whileTap" | "transition"
>;

type TactileButtonProps = Omit<
  HTMLMotionProps<"button">,
  "style" | "onPointerMove" | "onPointerLeave" | "whileHover" | "whileTap" | "transition"
>;

function useTactileSpring() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 420, damping: 30, mass: 0.2 });
  const y = useSpring(pointerY, { stiffness: 420, damping: 30, mass: 0.2 });

  function move(event: ReactPointerEvent<HTMLElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const normalizedX = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
    const normalizedY = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
    pointerX.set(normalizedX * 5);
    pointerY.set(normalizedY * 3);
  }

  function reset() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return {
    reduceMotion,
    style: { x: reduceMotion ? 0 : x, y: reduceMotion ? 0 : y },
    onPointerMove: move,
    onPointerLeave: reset,
  };
}

/** React-native anchor with restrained spring attraction and tactile press feedback. */
export function TactileLink({ className = "", children, ...props }: TactileMotionProps) {
  const tactile = useTactileSpring();

  return (
    <motion.a
      {...props}
      className={`tactile-react-control ${className}`.trim()}
      style={tactile.style}
      onPointerMove={tactile.onPointerMove}
      onPointerLeave={tactile.onPointerLeave}
      whileHover={tactile.reduceMotion ? undefined : { scale: 1.012 }}
      whileTap={tactile.reduceMotion ? undefined : { scale: 0.972 }}
      transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.22 }}
    >
      {children}
      <span className="tactile-react-sheen" aria-hidden="true" />
    </motion.a>
  );
}

/** React-native button with the same pointer spring, press depth and focus model. */
export function TactileButton({ className = "", children, type = "button", ...props }: TactileButtonProps) {
  const tactile = useTactileSpring();

  return (
    <motion.button
      {...props}
      type={type}
      className={`tactile-react-control ${className}`.trim()}
      style={tactile.style}
      onPointerMove={tactile.onPointerMove}
      onPointerLeave={tactile.onPointerLeave}
      whileHover={tactile.reduceMotion ? undefined : { scale: 1.018 }}
      whileTap={tactile.reduceMotion ? undefined : { scale: 0.965 }}
      transition={{ type: "spring", stiffness: 440, damping: 26, mass: 0.2 }}
    >
      {children}
      <span className="tactile-react-sheen" aria-hidden="true" />
    </motion.button>
  );
}
