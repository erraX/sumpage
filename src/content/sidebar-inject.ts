// Sidebar injection entry point - runs in page context
// Creates a floating button and injects the sidebar UI

import { createToggleButton } from '../lib/sidebar/toggle-button';
import { createPanel } from '../lib/sidebar/panel';

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

  // Panel state
  let panelOpen = false;
  let panelResult: ReturnType<typeof createPanel> | null = null;

  // Create toggle button
  createToggleButton(buttonShadow, {
    onPositionChange: () => {},
    onClick: () => {
      if (panelOpen && panelResult) {
        // Panel exists, close it
        panelResult.close();
        panelOpen = false;
        panelResult = null;
      } else {
        // Open panel
        openPanel();
      }
    },
  });

  // Open panel function (creates panel in its own shadow root)
  function openPanel(showSettings = false) {
    if (panelOpen) return;
    panelOpen = true;

    panelResult = createPanel({
      showSettings,
      onClose: () => {
        panelOpen = false;
        panelResult = null;
      },
    });
  }

  // Auto-open panel on load if no provider configured
  setTimeout(() => {
    openPanel(false);
  }, 0);
}

// Auto-inject when script loads
injectSidebar();
