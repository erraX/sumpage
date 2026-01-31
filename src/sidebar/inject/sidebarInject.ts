import { createToggleButton } from "./toggle-button";
import { createPanel } from "./panel";
import type { PanelResult } from "./types";
import { ShadowDom } from "./ShadowDom";

// Prevent multiple injections
let injected = false;

export function injectSidebar() {
  if (injected) return;
  injected = true;

  const buttonHost = new ShadowDom("sumpage-sidebar-button-host");
  buttonHost.mount();

  let panel: PanelResult | null = null;
  function openPanel() {
    if (!panel) {
      panel = createPanel();
    }
    panel.open();
  }

  createToggleButton(buttonHost.getShadow()!, {
    onPositionChange: () => {},
    onClick: openPanel,
  });

  // Auto-open panel on load if no provider configured
  setTimeout(openPanel, 0);
}

// Auto-inject when script loads
injectSidebar();
