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
  Search,
  Package,
  Calculator,
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  ShoppingBag,
  Tag,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import AnimatedSendButton, { type AnimatedSendButtonRef } from "./AnimatedSendButton";

/**
 * Interface for AI SDK 7 Tool UI Part Data
 */
interface ToolPartData {
  toolCallId?: string;
  toolName: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error" | string;
  input?: Record<string, any>;
  output?: any;
  errorText?: string;
}

/**
 * Extracts plain text content safely from a UIMessage object.
 */
function getMessageText(message: UIMessage): string {
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("");
  }
  return "";
}

/**
 * Safely prepares streamed text for rendering to avoid dangling code fences.
 */
function formatSafeText(rawText: string): {
  paragraphs: Array<{ id: string; content: string; isCode: boolean; language?: string }>;
} {
  if (!rawText) return { paragraphs: [] };

  let processed = rawText;
  const fenceMatches = processed.match(/```/g);
  if (fenceMatches && fenceMatches.length % 2 !== 0) {
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

/**
 * Friendly label for tool names
 */
function getToolFriendlyName(toolName: string): string {
  switch (toolName) {
    case "searchProducts":
      return "Search Products";
    case "checkOrderStatus":
      return "Check Order Status";
    case "calculatePrice":
      return "Calculate Price";
    default:
      return toolName;
  }
}

/**
 * Skeleton Loading Placeholder for searchProducts
 */
function SearchProductsSkeleton({ input }: { input?: Record<string, any> }) {
  return (
    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-700/90 bg-white dark:bg-zinc-900 p-3 shadow-sm space-y-2.5 animate-pulse">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-200 dark:bg-indigo-900/60" />
          <div className="h-3.5 w-36 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        {input?.maxPrice && (
          <div className="h-4 w-16 bg-indigo-100 dark:bg-indigo-950 rounded-full" />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-3.5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-3.5 w-10 bg-zinc-200 dark:bg-zinc-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Loading Placeholder for checkOrderStatus
 */
function CheckOrderStatusSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-700/90 bg-white dark:bg-zinc-900 p-3.5 shadow-sm space-y-3 animate-pulse">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-200 dark:bg-indigo-900/60" />
          <div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1.5">
          <div className="h-2.5 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-3.5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1.5">
          <div className="h-2.5 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
      </div>

      <div className="pt-1 space-y-1.5">
        <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-3 w-40 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton Loading Placeholder for calculatePrice
 */
function CalculatePriceSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-700/90 bg-white dark:bg-zinc-900 p-3.5 shadow-sm space-y-3 animate-pulse">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-200 dark:bg-indigo-900/60" />
          <div className="h-3.5 w-36 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        <div className="h-4 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <div className="space-y-2 py-1">
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-3 w-14 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-3 w-10 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        <div className="border-t-2 border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Render Tool Invocation with 4 Lifecycle States:
 * 1. input-streaming: Muted compact inline indicator with partial args
 * 2. input-available: Active pulsing card with spinner, tool action label, and matching skeleton layout (Zero CLS)
 * 3. output-available: Rich visual component for searchProducts, checkOrderStatus, calculatePrice
 * 4. output-error: Red error card with icon, message, and human suggestion
 */
function ToolPartRenderer({
  toolPart,
  onSuggestionClick,
}: {
  toolPart: ToolPartData;
  onSuggestionClick?: (text: string) => void;
}) {
  const { toolName, state, input = {}, output, errorText } = toolPart;

  // Determine 4 AI SDK 7 lifecycle states
  const isStreamingInput = state === "input-streaming" || state === "partial-call";
  const isInputAvailable = state === "input-available" || state === "call";
  const isOutputError =
    state === "output-error" ||
    Boolean(errorText) ||
    (output && typeof output === "object" && output.isError) ||
    (output instanceof Error);

  const isOutputAvailable = (state === "output-available" || state === "result") && !isOutputError;

  // 1. STATE: input-streaming
  if (isStreamingInput) {
    const partialParamStr =
      input && Object.keys(input).length > 0
        ? Object.entries(input)
            .map(([k, v]) => `${k}: "${v}"`)
            .join(", ")
        : "";

    return (
      <div className="my-2 py-1.5 px-3 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 text-xs font-mono flex items-center gap-2 border border-dashed border-zinc-300/60 dark:border-zinc-700/60 transition-all duration-200">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 shrink-0" />
        <span className="font-semibold">{getToolFriendlyName(toolName)}:</span>
        <span className="truncate max-w-[220px]">
          {partialParamStr || "streaming parameters..."}
        </span>
      </div>
    );
  }

  // 2. STATE: input-available (loading state while tool executes, with matching layout skeletons to eliminate CLS)
  if (isInputAvailable) {
    const loadingText = (() => {
      if (toolName === "searchProducts") return `Searching FlyStore for "${input.query || "products"}"...`;
      if (toolName === "checkOrderStatus") return `Checking status for order ${input.orderId || ""}...`;
      if (toolName === "calculatePrice") return `Calculating price estimate for ${input.productName || "item"}...`;
      return `Executing ${toolName}...`;
    })();

    return (
      <div className="my-2.5 space-y-2.5 transition-all duration-200">
        <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-2.5 shadow-sm">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
          <div>
            <span className="font-semibold text-xs text-indigo-950 dark:text-indigo-100">
              {getToolFriendlyName(toolName)}
            </span>
            <span className="text-[11px] text-indigo-700/90 dark:text-indigo-300/90 ml-2">
              {loadingText}
            </span>
          </div>
        </div>

        {/* Skeleton matching real content dimensions to prevent Cumulative Layout Shift (CLS) */}
        {toolName === "searchProducts" && <SearchProductsSkeleton input={input} />}
        {toolName === "checkOrderStatus" && <CheckOrderStatusSkeleton />}
        {toolName === "calculatePrice" && <CalculatePriceSkeleton />}
      </div>
    );
  }

  // 4. STATE: output-error
  if (isOutputError) {
    const rawErrorMessage = (() => {
      if (errorText) return errorText;
      if (typeof output === "string") return output;
      if (output && typeof output === "object") {
        return output.message || output.error || "Execution failed";
      }
      return "Tool execution encountered an error";
    })();

    const suggestion = (() => {
      if (toolName === "calculatePrice") {
        return "Try checking the product name spelling (e.g. 'FlyPods Pro', 'FlyWatch Ultra', 'FlyBook Laptop 15').";
      }
      if (toolName === "checkOrderStatus") {
        return "Please verify your order ID format (e.g. ORD-1001, ORD-1002).";
      }
      return "Please check your search keywords and try again.";
    })();

    return (
      <div className="my-2.5 p-3.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-100 shadow-sm transition-all duration-200 ease-in-out">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-rose-200 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-rose-900 dark:text-rose-200">
                {getToolFriendlyName(toolName)} Failed
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-200/70 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200">
                Error
              </span>
            </div>
            <p className="text-xs font-medium text-rose-800 dark:text-rose-300 mt-1">
              {rawErrorMessage}
            </p>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-400 mt-1 italic">
              💡 {suggestion}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. STATE: output-available (successful rich component rendering)
  if (isOutputAvailable && output) {
    return (
      <div className="my-3 transition-all duration-200 ease-in-out">
        {toolName === "searchProducts" && (
          <SearchProductsOutput result={output} onSuggestionClick={onSuggestionClick} />
        )}
        {toolName === "checkOrderStatus" && <CheckOrderStatusOutput result={output} />}
        {toolName === "calculatePrice" && <CalculatePriceOutput result={output} />}
      </div>
    );
  }

  return null;
}

/**
 * Output Available: searchProducts
 */
function SearchProductsOutput({
  result,
  onSuggestionClick,
}: {
  result: any;
  onSuggestionClick?: (text: string) => void;
}) {
  const products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    imageUrl?: string;
  }> = result.products || [];

  if (products.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 space-y-2.5">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>No products found for &ldquo;{result.query || "your query"}&rdquo;</span>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          We couldn&apos;t find any matching products in the FlyStore catalog. Try a broader search term (e.g. &ldquo;Audio&rdquo;, &ldquo;Wearables&rdquo;, or &ldquo;Accessories&rdquo;) or remove any price filters.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {["Audio", "Wearables", "Accessories", "Computers"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSuggestionClick?.(`Search products in ${cat}`)}
              className="text-[10px] px-2.5 py-1 rounded-md bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-600 transition-colors font-medium shadow-xs"
            >
              Browse {cat}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-700/90 bg-white dark:bg-zinc-900 p-3 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
            Product Search Results ({result.totalFound || products.length})
          </span>
        </div>
        {result.maxPrice && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-medium">
            Max: ${result.maxPrice}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-2.5 rounded-lg border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/50 flex items-center gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs shadow-inner">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                {p.name}
              </h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200/70 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {p.category}
                </span>
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                  ${p.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Output Available: checkOrderStatus
 */
function CheckOrderStatusOutput({ result }: { result: any }) {
  if (!result.found) {
    return (
      <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs shadow-sm flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-xs">Order Not Found</p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300 mt-0.5">
            {result.message || `No order matching ID "${result.orderId}" was located.`}
          </p>
        </div>
      </div>
    );
  }

  const order = result.order;
  const status = order.status;

  const statusBadge = (() => {
    switch (status) {
      case "delivered":
        return {
          label: "Delivered",
          className: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        };
      case "shipped":
        return {
          label: "Shipped",
          className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
          icon: <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        };
      case "processing":
      default:
        return {
          label: "Processing",
          className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        };
    }
  })();

  return (
    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-700/90 bg-white dark:bg-zinc-900 p-3.5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
            Order Status ({order.orderId})
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.className}`}
        >
          {statusBadge.icon}
          {statusBadge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 block font-medium">Est. Delivery</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {order.estimatedDelivery}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 block font-medium">Order Total</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="pt-1">
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
          Items in Order:
        </span>
        <ul className="space-y-1">
          {order.items.map((item: string, i: number) => (
            <li
              key={i}
              className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Output Available: calculatePrice
 */
function CalculatePriceOutput({ result }: { result: any }) {
  return (
    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-700/90 bg-white dark:bg-zinc-900 p-3.5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
            Price Estimate Breakdown
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
          {result.quantity}x {result.productName}
        </span>
      </div>

      {/* Itemized Table */}
      <table className="w-full text-xs">
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <tr>
            <td className="py-1.5 text-zinc-500 dark:text-zinc-400">Unit Price</td>
            <td className="py-1.5 text-right font-medium text-zinc-800 dark:text-zinc-200">
              ${result.unitPrice.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-zinc-500 dark:text-zinc-400">
              Subtotal ({result.quantity} unit{result.quantity > 1 ? "s" : ""})
            </td>
            <td className="py-1.5 text-right font-medium text-zinc-800 dark:text-zinc-200">
              ${result.subtotal.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-zinc-500 dark:text-zinc-400">
              Shipping ({result.shippingSpeed} speed)
            </td>
            <td className="py-1.5 text-right font-medium text-zinc-800 dark:text-zinc-200">
              ${result.shipping.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-zinc-500 dark:text-zinc-400">Estimated Tax (8%)</td>
            <td className="py-1.5 text-right font-medium text-zinc-800 dark:text-zinc-200">
              ${result.tax.toFixed(2)}
            </td>
          </tr>
          <tr className="border-t-2 border-zinc-200 dark:border-zinc-700 font-bold">
            <td className="pt-2 text-zinc-900 dark:text-zinc-100 text-sm">Estimated Total</td>
            <td className="pt-2 text-right text-indigo-600 dark:text-indigo-400 text-sm">
              ${result.total.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface FlyBotProps {
  embedded?: boolean;
}

export default function FlyBot({ embedded = false }: FlyBotProps) {
  const [isOpen, setIsOpen] = useState<boolean>(embedded);
  const [input, setInput] = useState<string>("");
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sendButtonRef = useRef<AnimatedSendButtonRef | null>(null);

  const { messages, sendMessage, stop, status, error, regenerate, clearError } = useChat();

  const isStreamingOrSubmitted = status === "submitted" || status === "streaming";

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsScrolledUp(distanceFromBottom > 75);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  useEffect(() => {
    if (!isScrolledUp) {
      scrollToBottom(true);
    }
  }, [messages, status, isScrolledUp, scrollToBottom]);

  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreamingOrSubmitted) return;

    const messageText = trimmed;
    setInput("");
    setIsScrolledUp(false);

    try {
      await sendMessage({ text: messageText });
    } catch (err) {
      console.error("[FlyBot Send Error]:", err);
      setInput(messageText);
      throw err;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sendButtonRef.current) {
      sendButtonRef.current.trigger();
    } else {
      handleSendMessage();
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInput(suggestionText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRetry = async () => {
    if (isRetrying || isStreamingOrSubmitted) return;
    setIsRetrying(true);
    try {
      if (clearError) {
        clearError();
      }
      if (typeof regenerate === "function") {
        await regenerate();
      } else {
        await sendMessage();
      }
    } catch (err) {
      console.error("[FlyBot Retry error]:", err);
    } finally {
      setIsRetrying(false);
    }
  };

  const lastMessage = messages[messages.length - 1];
  const lastMessageText = lastMessage ? getMessageText(lastMessage) : "";
  const isWaitingForFirstToken =
    status === "submitted" ||
    (status === "streaming" && lastMessage?.role === "assistant" && !lastMessageText && (!lastMessage.parts || lastMessage.parts.length === 0));

  const isError = status === "error";

  const errorMessage = (() => {
    if (!isError && !error) return null;
    const msg = error?.message || "";
    const errObj = error as any;
    const is429 =
      errObj?.status === 429 ||
      errObj?.statusCode === 429 ||
      errObj?.response?.status === 429;
    const lowerMsg = (msg + " " + String(error ?? "")).toLowerCase();

    if (
      is429 ||
      lowerMsg.includes("rate limit") ||
      lowerMsg.includes("429") ||
      lowerMsg.includes("quota") ||
      lowerMsg.includes("resource_exhausted")
    ) {
      return "You're sending messages a bit fast — please wait a moment and try again.";
    }
    if (msg.includes("API key") || msg.includes("401")) {
      return "API key issue — FlyBot cannot authenticate with the AI service right now.";
    }
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("network")) {
      return "Network connection issue. Please check your internet connection and click Retry.";
    }
    return msg || "Something went wrong while communicating with FlyBot. Please try again.";
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
        className="flex-1 overflow-y-auto p-4 space-y-4 relative scroll-smooth overscroll-y-contain bg-zinc-50/50 dark:bg-zinc-950/40"
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
              I can search products, check order status, or calculate full price breakdowns for you!
            </p>

            <div className="flex flex-wrap gap-1.5 justify-center pt-2 max-w-xs">
              {[
                "Search for audio products",
                "Check order ORD-1002",
                "Calculate price for 2 FlyPods Pro",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-700/80 transition-all shadow-sm text-left hover:scale-[1.02] active:scale-[0.98]"
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

          // Extract tool parts from message.parts or message.toolInvocations
          const toolParts: ToolPartData[] = [];
          if (Array.isArray(message.parts)) {
            message.parts.forEach((part: any, index: number) => {
              if (
                part.type?.startsWith("tool-") ||
                part.type === "dynamic-tool" ||
                part.type === "tool-invocation" ||
                part.toolInvocation
              ) {
                const rawName =
                  part.toolName ||
                  (part.type ? part.type.replace(/^tool-/, "") : "") ||
                  part.toolInvocation?.toolName ||
                  "tool";
                const toolName = rawName === "invocation" ? "tool" : rawName;

                toolParts.push({
                  toolCallId:
                    part.toolCallId ||
                    part.id ||
                    part.toolInvocation?.toolCallId ||
                    `tp-${index}`,
                  toolName,
                  state: part.state || part.toolInvocation?.state || "output-available",
                  input: part.input ?? part.args ?? part.toolInvocation?.args ?? {},
                  output: part.output ?? part.result ?? part.toolInvocation?.result,
                  errorText: part.errorText ?? part.error ?? (part.isError ? "Tool execution failed" : undefined),
                });
              }
            });
          }

          if ((message as any).toolInvocations && Array.isArray((message as any).toolInvocations)) {
            (message as any).toolInvocations.forEach((ti: any) => {
              if (!toolParts.some((existing) => existing.toolCallId === ti.toolCallId)) {
                const stateMap: Record<string, string> = {
                  "partial-call": "input-streaming",
                  call: "input-available",
                  result: ti.isError ? "output-error" : "output-available",
                };
                toolParts.push({
                  toolCallId: ti.toolCallId,
                  toolName: ti.toolName,
                  state: stateMap[ti.state] || ti.state,
                  input: ti.args || {},
                  output: ti.result,
                  errorText: ti.isError ? "Tool execution failed" : undefined,
                });
              }
            });
          }

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
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-100 rounded-tl-none"
                }`}
              >
                {/* Render Tool Parts */}
                {toolParts.map((tp, idx) => (
                  <ToolPartRenderer
                    key={tp.toolCallId || idx}
                    toolPart={tp}
                    onSuggestionClick={handleSuggestionClick}
                  />
                ))}

                {/* Text Content */}
                {paragraphs.length > 0 && (
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

                {/* Loading indicator if message is empty and streaming */}
                {!textContent && toolParts.length === 0 && !isUser && isStreamingOrSubmitted && (
                  <div className="flex items-center gap-1.5 py-1 px-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
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
                    FlyBot is processing...
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Inline Chat Error Banner with Retry */}
        {(isError || Boolean(error)) && errorMessage && (
          <div className="flex items-start gap-2.5 flex-row animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-medium shrink-0 mt-1 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl rounded-tl-none p-3.5 text-sm shadow-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 text-rose-900 dark:text-rose-100 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-xs text-rose-900 dark:text-rose-200">
                  ⚠️ Error Generating Response
                </p>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-200/70 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200">
                  Failed
                </span>
              </div>
              <p className="text-xs leading-relaxed text-rose-800 dark:text-rose-300">
                {errorMessage}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isRetrying || isStreamingOrSubmitted}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Retrying...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Jump to Latest Button */}
      {isScrolledUp && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
          <button
            type="button"
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

      {/* Input Form Footer — pinned sticky bottom with iOS safe-area support */}
      <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0 sticky bottom-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FlyBot to search, check orders, or calculate total..."
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
            <AnimatedSendButton
              ref={sendButtonRef}
              type="submit"
              disabled={!input.trim()}
              onSend={handleSendMessage}
              ariaLabel="Send message"
            />
          )}
        </form>
      </div>
    </div>
  );

  if (embedded) {
    return <div className="w-full h-[600px] max-h-[100dvh] max-w-2xl mx-auto">{chatContent}</div>;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[400px] max-w-[calc(100vw-1.5rem)] h-[540px] max-h-[calc(100dvh-5rem)] mb-3 transition-all duration-200 ease-in-out animate-in fade-in slide-in-from-bottom-4 max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:max-w-none max-sm:mb-0 max-sm:rounded-none max-sm:z-50">
          {chatContent}
        </div>
      )}

      <button
        type="button"
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
