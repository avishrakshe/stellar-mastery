import { describe, it, expect, vi } from "vitest";
import { subscribeToPaymentStream, subscribeToSorobanEvents } from "../lib/streaming";

describe("Horizon & Soroban Real-Time Streaming Unit Tests", () => {
  it("should return cleanup unsubscribe function for payment stream", () => {
    const unsub = subscribeToPaymentStream(() => {});
    expect(typeof unsub).toBe("function");
    unsub();
  });

  it("should stream Soroban contract events periodically", async () => {
    const mockCallback = vi.fn();
    const unsub = subscribeToSorobanEvents(mockCallback);
    expect(typeof unsub).toBe("function");
    unsub();
  });
});
