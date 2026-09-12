import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import AnimatedSendButton from "../AnimatedSendButton";

describe("AnimatedSendButton Unit Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("1. Renders in idle state with default aria-label and icon", () => {
    render(<AnimatedSendButton />);
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDefined();
    expect(button.getAttribute("data-state")).toBe("idle");
    expect(button).not.toBeDisabled();
  });

  it("2. Respects disabled prop and sets data-state='disabled'", () => {
    render(<AnimatedSendButton disabled={true} />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("data-state")).toBe("disabled");
    expect(button).toBeDisabled();
  });

  it("3. Transitions to loading upon trigger and calls onSend", async () => {
    let resolveSend: () => void;
    const onSend = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSend = resolve;
        })
    );

    render(<AnimatedSendButton onSend={onSend} />);
    const button = screen.getByRole("button", { name: /send/i });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(button.getAttribute("data-state")).toBe("loading");
    expect(button.getAttribute("aria-busy")).toBe("true");

    // Resolve the promise to complete the test cleanly
    await act(async () => {
      resolveSend!();
    });
  });

  it("4. Transitions to success on resolve, then resets to idle after successDuration", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(<AnimatedSendButton onSend={onSend} successDuration={1200} />);
    const button = screen.getByRole("button", { name: /send/i });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button.getAttribute("data-state")).toBe("success");
    expect(button.getAttribute("aria-label")).toContain("successfully");

    // Advance timers by 1200ms
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });

    expect(button.getAttribute("data-state")).toBe("idle");
  });

  it("5. Transitions to error state on rejection and displays Retry", async () => {
    const onSend = vi.fn().mockRejectedValue(new Error("Network failed"));

    render(<AnimatedSendButton onSend={onSend} />);
    const button = screen.getByRole("button", { name: /send/i });

    await act(async () => {
      fireEvent.click(button);
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(button.getAttribute("data-state")).toBe("error");
    expect(screen.getByText("Retry")).toBeDefined();
    expect(button.getAttribute("aria-label")).toContain("retry");

    // Clicking again in error state retries onSend
    onSend.mockResolvedValueOnce(undefined);
    await act(async () => {
      fireEvent.click(button);
    });

    expect(onSend).toHaveBeenCalledTimes(2);
    expect(button.getAttribute("data-state")).toBe("success");
  });

  it("6. Interruptibility: prevents double-clicks while loading", async () => {
    let resolveSend: () => void;
    const onSend = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSend = resolve;
        })
    );

    render(<AnimatedSendButton onSend={onSend} />);
    const button = screen.getByRole("button", { name: /send/i });

    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    });

    // Even with 3 rapid clicks, onSend should only be called once
    expect(onSend).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSend!();
    });
  });

  it("7. Keyboard accessibility: tracks focus state and can be activated", () => {
    render(<AnimatedSendButton />);
    const button = screen.getByRole("button", { name: /send/i });

    fireEvent.focus(button);
    expect(button.getAttribute("data-state")).toBe("focus");

    fireEvent.blur(button);
    expect(button.getAttribute("data-state")).toBe("idle");
  });
});
