"use client";

import { RoundedBox, Text } from "@react-three/drei";
import { useMemo } from "react";
import { createBrushedRoughnessTexture, createSoftShadowTexture } from "@/lib/textures";

export type AdobeVariant = "ae" | "pr";

export const ADOBE_VARIANTS: Record<AdobeVariant, { label: string; tint: string; glow: string }> = {
  ae: { label: "Ae", tint: "#8a8fdc", glow: "#7f8cff" },
  pr: { label: "Pr", tint: "#6f9fd6", glow: "#5aa8ff" },
};

/** Presentational rounded metal + glass Adobe app icon. Parent controls position/rotation. */
export function AdobeIconMesh({ variant, scale = 0.62 }: { variant: AdobeVariant; scale?: number }) {
  const config = ADOBE_VARIANTS[variant];
  const roughnessMap = useMemo(() => createBrushedRoughnessTexture(128), []);
  const shadowTexture = useMemo(() => createSoftShadowTexture(128), []);

  return (
    <group scale={scale}>
      <RoundedBox args={[1, 1, 0.32]} radius={0.09} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#3a3c40"
          metalness={1}
          roughness={0.42}
          roughnessMap={roughnessMap}
          clearcoat={0.4}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      <mesh position={[0, 0, 0.168]}>
        <planeGeometry args={[0.78, 0.78]} />
        <meshPhysicalMaterial
          color={config.tint}
          transmission={0.85}
          roughness={0.12}
          thickness={0.4}
          ior={1.4}
          clearcoat={1}
          attenuationColor={config.tint}
          attenuationDistance={0.6}
        />
      </mesh>

      <Text
        position={[0, 0, 0.19]}
        fontSize={0.34}
        fontWeight={700}
        color="#f5f5f5"
        anchorX="center"
        anchorY="middle"
      >
        {config.label}
      </Text>

      <pointLight position={[0, 0, 0.3]} color={config.glow} intensity={0.5} distance={1.5} />

      <sprite position={[0, -0.85, -0.2]} scale={[1.4, 1.4, 1]}>
        <spriteMaterial map={shadowTexture} transparent opacity={0.5} depthWrite={false} />
      </sprite>
    </group>
  );
}
