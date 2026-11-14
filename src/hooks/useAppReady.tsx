"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const AppReadyContext = createContext<boolean>(false);

const subscribe = () => () => {};

/**
 * Flips to ready right after hydration (there is no splash screen any more):
 * the server snapshot is `false`, the client snapshot is `true`.
 */
export function AppReadyProvider({ children }: { children: React.ReactNode }) {
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  return <AppReadyContext value={ready}>{children}</AppReadyContext>;
}

/** True once the page has hydrated. Drives entrance animations. */
export function useAppReady() {
  return useContext(AppReadyContext);
}
