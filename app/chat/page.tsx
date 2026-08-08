import FlyBot from "@/components/FlyBot";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlyBot Chat Assistant - FlyStore",
  description: "Chat with FlyBot, your personal shopping assistant for FlyStore.",
};

export default function ChatPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl w-full mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          FlyBot Shopping Assistant
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Ask questions, compare products, or get shopping advice in real-time.
        </p>
      </div>

      <FlyBot embedded={true} />
    </main>
  );
}
