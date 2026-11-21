import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { weatherKind, type HourlyWeather } from "./weather-utils";

function CloudSculpture({ night, storm }: { night: boolean; storm: boolean }) {
  const cloudRef = useRef<THREE.Group>(null);
  const material = night ? "#454951" : "#e6e4df";
  useFrame((state) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.12;
      cloudRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.08;
    }
  });
  const lobes = [
    [-1.65, -0.12, 0, 0.82], [-1.02, 0.34, 0.12, 1.02], [-0.18, 0.58, 0, 1.1],
    [0.72, 0.32, -0.08, 1.0], [1.48, -0.08, 0.08, 0.78], [-0.9, -0.42, 0.28, 0.82],
    [0.05, -0.48, 0.3, 0.88], [0.98, -0.42, 0.25, 0.7], [-1.95, -0.55, 0.18, 0.48],
    [1.92, -0.48, 0.2, 0.48]
  ];
  return <group ref={cloudRef} position={[0, 1.05, 0]}>
    {lobes.map(([x, y, z, scale], i) => <mesh key={i} position={[x, y, z]} scale={scale}>
      <sphereGeometry args={[0.78, 32, 32]} />
      <meshStandardMaterial color={material} roughness={0.82} metalness={0.06} />
    </mesh>)}
    {storm && <mesh position={[0, -1.18, 0.25]} rotation={[0, 0, -0.08]}>
      <coneGeometry args={[0.22, 1.35, 5]} />
      <meshStandardMaterial color="#d8d9db" emissive="#777b82" emissiveIntensity={0.25} />
    </mesh>}
  </group>;
}

function Atmosphere({ weather, hour }: { weather: HourlyWeather; hour: number }) {
  const kind = weatherKind(weather.code);
  const rainRef = useRef<THREE.Points>(null);
  const sunRef = useRef<THREE.Group>(null);
  const night = hour < 6 || hour >= 20;
  const rainy = kind === "rain" || kind === "storm";
  const snowy = kind === "snow";
  const cloudy = kind !== "clear";
  const palette = kind === "storm"
    ? { sky: night ? "#171923" : "#55535d", accent: "#aaa9b8" }
    : rainy ? { sky: night ? "#202a35" : "#778995", accent: "#a9c4d4" }
    : snowy ? { sky: night ? "#202a34" : "#aebbc4", accent: "#dce8ed" }
    : kind === "fog" ? { sky: "#a7a7a4", accent: "#d6d6d1" }
    : { sky: night ? "#171b2a" : "#c5b9a6", accent: "#e8c98e" };
  const particles = useMemo(() => {
    const values = new Float32Array(650 * 3);
    for (let i = 0; i < 650; i++) {
      values[i * 3] = (Math.random() - 0.5) * 12;
      values[i * 3 + 1] = Math.random() * 8 - 1;
      values[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    return values;
  }, []);
  useFrame((state, delta) => {
    if (rainRef.current && (rainy || snowy)) {
      const positions = rainRef.current.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i) - delta * (rainy ? 10 : 1.35);
        if (y < -2.8) y = 6;
        positions.setY(i, y);
        if (snowy) positions.setX(i, positions.getX(i) + Math.sin(state.clock.elapsedTime + i) * delta * 0.2);
      }
      positions.needsUpdate = true;
    }
    if (sunRef.current) {
      const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
      sunRef.current.position.set(Math.cos((hour / 24) * Math.PI * 2) * 3.9, 0.8 + daylight * 1.8, -2.6);
    }
  });
  return <>
    <color attach="background" args={[palette.sky]} />
    <fog attach="fog" args={[palette.sky, 10, 25]} />
    <ambientLight intensity={night ? 0.42 : 0.9} />
    <directionalLight position={[-4, 7, 5]} intensity={night ? 0.8 : 1.8} color="#fff4df" />
    <directionalLight position={[4, 1, -4]} intensity={0.65} color={palette.accent} />
    {night && <Stars radius={65} depth={35} count={700} factor={2} fade speed={0.25} />}
    {!cloudy && <group ref={sunRef}>
      <mesh><sphereGeometry args={[0.82, 48, 48]} /><meshStandardMaterial color="#f2c879" emissive="#e9a94c" emissiveIntensity={0.8} roughness={0.4} /></mesh>
      <mesh><sphereGeometry args={[1.12, 32, 32]} /><meshBasicMaterial color="#f2c879" transparent opacity={0.13} /></mesh>
    </group>}
    {cloudy && <CloudSculpture night={night} storm={kind === "storm"} />}
    {rainy && <points ref={rainRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
      <pointsMaterial color="#d8e4ed" size={0.035} transparent opacity={0.72} sizeAttenuation />
    </points>}
    {snowy && <points ref={rainRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.075} transparent opacity={0.92} sizeAttenuation />
    </points>}
    {kind === "storm" && <pointLight position={[0, 2.5, 1]} intensity={2.5} distance={8} color="#e0e3f0" />}
    <mesh position={[0, -2.55, -0.5]} scale={[1.7, 0.18, 0.65]}>
      <sphereGeometry args={[2.4, 48, 32]} />
      <meshStandardMaterial color={night ? "#252a32" : "#777b7b"} roughness={1} transparent opacity={0.5} />
    </mesh>
  </>;
}

export function WeatherScene({ weather, hour }: { weather: HourlyWeather; hour: number }) {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.25, 9], fov: 42 }} gl={{ antialias: true, alpha: false }}>
    <Atmosphere weather={weather} hour={hour} />
  </Canvas>;
}
