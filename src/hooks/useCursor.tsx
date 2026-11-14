"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type CursorLabel = null | "play" | "view" | "drag";

type CursorContextValue = {
  label: CursorLabel;
  setLabel: (label: CursorLabel) => void;
};

const CursorContext = createContext<CursorContextValue | null>(null);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [label, setLabelState] = useState<CursorLabel>(null);

  const setLabel = useCallback((next: CursorLabel) => {
    setLabelState(next);
  }, []);

  const value = useMemo(() => ({ label, setLabel }), [label, setLabel]);

  return <CursorContext value={value}>{children}</CursorContext>;
}

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursor must be used within CursorProvider");
  return ctx;
}

/** Spread onto any element to switch the custom cursor label on hover. */
export function useCursorHover(label: CursorLabel) {
  const { setLabel } = useCursor();
  return {
    onMouseEnter: () => setLabel(label),
    onMouseLeave: () => setLabel(null),
  };
}
