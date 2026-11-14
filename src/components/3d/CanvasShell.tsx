"use client";

import { Canvas, type RootState } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export function CanvasShell({
  children,
  className,
  cameraPosition = [0, 0, 5.4],
  fov = 32,
}: {
  children: React.ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
}) {
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const handleCreated = (state: RootState) => {
    state.gl.toneMapping = THREE.ACESFilmicToneMapping;
    state.gl.toneMappingExposure = 1.05;
  };

  return (
    <Canvas
      className={cn("!touch-auto", className)}
      frameloop={frameloop}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ position: cameraPosition, fov }}
      onCreated={handleCreated}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
