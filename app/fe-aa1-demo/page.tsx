"use client";

import React, { useState, useRef } from "react";
import AnimatedSendButton, {
  type AnimatedSendButtonRef,
  type ButtonState,
} from "@/components/AnimatedSendButton";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";

export default function AnimatedSendButtonDemoPage() {
  const buttonRef = useRef<AnimatedSendButtonRef | null>(null);
  const modeRef = useRef<"random" | "force-success" | "force-error">("random");
  const [lastOutcome, setLastOutcome] = useState<string>("Ready to test");
  const [currentState, setCurrentState] = useState<ButtonState>("idle");

  // Fake async send function: 800-2000ms delay, ~20% failure rate (or forced outcome)
  const handleSend = async () => {
    setCurrentState("loading");
    const mode = modeRef.current;
    const delay = Math.floor(Math.random() * 1200) + 800; // 800ms - 2000ms

    setLastOutcome(`Sending... (simulated ${delay}ms latency)`);

    await new Promise((resolve) => setTimeout(resolve, delay));

    if (mode === "force-success") {
      setLastOutcome(`Success! (Forced outcome after ${delay}ms)`);
      setCurrentState("success");
      setTimeout(() => setCurrentState("idle"), 1200);
      return "OK";
    }

    if (mode === "force-error") {
      setLastOutcome(`Error! (Forced failure after ${delay}ms)`);
      setCurrentState("error");
      throw new Error("Forced simulated network timeout");
    }

    // Default: ~20% random failure
    if (Math.random() < 0.2) {
      setLastOutcome(`Error! (Random 20% simulated failure after ${delay}ms)`);
      setCurrentState("error");
      throw new Error("Random network glitch (20% chance)");
    }

    setLastOutcome(`Success! (Random test succeeded after ${delay}ms)`);
    setCurrentState("success");
    setTimeout(() => setCurrentState("idle"), 1200);
    return "OK";
  };

  const handleForceSuccess = () => {
    modeRef.current = "force-success";
    buttonRef.current?.trigger();
  };

  const handleForceError = () => {
    modeRef.current = "force-error";
    buttonRef.current?.trigger();
  };

  const handleRandomTrigger = () => {
    modeRef.current = "random";
    buttonRef.current?.trigger();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to FlyStore</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            FE-AA1 Interactive Demo
          </span>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            AnimatedSendButton State Machine Demo
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            A state-machine-driven send button built with Framer Motion. Only
            animates transform and opacity, supports keyboard accessibility, and
            respects user reduced-motion preferences.
          </p>
        </div>

        {/* Interactive Playground Card */}
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-8">
          {/* Main Button Demonstration */}
          <div className="flex flex-col items-center justify-center p-10 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Interactive Component
              </span>
              <p className="text-xs text-zinc-500">
                Click the button directly to run with random 800–2000ms delay & 20% failure chance:
              </p>
            </div>

            <div className="pt-2">
              <AnimatedSendButton
                ref={buttonRef}
                type="button"
                onSend={handleSend}
                showLabel={true}
                label="Send Message"
                className="px-5 py-3 text-sm rounded-xl"
                ariaLabel="Demo send button"
              />
            </div>

            {/* Current State Status Pill */}
            <div className="flex items-center gap-2 pt-2 text-xs">
              <span className="text-zinc-500">Live Status:</span>
              <span className="font-mono px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold">
                {lastOutcome}
              </span>
            </div>
          </div>

          {/* Guaranteed State Trigger Controls */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Guaranteed Reviewer Triggers
            </h3>
            <p className="text-xs text-zinc-500">
              Test either terminal state immediately without relying on random probability:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleForceSuccess}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-semibold text-xs transition-all shadow-sm active:scale-98"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Force Success</span>
              </button>

              <button
                type="button"
                onClick={handleForceError}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-semibold text-xs transition-all shadow-sm active:scale-98"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Force Error</span>
              </button>

              <button
                type="button"
                onClick={handleRandomTrigger}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold text-xs transition-all shadow-sm active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Random (20% fail)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Animation & Easing Design Rationale */}
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Animation Design, Easing Curves & Accessibility Rationale
          </h2>

          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            The loading-to-success transition employs an animated SVG checkmark with a pathLength draw duration of 350ms using an ease-out curve, followed by a 1200ms hold before gracefully resetting to idle. An ease-out curve was chosen over linear because natural physical motion naturally decelerates as an object settles into its destination; starting briskly and easing to a stop feels crisp and responsive, whereas linear motion appears robotic. The ~1.2s success hold provides the optimal cognitive duration for users to perceive confirmation without hindering their workflow. Conversely, the loading-to-error transition triggers a 420ms damped horizontal shake sequence ([0, -8, 8, -6, 6, -3, 3, 0]) paired with an ease-in-out curve to mirror natural harmonic oscillation during direction changes, instantly shifting button styling to rose red with a distinct &apos;Retry&apos; label. To safeguard users with vestibular sensitivities (WCAG 2.2 Guideline 2.3.3), the component checks framer-motion&apos;s useReducedMotion() hook: when active, the lateral shake animation is completely bypassed while keeping color, icon, and text feedback fully operational.
          </p>
        </div>
      </div>
    </div>
  );
}
