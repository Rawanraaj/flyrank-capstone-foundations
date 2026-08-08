import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { getGeminiModel, systemPrompt } from "@/lib/ai/config";

/**
 * API Route Handler for FlyBot streaming chat endpoint.
 * Includes detailed server-side logging for debugging stream errors.
 */
export async function POST(req: Request) {
  console.log("[FlyBot] POST /api/chat — request received");

  try {
    // Runtime API key validation
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log(
      `[FlyBot] API key check — defined: ${Boolean(apiKey)}, length: ${apiKey?.length ?? 0}`
    );

    if (!apiKey) {
      console.error("[FlyBot] FATAL: No API key found in environment");
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const messages: UIMessage[] = body.messages ?? [];
    console.log(`[FlyBot] ${messages.length} messages received from client`);

    const convertedMessages = await convertToModelMessages(messages);
    console.log(`[FlyBot] Converted to ${convertedMessages.length} model messages`);

    const model = getGeminiModel();

    const result = streamText({
      model,
      system: systemPrompt,
      messages: convertedMessages,
      onError: ({ error }) => {
        // This fires when the stream itself encounters an error (e.g. 429, 401, model not found).
        // By this point the response headers are already sent as 200 + text/event-stream,
        // so this error gets embedded inside the SSE stream as a {"type":"error"} chunk.
        console.error("[FlyBot streamText onError]:", error);
        if (error instanceof Error) {
          console.error("[FlyBot streamText onError] name:", error.name);
          console.error("[FlyBot streamText onError] message:", error.message);
        }
      },
    });

    console.log("[FlyBot] streamText initiated, returning UI message stream response");

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("[FlyBot toUIMessageStreamResponse onError]:", error);

        // Return a descriptive error string — this is sent to the client
        // as the error text and surfaced by useChat's `error` property.
        if (error instanceof Error) {
          const msg = error.message;
          if (msg.includes("quota") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
            return "API quota exceeded. Please wait a moment and try again.";
          }
          if (msg.includes("API key") || msg.includes("401")) {
            return "API authentication failed. Please check the API key configuration.";
          }
          return msg;
        }
        return "An unexpected error occurred while generating a response.";
      },
    });
  } catch (error) {
    // This catches errors that happen BEFORE the stream starts (e.g. bad JSON body, config issues)
    console.error("[FlyBot POST catch]:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Chat processing failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
