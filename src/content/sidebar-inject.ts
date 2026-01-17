// Sidebar injection entry point - runs in page context
// This file creates a floating button and injects the sidebar UI

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SidebarApp } from './SidebarApp';

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

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&display=swap');

    #sumpage-toggle-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(160deg, #2f6f6a 0%, #3b837f 100%);
      border: 1px solid rgba(20, 60, 56, 0.4);
      box-shadow: 0 12px 24px rgba(22, 52, 50, 0.25), 0 4px 10px rgba(22, 52, 50, 0.2);
      cursor: pointer;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      font-family: "Space Grotesk", "Trebuchet MS", sans-serif;
    }
    #sumpage-toggle-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(22, 52, 50, 0.3), 0 6px 14px rgba(22, 52, 50, 0.22);
    }
    #sumpage-toggle-btn:active {
      transform: translateY(0);
    }
    #sumpage-toggle-btn svg {
      width: 28px;
      height: 28px;
      fill: #f9fbfa;
    }
  `;
  buttonShadow.appendChild(style);

  // Create toggle button with text icon
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sumpage-toggle-btn';
  toggleBtn.title = 'Sumpage - Click to summarize this page';
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(160deg, #2f6f6a 0%, #3b837f 100%);
    border: 1px solid rgba(20, 60, 56, 0.4);
    box-shadow: 0 12px 24px rgba(22, 52, 50, 0.25), 0 4px 10px rgba(22, 52, 50, 0.2);
    cursor: pointer;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    font-size: 22px;
    font-weight: 600;
    color: #f9fbfa;
    font-family: "Space Grotesk", "Trebuchet MS", sans-serif;
  `;
  toggleBtn.textContent = 'S';
  buttonShadow.appendChild(toggleBtn);

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

    // Inject panel styles - ALL CSS must be inline for Shadow DOM
    const panelStyle = document.createElement('style');
    panelStyle.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap');

      :host {
        --sumpage-font: "Space Grotesk", "Trebuchet MS", sans-serif;
        --sumpage-bg: #f6f2ea;
        --sumpage-surface: #ffffff;
        --sumpage-ink: #1f2a2a;
        --sumpage-muted: #5d6b68;
        --sumpage-accent: #2f6f6a;
        --sumpage-accent-strong: #235652;
        --sumpage-accent-soft: #e3f0ee;
        --sumpage-border: #d7e1dd;
        --sumpage-warning-bg: #fff0ec;
        --sumpage-warning-border: #f2b8a8;
        --sumpage-warning-text: #b44635;
        --sumpage-success: #2f7a4f;
        --sumpage-success-soft: #e6f4ec;
      }

      * { box-sizing: border-box; }
      .sumpage-sidebar-host {
        font-family: var(--sumpage-font);
        color: var(--sumpage-ink);
        contain: layout style;
      }
      .sumpage-sidebar-host * { box-sizing: border-box; }

      /* Panel */
      #sumpage-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        max-width: 100vw;
        height: 100vh;
        background: var(--sumpage-surface);
        box-shadow: -6px 0 28px rgba(22, 52, 50, 0.18);
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: var(--sumpage-font);
      }
      #sumpage-panel.open { transform: translateX(0); }

      /* Header */
      #sumpage-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        background: linear-gradient(160deg, #2f6f6a 0%, #3b837f 100%);
      }
      #sumpage-panel-header h2 {
        font-size: 17px;
        font-weight: 600;
        color: #f9fbfa;
        margin: 0;
      }
      #sumpage-close-btn {
        width: 30px;
        height: 30px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.18);
        border: 1px solid rgba(255, 255, 255, 0.22);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
      }
      #sumpage-close-btn:hover { background: rgba(255, 255, 255, 0.28); }
      #sumpage-close-btn svg { width: 16px; height: 16px; fill: #f9fbfa; }
      #sumpage-settings-btn:hover { background: rgba(255, 255, 255, 0.28); }

      /* Content */
      #sumpage-panel-content {
        flex: 1;
        overflow-y: auto;
        background: linear-gradient(180deg, #f8f4ee 0%, #f1f5f3 100%);
      }

      /* React header inside panel content */
      .sumpage-sidebar-panel { background: transparent; }
      .sumpage-sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 4px 4px;
        margin: 0 14px 12px;
        border-bottom: 1px dashed var(--sumpage-border);
      }
      .sumpage-sidebar-title {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: var(--sumpage-muted);
        margin: 0;
      }
      .sumpage-sidebar-header .sumpage-close-btn { display: none; }
      .sumpage-sidebar-content { padding: 0; }

      /* Container */
      .sumpage-container { max-width: 360px; margin: 0 auto; padding: 10px 18px 24px; }

      /* Loading */
      .sumpage-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; }
      .sumpage-loading-icon { width: 48px; height: 48px; margin-bottom: 16px; }
      .sumpage-spinner { width: 32px; height: 32px; border: 3px solid var(--sumpage-border); border-top-color: var(--sumpage-accent); border-radius: 50%; animation: sumpage-spin 0.8s linear infinite; }
      @keyframes sumpage-spin { to { transform: rotate(360deg); } }
      .sumpage-loading p { color: var(--sumpage-muted); font-size: 14px; margin: 0; }
      .sumpage-loading.success .sumpage-spinner { border-top-color: var(--sumpage-success); }
      .sumpage-loading.success p { color: var(--sumpage-success); }

      /* Error */
      .sumpage-error { background: var(--sumpage-warning-bg); border: 1px solid var(--sumpage-warning-border); border-radius: 10px; padding: 16px; margin-bottom: 16px; text-align: center; }
      .sumpage-error p { color: var(--sumpage-warning-text); font-size: 14px; margin: 0 0 12px 0; }
      .sumpage-retry-btn { background: var(--sumpage-accent); color: #f9fbfa; border: none; padding: 8px 14px; border-radius: 8px; font-size: 14px; cursor: pointer; transition: background 0.2s ease; }
      .sumpage-retry-btn:hover { background: var(--sumpage-accent-strong); }

      /* Result */
      .sumpage-result { background: var(--sumpage-surface); border-radius: 14px; padding: 16px; box-shadow: 0 8px 20px rgba(22, 52, 50, 0.08); border: 1px solid var(--sumpage-border); }
      .sumpage-ai-badge { display: inline-block; background: var(--sumpage-accent-soft); color: var(--sumpage-accent-strong); font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 12px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
      .sumpage-markdown-section { margin-bottom: 16px; }
      .sumpage-markdown-section:last-child { margin-bottom: 0; }
      .sumpage-markdown-section h3 { font-size: 14px; font-weight: 600; color: var(--sumpage-ink); margin: 0 0 10px 0; }
      .sumpage-markdown-content { font-size: 14px; line-height: 1.6; color: var(--sumpage-muted); }
      .sumpage-markdown-content p { margin: 0 0 10px 0; }
      .sumpage-markdown-content p:last-child { margin-bottom: 0; }
      .sumpage-markdown-content h1, .sumpage-markdown-content h2, .sumpage-markdown-content h3, .sumpage-markdown-content h4 { color: var(--sumpage-ink); margin: 16px 0 8px 0; }
      .sumpage-markdown-content ul, .sumpage-markdown-content ol { margin: 10px 0; padding-left: 20px; }
      .sumpage-markdown-content li { margin-bottom: 6px; }

      /* Key Points */
      .sumpage-key-points { list-style: none; padding: 0; margin: 0; }
      .sumpage-key-points li { position: relative; padding-left: 20px; margin-bottom: 10px; font-size: 13px; color: var(--sumpage-muted); line-height: 1.5; }
      .sumpage-key-points li::before { content: ""; position: absolute; left: 0; top: 6px; width: 6px; height: 6px; border-radius: 50%; background: var(--sumpage-accent); }

      /* Actions */
      .sumpage-actions { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--sumpage-border); }
      .sumpage-refresh-btn { width: 100%; background: var(--sumpage-accent-soft); color: var(--sumpage-accent-strong); border: none; padding: 10px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
      .sumpage-refresh-btn:hover { background: #d4e7e4; }

      /* Empty */
      .sumpage-empty { text-align: center; padding: 40px 20px; }
      .sumpage-empty p { color: var(--sumpage-muted); font-size: 14px; margin: 0 0 16px 0; }
      .sumpage-summarize-btn { width: 100%; background: linear-gradient(160deg, #2f6f6a 0%, #3b837f 100%); color: #f9fbfa; border: none; padding: 12px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 8px 16px rgba(22, 52, 50, 0.25); }
      .sumpage-summarize-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 20px rgba(22, 52, 50, 0.3); }
      .sumpage-summarize-btn:active { transform: translateY(0); }

      /* Settings form */
      .sumpage-form-group { margin-bottom: 16px; }
      .sumpage-label { display: block; font-size: 13px; font-weight: 600; color: var(--sumpage-muted); margin-bottom: 6px; letter-spacing: 0.01em; }
      .sumpage-input { width: 100%; padding: 10px 12px; border: 1px solid var(--sumpage-border); border-radius: 10px; font-size: 14px; transition: border-color 0.2s ease, box-shadow 0.2s ease; background: #fbfbfa; }
      .sumpage-input:focus { outline: none; border-color: var(--sumpage-accent); box-shadow: 0 0 0 3px rgba(47, 111, 106, 0.18); }
      .sumpage-textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--sumpage-border); border-radius: 10px; font-size: 14px; font-family: inherit; resize: vertical; background: #fbfbfa; }
      .sumpage-textarea:focus { outline: none; border-color: var(--sumpage-accent); box-shadow: 0 0 0 3px rgba(47, 111, 106, 0.18); }
    `;
    panelShadow.appendChild(panelStyle);

    // Create panel container
    const panel = document.createElement('div');
    panel.id = 'sumpage-panel';
    panelShadow.appendChild(panel);

    // Create header with title, settings button, and close button
    const header = document.createElement('div');
    header.id = 'sumpage-panel-header';
    header.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.2); background: linear-gradient(160deg, #2f6f6a 0%, #3b837f 100%);';

    const leftGroup = document.createElement('div');
    leftGroup.style.cssText = 'display: flex; align-items: center; gap: 12px;';

    const title = document.createElement('h2');
    title.textContent = 'Sumpage';
    title.style.cssText = 'font-size: 17px; font-weight: 600; color: #f9fbfa; margin: 0;';
    leftGroup.appendChild(title);

    // Settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'sumpage-settings-btn';
    settingsBtn.title = 'Settings';
    settingsBtn.style.cssText = `
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
      color: #f9fbfa;
    `;
    settingsBtn.textContent = '⚙';
    leftGroup.appendChild(settingsBtn);

    header.appendChild(leftGroup);

    const closeBtn = document.createElement('button');
    closeBtn.id = 'sumpage-close-btn';
    closeBtn.style.cssText = `
      width: 30px;
      height: 30px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.22);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
      font-size: 16px;
      color: #f9fbfa;
    `;
    closeBtn.textContent = '×';

    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Create content container for React
    const content = document.createElement('div');
    content.id = 'sumpage-panel-content';
    panel.appendChild(content);

    // Render React app with onSettings callback
    panelRoot = createRoot(content);
    panelRoot.render(React.createElement(SidebarApp, { onClose: closePanel, showSettings: showSettings }));

    // Trigger animation unless disabled (used for settings view)
    if (options?.disableAnimation) {
      panel.style.transition = 'none';
      panel.classList.add('open');
      requestAnimationFrame(() => {
        panel.style.transition = '';
      });
    } else {
      requestAnimationFrame(() => {
        panel.classList.add('open');
      });
    }

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

    const panel = panelHost.shadowRoot?.getElementById('sumpage-panel');
    if (panel) {
      panel.classList.remove('open');
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

  // Toggle button handler
  toggleBtn.addEventListener('click', () => {
    if (panelOpen) {
      closePanel();
    } else {
      openPanel(false);
    }
  });
}

// Auto-inject when script loads
injectSidebar();
