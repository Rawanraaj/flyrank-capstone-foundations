"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import {
  MessageSquare,
  X,
  Send,
  Square,
  ArrowDown,
  Sparkles,
  Bot,
  User,
  Minimize2,
  AlertTriangle,
} from "lucide-react";

/**
 * Extracts plain text content safely from a UIMessage object.
 */
function getMessageText(message: UIMessage): string {
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text"
      )
      .map((part) => part.text)
      .join("");
  }
  return "";
}

/**
 * Safely prepares streamed text for rendering to avoid dangling code fences
 * or broken markdown structures from visually breaking mid-stream.
 */
function formatSafeText(rawText: string): {
  paragraphs: Array<{ id: string; content: string; isCode: boolean; language?: string }>;
} {
  if (!rawText) return { paragraphs: [] };

  // Handle unclosed code fences safely
  let processed = rawText;
  const fenceMatches = processed.match(/```/g);
  if (fenceMatches && fenceMatches.length % 2 !== 0) {
    // Append a temporary closing fence so code blocks render safely mid-stream
    processed += "\n```";
  }

  const blocks = processed.split(/(```[\s\S]*?```)/g);
  const result: Array<{
    id: string;
    content: string;
    isCode: boolean;
    language?: string;
  }> = [];

  blocks.forEach((block, index) => {
    if (!block) return;

    if (block.startsWith("```")) {
      const firstLineEnd = block.indexOf("\n");
      const language =
        firstLineEnd !== -1 ? block.slice(3, firstLineEnd).trim() : "";
      const codeContent =
        firstLineEnd !== -1
          ? block.slice(firstLineEnd + 1, block.lastIndexOf("```"))
          : block.slice(3, block.lastIndexOf("```"));

      result.push({
        id: `code-${index}`,
        content: codeContent.trim(),
        isCode: true,
        language: language || "text",
      });
    } else {
      result.push({
        id: `text-${index}`,
        content: block,
        isCode: false,
      });
    }
  });

  return { paragraphs: result };
}

interface FlyBotProps {
  /** If true, renders embedded inline instead of a floating chat widget. Defaults to false. */
  embedded?: boolean;
}

