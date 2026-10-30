import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

let startPromise: Promise<void> | null = null;

/**
 * Starts the MSW browser Service Worker in any environment,
 * bypassing unhandled requests so application assets are never blocked.
 */
export function startWorker(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve();
  }

  if (!startPromise) {
    startPromise = worker
      .start({
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      })
      .then(() => undefined)
      .catch((err) => {
        console.error("Failed to start MSW worker:", err);
      });
  }

  return startPromise;
}
