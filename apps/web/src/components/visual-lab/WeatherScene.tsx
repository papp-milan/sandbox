import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { weatherKind, type HourlyWeather } from "./weather-utils";

function CloudLayer({night,dense,offset=0,scale=1}:{night:boolean;dense:boolean;offset?:number;scale?:number}) {
 const group=useRef<THREE.Group>(null);
 const lobes=[[-1.9,-.05,0,.86],[-1.25,.38,.12,1.02],[-.48,.66,0,1.08],[.38,.62,-.08,1.08],[1.2,.34,.06,.96],[1.82,-.02,.12,.78],[-1.05,-.48,.28,.86],[-.1,-.5,.3,1.02],[.92,-.43,.28,.86],[-1.9,-.42,.2,.56],[1.88,-.38,.2,.54]] as const;
 useFrame(({clock})=>{if(group.current){group.current.position.x=offset+Math.sin(clock.elapsedTime*.18+offset)*.28;group.current.position.y=1.15+Math.sin(clock.elapsedTime*.55+offset)*.12;group.current.rotation.z=Math.sin(clock.elapsedTime*.2+offset)*.025;}});
 return <group ref={group} position={[offset,1.15,0]} scale={scale}>
  {lobes.map(([x,y,z,s],i)=><mesh key={i} position={[x,y,z]} scale={s}>
   <sphereGeometry args={[.83,36,28]}/>
   <meshStandardMaterial color={night?"#c2d0df":dense?(i%3===0?"#dce7ee":"#aebfce"):(i%3===0?"#fff5e8":"#e5edf2")} roughness={.82}/>
  </mesh>)}
 </group>;
}
function WeatherWorld({weather,hour}:{weather:HourlyWeather;hour:number}) {
 const kind=weatherKind(weather.code), particlesRef=useRef<THREE.Points>(null), sunRef=useRef<THREE.Group>(null), haloRef=useRef<THREE.Mesh>(null), flashRef=useRef<THREE.PointLight>(null);
 const night=hour<6||hour>=20, rainy=kind==="rain"||kind==="storm", snowy=kind==="snow", foggy=kind==="fog", windy=weather.wind>22;
 const sky=kind==="storm"?(night?"#26324d":"#52627e"):rainy?(night?"#29445e":"#648ba7"):snowy?(night?"#263b57":"#9bc4d9"):foggy?"#9bafb8":kind==="cloudy"?(night?"#293c59":"#83abc5"):(night?"#152a4b":"#62b2e5");
 const particles=useMemo(()=>{const a=new Float32Array(760*3);for(let i=0;i<760;i++){a[i*3]=(Math.random()-.5)*15;a[i*3+1]=Math.random()*11-3;a[i*3+2]=(Math.random()-.5)*9;}return a;},[]);
 useFrame((state,delta)=>{
  if(particlesRef.current&&(rainy||snowy)){const p=particlesRef.current.geometry.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i)-delta*(rainy?13:1.35);let x=p.getX(i)+(windy?weather.wind/80:0)*delta;if(y< -3){y=8;x=(Math.random()-.5)*15;}if(snowy)x+=Math.sin(state.clock.elapsedTime*1.7+i)*delta*.32;p.setXYZ(i,x,y,p.getZ(i));}p.needsUpdate=true;}
  if(sunRef.current){const angle=((hour-6)/12)*Math.PI;sunRef.current.position.set(-3+Math.cos(angle)*1.3,1+Math.max(0,Math.sin(angle))*2.5,-3);}
  if(haloRef.current)haloRef.current.rotation.z=state.clock.elapsedTime*.12;
  if(flashRef.current){const pulse=kind==="storm"&&Math.sin(state.clock.elapsedTime*3.4)>0.985?5:0;flashRef.current.intensity=THREE.MathUtils.damp(flashRef.current.intensity,pulse,.08,delta);}
 });
 return <>
  <color attach="background" args={[sky]}/><fog attach="fog" args={[sky,14,34]}/>
  <ambientLight intensity={night?.65:1.2}/>
  <directionalLight position={[-5,8,5]} intensity={night?.8:2.1} color="#fff1dc"/>
  <directionalLight position={[4,3,-4]} intensity={.85} color={kind==="snow"?"#d8f4ff":"#ffd5a0"}/>
  {night&&<Stars radius={75} depth={48} count={1300} factor={2.3} fade speed={.65}/>}
  {!night&&!rainy&&!snowy&&!foggy&&<group ref={sunRef}>
   <mesh><sphereGeometry args={[.72,48,48]}/><meshStandardMaterial color="#ffe19a" emissive="#ffae42" emissiveIntensity={1.4}/></mesh>
   <mesh ref={haloRef}><torusGeometry args={[1.05,.055,12,96]}/><meshBasicMaterial color="#ffe2a1" transparent opacity={.68}/></mesh>
   <mesh><sphereGeometry args={[1.42,32,32]}/><meshBasicMaterial color="#ffc76d" transparent opacity={.12}/></mesh>
  </group>}
  {night&&<group position={[-2.8,2.8,-3]}><mesh><sphereGeometry args={[.52,40,32]}/><meshStandardMaterial color="#f0f4ff" emissive="#c7ddff" emissiveIntensity={.55}/></mesh><mesh><torusGeometry args={[.78,.025,8,64]}/><meshBasicMaterial color="#dce8ff" transparent opacity={.35}/></mesh></group>}
  {kind!=="clear"&&<><CloudLayer night={night} dense={rainy||kind==="storm"||kind==="cloudy"} scale={kind==="storm"?1.65:1.35}/><CloudLayer night={night} dense={true} offset={-4.2} scale={.72}/><CloudLayer night={night} dense={true} offset={4.3} scale={.8}/></>}
  {rainy&&<points ref={particlesRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles,3]}/></bufferGeometry><pointsMaterial color="#d8efff" size={.055} transparent opacity={.82} sizeAttenuation/></points>}
  {snowy&&<points ref={particlesRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles,3]}/></bufferGeometry><pointsMaterial color="#fff" size={.095} transparent opacity={.98} sizeAttenuation/></points>}
  {kind==="storm"&&<pointLight ref={flashRef} position={[1.5,3,1]} intensity={0} distance={16} color="#eaf2ff"/>}
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-2.65,0]}><planeGeometry args={[200,200]}/><meshStandardMaterial color={night?"#26354d":snowy?"#9db8c5":rainy?"#4b6e87":"#5b91ad"} roughness={.96}/></mesh>
 </>;
}
export function WeatherScene({weather,hour}:{weather:HourlyWeather;hour:number}) {
 return <Canvas dpr={[1,1.5]} camera={{position:[0,1.05,9],fov:42}} gl={{antialias:true,alpha:false}}>
  <WeatherWorld weather={weather} hour={hour}/>
 </Canvas>;
}
