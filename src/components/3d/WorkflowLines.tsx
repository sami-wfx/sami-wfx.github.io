"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

export function WorkflowLines({
  from,
  to,
  reducedMotion = false,
}: {
  from: [number, number, number];
  to: [number, number, number];
  reducedMotion?: boolean;
}) {
  const dotRef = useRef<THREE.Mesh>(null);
  const [phase] = useState(() => Math.random() * Math.PI * 2);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(...from),
        new THREE.Vector3(
          (from[0] + to[0]) / 2,
          (from[1] + to[1]) / 2 + 0.4,
          (from[2] + to[2]) / 2
        ),
        new THREE.Vector3(...to),
      ]),
    [from, to]
  );

  const points = useMemo(() => curve.getPoints(24), [curve]);

  useFrame((state) => {
    if (!dotRef.current || reducedMotion) return;
    const t = (Math.sin(state.clock.elapsedTime * 0.4 + phase) + 1) / 2;
    const p = curve.getPointAt(t);
    dotRef.current.position.copy(p);
  });

  return (
    <>
      <Line points={points} color="#ffffff" transparent opacity={0.14} lineWidth={1} />
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
    </>
  );
}
