import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Season = "spring" | "summer" | "autumn" | "winter";

const palettes: Record<Season, { leaf: string; leafLight: string; stone: string; moss: string; bloom: string; water: string }> = {
  spring: { leaf: "#527e50", leafLight: "#a5c77b", stone: "#78877d", moss: "#6f9562", bloom: "#f3b8d0", water: "#9bd9e4" },
  summer: { leaf: "#315f3b", leafLight: "#77a64d", stone: "#77796c", moss: "#587a48", bloom: "#f1d16e", water: "#78c7d0" },
  autumn: { leaf: "#80503a", leafLight: "#d18a42", stone: "#817264", moss: "#98734b", bloom: "#d77b42", water: "#79a7a4" },
  winter: { leaf: "#294c50", leafLight: "#78999b", stone: "#a5b7c0", moss: "#82999a", bloom: "#edf6fa", water: "#b8e5ed" },
};

const fernSites = [
  [-7.1, 2.6, 0.85], [-5.6, 3.5, 0.7], [-1.7, 2.9, 0.8],
  [0.2, 3.6, 0.65], [5.1, 3.2, 0.85], [7.4, 2.7, 0.8],
] as const;

const mushroomSites = [
  [-6.25, 2.15], [-5.95, 2.3], [-1.2, 3.0], [4.8, 2.55], [6.0, 2.9],
] as const;

function Fern({ scale, color, light }: { scale: number; color: string; light: string }) {
  const sway = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (sway.current) sway.current.rotation.z = Math.sin(clock.elapsedTime * 1.15 + scale * 4) * 0.055;
  });
  return (
    <group ref={sway} scale={scale}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.018, 0.025, 0.5, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const height = 0.12 + i * 0.075;
        return (
          <mesh key={i} position={[side * (0.13 + i * 0.025), height, 0]} rotation={[0, 0, -side * 0.62]}>
            <coneGeometry args={[0.105, 0.34, 5]} />
            <meshStandardMaterial color={i % 3 === 0 ? light : color} roughness={0.92} />
          </mesh>
        );
      })}
    </group>
  );
}

function Lantern({ position, season }: { position: [number, number, number]; season: Season }) {
  const warm = season !== "summer";
  const glow = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glow.current) glow.current.intensity = (season === "winter" ? 1.05 : 0.48) + Math.sin(clock.elapsedTime * 5 + position[0]) * 0.09;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.035, 0.055, 1.16, 7]} />
        <meshStandardMaterial color="#493c32" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.24, 0.27, 0.24]} />
        <meshStandardMaterial color="#453b32" metalness={0.35} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.2, 0.13]}>
        <planeGeometry args={[0.13, 0.17]} />
        <meshBasicMaterial color={warm ? "#ffc979" : "#f5e7b2"} />
      </mesh>
      <mesh position={[0, 1.38, 0]}>
        <coneGeometry args={[0.19, 0.18, 4]} />
        <meshStandardMaterial color="#554638" />
      </mesh>
      <pointLight ref={glow} position={[0, 1.18, 0.2]} color="#ffc77d" intensity={season === "winter" ? 1.15 : 0.55} distance={3.2} />
    </group>
  );
}

function RuinedGate({ season }: { season: Season }) {
  const stone = palettes[season].stone;
  return (
    <group position={[-6.7, -1.98, -3.45]} rotation={[0, 0.12, 0]} scale={0.82}>
      <mesh position={[-0.78, 1.05, 0]}>
        <boxGeometry args={[0.32, 2.1, 0.42]} />
        <meshStandardMaterial color={stone} roughness={1} />
      </mesh>
      <mesh position={[0.78, 0.82, 0]}>
        <boxGeometry args={[0.32, 1.64, 0.42]} />
        <meshStandardMaterial color={stone} roughness={1} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[1.9, 0.3, 0.46]} />
        <meshStandardMaterial color={stone} roughness={1} />
      </mesh>
      <mesh position={[-0.78, 0.52, 0.23]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.38, 0.12, 0.5]} />
        <meshStandardMaterial color={palettes[season].moss} />
      </mesh>
      <mesh position={[0.78, 0.33, 0.23]}>
        <boxGeometry args={[0.38, 0.1, 0.5]} />
        <meshStandardMaterial color={palettes[season].moss} />
      </mesh>
      <mesh position={[0.18, 1.15, 0.02]} rotation={[0, 0, -0.22]}>
        <boxGeometry args={[0.16, 0.58, 0.36]} />
        <meshStandardMaterial color={stone} roughness={1} />
      </mesh>
    </group>
  );
}

