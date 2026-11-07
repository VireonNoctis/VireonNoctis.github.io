"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";

type TactileAnchorProps = Omit<HTMLMotionProps<"a">, "style" | "onPointerMove" | "onPointerLeave">;
type TactileButtonProps = Omit<HTMLMotionProps<"button">, "style" | "onPointerMove" | "onPointerLeave">;
type TactileSummaryProps = Omit<HTMLMotionProps<"summary">, "style" | "onPointerMove" | "onPointerLeave">;

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

export function TactileLink({
  className = "",
  children,
  whileHover,
  whileTap,
  transition,
  ...props
}: TactileAnchorProps) {
  const tactile = useTactileSpring();

  return (
    <motion.a
      {...props}
      className={`tactile-react-control ${className}`.trim()}
      style={tactile.style}
      onPointerMove={tactile.onPointerMove}
      onPointerLeave={tactile.onPointerLeave}
      whileHover={tactile.reduceMotion ? undefined : (whileHover ?? { scale: 1.012 })}
      whileTap={tactile.reduceMotion ? undefined : (whileTap ?? { scale: 0.972 })}
      transition={transition ?? { type: "spring", stiffness: 420, damping: 28, mass: 0.22 }}
    >
      {children}
      <span className="tactile-react-sheen" aria-hidden="true" />
    </motion.a>
  );
}

export function TactileButton({
  className = "",
  children,
  type = "button",
  whileHover,
  whileTap,
  transition,
  ...props
}: TactileButtonProps) {
  const tactile = useTactileSpring();

  return (
    <motion.button
      {...props}
      type={type}
      className={`tactile-react-control ${className}`.trim()}
      style={tactile.style}
      onPointerMove={tactile.onPointerMove}
      onPointerLeave={tactile.onPointerLeave}
      whileHover={tactile.reduceMotion ? undefined : (whileHover ?? { scale: 1.018 })}
      whileTap={tactile.reduceMotion ? undefined : (whileTap ?? { scale: 0.965 })}
      transition={transition ?? { type: "spring", stiffness: 440, damping: 26, mass: 0.2 }}
    >
      {children}
      <span className="tactile-react-sheen" aria-hidden="true" />
    </motion.button>
  );
}

export function TactileSummary({
  className = "",
  children,
  whileHover,
  whileTap,
  transition,
  ...props
}: TactileSummaryProps) {
  const tactile = useTactileSpring();

  return (
    <motion.summary
      {...props}
      className={`tactile-react-control ${className}`.trim()}
      style={tactile.style}
      onPointerMove={tactile.onPointerMove}
      onPointerLeave={tactile.onPointerLeave}
      whileHover={tactile.reduceMotion ? undefined : (whileHover ?? { y: -1 })}
      whileTap={tactile.reduceMotion ? undefined : (whileTap ?? { scale: 0.992 })}
      transition={transition ?? { type: "spring", stiffness: 400, damping: 30, mass: 0.22 }}
    >
      {children}
      <span className="tactile-react-sheen" aria-hidden="true" />
    </motion.summary>
  );
}
