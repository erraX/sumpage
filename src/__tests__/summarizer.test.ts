import { describe, it, expect, vi } from "vitest";

// Mock the chrome API for tests
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
};

vi.stubGlobal("chrome", mockChrome);

describe("Sidebar injection", () => {
  it("should be importable", async () => {
    const { injectSidebar } = await import("../sidebar/inject");
    expect(injectSidebar).toBeDefined();
  });
});
