import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

// Stub requestAnimationFrame for jsdom
const originalRaf = globalThis.requestAnimationFrame;
const originalCancelRaf = globalThis.cancelAnimationFrame;

const mockChrome = {
  storage: {
    local: {
      get: vi.fn((_, cb) => cb({})),
      set: vi.fn(),
    },
  },
};

describe('sidebar toggle button', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    // Ensure fresh globals per test
    (globalThis as unknown as { chrome?: unknown }).chrome = mockChrome;
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      return setTimeout(cb, 0) as unknown as number;
    };
    globalThis.cancelAnimationFrame = (id: number) => {
      clearTimeout(id);
    };
  });

  it('reopens after being closed with the close button', async () => {
    const { injectSidebar } = await import('./sidebarInject');

    injectSidebar();
    await vi.runAllTimersAsync();

    const panelHost = document.getElementById('sumpage-panel-host');
    expect(panelHost).not.toBeNull();
    const panelShadow = panelHost!.shadowRoot!;
    const panel = panelShadow.querySelector('.sumpage-panel') as HTMLElement;

    expect(panel.classList.contains('sumpage-panel-open')).toBe(true);

    const closeBtn = panelShadow.querySelector(
      '.sumpage-panel-btn-close'
    ) as HTMLButtonElement;
    closeBtn.click();

    expect(panel.classList.contains('sumpage-panel-open')).toBe(false);

    const toggleHost = document.getElementById('sumpage-sidebar-button-host');
    expect(toggleHost).not.toBeNull();
    const toggleShadow = toggleHost!.shadowRoot!;
    const toggleBtn = toggleShadow.querySelector(
      '#sumpage-toggle-btn'
    ) as HTMLButtonElement;

    toggleBtn.click();

    expect(panel.classList.contains('sumpage-panel-open')).toBe(true);
  });

  it('reopens after being closed via outside click handler', async () => {
    const { injectSidebar } = await import('./sidebarInject');

    injectSidebar();
    await vi.runAllTimersAsync();

    const panelHost = document.getElementById('sumpage-panel-host')!;
    const panelShadow = panelHost.shadowRoot!;
    const panel = panelShadow.querySelector('.sumpage-panel') as HTMLElement;

    expect(panel.classList.contains('sumpage-panel-open')).toBe(true);

    // Simulate outside click
    document.body.click();

    expect(panel.classList.contains('sumpage-panel-open')).toBe(false);

    const toggleHost = document.getElementById('sumpage-sidebar-button-host')!;
    const toggleBtn = toggleHost.shadowRoot!.querySelector(
      '#sumpage-toggle-btn'
    ) as HTMLButtonElement;
    toggleBtn.click();

    expect(panel.classList.contains('sumpage-panel-open')).toBe(true);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();

    document.body.innerHTML = '';
    (globalThis as unknown as { chrome?: unknown }).chrome = undefined;
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancelRaf;
  });
});
