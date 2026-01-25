// Sidebar injection entry point - runs in page context
// This file creates a floating button and injects the sidebar UI using Emotion

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SidebarApp } from './SidebarApp';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { theme } from './theme';

// Prevent multiple injections
let injected = false;

export function injectSidebar() {
  console.log('[Sumpage] injectSidebar called, injected:', injected);
  if (injected) return;
  injected = true;
  console.log('[Sumpage] Creating floating button...');

  // Create shadow DOM host for floating button
  const buttonHost = document.createElement('div');
  buttonHost.id = 'sumpage-sidebar-host';
  document.body.appendChild(buttonHost);
  const buttonShadow = buttonHost.attachShadow({ mode: 'open' });

  // Inject global styles for toggle button
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    .sumpage-toggle-btn {
      position: fixed;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(47, 111, 106, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 12px rgba(22, 52, 50, 0.25);
      cursor: pointer;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      user-select: none;
      padding: 0;
    }
    .sumpage-toggle-btn:hover {
      transform: translateY(-1px);
      background: rgba(47, 111, 106, 1);
      box-shadow: 0 6px 16px rgba(22, 52, 50, 0.3);
    }
    .sumpage-toggle-btn:active {
      transform: translateY(0);
    }
    .sumpage-toggle-btn.dragging {
      cursor: grabbing;
      transform: scale(1.05);
    }
    .sumpage-toggle-btn svg {
      fill: none;
    }
  `;
  buttonShadow.appendChild(style);

  // Create toggle button with SVG logo
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sumpage-toggle-btn';
  toggleBtn.className = 'sumpage-toggle-btn';
  toggleBtn.title = 'Sumpage - Click to summarize this page';

  // SVG logo: minimalist line-style chat bubble (centered)
  const svgNS = 'http://www.w3.org/2000/svg';
  const svgIcon = document.createElementNS(svgNS, 'svg');
  svgIcon.setAttribute('viewBox', '0 0 24 24');
  svgIcon.setAttribute('width', '18');
  svgIcon.setAttribute('height', '18');

  // Main bubble outline - centered in 24x24 viewBox
  const bubblePath = document.createElementNS(svgNS, 'path');
  bubblePath.setAttribute(
    'd',
    'M6 6C4.343 6 3 7.343 3 9v6c0 1.657 1.343 3 3 3h1v2l3-2h6c1.657 0 3-1.343 3-3V9c0-1.657-1.343-3-3-3H6z'
  );
  bubblePath.setAttribute('fill', 'none');
  bubblePath.setAttribute('stroke', '#f9fbfa');
  bubblePath.setAttribute('stroke-width', '1.5');
  bubblePath.setAttribute('stroke-linecap', 'round');
  bubblePath.setAttribute('stroke-linejoin', 'round');

  svgIcon.appendChild(bubblePath);
  toggleBtn.appendChild(svgIcon);

  // Set initial position
  toggleBtn.style.right = '24px';
  toggleBtn.style.bottom = '24px';

  buttonShadow.appendChild(toggleBtn);

  // Draggable state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let buttonRight = 24;
  let buttonBottom = 24;

  function clampButtonPosition(right: number, bottom: number) {
    const rect = toggleBtn.getBoundingClientRect();
    const maxRight = Math.max(0, window.innerWidth - rect.width);
    const maxBottom = Math.max(0, window.innerHeight - rect.height);
    return {
      right: Math.min(Math.max(0, right), maxRight),
      bottom: Math.min(Math.max(0, bottom), maxBottom),
    };
  }

  function applyButtonPosition(right: number, bottom: number) {
    const clamped = clampButtonPosition(right, bottom);
    buttonRight = clamped.right;
    buttonBottom = clamped.bottom;
    toggleBtn.style.right = buttonRight + 'px';
    toggleBtn.style.bottom = buttonBottom + 'px';
    return clamped;
  }

  // Load saved position (async, may override initial position)
  function loadButtonPosition() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get('sumpageButtonPos', (result: any) => {
        if (
          result.sumpageButtonPos &&
          typeof result.sumpageButtonPos.right === 'number' &&
          typeof result.sumpageButtonPos.bottom === 'number'
        ) {
          const clamped = applyButtonPosition(
            result.sumpageButtonPos.right,
            result.sumpageButtonPos.bottom
          );
          if (
            clamped.right !== result.sumpageButtonPos.right ||
            clamped.bottom !== result.sumpageButtonPos.bottom
          ) {
            saveButtonPosition();
          }
        }
      });
    }
  }

  // Save position to storage
  function saveButtonPosition() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        sumpageButtonPos: { right: buttonRight, bottom: buttonBottom },
      });
    }
  }

  // Initialize - load saved position
  loadButtonPosition();

  // Drag event handlers
  let wasDragged = false;

  toggleBtn.addEventListener('mousedown', (e: MouseEvent) => {
    isDragging = true;
    wasDragged = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    toggleBtn.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) wasDragged = true;
    applyButtonPosition(buttonRight - deltaX, buttonBottom - deltaY);
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      toggleBtn.classList.remove('dragging');
      saveButtonPosition();
    }
  });

  window.addEventListener('resize', () => {
    const prevRight = buttonRight;
    const prevBottom = buttonBottom;
    const clamped = applyButtonPosition(prevRight, prevBottom);
    if (clamped.right !== prevRight || clamped.bottom !== prevBottom) {
      saveButtonPosition();
    }
  });

  // Panel state
  let panelOpen = false;
  let panelRoot: ReturnType<typeof createRoot> | null = null;
  let panelHost: HTMLElement | null = null;

  function openPanel(showSettings = false, options?: { disableAnimation?: boolean }) {
    if (panelOpen) return;
    panelOpen = true;

    // Create panel host
    panelHost = document.createElement('div');
    panelHost.id = 'sumpage-panel-host';
    document.body.appendChild(panelHost);
    const panelShadow = panelHost.attachShadow({ mode: 'open' });

    // Create Emotion cache for Shadow DOM
    const panelStyle = document.createElement('style');
    panelShadow.appendChild(panelStyle);

    // Create cache for Emotion (styles will be injected into the shadow root)
    const cache = createCache({
      key: 'sumpage',
      container: panelStyle,
    });

    // Inject minimal CSS for panel structure
    const globalStyle = document.createElement('style');
    globalStyle.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap');

      * { box-sizing: border-box; }

      /* Panel structure */
      .sumpage-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        max-width: 100vw;
        height: 100vh;
        background: ${theme.surface};
        box-shadow: -6px 0 28px rgba(22, 52, 50, 0.18);
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: ${theme.font};
      }
      .sumpage-panel-open { transform: translateX(0); }

      /* Header */
      .sumpage-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        background: linear-gradient(160deg, ${theme.accent} 0%, #3b837f 100%);
      }
      .sumpage-panel-header h2 {
        font-size: 17px;
        font-weight: 600;
        color: ${theme.white};
        margin: 0;
      }
      .sumpage-panel-btn {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.18);
        border: 1px solid rgba(255, 255, 255, 0.22);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
        font-size: 14px;
        color: ${theme.white};
      }
      .sumpage-panel-btn:hover { background: rgba(255, 255, 255, 0.28); }
      .sumpage-panel-btn-close {
        width: 30px;
        height: 30px;
        border-radius: 10px;
        font-size: 16px;
      }

      /* Content */
      .sumpage-panel-content {
        flex: 1;
        overflow-y: auto;
        background: linear-gradient(180deg, ${theme.bg} 0%, #f1f5f3 100%);
      }
      .sumpage-panel-content::-webkit-scrollbar { width: 10px; }
      .sumpage-panel-content::-webkit-scrollbar-track { background: #efe9e1; }
      .sumpage-panel-content::-webkit-scrollbar-thumb { background: #c6d5d0; border-radius: 999px; border: 2px solid #efe9e1; }
    `;
    panelShadow.appendChild(globalStyle);

    // Create panel container
    const panel = document.createElement('div');
    panel.className = 'sumpage-panel';
    panelShadow.appendChild(panel);

    // Create header with title, settings button, and close button
    const header = document.createElement('div');
    header.className = 'sumpage-panel-header';
    panel.appendChild(header);

    const leftGroup = document.createElement('div');
    leftGroup.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    header.appendChild(leftGroup);

    const title = document.createElement('h2');
    title.textContent = 'Sumpage';
    leftGroup.appendChild(title);

    // Settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'sumpage-panel-btn';
    settingsBtn.title = 'Settings';
    settingsBtn.textContent = '⚙';
    leftGroup.appendChild(settingsBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'sumpage-panel-btn sumpage-panel-btn-close';
    closeBtn.textContent = '×';
    header.appendChild(closeBtn);

    // Create content container for React
    const content = document.createElement('div');
    content.className = 'sumpage-panel-content';
    panel.appendChild(content);

    // Render React app with Emotion cache
    panelRoot = createRoot(content);
    panelRoot.render(
      React.createElement(
        CacheProvider,
        { value: cache },
        React.createElement(SidebarApp, { onClose: closePanel, showSettings: showSettings })
      )
    );

    // Trigger animation unless disabled (used for settings view)
    if (options?.disableAnimation) {
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

    // Set up outside click listener to close panel
    setupOutsideClickListener();

    // Close button handler
    closeBtn.addEventListener('click', closePanel);

    // Settings button handler
    settingsBtn.addEventListener('click', () => {
      setShowSettings(true);
    });
  }

  function setShowSettings(value: boolean) {
    if (panelHost && panelRoot) {
      panelRoot.unmount();
      panelRoot = null;
      panelHost.remove();
      panelHost = null;
      panelOpen = false;
    }
    if (value) {
      openPanel(true, { disableAnimation: true });
    }
  }

  function closePanel() {
    if (!panelOpen || !panelHost) return;

    // Remove outside click listener
    if (outsideClickHandler) {
      document.removeEventListener('click', outsideClickHandler);
      outsideClickHandler = null;
    }

    const panel = panelHost.shadowRoot?.querySelector('.sumpage-panel');
    if (panel) {
      panel.classList.remove('sumpage-panel-open');
      setTimeout(() => {
        panelRoot?.unmount();
        panelRoot = null;
        panelHost?.remove();
        panelHost = null;
        panelOpen = false;
      }, 300);
    } else {
      panelRoot?.unmount();
      panelRoot = null;
      panelHost?.remove();
      panelHost = null;
      panelOpen = false;
    }
  }

  // Outside click handler
  let outsideClickHandler: ((e: MouseEvent) => void) | null = null;
  let ignoreNextOutsideClick = false;

  function setupOutsideClickListener() {
    ignoreNextOutsideClick = true;
    setTimeout(() => {
      ignoreNextOutsideClick = false;
    }, 100);

    outsideClickHandler = (e: MouseEvent) => {
      if (ignoreNextOutsideClick) return;
      if (toggleBtn.contains(e.target as Node)) return;
      if (panelHost?.contains(e.target as Node)) return;
      closePanel();
    };
    document.addEventListener('click', outsideClickHandler);
  }

  // Toggle button handler
  toggleBtn.addEventListener('click', () => {
    if (wasDragged) return;
    if (panelOpen) closePanel();
    else openPanel(false);
  });

  setTimeout(() => {
    openPanel(false);
  });
}

// Auto-inject when script loads
injectSidebar();
