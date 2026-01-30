// Sidebar injection entry point - runs in page context
// Creates a floating button and injects the sidebar UI

import { createToggleButton } from '../lib/sidebar/toggle-button';
import { createPanel } from '../lib/sidebar/panel';
import type { PanelResult } from '../lib/sidebar/types';

// Prevent multiple injections
let injected = false;

export function injectSidebar() {
  if (injected) return;
  injected = true;

  // Create button host with its own shadow root
  const buttonHost = document.createElement('div');
  buttonHost.id = 'sumpage-sidebar-host';
  document.body.appendChild(buttonHost);
  const buttonShadow = buttonHost.attachShadow({ mode: 'open' });

  // Create toggle button
  createToggleButton(buttonShadow, {
    onPositionChange: () => {},
    onClick: openPanel,
  });

  let panel: PanelResult | null = null;
  function openPanel() {
    if (!panel) {
      panel = createPanel();
    }
    panel.open();
  }

  // Auto-open panel on load if no provider configured
  setTimeout(openPanel, 0);
}

// Auto-inject when script loads
injectSidebar();