function Waterfall({ season }: { season: Season }) {
  const water = palettes[season].water;
  const flow = useRef<THREE.Group>(null);
  const spray = useRef<THREE.Group>(null);
  const pool = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (flow.current) flow.current.children.forEach((child, i) => {
      child.position.y = 0.92 - ((t * (1.05 + (i % 4) * 0.19) + i * 0.23) % 1.9);
      child.position.x = Math.sin(t * 2.2 + i) * 0.035;
    });
    if (spray.current) {
      spray.current.children.forEach((child, i) => {
        child.position.y = -0.78 + ((t * 0.48 + i * 0.17) % 0.72);
        child.position.x = Math.sin(t * 1.8 + i * 2) * 0.12;
      });
    }
    if (pool.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.035;
      pool.current.scale.set(0.88 * pulse, 0.48 * pulse, 1);
    }
  });
  return (
    <group position={[5.35, -0.82, -2.15]}>
      {/* A dark rock face and clear upper lip make the source and drop readable. */}
      <mesh position={[0, -0.02, -0.18]} scale={[1.05, 1.28, 0.42]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={palettes[season].stone} roughness={1} />
      </mesh>
      <mesh position={[0, 0.98, 0.12]}>
        <boxGeometry args={[1.72, 0.24, 0.82]} />
        <meshStandardMaterial color={palettes[season].stone} roughness={1} />
      </mesh>
      <mesh position={[0, 0.02, 0.18]}>
        <boxGeometry args={[0.98, 1.9, 0.045]} />
        <meshBasicMaterial color={water} transparent opacity={0.76} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <group ref={flow} position={[0, 0, 0.23]}>
        {Array.from({ length: 22 }, (_, i) => (
          <mesh key={i} position={[(i % 7 - 3) * 0.125, 0.92, 0.025]}>
            <capsuleGeometry args={[0.018 + (i % 3) * 0.009, 0.22 + (i % 4) * 0.09, 3, 6]} />
            <meshBasicMaterial color={i % 4 === 0 ? "#f0ffff" : water} transparent opacity={0.9} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -1.0, 0.28]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.12, 0.58, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshStandardMaterial color={water} roughness={0.12} metalness={0.16} transparent opacity={0.94} />
      </mesh>
      <mesh ref={pool} position={[0, -0.96, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial color="#d9fbff" transparent opacity={0.23} depthWrite={false} />
      </mesh>
      <group ref={spray} position={[0, 0, 0.36]}>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[(i - 5.5) * 0.085, -0.78, 0]}>
            <sphereGeometry args={[0.035 + (i % 3) * 0.012, 8, 8]} />
            <meshBasicMaterial color="#eaffff" transparent opacity={0.82} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {/* The outflow visibly joins the lake instead of ending beneath the terrain. */}
      <mesh position={[-0.52, -1.13, 0.62]} rotation={[-Math.PI / 2, 0, -0.14]} scale={[0.34, 0.95, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color={water} roughness={0.16} metalness={0.12} />
      </mesh>
      {[-0.78, -0.58, 0.62, 0.82].map((x, i) => (
        <mesh key={i} position={[x, -0.82 + (i % 2) * 0.12, 0.42]} scale={[0.3, 0.22, 0.26]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={palettes[season].stone} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function WorldLandmarks({ season }: { season: Season }) {
  const palette = palettes[season];
  const fallenLogs = useMemo(() => [
    { x: -3.5, z: 3.55, rotation: 0.34, length: 1.45 },
    { x: 6.8, z: 1.85, rotation: -0.52, length: 1.05 },
  ], []);
  const reedSites = useMemo(() => Array.from({ length: 13 }, (_, i) => ({
    x: -3.6 + i * 0.53,
    z: -0.1 + Math.sin(i * 1.8) * 0.25,
    height: 0.45 + (i % 4) * 0.13,
  })), []);

  return (
    <>
      <RuinedGate season={season} />
      <Waterfall season={season} />
      {fernSites.map(([x, z, scale], i) => (
        <group key={"fern-" + i} position={[x, -1.98, z]}>
          <Fern scale={scale} color={palette.leaf} light={palette.leafLight} />
          <Fern scale={scale * 0.72} color={palette.leafLight} light={palette.leaf} />
        </group>
      ))}
      {mushroomSites.map(([x, z], i) => (
        <group key={"mushroom-" + i} position={[x, -1.98, z]} scale={i % 2 ? 0.78 : 1}>
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.035, 0.055, 0.26, 7]} />
            <meshStandardMaterial color="#e7ddc9" />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={season === "winter" ? "#dce9ed" : season === "autumn" ? "#b85d37" : "#bd7654"} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {fallenLogs.map((log, i) => (
        <group key={"log-" + i} position={[log.x, -1.91, log.z]} rotation={[0, 0, log.rotation]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.16, log.length, 8]} />
            <meshStandardMaterial color="#594635" roughness={1} />
          </mesh>
          <mesh position={[0, 0.04, log.length * 0.48]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.105, 0.105, 0.018, 8]} />
            <meshStandardMaterial color="#b18a61" />
          </mesh>
          <mesh position={[0, 0.14, -0.1]}>
            <sphereGeometry args={[0.18, 8, 6]} />
            <meshStandardMaterial color={palette.moss} />
          </mesh>
        </group>
      ))}
      {reedSites.map((reed, i) => (
        <group key={"reed-" + i} position={[reed.x, -1.98, reed.z]}>
          {[0, 1, 2].map((blade) => (
            <mesh key={blade} position={[(blade - 1) * 0.07, reed.height / 2, (blade - 1) * 0.035]} rotation={[0, 0, (blade - 1) * -0.18]}>
              <coneGeometry args={[0.035, reed.height, 5]} />
              <meshStandardMaterial color={palette.leafLight} roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
      <Lantern position={[-2.45, -1.98, 2.25]} season={season} />
      <Lantern position={[3.9, -1.98, 2.15]} season={season} />
    </>
  );
}
