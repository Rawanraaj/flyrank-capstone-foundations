"use client";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Send, Loader2, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export type ButtonState =
  | "idle"
  | "hover"
  | "focus"
  | "loading"
  | "success"
  | "error"
  | "disabled";

export interface AnimatedSendButtonRef {
  state: ButtonState;
  reset: () => void;
  trigger: () => Promise<void>;
}

export interface AnimatedSendButtonProps {
  /** Async send callback. Resolves for success, rejects for error. */
  onSend?: () => Promise<unknown> | unknown;
  /** External disabled flag (e.g. empty input or already streaming) */
  disabled?: boolean;
  /** Button type: submit or button */
  type?: "submit" | "button";
  /** Optional custom button label */
  label?: string;
  /** Whether to render label text alongside the send icon in idle */
  showLabel?: boolean;
  /** Custom extra Tailwind classes */
  className?: string;
  /** Custom accessible aria-label */
  ariaLabel?: string;
  /** Auto-reset delay in ms after success (default 1200ms) */
  successDuration?: number;
  /** Explicit test/override state for previewing */
  forcedState?: ButtonState;
}

/**
 * AnimatedSendButton
 *
 * Production-ready, accessible, state-machine-driven send button.
 * - Explicit states: idle, hover, focus, loading, success, error, disabled
 * - Animates ONLY transform and opacity (with Framer Motion layout transition)
 * - Accessible focus ring, keyboard operable (Enter/Space)
 * - useReducedMotion() support: removes shake and non-essential motion
 * - Interruptible & guarded: prevents double-clicks and re-entrant executions
 */
export const AnimatedSendButton = forwardRef<
  AnimatedSendButtonRef,
  AnimatedSendButtonProps
>(function AnimatedSendButton(
  {
    onSend,
    disabled = false,
    type = "submit",
    label = "Send",
    showLabel = false,
    className,
    ariaLabel,
    successDuration = 1200,
    forcedState,
  },
  ref
) {
  const shouldReduceMotion = useReducedMotion();

  // Internal lifecycle states: "idle" | "loading" | "success" | "error"
  const [internalState, setInternalState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Guards against race conditions and mid-animation re-entry
  const isExecutingRef = useRef(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Expose imperative handle for programmatic control/inspection
  useImperativeHandle(ref, () => ({
    state: effectiveState,
    reset: () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      isExecutingRef.current = false;
      setInternalState("idle");
    },
    trigger: async () => {
      await handleTrigger();
    },
  }));

  // Clean up any pending success timer on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // Compute the single source of truth: effectiveState
  const effectiveState: ButtonState = (() => {
    if (forcedState) return forcedState;
    if (internalState === "loading") return "loading";
    if (internalState === "success") return "success";
    if (internalState === "error") return "error";
    if (disabled) return "disabled";
    if (isFocused) return "focus";
    if (isHovered) return "hover";
    return "idle";
  })();

  // Core action handler
  const handleTrigger = async (
    e?: React.MouseEvent<HTMLButtonElement> | React.FormEvent
  ) => {
    // If used as type="button", prevent form submit bubbling
    if (e && type === "button") {
      e.preventDefault();
    }

    // Interruptibility guard: do not double-fire if already executing, disabled, or in success
    if (
      (disabled && internalState !== "error") ||
      isExecutingRef.current ||
      internalState === "loading" ||
      internalState === "success"
    ) {
      return;
    }

    if (!onSend) return;

    isExecutingRef.current = true;
    setInternalState("loading");

    try {
      await onSend();
      setInternalState("success");

      // Auto-transition back to idle after successDuration (~1.2s)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setInternalState("idle");
        isExecutingRef.current = false;
      }, successDuration);
    } catch (error) {
      console.error("[AnimatedSendButton] onSend failed:", error);
      setInternalState("error");
      isExecutingRef.current = false;
    }
  };

  // Accessible aria-label based on effective state
  const computedAriaLabel =
    ariaLabel ||
    (effectiveState === "loading"
      ? "Sending message..."
      : effectiveState === "success"
      ? "Message sent successfully"
      : effectiveState === "error"
      ? "Failed to send message. Click to retry."
      : effectiveState === "disabled"
      ? "Send button disabled"
      : label);

  // Content animation variants (strictly opacity and transform)
  const contentVariants: Variants = {
    initial: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.8,
      y: shouldReduceMotion ? 0 : 4,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.05 : 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.8,
      y: shouldReduceMotion ? 0 : -4,
      transition: {
        duration: shouldReduceMotion ? 0.05 : 0.15,
        ease: "easeIn",
      },
    },
  };

  // State-specific visual styling
  const stateClasses = {
    idle: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
    hover: "bg-indigo-700 text-white shadow-md",
    focus:
      "bg-indigo-700 text-white ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-zinc-900 shadow-md",
    loading: "bg-indigo-600 text-white cursor-wait opacity-95",
    success: "bg-emerald-600 text-white shadow-sm",
    error: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm",
    disabled: "bg-indigo-600/40 text-white/60 cursor-not-allowed",
  };

  return (
    <motion.button
      type={type}
      layout
      onClick={handleTrigger}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={effectiveState === "disabled" || effectiveState === "loading"}
      aria-label={computedAriaLabel}
      aria-live="polite"
      aria-busy={effectiveState === "loading"}
      aria-disabled={
        effectiveState === "disabled" || effectiveState === "loading"
      }
      data-state={effectiveState}
      // Single horizontal shake on error (disabled when prefers-reduced-motion is true)
      animate={
        effectiveState === "error" && !shouldReduceMotion
          ? {
              x: [0, -8, 8, -6, 6, -3, 3, 0],
              transition: { duration: 0.42, ease: "easeInOut" },
            }
          : { x: 0 }
      }
      whileTap={
        effectiveState === "disabled" ||
        effectiveState === "loading" ||
        shouldReduceMotion
          ? undefined
          : { scale: 0.94 }
      }
      whileHover={
        effectiveState === "disabled" ||
        effectiveState === "loading" ||
        shouldReduceMotion
          ? undefined
          : { scale: 1.02 }
      }
      transition={{
        layout: {
          duration: shouldReduceMotion ? 0.05 : 0.22,
          ease: "easeOut",
        },
      }}
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-medium text-xs transition-colors duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 shrink-0",
        stateClasses[effectiveState],
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {effectiveState === "loading" && (
          <motion.span
            key="loading"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="inline-flex items-center justify-center gap-1.5"
          >
            <motion.span
              animate={{ rotate: shouldReduceMotion ? 0 : 360 }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                ease: "linear",
              }}
              className="inline-flex"
            >
              <Loader2 className="w-4 h-4" />
            </motion.span>
            {showLabel && <span>Sending...</span>}
          </motion.span>
        )}

        {effectiveState === "success" && (
          <motion.span
            key="success"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="inline-flex items-center justify-center gap-1.5"
          >
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <motion.path
                d="M20 6L9 17l-5-5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: shouldReduceMotion ? 0.05 : 0.35,
                    ease: "easeOut",
                  },
                }}
              />
            </svg>
            {showLabel && <span>Sent!</span>}
          </motion.span>
        )}

        {effectiveState === "error" && (
          <motion.span
            key="error"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="inline-flex items-center justify-center gap-1.5 text-white font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </motion.span>
        )}

        {(effectiveState === "idle" ||
          effectiveState === "hover" ||
          effectiveState === "focus" ||
          effectiveState === "disabled") && (
          <motion.span
            key="idle"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="inline-flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            {showLabel && <span>{label}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

AnimatedSendButton.displayName = "AnimatedSendButton";
export default AnimatedSendButton;
