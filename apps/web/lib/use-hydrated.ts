import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` on the server and during the client's hydration render, `true`
 * afterwards. Use it to keep LocalStorage-backed values (the persisted Cart)
 * out of the first client render so it matches the server HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
