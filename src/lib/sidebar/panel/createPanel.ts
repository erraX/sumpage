import React from 'react';
import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import type { PanelOptions, PanelResult } from '../types';
import { SidebarApp } from '../../../content/SidebarApp';
import { PANEL_STYLES, COMPONENT_STYLES } from './panelStyles';
import { setupOutsideClick } from '../outsideClick';

export function createPanel(options: PanelOptions): PanelResult {
  // Create panel host with its own shadow root
  const host = document.createElement('div');
  host.id = 'sumpage-panel-host';
  document.body.appendChild(host);
  const panelShadow = host.attachShadow({ mode: 'open' });

  const initialShowSettings = options.showSettings ?? false;

  // Inject styles
  const globalStyle = document.createElement('style');
  globalStyle.textContent = PANEL_STYLES + COMPONENT_STYLES;
  panelShadow.appendChild(globalStyle);

  // Create panel container that React will fully control
  const panel = document.createElement('div');
  panel.className = 'sumpage-panel';
  panelShadow.appendChild(panel);

  // Create Emotion cache for Shadow DOM
  const styleElement = document.createElement('style');
  panelShadow.appendChild(styleElement);
  const cache = createCache({
    key: 'sumpage',
    container: styleElement,
  });

  // Track if already closed
  let isClosed = false;
  const panelRoot = createRoot(panel);

  // Close function (use function declaration for hoisting)
  const closePanel = () => {
    if (isClosed) return;
    isClosed = true;

    cleanupOutsideClick();
    options.onClose?.();

    panel.classList.remove('sumpage-panel-open');
    setTimeout(() => {
      panelRoot.unmount();
      host.remove();
    }, 300);
  };

  // Outside click handler
  const cleanupOutsideClick = setupOutsideClick([panel], closePanel);

  // Render React app
  panelRoot.render(
    React.createElement(
      CacheProvider,
      { value: cache },
      React.createElement(SidebarApp, {
        onClose: closePanel,
        initialShowSettings,
      })
    )
  );

  // Animation
  if (options.disableAnimation) {
    panel.style.transition = 'none';
    panel.classList.add('sumpage-panel-open');
    requestAnimationFrame(() => {
      panel.style.transition = '';
    });
  } else {
    requestAnimationFrame(() => {
      panel.classList.add('sumpage-panel-open');
    });
  }

  // Event handlers are now managed inside React components

  return {
    panel,
    close: closePanel,
    cleanup: () => {
      // Event handlers are managed by React; no DOM listeners to remove here
      cleanupOutsideClick();
      panelRoot.unmount();
      host.remove();
    },
  };
}
