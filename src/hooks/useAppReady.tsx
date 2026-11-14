"use client";

import { createContext, useContext, useState } from "react";

const AppReadyContext = createContext<boolean>(false);
const SetAppReadyContext = createContext<(ready: boolean) => void>(() => {});

export function AppReadyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  return (
    <SetAppReadyContext value={setReady}>
      <AppReadyContext value={ready}>{children}</AppReadyContext>
    </SetAppReadyContext>
  );
}

/** True once the preloader has begun revealing the page. Drives entrance animations. */
export function useAppReady() {
  return useContext(AppReadyContext);
}

export function useSetAppReady() {
  return useContext(SetAppReadyContext);
}
