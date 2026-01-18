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
    #sumpage-toggle-btn:hover {
      transform: translateY(-1px);
      background: rgba(47, 111, 106, 1);
      box-shadow: 0 6px 16px rgba(22, 52, 50, 0.3);
    }
    #sumpage-toggle-btn:active {
      transform: translateY(0);
    }
    #sumpage-toggle-btn.dragging {
      cursor: grabbing;
      transform: scale(1.05);
    }
    #sumpage-toggle-btn svg {
      fill: none;
    }
  `;
  buttonShadow.appendChild(style);

  // Create toggle button with SVG logo
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sumpage-toggle-btn';
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

  // Set initial position immediately
  toggleBtn.style.position = 'fixed';
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

    // Prevent text selection during drag
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    // Consider it a drag if moved more than 5 pixels
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      wasDragged = true;
    }

    // Update position (invert delta for right/bottom positioning)
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
      #sumpage-panel-content::-webkit-scrollbar { width: 10px; }
      #sumpage-panel-content::-webkit-scrollbar-track { background: #efe9e1; }
      #sumpage-panel-content::-webkit-scrollbar-thumb { background: #c6d5d0; border-radius: 999px; border: 2px solid #efe9e1; }

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
      .sumpage-new-chat-btn {
        width: 24px;
        height: 24px;
        border-radius: 8px;
        background: var(--sumpage-accent-soft);
        border: 1px solid var(--sumpage-border);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 600;
        color: var(--sumpage-accent-strong);
        transition: all 0.2s ease;
      }
      .sumpage-new-chat-btn:hover {
        background: var(--sumpage-accent);
        color: #f9fbfa;
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
      .sumpage-markdown-content { font-size: 14px; line-height: 1.6; color: var(--sumpage-muted); overflow-wrap: anywhere; word-break: break-word; }
      .sumpage-markdown-content p { margin: 0 0 10px 0; }
      .sumpage-markdown-content p:last-child { margin-bottom: 0; }
      .sumpage-markdown-content h1, .sumpage-markdown-content h2, .sumpage-markdown-content h3, .sumpage-markdown-content h4 { color: var(--sumpage-ink); margin: 16px 0 8px 0; }
      .sumpage-markdown-content ul, .sumpage-markdown-content ol { margin: 10px 0; padding-left: 20px; }
      .sumpage-markdown-content li { margin-bottom: 6px; }
      .sumpage-markdown-content pre { margin: 10px 0; padding: 10px 12px; background: #f0f2f1; border: 1px solid var(--sumpage-border); border-radius: 10px; white-space: pre-wrap; overflow-x: auto; max-width: 100%; }
      .sumpage-markdown-content code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }

      /* Key Points */
      .sumpage-key-points { list-style: none; padding: 0; margin: 0; }
      .sumpage-key-points li { position: relative; padding-left: 20px; margin-bottom: 10px; font-size: 13px; color: var(--sumpage-muted); line-height: 1.5; }
      .sumpage-key-points li::before { content: ""; position: absolute; left: 0; top: 6px; width: 6px; height: 6px; border-radius: 50%; background: var(--sumpage-accent); }

      /* Actions */
      .sumpage-actions { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--sumpage-border); }
      .sumpage-refresh-btn { width: 100%; background: var(--sumpage-accent-soft); color: var(--sumpage-accent-strong); border: none; padding: 10px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
      .sumpage-refresh-btn:hover { background: #d4e7e4; }

      /* Empty */
      .sumpage-empty { text-align: left; padding: 24px 16px 32px; }
      .sumpage-empty p { color: var(--sumpage-muted); font-size: 12px; margin: 6px 0 0; }
      .sumpage-summarize-btn { width: 100%; background: linear-gradient(160deg, #2f6f6a 0%, #3b837f 100%); color: #f9fbfa; border: none; padding: 12px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 8px 16px rgba(22, 52, 50, 0.25); }
      .sumpage-summarize-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 20px rgba(22, 52, 50, 0.3); }
      .sumpage-summarize-btn:active { transform: translateY(0); }

      .sumpage-prompt-panel {
        position: relative;
        padding: 16px;
        border: 1px solid var(--sumpage-border);
        border-radius: 18px;
        background: linear-gradient(180deg, #ffffff 0%, #f3f7f5 100%);
        box-shadow: 0 10px 22px rgba(22, 52, 50, 0.08);
        overflow: hidden;
      }
      .sumpage-prompt-panel::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(120px 120px at 10% 0, rgba(47, 111, 106, 0.12), transparent 60%),
          radial-gradient(160px 160px at 100% 10%, rgba(47, 111, 106, 0.08), transparent 60%);
        pointer-events: none;
      }
      .sumpage-prompt-panel > * { position: relative; }

      .sumpage-prompt-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }
      .sumpage-prompt-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--sumpage-ink); }
      .sumpage-prompt-header p { margin: 4px 0 0; font-size: 12px; color: var(--sumpage-muted); }
      .sumpage-prompt-count {
        background: var(--sumpage-accent-soft);
        color: var(--sumpage-accent-strong);
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 999px;
        white-space: nowrap;
      }

      .sumpage-prompt-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }
      .sumpage-prompt-tab {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid #d5e2de;
        background: #f2f6f4;
        color: var(--sumpage-muted);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, color 0.15s ease;
      }
      .sumpage-prompt-tab:hover:not(:disabled) { background: #e8f1ee; transform: translateY(-1px); }
      .sumpage-prompt-tab.is-active {
        background: var(--sumpage-accent);
        color: #f9fbfa;
        border-color: transparent;
        box-shadow: 0 10px 18px rgba(47, 111, 106, 0.25);
      }
      .sumpage-prompt-tab:disabled { opacity: 0.6; cursor: not-allowed; }
      .sumpage-prompt-tab-badge {
        background: rgba(47, 111, 106, 0.12);
        color: var(--sumpage-accent-strong);
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 999px;
      }
      .sumpage-prompt-tab.is-active .sumpage-prompt-tab-badge {
        background: rgba(255, 255, 255, 0.2);
        color: #f9fbfa;
      }

      .sumpage-prompt-editor {
        background: #fbfbfa;
        border: 1px solid var(--sumpage-border);
        border-radius: 14px;
        padding: 12px;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
        margin-bottom: 14px;
      }
      .sumpage-prompt-editor-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }
      .sumpage-prompt-editor-title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--sumpage-muted);
      }
      .sumpage-prompt-editor-hint { font-size: 11px; color: var(--sumpage-muted); }
      .sumpage-prompt-textarea {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        resize: vertical;
        min-height: 140px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        line-height: 1.55;
        color: var(--sumpage-ink);
      }
      .sumpage-prompt-send { margin-top: 6px; }

      /* Settings form */
      .sumpage-form-group { margin-bottom: 16px; }
      .sumpage-label { display: block; font-size: 13px; font-weight: 600; color: var(--sumpage-muted); margin-bottom: 6px; letter-spacing: 0.01em; }
      .sumpage-input { width: 100%; padding: 10px 12px; border: 1px solid var(--sumpage-border); border-radius: 10px; font-size: 14px; transition: border-color 0.2s ease, box-shadow 0.2s ease; background: #fbfbfa; }
      .sumpage-input:focus { outline: none; border-color: var(--sumpage-accent); box-shadow: 0 0 0 3px rgba(47, 111, 106, 0.18); }
      .sumpage-textarea { width: 100%; padding: 12px 14px; border: 1px solid var(--sumpage-border); border-radius: 10px; font-size: 14px; font-family: inherit; resize: vertical; background: #fbfbfa; min-height: 120px; max-height: 300px; }
      .sumpage-textarea:focus { outline: none; border-color: var(--sumpage-accent); box-shadow: 0 0 0 3px rgba(47, 111, 106, 0.18); }

      /* Chat */
      .sumpage-chat-container { display: flex; flex-direction: column; height: calc(100vh - 100px); max-height: 600px; }
      .sumpage-chat-messages { flex: 1; overflow-y: auto; padding-bottom: 12px; }
      .sumpage-chat-messages::-webkit-scrollbar { width: 10px; }
      .sumpage-chat-messages::-webkit-scrollbar-track { background: #efe9e1; }
      .sumpage-chat-messages::-webkit-scrollbar-thumb { background: #c6d5d0; border-radius: 999px; border: 2px solid #efe9e1; }
      .sumpage-chat-message { margin-bottom: 12px; padding: 12px 14px; border-radius: 12px; max-width: 92%; overflow: hidden; }
      .sumpage-chat-user { background: var(--sumpage-accent); color: #f9fbfa; margin-left: auto; border-bottom-right-radius: 4px; }
      .sumpage-chat-assistant { background: var(--sumpage-surface); border: 1px solid var(--sumpage-border); margin-right: auto; border-bottom-left-radius: 4px; }
      .sumpage-chat-role { font-size: 11px; font-weight: 600; margin-bottom: 6px; opacity: 0.7; }
      .sumpage-chat-user .sumpage-chat-role { color: rgba(249, 251, 250, 0.8); }
      .sumpage-chat-assistant .sumpage-chat-role { color: var(--sumpage-accent); }
      .sumpage-chat-content { font-size: 14px; line-height: 1.5; overflow-wrap: anywhere; word-break: break-word; }
      .sumpage-chat-content p { margin: 0 0 8px 0; }
      .sumpage-chat-content p:last-child { margin-bottom: 0; }
      .sumpage-chat-content ul { margin: 8px 0; padding-left: 18px; }
      .sumpage-chat-content li { margin-bottom: 4px; }
      .sumpage-chat-content pre { margin: 8px 0; padding: 10px 12px; background: #f0f2f1; border: 1px solid var(--sumpage-border); border-radius: 10px; white-space: pre-wrap; overflow-x: auto; max-width: 100%; }
      .sumpage-chat-content code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }

      .sumpage-chat-prompt {
        margin: 8px 0 12px;
        padding: 10px;
        border: 1px solid var(--sumpage-border);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.75);
      }
      .sumpage-chat-prompt-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }
      .sumpage-chat-prompt-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--sumpage-muted);
      }
      .sumpage-chat-prompt-name {
        font-size: 11px;
        font-weight: 600;
        color: var(--sumpage-accent-strong);
      }
      .sumpage-chat-prompt .sumpage-prompt-tabs { margin-bottom: 0; }
      .sumpage-chat-prompt .sumpage-prompt-tab { font-size: 11px; padding: 5px 10px; }

      /* Chat input */
      .sumpage-chat-input-container { display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid var(--sumpage-border); margin-top: auto; }
      .sumpage-chat-input { flex: 1; padding: 12px 14px; border: 1px solid var(--sumpage-border); border-radius: 12px; font-size: 14px; font-family: inherit; resize: vertical; background: var(--sumpage-surface); color: var(--sumpage-ink); min-height: 48px; max-height: 150px; }
      .sumpage-chat-input::placeholder { color: var(--sumpage-muted); }
      .sumpage-chat-input:focus { outline: none; border-color: var(--sumpage-accent); }
      .sumpage-chat-send-btn { width: 40px; height: 40px; border: none; border-radius: 12px; background: var(--sumpage-accent); color: #f9fbfa; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.2s ease; }
      .sumpage-chat-send-btn:hover:not(:disabled) { background: var(--sumpage-accent-strong); transform: scale(1.02); }
      .sumpage-chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      /* Typing animation */
      .sumpage-typing { display: flex; gap: 4px; padding: 4px 0; }
      .sumpage-typing-dot { width: 6px; height: 6px; background: var(--sumpage-muted); border-radius: 50%; animation: sumpage-typing 1.4s infinite ease-in-out; }
      .sumpage-typing-dot:nth-child(1) { animation-delay: 0s; }
      .sumpage-typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .sumpage-typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes sumpage-typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.6; } 30% { transform: translateY(-4px); opacity: 1; } }
    `;
    panelShadow.appendChild(panelStyle);

    // Create panel container
    const panel = document.createElement('div');
    panel.id = 'sumpage-panel';
    panelShadow.appendChild(panel);

    // Create header with title, settings button, and close button
    const header = document.createElement('div');
    header.id = 'sumpage-panel-header';
    header.style.cssText =
      'display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.2); background: linear-gradient(160deg, #2f6f6a 0%, #3b837f 100%);';

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
    panelRoot.render(
      React.createElement(SidebarApp, { onClose: closePanel, showSettings: showSettings })
    );

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

  // Outside click handler
  let outsideClickHandler: ((e: MouseEvent) => void) | null = null;
  let ignoreNextOutsideClick = false;

  function setupOutsideClickListener() {
    // Ignore the click that just opened the panel
    ignoreNextOutsideClick = true;
    setTimeout(() => {
      ignoreNextOutsideClick = false;
    }, 100);

    outsideClickHandler = (e: MouseEvent) => {
      if (ignoreNextOutsideClick) return;
      // Don't close if clicking on the toggle button or inside the panel
      if (toggleBtn.contains(e.target as Node)) return;
      if (panelHost?.contains(e.target as Node)) return;
      closePanel();
    };
    document.addEventListener('click', outsideClickHandler);
  }

  // Toggle button handler
  toggleBtn.addEventListener('click', () => {
    if (wasDragged) return; // Skip if this was a drag
    if (panelOpen) {
      closePanel();
    } else {
      openPanel(false);
    }
  });
}

// Auto-inject when script loads
injectSidebar();
