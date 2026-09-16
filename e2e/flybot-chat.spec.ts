import { test, expect } from "@playwright/test";

test.describe("FlyBot Chat Primary Flow E2E Test", () => {
  test("user opens homepage, opens FlyBot, sends a message, and receives a mocked streamed reply", async ({
    page,
  }) => {
    // 1. Mock the AI chat API route at the network level (page.route)
    let interceptedRequest = false;

    await page.route("**/api/chat", async (route) => {
      interceptedRequest = true;

      // Format matching Vercel AI SDK UI Message Stream protocol (v1)
      const sseBody = [
        'data: {"type":"start","messageId":"msg-e2e-1"}\n\n',
        'data: {"type":"text-start","id":"part-e2e-1"}\n\n',
        'data: {"type":"text-delta","id":"part-e2e-1","delta":"FlyPods Pro feature active noise cancellation with 30-hour battery life."}\n\n',
        'data: {"type":"text-end","id":"part-e2e-1"}\n\n',
        'data: {"type":"finish"}\n\n',
        "data: [DONE]\n\n",
      ].join("");

      await route.fulfill({
        status: 200,
        contentType: "text/event-stream; charset=utf-8",
        headers: {
          "x-vercel-ai-ui-message-stream": "v1",
          "cache-control": "no-cache",
          connection: "keep-alive",
        },
        body: sseBody,
      });
    });

    // 2. Open the FlyStore homepage
    await page.goto("/");

    // Verify homepage navigation using accessible brand link
    await expect(
      page.getByRole("link", { name: /FlyStore/i }).first()
    ).toBeVisible();

    // 3. Open the FlyBot chat widget using accessible role and label
    const openChatButton = page.getByRole("button", {
      name: /open flybot chat|chat with flybot/i,
    });
    await expect(openChatButton).toBeVisible();
    await openChatButton.click();

    // Verify chat drawer opened and welcome heading appears
    await expect(
      page.getByRole("heading", { name: "FlyBot", exact: true })
    ).toBeVisible();
    await expect(page.getByText(/Hi there! I'm FlyBot/i)).toBeVisible();

    // 4. Type a message into the chat input
    const chatInput = page.getByRole("textbox");
    await expect(chatInput).toBeVisible();
    await chatInput.fill("Tell me about the FlyPods Pro");

    // 5. Send the message using the accessible send button
    const sendButton = page.getByRole("button", { name: /send message/i });
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // 6. Verify user message appears in the chat message flow
    await expect(
      page.getByText("Tell me about the FlyPods Pro")
    ).toBeVisible();

    // 7. Verify FlyBot's mocked reply appears in the chat message flow
    await expect(
      page.getByText(
        "FlyPods Pro feature active noise cancellation with 30-hour battery life."
      )
    ).toBeVisible();

    // Verify the mock was called and network was intercepted
    expect(interceptedRequest).toBe(true);
  });
});
