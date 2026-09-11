/**
 * Registers the FinanceFlow service worker for offline / installable PWA support.
 * Only runs in production builds to avoid caching issues during development.
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
      // Non-fatal: app still works without offline support.
      console.warn("FinanceFlow SW registration failed:", err);
    });
  });
}
