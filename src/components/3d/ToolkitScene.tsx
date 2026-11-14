"use client";

import { CanvasShell } from "@/components/3d/CanvasShell";
import { StudioEnvironment } from "@/components/3d/StudioEnvironment";
import { ChromeLogo } from "@/components/3d/ChromeLogo";
import { ToolkitIcon } from "@/components/3d/ToolkitIcon";
import { WorkflowLines } from "@/components/3d/WorkflowLines";

const AE_POS: [number, number, number] = [-1.45, 0.32, 0];
const PR_POS: [number, number, number] = [1.45, -0.22, 0];

export function ToolkitScene({
  progressRef,
  reducedMotion = false,
}: {
  progressRef: React.RefObject<{ value: number }>;
  reducedMotion?: boolean;
}) {
  return (
    <CanvasShell className="!absolute inset-0 h-full w-full" cameraPosition={[0, 0, 6.4]} fov={34}>
      <StudioEnvironment />

      <ChromeLogo
        parallax={false}
        reducedMotion={reducedMotion}
        widthFactor={0.24}
        approachRef={progressRef}
      />

      <ToolkitIcon
        variant="ae"
        position={AE_POS}
        rotationRange={[-0.35, 0.17]}
        progressRef={progressRef}
        reducedMotion={reducedMotion}
        approachSide={-1}
      />
      <ToolkitIcon
        variant="pr"
        position={PR_POS}
        rotationRange={[0.35, -0.17]}
        progressRef={progressRef}
        reducedMotion={reducedMotion}
        approachSide={1}
      />

      {!reducedMotion && (
        <>
          <WorkflowLines from={AE_POS} to={[0, 0, 0]} />
          <WorkflowLines from={[0, 0, 0]} to={PR_POS} />
        </>
      )}
    </CanvasShell>
  );
}
