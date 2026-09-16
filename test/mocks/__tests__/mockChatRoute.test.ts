import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChat } from "@ai-sdk/react";
import {
  mockChatRoute,
  createMockTextStreamResponse,
  createMockToolStreamResponse,
  createMockErrorResponse,
  MOCK_PRODUCTS,
  type ChatRouteMockController,
} from "../mockChatRoute";

describe("AI Chat Route Mocking (mockChatRoute)", () => {
  let mock: ChatRouteMockController;

  beforeEach(() => {
    mock = mockChatRoute();
  });

  afterEach(() => {
    mock.restore();
  });

  describe("1. Stream Builders (createMock*StreamResponse)", () => {
    it("generates a valid SSE stream for streamed text reply", async () => {
      const res = createMockTextStreamResponse("Hello from FlyBot!", {
        chunks: ["Hello ", "from ", "FlyBot!"],
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");

      const body = await res.text();
      expect(body).toContain('"type":"start"');
      expect(body).toContain('"type":"text-start"');
      expect(body).toContain('"type":"text-delta","id":');
      expect(body).toContain('"delta":"Hello "');
      expect(body).toContain('"delta":"from "');
      expect(body).toContain('"delta":"FlyBot!"');
      expect(body).toContain('"type":"text-end"');
      expect(body).toContain('"type":"finish"');
      expect(body).toContain("data: [DONE]");
    });

    it("generates a valid SSE stream for tool-call response (searchProducts)", async () => {
      const res = createMockToolStreamResponse({
        toolName: "searchProducts",
        input: { query: "audio" },
        output: {
          query: "audio",
          totalFound: 2,
          products: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[3]],
        },
        followUpText: "Found 2 audio products!",
      });

      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain('"type":"tool-input-available"');
      expect(body).toContain('"toolName":"searchProducts"');
      expect(body).toContain('"query":"audio"');
      expect(body).toContain('"type":"tool-output-available"');
      expect(body).toContain('"totalFound":2');
      expect(body).toContain("FlyPods Pro");
      expect(body).toContain('"type":"text-delta"');
      expect(body).toContain("Found 2 audio products!");
    });

    it("generates HTTP and stream-level error responses", async () => {
      const http500 = createMockErrorResponse({ status: 500 });
      expect(http500.status).toBe(500);
      const json500 = await http500.json();
      expect(json500.error).toContain("Internal server error");

      const http429 = createMockErrorResponse({ status: 429 });
      expect(http429.status).toBe(429);
      const json429 = await http429.json();
      expect(json429.error).toContain("quota");

      const streamErr = createMockErrorResponse({
        asStreamError: true,
        errorText: "Model overloaded",
      });
      expect(streamErr.status).toBe(200);
      const streamBody = await streamErr.text();
      expect(streamBody).toContain('"type":"error"');
      expect(streamBody).toContain("Model overloaded");
    });
  });

  describe("2. useChat Integration: Normal Streamed Text Reply", () => {
    it("delivers streamed assistant message to useChat hook", async () => {
      mock.simulateText("Welcome to FlyStore! How can I help you find gadgets?");

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage({ text: "Hi there!" });
      });

      // User sent 1 message, assistant received 1 message
      expect(result.current.messages.length).toBe(2);
      expect(result.current.messages[0].role).toBe("user");
      expect(result.current.messages[1].role).toBe("assistant");

      // Verify text part
      const assistantMsg = result.current.messages[1];
      const textPart = assistantMsg.parts.find((p) => p.type === "text");
      expect(textPart).toBeDefined();
      if (textPart && textPart.type === "text") {
        expect(textPart.text).toBe("Welcome to FlyStore! How can I help you find gadgets?");
      }

      // Verify request payload was captured
      expect(mock.getRequests().length).toBe(1);
      const lastReq = mock.getLastRequest();
      expect(lastReq?.url).toContain("/api/chat");
      expect(mock.getLastMessages()[0].parts[0].text).toBe("Hi there!");
    });
  });

  describe("3. useChat Integration: Tool-Call Response", () => {
    it("delivers tool call and fixed products list to useChat hook", async () => {
      mock.simulateToolCall({
        toolName: "searchProducts",
        input: { query: "headphones" },
        output: {
          query: "headphones",
          totalFound: 1,
          products: [MOCK_PRODUCTS[0]],
        },
        followUpText: "I found 1 product: FlyPods Pro for $149.99.",
      });

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage({ text: "Find headphones" });
      });

      expect(result.current.messages.length).toBe(2);
      const assistantMsg = result.current.messages[1];
      expect(assistantMsg.role).toBe("assistant");

      // Check tool parts in message
      const toolParts = assistantMsg.parts.filter((p) =>
        p.type?.startsWith("tool-") || (p as any).toolName
      );
      expect(toolParts.length).toBeGreaterThan(0);

      // Check text delta follow-up
      const textPart = assistantMsg.parts.find((p) => p.type === "text");
      expect(textPart).toBeDefined();
      if (textPart && textPart.type === "text") {
        expect(textPart.text).toContain("FlyPods Pro");
      }
    });
  });

  describe("4. useChat Integration: Error Responses", () => {
    it("triggers useChat error state on HTTP 500", async () => {
      mock.simulateError({
        status: 500,
        message: "GROQ_API_KEY is not configured",
      });

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage({ text: "Hello" }).catch(() => {});
      });

      expect(result.current.status).toBe("error");
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain("GROQ_API_KEY is not configured");
    });

    it("triggers useChat error state on HTTP 429 rate limit", async () => {
      mock.simulateError({ status: 429 });

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage({ text: "Hello" }).catch(() => {});
      });

      expect(result.current.status).toBe("error");
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain("quota");
    });

    it("handles stream-level error chunks", async () => {
      mock.simulateError({
        asStreamError: true,
        errorText: "Stream interrupted by upstream model",
      });

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage({ text: "Hello" }).catch(() => {});
      });

      expect(result.current.status).toBe("error");
      expect(result.current.error?.message).toContain("Stream interrupted by upstream model");
    });

    it("handles network failure rejection", async () => {
      mock.simulateNetworkFailure("Network error: connection refused");

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage({ text: "Hello" }).catch(() => {});
      });

      expect(result.current.status).toBe("error");
      expect(result.current.error?.message).toContain("connection refused");
    });
  });

  describe("5. Reusability and Queueing Across Multiple Calls", () => {
    it("supports queueing sequential responses (e.g. initial failure then success retry)", async () => {
      // 1st call fails, 2nd call succeeds
      mock
        .queueResponse(createMockErrorResponse({ status: 500, message: "Temporary failure" }))
        .queueResponse(createMockTextStreamResponse("Success on retry!"));

      const { result } = renderHook(() => useChat());

      // 1st call -> error
      await act(async () => {
        await result.current.sendMessage({ text: "First try" }).catch(() => {});
      });
      expect(result.current.status).toBe("error");

      // 2nd call -> success
      await act(async () => {
        await result.current.sendMessage({ text: "Second try" });
      });
      expect(result.current.status).toBe("ready");
      const lastMsg = result.current.messages[result.current.messages.length - 1];
      expect(lastMsg.role).toBe("assistant");
      const textPart = lastMsg.parts.find((p) => p.type === "text");
      if (textPart && textPart.type === "text") {
        expect(textPart.text).toBe("Success on retry!");
      }

      expect(mock.getRequests().length).toBe(2);
    });
  });
});
