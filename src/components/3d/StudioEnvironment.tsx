"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { lerp } from "@/lib/utils";

/**
 * Procedural studio softbox rig built from drei Lightformers — gives the chrome
 * material believable reflections without shipping an external HDRI asset.
 */
export function StudioEnvironment({
  cursorReactive = false,
}: {
  cursorReactive?: boolean;
}) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const current = useRef({ x: 4, y: 5 });

  useFrame((state) => {
    if (!cursorReactive || !keyLightRef.current) return;
    const px = Number.isFinite(state.pointer.x) ? state.pointer.x : 0;
    const py = Number.isFinite(state.pointer.y) ? state.pointer.y : 0;
    current.current.x = lerp(current.current.x, 4 + px * 1.2, 0.03);
    current.current.y = lerp(current.current.y, 5 + py * 0.8, 0.03);
    keyLightRef.current.position.x = current.current.x;
    keyLightRef.current.position.y = current.current.y;
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight ref={keyLightRef} position={[4, 5, 3]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-5, 2, -2]} intensity={0.5} color="#b9c4ff" />
      <spotLight
        position={[0, 4, 4]}
        angle={0.5}
        penumbra={1}
        intensity={0.6}
        color="#ffffff"
      />

      <Environment resolution={256} frames={1}>
        <group rotation={[0, Math.PI / 3, 0]}>
          <Lightformer
            form="rect"
            intensity={4}
            color="#ffffff"
            position={[0, 3, -4]}
            scale={[8, 4, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={2.2}
            color="#dfe6ff"
            position={[-6, 1, 2]}
            rotation={[0, Math.PI / 2.4, 0]}
            scale={[5, 3, 1]}
          />
          <Lightformer
            form="rect"
            intensity={2.6}
            color="#ffffff"
            position={[6, -1, 3]}
            rotation={[0, -Math.PI / 2.4, 0]}
            scale={[5, 3, 1]}
          />
          <Lightformer
            form="ring"
            intensity={3}
            color="#ffffff"
            position={[0, -4, 2]}
            scale={6}
          />
        </group>
      </Environment>
    </>
  );
}
