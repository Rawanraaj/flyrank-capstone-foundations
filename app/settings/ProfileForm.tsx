"use client";

import { useActionState, useState } from "react";
import { updateProfileAction } from "./actions";
import { ProfileFormState } from "./validation";

interface ProfileFormProps {
  initialValues?: {
    name?: string;
    email?: string;
    website?: string;
    bio?: string;
  };
}

const initialState: ProfileFormState = {
  success: false,
  message: "",
  errors: {},
};

export default function ProfileForm({ initialValues }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  );

  const [bioText, setBioText] = useState(
    initialValues?.bio ?? state.values?.bio ?? ""
  );

  const bioCharCount = bioText.length;
  const isBioOverLimit = bioCharCount > 300;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          User Profile Settings
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Update your public profile information below.
        </p>
      </div>

      {state.message && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
            state.success
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60"
          }`}
        >
          {state.success ? (
            <svg
              className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} noValidate className="space-y-6">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={state.values?.name ?? initialValues?.name ?? ""}
            aria-describedby={state.errors?.name ? "name-error" : undefined}
            aria-invalid={!!state.errors?.name}
            className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
              state.errors?.name
                ? "border-rose-400 focus:ring-rose-500"
                : "border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            }`}
            placeholder="Jane Doe"
          />
          {state.errors?.name && (
            <p
              id="name-error"
              className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1"
            >
              <span>{state.errors.name}</span>
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={state.values?.email ?? initialValues?.email ?? ""}
            aria-describedby={state.errors?.email ? "email-error" : undefined}
            aria-invalid={!!state.errors?.email}
            className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
              state.errors?.email
                ? "border-rose-400 focus:ring-rose-500"
                : "border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            }`}
            placeholder="jane@example.com"
          />
          {state.errors?.email && (
            <p
              id="email-error"
              className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1"
            >
              <span>{state.errors.email}</span>
            </p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <label
            htmlFor="website"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={state.values?.website ?? initialValues?.website ?? ""}
            aria-describedby={state.errors?.website ? "website-error" : undefined}
            aria-invalid={!!state.errors?.website}
            className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
              state.errors?.website
                ? "border-rose-400 focus:ring-rose-500"
                : "border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            }`}
            placeholder="https://example.com"
          />
          {state.errors?.website && (
            <p
              id="website-error"
              className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1"
            >
              <span>{state.errors.website}</span>
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="bio"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Bio
            </label>
            <span
              id="bio-counter"
              className={`text-xs font-medium ${
                isBioOverLimit
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {bioCharCount} / 300
            </span>
          </div>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            aria-describedby={`bio-counter ${state.errors?.bio ? "bio-error" : ""}`}
            aria-invalid={!!state.errors?.bio || isBioOverLimit}
            className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all resize-y ${
              state.errors?.bio || isBioOverLimit
                ? "border-rose-400 focus:ring-rose-500"
                : "border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            }`}
            placeholder="Tell us a little bit about yourself..."
          />
          {state.errors?.bio && (
            <p
              id="bio-error"
              className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1"
            >
              <span>{state.errors.bio}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Saving changes...</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
