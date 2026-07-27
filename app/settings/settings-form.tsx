"use client";

import { useActionState, useRef, useState } from "react";
import { updateProfile, type ProfileState } from "./actions";

const initialState: ProfileState = {
  status: "idle",
  message: "",
};

const AVATAR_INITIALS_COLORS = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function SettingsForm() {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState
  );
  const [name, setName] = useState("Alex Johnson");
  const [charCount, setCharCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const colorIndex = name.length % AVATAR_INITIALS_COLORS.length;

  return (
    <div className="min-h-screen bg-[#0c0c14] text-zinc-100 font-sans">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300 mb-6"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to home
          </a>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Settings
          </h1>
          <p className="mt-2 text-base text-zinc-400">
            Manage your profile information and preferences.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40">
          {/* Card header with avatar */}
          <div className="flex flex-col items-center gap-4 border-b border-white/[0.06] px-8 py-8 sm:flex-row sm:items-start">
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_INITIALS_COLORS[colorIndex]} text-2xl font-bold text-white shadow-lg shadow-violet-500/20 transition-all duration-500`}
            >
              {getInitials(name || "U")}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-semibold text-white">
                Profile Photo
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Your avatar is generated from your initials. Update your name to
                change it.
              </p>
            </div>
          </div>

          {/* Form */}
          <form ref={formRef} action={formAction} className="px-8 py-8">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="settings-name"
                  className="mb-1.5 block text-sm font-medium text-zinc-300"
                >
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="settings-name"
                  name="name"
                  type="text"
                  required
                  defaultValue="Alex Johnson"
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-0 transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Your full name"
                />
                {state.errors?.name && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {state.errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="settings-email"
                  className="mb-1.5 block text-sm font-medium text-zinc-300"
                >
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  id="settings-email"
                  name="email"
                  type="email"
                  required
                  defaultValue="alex@example.com"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-0 transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20"
                  placeholder="you@example.com"
                />
                {state.errors?.email && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {state.errors.email}
                  </p>
                )}
              </div>

              {/* Website */}
              <div>
                <label
                  htmlFor="settings-website"
                  className="mb-1.5 block text-sm font-medium text-zinc-300"
                >
                  Website
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.6 9h16.8M3.6 15h16.8"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3a14.25 14.25 0 0 1 4 9 14.25 14.25 0 0 1-4 9 14.25 14.25 0 0 1-4-9 14.25 14.25 0 0 1 4-9Z"
                      />
                    </svg>
                  </span>
                  <input
                    id="settings-website"
                    name="website"
                    type="url"
                    defaultValue=""
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none ring-0 transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20"
                    placeholder="https://your-site.com"
                  />
                </div>
                {state.errors?.website && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {state.errors.website}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="settings-bio"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Bio
                  </label>
                  <span
                    className={`text-xs tabular-nums ${charCount > 300 ? "text-rose-400" : "text-zinc-500"}`}
                  >
                    {charCount}/300
                  </span>
                </div>
                <textarea
                  id="settings-bio"
                  name="bio"
                  rows={4}
                  defaultValue=""
                  onChange={(e) => setCharCount(e.target.value.length)}
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-0 transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Tell us a little about yourself..."
                />
                {state.errors?.bio && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {state.errors.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Status message */}
            {state.status !== "idle" && (
              <div
                className={`mt-6 rounded-xl border px-4 py-3 text-sm transition-all duration-300 ${
                  state.status === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {state.status === "success" ? (
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  )}
                  {state.message}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-8 sm:flex-row sm:justify-end">
              <a
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={pending}
                className="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {/* Shimmer effect */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {pending ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          Changes are saved to the server. Your data is secure.
        </p>
      </div>
    </div>
  );
}
