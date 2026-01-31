import React from 'react';
import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { PanelOptions, PanelResult } from '../types';
import { SidebarApp } from '../../ui/SidebarApp';
import { PANEL_STYLES, COMPONENT_STYLES } from './panelStyles';
import { setupOutsideClick } from '../outsideClick';
import { muiTheme } from '../../ui/muiTheme';

export function createPanel(options: PanelOptions = {}): PanelResult {
  // Create panel host with its own shadow root
  const host = document.createElement('div');
  host.id = 'sumpage-panel-host';
  document.body.appendChild(host);
  const panelShadow = host.attachShadow({ mode: 'open' });

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
  const panelRoot = createRoot(panel);

  let cleanupOutsideClick: (() => void) | null = null;

  const attachOutsideClick = () => {
    // Prevent duplicate listeners
    cleanupOutsideClick?.();
    cleanupOutsideClick = setupOutsideClick([panel], closePanel);
  };

  // Close function (use function declaration for hoisting)
  const closePanel = () => {
    if (!panel.classList.contains('sumpage-panel-open')) return;

    cleanupOutsideClick?.();
    options.onClose?.();

    panel.classList.remove('sumpage-panel-open');
  };

  // Outside click handler
  attachOutsideClick();

  // Render React app
  panelRoot.render(
    React.createElement(
      CacheProvider,
      { value: cache },
      React.createElement(
        ThemeProvider,
        { theme: muiTheme },
        React.createElement(
          React.Fragment,
          null,
          React.createElement(CssBaseline, null),
          React.createElement(SidebarApp, {
            onClose: closePanel,
          })
        )
      )
    )
  );

  // Animation
  requestAnimationFrame(() => {
    panel.classList.add('sumpage-panel-open');
  });

  // Event handlers are now managed inside React components

  return {
    open: () => {
      attachOutsideClick();
      panel.classList.add('sumpage-panel-open');
    },
    close: closePanel,
  };
}
