import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { compileSurfaceExpression, sampleSurface } from "./graph-utils";

type GraphSurfaceProps = {
  expression: string;
  amplitude: number;
  frequency: number;
  mode: "solid" | "wireframe" | "combined";
};

export function GraphSurface({ expression, amplitude, frequency, mode }: GraphSurfaceProps) {
  const geometry = useMemo(() => {
    const evaluate = compileSurfaceExpression(expression);
    const sampled = sampleSurface(evaluate, amplitude, frequency);
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.Float32BufferAttribute(sampled.positions, 3));
    result.setAttribute("color", new THREE.Float32BufferAttribute(sampled.colors, 3));
    result.setIndex(sampled.indices);
    result.computeVertexNormals();
    return result;
  }, [expression, amplitude, frequency]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const solid = mode !== "wireframe";
  const wire = mode !== "solid";

  return (
    <group>
      {solid && <mesh geometry={geometry}><meshStandardMaterial vertexColors roughness={0.72} metalness={0.08} side={THREE.DoubleSide} /></mesh>}
      {wire && <mesh geometry={geometry}><meshBasicMaterial color="#c9d1d9" wireframe transparent opacity={mode === "combined" ? 0.2 : 0.72} /></mesh>}
    </group>
  );
}
