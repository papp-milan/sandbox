import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { GraphSurface } from "./GraphSurface";

type GraphCanvasProps = {
  expression: string;
  amplitude: number;
  frequency: number;
  mode: "solid" | "wireframe" | "combined";
};

function SceneGrid() {
  return (
    <>
      <gridHelper args={[12, 24, "#414141", "#242424"]} position={[0, -0.02, 0]} />
      <axesHelper args={[5.5]} />
    </>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <Canvas dpr={[1, 1.75]} gl={{ antialias: true, alpha: false }} camera={{ position: [9, 7, 9], fov: 42 }}>
      <color attach="background" args={["#0c0d0f"]} />
      <PerspectiveCamera makeDefault position={[9, 7, 9]} fov={42} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 9, 6]} intensity={2.1} />
      <directionalLight position={[-6, 3, -5]} intensity={0.55} />
      <SceneGrid />
      <Suspense fallback={null}>
        <GraphSurface {...props} />
      </Suspense>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={5} maxDistance={24} maxPolarAngle={Math.PI * 0.49} />
    </Canvas>
  );
}
