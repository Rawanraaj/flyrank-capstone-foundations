import { vi } from "vitest";

/**
 * Standard headers for Vercel AI SDK UI Message Stream (v1)
 */
export const UI_MESSAGE_STREAM_HEADERS: Record<string, string> = {
  "content-type": "text/event-stream; charset=utf-8",
  "cache-control": "no-cache",
  connection: "keep-alive",
  "x-vercel-ai-ui-message-stream": "v1",
  "x-accel-buffering": "no",
};

/**
 * Standard mock product catalog fixtures matching app/api/chat/route.ts
 */
export const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "FlyPods Pro",
    category: "Audio",
    price: 149.99,
    imageUrl: "/placeholders/audio.jpg",
  },
  {
    id: "prod-2",
    name: "FlyWatch Ultra",
    category: "Wearables",
    price: 299.99,
    imageUrl: "/placeholders/watch.jpg",
  },
  {
    id: "prod-3",
    name: "FlyBook Laptop 15",
    category: "Computers",
    price: 999.99,
    imageUrl: "/placeholders/laptop.jpg",
  },
  {
    id: "prod-4",
    name: "FlySound Bluetooth Speaker",
    category: "Audio",
    price: 79.99,
    imageUrl: "/placeholders/speaker.jpg",
  },
];

/**
 * Standard mock orders fixtures matching app/api/chat/route.ts
 */
export const MOCK_ORDERS = [
  {
    orderId: "ORD-1001",
    status: "delivered",
    estimatedDelivery: "2026-08-25",
    items: ["FlyPods Pro", "FlyCharge Wireless Pad"],
    total: 179.98,
  },
  {
    orderId: "ORD-1002",
    status: "shipped",
    estimatedDelivery: "2026-09-02",
    items: ["FlyWatch Ultra"],
    total: 299.99,
  },
];

/**
 * Encodes array of chunks into an SSE Response matching AI SDK UI Message Stream protocol.
 */
export function createSSEResponse(chunks: Array<Record<string, unknown>>): Response {
  const sseBody =
    chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") +
    "data: [DONE]\n\n";

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(sseBody));
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: UI_MESSAGE_STREAM_HEADERS,
  });
}

export interface MockTextOptions {
  messageId?: string;
  partId?: string;
  chunks?: string[];
}

/**
 * Simulates (1): A normal successful streamed text reply.
 */
export function createMockTextStreamResponse(
  text: string,
  options: MockTextOptions = {}
): Response {
  const messageId = options.messageId ?? `msg-${Date.now()}`;
  const partId = options.partId ?? `part-${Date.now()}`;

  // If specific chunks provided, stream those; otherwise stream single or segmented text
  const deltas =
    options.chunks && options.chunks.length > 0 ? options.chunks : [text];

  const streamChunks: Array<Record<string, unknown>> = [
    { type: "start", messageId },
    { type: "text-start", id: partId },
    ...deltas.map((delta) => ({ type: "text-delta", id: partId, delta })),
    { type: "text-end", id: partId },
    { type: "finish" },
  ];

  return createSSEResponse(streamChunks);
}

export interface MockToolCallItem {
  toolName: string;
  toolCallId?: string;
  input: Record<string, unknown>;
  output: unknown;
}

export interface MockToolOptions {
  messageId?: string;
  toolCalls?: MockToolCallItem[];
  // Convenience for single tool
  toolName?: string;
  toolCallId?: string;
  input?: Record<string, unknown>;
  output?: unknown;
  followUpText?: string;
  followUpPartId?: string;
}

/**
 * Simulates (2): A tool-call response (e.g. searchProducts returning a fixed product list).
 */
