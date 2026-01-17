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
    #sumpage-toggle-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4a90d9 0%, #3a7bc8 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(74, 144, 217, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    #sumpage-toggle-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(74, 144, 217, 0.5), 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    #sumpage-toggle-btn:active {
      transform: scale(0.95);
    }
    #sumpage-toggle-btn svg {
      width: 28px;
      height: 28px;
      fill: white;
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
    border-radius: 50%;
    background: linear-gradient(135deg, #4a90d9 0%, #3a7bc8 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(74, 144, 217, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    font-size: 24px;
    font-weight: bold;
    color: white;
  `;
  toggleBtn.textContent = 'S';
  buttonShadow.appendChild(toggleBtn);

  // Panel state
  let panelOpen = false;
  let panelRoot: ReturnType<typeof createRoot> | null = null;
  let panelHost: HTMLElement | null = null;

  function openPanel() {
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
      * { box-sizing: border-box; }
      .sumpage-sidebar-host { all: initial; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; contain: layout style; }
      .sumpage-sidebar-host * { box-sizing: border-box; }

      /* Panel */
      #sumpage-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        max-width: 100vw;
        height: 100vh;
        background: #ffffff;
        box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      #sumpage-panel.open { transform: translateX(0); }

      /* Header */
      #sumpage-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
        background: linear-gradient(135deg, #4a90d9 0%, #3a7bc8 100%);
      }
      #sumpage-panel-header h2 {
        font-size: 18px;
        font-weight: 600;
        color: white;
        margin: 0;
      }
      #sumpage-close-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
      }
      #sumpage-close-btn:hover { background: rgba(255, 255, 255, 0.3); }
      #sumpage-close-btn svg { width: 16px; height: 16px; fill: white; }

      /* Content */
      #sumpage-panel-content {
        flex: 1;
        overflow-y: auto;
        background: #f8f9fa;
      }

      /* Container */
      .sumpage-container { max-width: 360px; margin: 0 auto; padding: 16px; }

      /* Loading */
      .sumpage-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; }
      .sumpage-loading-icon { width: 48px; height: 48px; margin-bottom: 16px; }
      .sumpage-spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #4a90d9; border-radius: 50%; animation: sumpage-spin 0.8s linear infinite; }
      @keyframes sumpage-spin { to { transform: rotate(360deg); } }
      .sumpage-loading p { color: #718096; font-size: 14px; margin: 0; }
      .sumpage-loading.success .sumpage-spinner { border-top-color: #38a169; }
      .sumpage-loading.success p { color: #38a169; }

      /* Error */
      .sumpage-error { background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: center; }
      .sumpage-error p { color: #c53030; font-size: 14px; margin: 0 0 12px 0; }
      .sumpage-retry-btn { background: #4a90d9; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; transition: background 0.2s ease; }
      .sumpage-retry-btn:hover { background: #3a7bc8; }

      /* Result */
      .sumpage-result { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); }
      .sumpage-ai-badge { display: inline-block; background: linear-gradient(135deg, #4a90d9 0%, #3a7bc8 100%); color: white; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 12px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
      .sumpage-markdown-section { margin-bottom: 16px; }
      .sumpage-markdown-section:last-child { margin-bottom: 0; }
      .sumpage-markdown-section h3 { font-size: 14px; font-weight: 600; color: #2d3748; margin: 0 0 10px 0; }
      .sumpage-markdown-content { font-size: 14px; line-height: 1.6; color: #4a5568; }
      .sumpage-markdown-content p { margin: 0 0 10px 0; }
      .sumpage-markdown-content p:last-child { margin-bottom: 0; }
      .sumpage-markdown-content h1, .sumpage-markdown-content h2, .sumpage-markdown-content h3, .sumpage-markdown-content h4 { color: #2d3748; margin: 16px 0 8px 0; }
      .sumpage-markdown-content ul, .sumpage-markdown-content ol { margin: 10px 0; padding-left: 20px; }
      .sumpage-markdown-content li { margin-bottom: 6px; }

      /* Key Points */
      .sumpage-key-points { list-style: none; padding: 0; margin: 0; }
      .sumpage-key-points li { position: relative; padding-left: 20px; margin-bottom: 10px; font-size: 13px; color: #4a5568; line-height: 1.5; }
      .sumpage-key-points li::before { content: ""; position: absolute; left: 0; top: 6px; width: 6px; height: 6px; border-radius: 50%; background: #4a90d9; }

      /* Actions */
      .sumpage-actions { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
      .sumpage-refresh-btn { width: 100%; background: #edf2f7; color: #4a5568; border: none; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
      .sumpage-refresh-btn:hover { background: #e2e8f0; }

      /* Empty */
      .sumpage-empty { text-align: center; padding: 40px 20px; }
      .sumpage-empty p { color: #718096; font-size: 14px; margin: 0 0 16px 0; }
      .sumpage-summarize-btn { width: 100%; background: linear-gradient(135deg, #4a90d9 0%, #3a7bc8 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3); }
      .sumpage-summarize-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74, 144, 217, 0.4); }
      .sumpage-summarize-btn:active { transform: translateY(0); }

      /* Settings form */
      .sumpage-form-group { margin-bottom: 16px; }
      .sumpage-label { display: block; font-size: 14px; font-weight: 500; color: #4a5568; margin-bottom: 6px; }
      .sumpage-input { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
      .sumpage-input:focus { outline: none; border-color: #4a90d9; box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.15); }
      .sumpage-textarea { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical; }
      .sumpage-textarea:focus { outline: none; border-color: #4a90d9; box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.15); }
    `;
    panelShadow.appendChild(panelStyle);

    // Create panel container
    const panel = document.createElement('div');
    panel.id = 'sumpage-panel';
    panelShadow.appendChild(panel);

    // Create header with proper SVG
    const header = document.createElement('div');
    header.id = 'sumpage-panel-header';

    const title = document.createElement('h2');
    title.textContent = 'Sumpage';
    title.style.cssText = 'font-size: 18px; font-weight: 600; color: white; margin: 0;';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.id = 'sumpage-close-btn';
    closeBtn.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
      font-size: 18px;
      color: white;
    `;
    closeBtn.textContent = '×';

    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Create content container for React
    const content = document.createElement('div');
    content.id = 'sumpage-panel-content';
    panel.appendChild(content);

    // Render React app
    panelRoot = createRoot(content);
    panelRoot.render(React.createElement(SidebarApp, { onClose: closePanel }));

    // Trigger animation
    requestAnimationFrame(() => {
      panel.classList.add('open');
    });

    // Close button handler
    closeBtn.addEventListener('click', closePanel);
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
      openPanel();
    }
  });
}

// Auto-inject when script loads
injectSidebar();
