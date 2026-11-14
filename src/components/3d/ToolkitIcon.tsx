"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { lerp } from "@/lib/utils";
import { AdobeIconMesh, type AdobeVariant } from "@/components/3d/AdobeIconMesh";

export function ToolkitIcon({
  variant,
  position,
  rotationRange,
  progressRef,
  reducedMotion = false,
  approachSide = 0,
}: {
  variant: AdobeVariant;
  position: [number, number, number];
  /** [rotationY at progress 0, rotationY at progress 1] in radians. */
  rotationRange: [number, number];
  progressRef: React.RefObject<{ value: number }>;
  reducedMotion?: boolean;
  /** -1 (comes from the left) or 1 (from the right) — meets center mid-scroll, then splits back apart. */
  approachSide?: -1 | 0 | 1;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentY = useRef(rotationRange[0]);
  const currentX = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    const progress = progressRef.current?.value ?? 0;
    const target = THREE.MathUtils.lerp(rotationRange[0], rotationRange[1], progress);
    currentY.current = lerp(currentY.current, target, 0.08);
    groupRef.current.rotation.y = currentY.current;

    // Triangular arc: 0 at the edges, peaks (closest to center) at mid-scroll.
    const arc = 1 - Math.abs(progress - 0.5) * 2;
    const targetX = -approachSide * arc * 0.55;
    currentX.current = lerp(currentX.current, targetX, 0.08);
    groupRef.current.position.x = position[0] + currentX.current;

    if (!reducedMotion) {
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <AdobeIconMesh variant={variant} scale={0.9} />
    </group>
  );
}
