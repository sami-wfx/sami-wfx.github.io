"use client";

import { useLoader, useThree, useFrame } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { createBrushedRoughnessTexture } from "@/lib/textures";
import { lerp } from "@/lib/utils";

export function ChromeLogo({
  text = "AKYRO",
  parallax = true,
  reducedMotion = false,
  widthFactor = 0.66,
  offsetX = 0,
  offsetY = 0,
  approachRef,
}: {
  text?: string;
  parallax?: boolean;
  reducedMotion?: boolean;
  /** Fraction of viewport width the wordmark should fill. */
  widthFactor?: number;
  /** Static position offset as a fraction of viewport width/height. */
  offsetX?: number;
  offsetY?: number;
  /** External 0→1 scroll progress driving a slight camera-approach (scale + z). */
  approachRef?: React.RefObject<{ value: number }>;
}) {
  const font = useLoader(FontLoader, "/fonts/archivo-black.typeface.json") as Font;
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const viewportWidth = useThree((s) => s.viewport.width);
  const viewportHeight = useThree((s) => s.viewport.height);

  const geometry = useMemo(() => {
    const geo = new TextGeometry(text, {
      font,
      size: 1,
      depth: 0.22,
      curveSegments: 64,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.006,
      bevelOffset: 0,
      bevelSegments: 3,
    });
    geo.computeBoundingBox();
    geo.computeVertexNormals();
    return geo;
  }, [font, text]);

  const baseWidth = useMemo(() => {
    const box = geometry.boundingBox;
    return box ? box.max.x - box.min.x : 5;
  }, [geometry]);

  const roughnessMap = useMemo(() => createBrushedRoughnessTexture(256), []);

  const baseScale = useMemo(() => {
    const target = viewportWidth * widthFactor;
    return THREE.MathUtils.clamp(target / baseWidth, 0.35, 3.2);
  }, [viewportWidth, baseWidth, widthFactor]);

  const targetRot = useRef({ x: 0, y: 0 });
  const currentRot = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!groupRef.current) return;

    if (parallax && !reducedMotion) {
      targetRot.current.y = state.pointer.x * 0.22;
      targetRot.current.x = -state.pointer.y * 0.12;
    } else {
      targetRot.current.x = 0;
      targetRot.current.y = 0;
    }

    currentRot.current.x = lerp(currentRot.current.x, targetRot.current.x, 0.05);
    currentRot.current.y = lerp(currentRot.current.y, targetRot.current.y, 0.05);

    groupRef.current.rotation.x = currentRot.current.x;
    groupRef.current.rotation.y = currentRot.current.y;

    const baseY = viewportHeight * offsetY;
    groupRef.current.position.x = viewportWidth * offsetX;
    groupRef.current.position.y = reducedMotion
      ? baseY
      : baseY + Math.sin(state.clock.elapsedTime * 0.5) * 0.035;

    const approach = approachRef?.current?.value ?? 0;
    const scale = baseScale * (1 + approach * 0.18);
    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.z = approach * 0.6;
  });

  return (
    <group ref={groupRef} scale={baseScale}>
      <Center>
        <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#c9cbcf"
            metalness={1}
            roughness={0.22}
            roughnessMap={roughnessMap}
            clearcoat={0.6}
            clearcoatRoughness={0.25}
            reflectivity={1}
            envMapIntensity={1.6}
          />
        </mesh>
      </Center>
    </group>
  );
}
