let workerReadyPromise: Promise<void> | null = null;

/**
 * Lazily loads and starts the MSW browser service worker via dynamic import.
 * Keeps MSW completely off Home's critical path and bundle.
 */
export async function ensureOrderWorkerReady(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  if (!workerReadyPromise) {
    workerReadyPromise = (async () => {
      const { startWorker } = await import("@/mocks/browser");
      await startWorker();
    })();
  }

  return workerReadyPromise;
}
