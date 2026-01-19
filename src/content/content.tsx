// Import sidebar injection
import { injectSidebar } from "./sidebar-inject";

// Inject sidebar when content script loads
if (typeof window !== "undefined" && !window.sumpageInjected) {
  console.log("[Sumpage] Content script loaded, calling injectSidebar...");
  window.sumpageInjected = true;
  injectSidebar();
}
