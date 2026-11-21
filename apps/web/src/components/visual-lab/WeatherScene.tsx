import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Cloud, Stars } from "@react-three/drei";
import * as THREE from "three";
import { weatherKind, type HourlyWeather } from "./weather-utils";

function Atmosphere({ weather, hour }: { weather: HourlyWeather; hour:number }) {
  const kind = weatherKind(weather.code);
  const cloudRef = useRef<THREE.Group>(null);
  const rainRef = useRef<THREE.Points>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const night = hour < 6 || hour >= 20;
  const clouds = kind !== "clear";
  const rain = kind === "rain" || kind === "storm";
  const snow = kind === "snow";
  const particles = useMemo(() => {
    const values = new Float32Array(900 * 3);
    for (let i=0;i<900;i++) { values[i*3]=(Math.random()-.5)*13; values[i*3+1]=Math.random()*8; values[i*3+2]=(Math.random()-.5)*9; }
    return values;
  }, []);
  useFrame((state, delta) => {
    if (cloudRef.current) cloudRef.current.rotation.y += delta * (weather.wind / 3600 + .006);
    if (rainRef.current && (rain || snow)) {
      const p = rainRef.current.geometry.attributes.position;
      for(let i=0;i<p.count;i++) {
        let y=p.getY(i)-(rain ? delta*9 : delta*1.5);
        if(y < -2) y=7;
        p.setY(i,y);
        if(snow) { p.setX(i,p.getX(i)+Math.sin(state.clock.elapsedTime+i)*delta*.18); }
      }
      p.needsUpdate=true;
    }
    if (sunRef.current) sunRef.current.position.set(Math.cos((hour/24)*Math.PI*2)*5, Math.sin((hour/24)*Math.PI*2)*3.2+1.5, -2.5);
  });
  return <>
    <color attach="background" args={[night ? "#080a0d" : "#17191c"]}/>
    <fog attach="fog" args={[night ? "#080a0d" : "#17191c", 10, 24]}/>
    <ambientLight intensity={night ? .24 : .65}/>
    <directionalLight position={[4,8,5]} intensity={night ? .45 : 1.5} color="#e6e6e6"/>
    {night && <Stars radius={70} depth={35} count={900} factor={2.2} fade speed={.25}/>}
    <mesh ref={sunRef}><sphereGeometry args={[.48,32,32]}/><meshBasicMaterial color={night ? "#aeb6c4" : "#f0f0e8"}/></mesh>
    <mesh position={[0,-1.55,0]} scale={[1, .23, .72]}><sphereGeometry args={[4.8,64,48]}/><meshStandardMaterial color="#33373b" roughness={.92} metalness={.12}/></mesh>
    <mesh position={[0,-1.3,0]} scale={[1,.18,.73]}><sphereGeometry args={[4.25,64,48]}/><meshStandardMaterial color="#171a1d" roughness={.85}/></mesh>
    <group ref={cloudRef}>
      {clouds && <><Cloud position={[-2.8,2.1,-1.2]} speed={.12} opacity={kind==="fog"?.22:.62} segments={24} bounds={[4,1.1,2]}/><Cloud position={[2.4,2.8,-2]} speed={.1} opacity={kind==="fog"?.2:.52} segments={20} bounds={[3.5,.9,1.8]}/><Cloud position={[.2,3.5,-3.5]} speed={.08} opacity={.34} segments={18} bounds={[3,1,1.5]}/></>}
    </group>
    {(rain || snow) && <points ref={rainRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles,3]}/></bufferGeometry><pointsMaterial color="#c8cdd2" size={snow?.055:.025} transparent opacity={snow?.8:.55} sizeAttenuation/></points>}
    {kind === "storm" && <pointLight position={[0,3,0]} intensity={2.2} distance={9} color="#dce3ea"/>}
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.31,0]}><circleGeometry args={[4.1,64]}/><meshBasicMaterial color="#262a2e" transparent opacity={.75}/></mesh>
  </>;
}
export function WeatherScene({weather,hour}:{weather:HourlyWeather;hour:number}) {
 return <Canvas dpr={[1,1.5]} camera={{position:[0,2.5,10],fov:42}} gl={{antialias:true,alpha:false}}>
   <Atmosphere weather={weather} hour={hour}/>
 </Canvas>;
}
