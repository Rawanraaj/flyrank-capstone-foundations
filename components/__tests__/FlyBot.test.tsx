import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FlyBot from "../FlyBot";
import {
  mockChatRoute,
  createMockTextStreamResponse,
  createMockToolStreamResponse,
  createMockErrorResponse,
  MOCK_PRODUCTS,
  type ChatRouteMockController,
} from "@/test/mocks/mockChatRoute";

describe("FlyBot Chat Message Renderer Component Tests", () => {
  let mock: ChatRouteMockController;

  beforeEach(() => {
    mock = mockChatRoute();
  });

  afterEach(() => {
    mock.restore();
  });

  // Helper to send a message via accessible user interactions
  async function sendMessage(text: string) {
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: text } });
    const sendButton = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(sendButton);
  }

  it("(1) renders a pending/loading state message while waiting for the response", async () => {
    let releaseResponse: () => void = () => {};
    const pendingGate = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });

    mock.setDefaultResponse(async () => {
      await pendingGate;
      return createMockTextStreamResponse("Here is your answer!");
    });

    render(<FlyBot embedded={true} />);

    // Initially welcome message is present
    expect(screen.getByText(/Hi there! I'm FlyBot/i)).toBeInTheDocument();

    // Submit user message
    await sendMessage("Tell me about warranty policies");

    // 1. User message appears in chat flow
    expect(screen.getByText("Tell me about warranty policies")).toBeInTheDocument();

    // 2. Pending indicator appears in chat flow
    expect(screen.getByText(/FlyBot is processing\.\.\./i)).toBeInTheDocument();

    // 3. Send button indicates loading via aria-busy="true" and Stop button is rendered
    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByRole("button", { name: /stop generating response/i })
    ).toBeInTheDocument();

    // Release the gate to allow stream to complete cleanly
    releaseResponse();

    await waitFor(() => {
      expect(screen.getByText("Here is your answer!")).toBeInTheDocument();
    });
  });

  it("(2) renders a streaming text message with partial content and stop control", async () => {
    let releaseSecondChunk: () => void = () => {};
    const streamGate = new Promise<void>((resolve) => {
      releaseSecondChunk = resolve;
    });

    mock.setDefaultResponse(async () => {
      const sseBody1 = [
        'data: {"type":"start","messageId":"msg-stream-1"}\n\n',
        'data: {"type":"text-start","id":"part-stream-1"}\n\n',
        'data: {"type":"text-delta","id":"part-stream-1","delta":"FlyStore offers a 30-day "}\n\n',
      ].join("");

      const sseBody2 = [
        'data: {"type":"text-delta","id":"part-stream-1","delta":"hassle-free return policy."}\n\n',
        'data: {"type":"text-end","id":"part-stream-1"}\n\n',
        'data: {"type":"finish"}\n\n',
        "data: [DONE]\n\n",
      ].join("");

      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(new TextEncoder().encode(sseBody1));
          await streamGate;
          controller.enqueue(new TextEncoder().encode(sseBody2));
          controller.close();
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "content-type": "text/event-stream; charset=utf-8",
          "x-vercel-ai-ui-message-stream": "v1",
        },
      });
    });

    render(<FlyBot embedded={true} />);

    await sendMessage("What is your return policy?");

    // Verify partial streamed text message is visible in the chat message flow
    await waitFor(() => {
      expect(screen.getByText(/FlyStore offers a 30-day/i)).toBeInTheDocument();
    });

    // Secondary stop button is visible during active streaming
    const stopButton = screen.getByRole("button", {
      name: /stop generating response/i,
    });
    expect(stopButton).toBeInTheDocument();

    // Now release remainder of stream
    releaseSecondChunk();

    // Verify full completed message text is rendered
    await waitFor(() => {
      expect(
        screen.getByText(/FlyStore offers a 30-day hassle-free return policy\./i)
      ).toBeInTheDocument();
    });
  });

  it("(3) renders a completed text message when stream finishes", async () => {
    mock.simulateText("FlyStore ships worldwide with expedited shipping available!");

    render(<FlyBot embedded={true} />);

    await sendMessage("Do you ship internationally?");

    // User message is rendered
    expect(screen.getByText("Do you ship internationally?")).toBeInTheDocument();

    // Completed assistant message is rendered
    await waitFor(() => {
      expect(
        screen.getByText(
          "FlyStore ships worldwide with expedited shipping available!"
        )
      ).toBeInTheDocument();
    });

    // Processing indicator is no longer displayed
    expect(screen.queryByText(/FlyBot is processing\.\.\./i)).not.toBeInTheDocument();

    // Send button returns to ready state
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("(4) renders an error state message with the Retry button on API failure", async () => {
    mock.simulateError({
      status: 429,
      message: "Rate limit exceeded",
    });

    render(<FlyBot embedded={true} />);

    await sendMessage("Check status quickly");

    // Error heading rendered
    await waitFor(() => {
      expect(
        screen.getByText(/Error Generating Response/i)
      ).toBeInTheDocument();
    });

    // Friendly 429 rate limit message rendered
    expect(
      screen.getByText(/You're sending messages a bit fast/i)
    ).toBeInTheDocument();

    // Accessible Retry button rendered and clickable
    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toBeEnabled();

    // Verify Retry button works with mocked recovery
    mock.simulateText("Recovered response on retry!");
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(
        screen.getByText("Recovered response on retry!")
      ).toBeInTheDocument();
    });
  });

  it("(5) renders a tool-result message type (product search results) correctly within message flow", async () => {
    mock.simulateToolCall({
      toolName: "searchProducts",
      input: { query: "audio" },
      output: {
        query: "audio",
        totalFound: 2,
        products: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[3]], // FlyPods Pro ($149.99) & FlySound Speaker ($79.99)
      },
      followUpText: "Here are the best audio products currently in stock at FlyStore:",
    });

    render(<FlyBot embedded={true} />);

    await sendMessage("Search audio gear");

    // User message in chat flow
    expect(screen.getByText("Search audio gear")).toBeInTheDocument();

    // Tool results container heading
    await waitFor(() => {
      expect(screen.getByText(/Product Search Results/i)).toBeInTheDocument();
    });

    // Product 1 heading and price rendered by accessible text/role
    expect(
      screen.getByRole("heading", { name: "FlyPods Pro" })
    ).toBeInTheDocument();
    expect(screen.getByText("$149.99")).toBeInTheDocument();

    // Product 2 heading and price rendered by accessible text/role
    expect(
      screen.getByRole("heading", { name: "FlySound Bluetooth Speaker" })
    ).toBeInTheDocument();
    expect(screen.getByText("$79.99")).toBeInTheDocument();

    // Assistant follow-up message text rendered after tool results
    expect(
      screen.getByText(/Here are the best audio products currently in stock at FlyStore:/i)
    ).toBeInTheDocument();
  });
});