export function createMockToolStreamResponse(
  options: MockToolOptions = {}
): Response {
  const messageId = options.messageId ?? `msg-${Date.now()}`;
  const streamChunks: Array<Record<string, unknown>> = [
    { type: "start", messageId },
  ];

  const toolCalls: MockToolCallItem[] = options.toolCalls
    ? [...options.toolCalls]
    : [];

  // If single tool convenience parameters passed, add it
  if (options.toolName) {
    toolCalls.push({
      toolName: options.toolName,
      toolCallId: options.toolCallId ?? `call-${Date.now()}`,
      input: options.input ?? {},
      output: options.output ?? { products: MOCK_PRODUCTS },
    });
  }

  // Default to searchProducts if no tool calls provided
  if (toolCalls.length === 0) {
    toolCalls.push({
      toolName: "searchProducts",
      toolCallId: `call-${Date.now()}`,
      input: { query: "products" },
      output: {
        query: "products",
        totalFound: MOCK_PRODUCTS.length,
        products: MOCK_PRODUCTS,
      },
    });
  }

  // Add each tool call and its output
  for (let i = 0; i < toolCalls.length; i++) {
    const item = toolCalls[i];
    const callId = item.toolCallId ?? `call-${i}-${Date.now()}`;

    streamChunks.push({
      type: "tool-input-available",
      toolCallId: callId,
      toolName: item.toolName,
      input: item.input,
    });

    streamChunks.push({
      type: "tool-output-available",
      toolCallId: callId,
      output: item.output,
    });
  }

  // Optional assistant follow-up text commentary (e.g. "I found 4 products...")
  if (options.followUpText) {
    const partId = options.followUpPartId ?? `text-${Date.now()}`;
    streamChunks.push({ type: "text-start", id: partId });
    streamChunks.push({
      type: "text-delta",
      id: partId,
      delta: options.followUpText,
    });
    streamChunks.push({ type: "text-end", id: partId });
  }

  streamChunks.push({ type: "finish" });

  return createSSEResponse(streamChunks);
}

export interface MockErrorOptions {
  status?: number;
  message?: string;
  asStreamError?: boolean;
  errorText?: string;
}

/**
 * Simulates (3): An error/failed response.
 * Supports both HTTP-level errors (e.g. 500, 429 rate limits) and stream-level error chunks.
 */
export function createMockErrorResponse(
  options: MockErrorOptions = {}
): Response {
  if (options.asStreamError) {
    const errorText =
      options.errorText || options.message || "An unexpected error occurred during generation.";
    const streamChunks = [{ type: "error", errorText }];
    return createSSEResponse(streamChunks);
  }

  const status = options.status ?? 500;
  const message =
    options.message ??
    (status === 429
      ? "API quota exceeded. Please wait a moment and try again."
      : "Internal server error occurred while processing chat.");

  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export interface RecordedChatRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  messages: any[];
}

export interface ChatRouteMockController {
  /**
   * Simulates a normal successful streamed text reply.
   */
  simulateText: (text: string, options?: MockTextOptions) => ChatRouteMockController;

  /**
   * Simulates a tool-call response (e.g. searchProducts).
   */
  simulateToolCall: (options?: MockToolOptions) => ChatRouteMockController;

  /**
   * Simulates an error/failed response.
   */
  simulateError: (options?: MockErrorOptions) => ChatRouteMockController;

  /**
   * Simulates a network failure (fetch throws/rejects).
   */
  simulateNetworkFailure: (errorMessage?: string) => ChatRouteMockController;

  /**
   * Queues a custom Response (or generator function) for the next call.
   */
  queueResponse: (
    responseOrFn: Response | ((req: RecordedChatRequest) => Response | Promise<Response>)
  ) => ChatRouteMockController;

  /**
   * Sets default response generator when queue is empty.
   */
  setDefaultResponse: (
    responseOrFn: Response | ((req: RecordedChatRequest) => Response | Promise<Response>)
  ) => ChatRouteMockController;

  /**
   * All requests intercepted by this mock.
   */
  getRequests: () => RecordedChatRequest[];

  /**
   * The most recent request intercepted by this mock.
   */
  getLastRequest: () => RecordedChatRequest | undefined;

  /**
   * The messages array from the most recent request.
   */
  getLastMessages: () => any[];

  /**
   * Clears recorded requests and response queues.
   */
  reset: () => ChatRouteMockController;

  /**
   * Restores global fetch to original implementation.
   */
  restore: () => void;
}

export interface MockChatRouteOptions {
  initialMode?: "text" | "tool" | "error";
  initialText?: string;
  initialToolOptions?: MockToolOptions;
  initialErrorOptions?: MockErrorOptions;
  targetPath?: string | RegExp;
}

/**
 * Installs a fetch mock for /api/chat that simulates text, tool-call, and error responses.
 * Reusable across multiple test files.
 */