export default function FlyBot({ embedded = false }: FlyBotProps) {
  const [isOpen, setIsOpen] = useState<boolean>(embedded);
  const [input, setInput] = useState<string>("");
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, stop, status, error } = useChat();

  const isStreamingOrSubmitted = status === "submitted" || status === "streaming";

  // Check scroll position to determine if auto-scroll should activate
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    // Consider "near bottom" if within 75px
    setIsScrolledUp(distanceFromBottom > 75);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Auto-scroll logic: only scroll if the user hasn't manually scrolled up
  useEffect(() => {
    if (!isScrolledUp) {
      scrollToBottom(true);
    }
  }, [messages, status, isScrolledUp, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreamingOrSubmitted) return;

    sendMessage({ text: trimmed });
    setInput("");
    setIsScrolledUp(false);
  };

  const handleStop = () => {
    stop();
  };

  // Determine if we need to show the thinking indicator
  // (when submitted or streaming before any content has arrived)
  const lastMessage = messages[messages.length - 1];
  const lastMessageText = lastMessage ? getMessageText(lastMessage) : "";
  const isWaitingForFirstToken =
    status === "submitted" ||
    (status === "streaming" && lastMessage?.role === "assistant" && !lastMessageText);

  const isError = status === "error";

  // Derive a user-friendly error message
  const errorMessage = (() => {
    if (!isError || !error) return null;
    const msg = error.message || "";
    if (msg.includes("quota") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      return "FlyBot's API quota has been exceeded. Please wait a minute and try again, or check your Gemini API plan.";
    }
    if (msg.includes("API key") || msg.includes("401") || msg.includes("UNAUTHENTICATED")) {
      return "API key issue — FlyBot can't authenticate with the AI service right now.";
    }
    if (msg.includes("404") || msg.includes("NOT_FOUND")) {
      return "The AI model is currently unavailable. Please try again later.";
    }
    return "Something went wrong. Please try sending your message again.";
  })();

  const chatContent = (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 dark:bg-indigo-700 text-white select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base leading-tight tracking-wide">
                FlyBot
              </h2>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/50 text-indigo-100 border border-indigo-400/30">
                AI Assistant
              </span>
            </div>
            <p className="text-xs text-indigo-100/90 leading-none mt-0.5">
              FlyStore Shopping Concierge
            </p>
          </div>
        </div>

        {!embedded && (
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close FlyBot chat"
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative scroll-smooth bg-zinc-50/50 dark:bg-zinc-950/40"
      >
        {/* Welcome Banner if empty */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
              Hi there! I&apos;m FlyBot 👋
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              Ask me anything about FlyStore products, shipping, returns, or get personalized recommendations!
            </p>

            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {[
                "Who are you?",
                "What products do you offer?",
                "Do you offer warranty?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    sendMessage({ text: suggestion });
                    setIsScrolledUp(false);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-700/80 transition-colors shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message List */}
        {messages.map((message) => {
          const isUser = message.role === "user";
          const textContent = getMessageText(message);
          const { paragraphs } = formatSafeText(textContent);

          return (
            <div
              key={message.id}
              className={`flex items-start gap-2.5 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 mt-1 shadow-sm ${
                  isUser
                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {isUser ? (
                  <User className="w-3.5 h-3.5" />
                ) : (
                  <Bot className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-100 rounded-tl-none"
                }`}
              >
                {!textContent && !isUser ? (
                  /* Thinking dots inside assistant bubble if text is empty (only while loading, not on error) */
                  isStreamingOrSubmitted ? (
                    <div className="flex items-center gap-1.5 py-1 px-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                    </div>
                  ) : null
                ) : (
                  <div className="space-y-2">
                    {paragraphs.map((block) => {
                      if (block.isCode) {
                        return (
                          <div
                            key={block.id}
                            className="my-2 rounded-lg bg-zinc-900 text-zinc-100 p-3 font-mono text-xs overflow-x-auto border border-zinc-700"
                          >
                            {block.language && (
                              <div className="text-[10px] text-zinc-400 font-sans uppercase mb-1 border-b border-zinc-800 pb-1">
                                {block.language}
                              </div>
                            )}
                            <pre className="whitespace-pre">{block.content}</pre>
                          </div>
                        );
                      }

                      return (
                        <p key={block.id} className="whitespace-pre-wrap leading-relaxed">
                          {block.content}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator when submitted before first assistant message arrives */}
        {isWaitingForFirstToken &&
          (!lastMessage || lastMessage.role === "user") && (
            <div className="flex items-start gap-2.5 flex-row">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-medium shrink-0 mt-1 shadow-sm">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1.5 font-medium">
                    FlyBot is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Error Banner */}
        {isError && errorMessage && (
          <div className="flex items-start gap-2.5 flex-row">
            <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-medium shrink-0 mt-1 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[82%] sm:max-w-[78%] rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200">
              <p className="font-medium text-xs mb-1">⚠️ Error</p>
              <p className="text-xs leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating "Jump to latest" pill */}
      {isScrolledUp && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => {
              scrollToBottom(true);
              setIsScrolledUp(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-medium shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Jump to latest</span>
          </button>
        </div>
      )}

      {/* Input Form Footer */}
      <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FlyBot something..."
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
          />

          {isStreamingOrSubmitted ? (
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold transition-all shrink-0 shadow-sm"
              aria-label="Stop generating response"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shrink-0 shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );

  if (embedded) {
    return <div className="w-full h-[600px] max-w-2xl mx-auto">{chatContent}</div>;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Widget Window */}
      {isOpen && (
        <div className="w-[375px] max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[calc(100vh-6rem)] mb-3 transition-all duration-200 ease-in-out animate-in fade-in slide-in-from-bottom-4">
          {chatContent}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close FlyBot chat" : "Open FlyBot chat"}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-xl hover:shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageSquare className="w-5 h-5" />
            <span>Chat with FlyBot</span>
          </>
        )}
      </button>
    </div>
  );
}
