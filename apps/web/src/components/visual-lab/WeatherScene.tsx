import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { weatherKind, type HourlyWeather } from "./weather-utils";

function CloudMass({ night, dense }: { night:boolean; dense:boolean }) {
 const ref=useRef<THREE.Group>(null);
 const lobes=[
  [-1.9,-.05,0,.86],[-1.25,.38,.12,1.02],[-.48,.66,0,1.08],[.38,.62,-.08,1.08],
  [1.2,.34,.06,.96],[1.82,-.02,.12,.78],[-1.05,-.48,.28,.86],[-.1,-.5,.3,1.02],
  [.92,-.43,.28,.86],[-1.9,-.42,.2,.56],[1.88,-.38,.2,.54]
 ] as const;
 useFrame(({clock})=>{if(ref.current){ref.current.rotation.y=Math.sin(clock.elapsedTime*.16)*.09;ref.current.position.y=1.18+Math.sin(clock.elapsedTime*.42)*.07;}});
 return <group ref={ref} position={[1.25,1.15,0]} scale={dense?1.42:1.25}>
  {lobes.map(([x,y,z,s],i)=><mesh key={i} position={[x,y,z]} scale={s}>
   <sphereGeometry args={[.83,40,32]}/>
   <meshStandardMaterial color={night?"#aeb7c2":i%3===0?"#f4f2ee":"#d9e0e3"} roughness={.92} metalness={0}/>
  </mesh>)}
 </group>;
}
function WeatherWorld({weather,hour}:{weather:HourlyWeather;hour:number}) {
 const kind=weatherKind(weather.code), rainRef=useRef<THREE.Points>(null), sunRef=useRef<THREE.Group>(null);
 const night=hour<6||hour>=20, rainy=kind==="rain"||kind==="storm", snowy=kind==="snow", foggy=kind==="fog";
 const palette=kind==="storm"?{sky:night?"#202432":"#59616e",glow:"#aab4c3"}:
  rainy?{sky:night?"#263442":"#6f8796",glow:"#b4c7d1"}:
  snowy?{sky:night?"#263542":"#a7bbc6",glow:"#e3edf0"}:
  foggy?{sky:"#89999f",glow:"#d7dfe0"}:
  kind==="cloudy"?{sky:night?"#293443":"#819aa8",glow:"#f1d8a8"}:
  {sky:night?"#17253a":"#7da9c1",glow:"#f5d28b"};
 const particles=useMemo(()=>{const a=new Float32Array(520*3);for(let i=0;i<520;i++){a[i*3]=(Math.random()-.5)*13;a[i*3+1]=Math.random()*9-2;a[i*3+2]=(Math.random()-.5)*8;}return a;},[]);
 useFrame((state,delta)=>{
  if(rainRef.current&&(rainy||snowy)){const p=rainRef.current.geometry.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i)-delta*(rainy?11:1.25);if(y< -3)y=7;p.setY(i,y);if(snowy)p.setX(i,p.getX(i)+Math.sin(state.clock.elapsedTime+i)*delta*.18);}p.needsUpdate=true;}
  if(sunRef.current){const angle=((hour-6)/12)*Math.PI;sunRef.current.position.set(-2.7+Math.cos(angle)*1.2,1.2+Math.max(0,Math.sin(angle))*2.2,-2.8);}
 });
 return <>
  <color attach="background" args={[palette.sky]}/><fog attach="fog" args={[palette.sky,12,30]}/>
  <ambientLight intensity={night?.58:1.05}/>
  <directionalLight position={[-5,7,5]} intensity={night?.85:1.9} color="#fff4e7"/>
  <directionalLight position={[4,2,-4]} intensity={.7} color={palette.glow}/>
  {night&&<Stars radius={70} depth={40} count={900} factor={2} fade speed={.25}/>}
  {!rainy&&!snowy&&!foggy&&<group ref={sunRef}>
   <mesh><sphereGeometry args={[.82,48,48]}/><meshStandardMaterial color="#f4ca83" emissive="#e6a94e" emissiveIntensity={.7}/></mesh>
   <mesh><sphereGeometry args={[1.22,32,32]}/><meshBasicMaterial color="#f4ca83" transparent opacity={.12}/></mesh>
  </group>}
  {kind!=="clear"&&<CloudMass night={night} dense={kind==="storm"||kind==="rain"||kind==="cloudy"}/>}
  {rainy&&<points ref={rainRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles,3]}/></bufferGeometry><pointsMaterial color="#e3edf4" size={.045} transparent opacity={.76} sizeAttenuation/></points>}
  {snowy&&<points ref={rainRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles,3]}/></bufferGeometry><pointsMaterial color="#fff" size={.085} transparent opacity={.95} sizeAttenuation/></points>}
  {kind==="storm"&&<pointLight position={[1.2,2.5,1]} intensity={3} distance={10} color="#e3e9f5"/>}
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-2.65,0]}><planeGeometry args={[200,200]}/><meshStandardMaterial color={night?"#28313d":"#728b93"} roughness={1}/></mesh>
 </>;
}
export function WeatherScene({weather,hour}:{weather:HourlyWeather;hour:number}) {
 return <Canvas dpr={[1,1.5]} camera={{position:[0,1.05,9],fov:42}} gl={{antialias:true,alpha:false}}>
  <WeatherWorld weather={weather} hour={hour}/>
 </Canvas>;
}