export function mockChatRoute(
  options: MockChatRouteOptions = {}
): ChatRouteMockController {
  const originalFetch = globalThis.fetch;
  const targetPattern = options.targetPath ?? /\/api\/chat/;

  let defaultHandler: (req: RecordedChatRequest) => Promise<Response> = async () =>
    createMockTextStreamResponse("Hello! How can I assist you with FlyStore today?");

  const responseQueue: Array<
    (req: RecordedChatRequest) => Response | Promise<Response>
  > = [];
  const recordedRequests: RecordedChatRequest[] = [];
  let networkFailureError: Error | null = null;

  const controller: ChatRouteMockController = {
    simulateText(text: string, opts?: MockTextOptions) {
      networkFailureError = null;
      defaultHandler = async () => createMockTextStreamResponse(text, opts);
      return controller;
    },

    simulateToolCall(opts?: MockToolOptions) {
      networkFailureError = null;
      defaultHandler = async () => createMockToolStreamResponse(opts);
      return controller;
    },

    simulateError(opts?: MockErrorOptions) {
      networkFailureError = null;
      defaultHandler = async () => createMockErrorResponse(opts);
      return controller;
    },

    simulateNetworkFailure(errorMessage = "Failed to fetch") {
      networkFailureError = new Error(errorMessage);
      return controller;
    },

    queueResponse(responseOrFn) {
      if (typeof responseOrFn === "function") {
        responseQueue.push(responseOrFn);
      } else {
        responseQueue.push(() => responseOrFn);
      }
      return controller;
    },

    setDefaultResponse(responseOrFn) {
      networkFailureError = null;
      if (typeof responseOrFn === "function") {
        defaultHandler = async (req) => responseOrFn(req);
      } else {
        defaultHandler = async () => responseOrFn;
      }
      return controller;
    },

    getRequests() {
      return [...recordedRequests];
    },

    getLastRequest() {
      return recordedRequests[recordedRequests.length - 1];
    },

    getLastMessages() {
      const last = controller.getLastRequest();
      return last?.messages ?? [];
    },

    reset() {
      recordedRequests.length = 0;
      responseQueue.length = 0;
      networkFailureError = null;
      defaultHandler = async () =>
        createMockTextStreamResponse("Hello! How can I assist you with FlyStore today?");
      return controller;
    },

    restore() {
      globalThis.fetch = originalFetch;
    },
  };

  // Configure initial behavior if specified
  if (options.initialMode === "tool") {
    controller.simulateToolCall(options.initialToolOptions);
  } else if (options.initialMode === "error") {
    controller.simulateError(options.initialErrorOptions);
  } else if (options.initialText) {
    controller.simulateText(options.initialText);
  }

  // Intercept globalThis.fetch
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;

    const matches =
      typeof targetPattern === "string"
        ? urlStr.includes(targetPattern)
        : targetPattern.test(urlStr);

    if (!matches) {
      // Pass-through to original fetch if it exists
      if (typeof originalFetch === "function") {
        return originalFetch(input, init);
      }
      return new Response(null, { status: 404 });
    }

    // Parse and record request
    let bodyJson: any = null;
    if (init?.body) {
      try {
        bodyJson =
          typeof init.body === "string"
            ? JSON.parse(init.body)
            : init.body;
      } catch {
        bodyJson = init.body;
      }
    } else if (input instanceof Request) {
      try {
        const cloned = input.clone();
        bodyJson = await cloned.json();
      } catch {
        // Ignore unparseable body
      }
    }

    const recorded: RecordedChatRequest = {
      url: urlStr,
      method: init?.method ?? (input instanceof Request ? input.method : "POST"),
      headers: (init?.headers as Record<string, string>) ?? {},
      body: bodyJson,
      messages: bodyJson?.messages ?? [],
    };
    recordedRequests.push(recorded);

    // Simulate network error if configured
    if (networkFailureError) {
      throw networkFailureError;
    }

    // Dequeue next response or fallback to default handler
    const nextHandler = responseQueue.shift();
    if (nextHandler) {
      return nextHandler(recorded);
    }

    return defaultHandler(recorded);
  }) as unknown as typeof fetch;

  return controller;
}
