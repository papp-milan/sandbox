import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { weatherKind, type HourlyWeather } from "./weather-utils";

function Tree({position,scale=1}:{position:[number,number,number];scale?:number}) {
 const leaves=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(leaves.current)leaves.current.rotation.z=Math.sin(clock.elapsedTime*1.4+position[0])*0.055;});
 return <group position={position} scale={scale}>
  <mesh position={[0,.55,0]}><cylinderGeometry args={[.07,.12,1.1,7]}/><meshStandardMaterial color="#514638"/></mesh>
  <group ref={leaves} position={[0,1.2,0]}>
   <mesh position={[0,.38,0]}><coneGeometry args={[.62,1.25,8]}/><meshStandardMaterial color="#365c50" roughness={.9}/></mesh>
   <mesh position={[0,.9,0]}><coneGeometry args={[.46,1.05,8]}/><meshStandardMaterial color="#527b62" roughness={.9}/></mesh>
  </group>
 </group>;
}
function CloudLayer({night,offset=0,scale=1}:{night:boolean;offset?:number;scale?:number}) {
 const group=useRef<THREE.Group>(null);
 const lobes=[[-1.9,-.05,0,.86],[-1.25,.38,.12,1.02],[-.48,.66,0,1.08],[.38,.62,-.08,1.08],[1.2,.34,.06,.96],[1.82,-.02,.12,.78],[-1.05,-.48,.28,.86],[-.1,-.5,.3,1.02],[.92,-.43,.28,.86]] as const;
 useFrame(({clock})=>{if(group.current){group.current.position.x=offset+Math.sin(clock.elapsedTime*.18+offset)*.34;group.current.position.y=1.7+Math.sin(clock.elapsedTime*.55+offset)*.14;group.current.rotation.z=Math.sin(clock.elapsedTime*.2+offset)*.03;}});
 return <group ref={group} position={[offset,1.7,0]} scale={scale}>{lobes.map(([x,y,z,s],i)=><mesh key={i} position={[x,y,z]} scale={s}><sphereGeometry args={[.83,32,24]}/><meshStandardMaterial color={night?"#b9c8dc":i%3===0?"#fff4e7":"#d9e7ed"} roughness={.82}/></mesh>)}</group>;
}
function WeatherWorld({weather,hour}:{weather:HourlyWeather;hour:number}) {
 const kind=weatherKind(weather.code),rainy=kind==="rain"||kind==="storm",snowy=kind==="snow",night=hour<5||hour>=21,golden=(hour>=5&&hour<=8)||(hour>=17&&hour<=20),windy=weather.wind>14;
 const groundRef=useRef<THREE.Mesh>(null),sunRef=useRef<THREE.Group>(null),haloRef=useRef<THREE.Mesh>(null),flashRef=useRef<THREE.PointLight>(null),rainRef=useRef<THREE.Points>(null),windRef=useRef<THREE.Points>(null);
 const skyTarget=new THREE.Color(kind==="storm"?(night?"#18263b":"#52677c"):rainy?(night?"#1d3854":"#6091aa"):snowy?(night?"#263b57":"#a8cbd8"):kind==="fog"?"#9caeb6":kind==="cloudy"?(night?"#253b57":"#7eabc4"):(night?"#101e3d":golden?"#ed9c69":"#59b6e7"));
 const groundTarget=new THREE.Color(night?"#182b3a":snowy?"#e0edf0":rainy?"#365d68":"#4f8b67");
 const rainPositions=useMemo(()=>{const a=new Float32Array(900*3);for(let i=0;i<900;i++){a[i*3]=(Math.random()-.5)*18;a[i*3+1]=Math.random()*12-3;a[i*3+2]=(Math.random()-.5)*12;}return a;},[]);
 const windPositions=useMemo(()=>{const a=new Float32Array(260*3);for(let i=0;i<260;i++){a[i*3]=(Math.random()-.5)*22;a[i*3+1]=Math.random()*5-1;a[i*3+2]=(Math.random()-.5)*12;}return a;},[]);
 useFrame((state,delta)=>{
  const bg=state.scene.background as THREE.Color|null;
  if(bg)bg.lerp(skyTarget,1-Math.exp(-delta*1.25));
  if(state.scene.fog instanceof THREE.Fog)state.scene.fog.color.lerp(skyTarget,1-Math.exp(-delta*1.25));
  if(groundRef.current){const mat=groundRef.current.material as THREE.MeshStandardMaterial;mat.color.lerp(groundTarget,1-Math.exp(-delta*1.2));}
  if(sunRef.current){const progress=(hour-6)/12*Math.PI;sunRef.current.position.set(-4+Math.cos(progress)*4,Math.max(-.2,Math.sin(progress))*4.1-0.1,-3);sunRef.current.visible=!night;}
  if(haloRef.current)haloRef.current.rotation.z=state.clock.elapsedTime*.1;
  if(flashRef.current){const pulse=kind==="storm"&&Math.sin(state.clock.elapsedTime*3.2)>0.985?4.8:0;flashRef.current.intensity=THREE.MathUtils.damp(flashRef.current.intensity,pulse,.08,delta);}
  if(rainRef.current){const p=rainRef.current.geometry.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i)-delta*(rainy?12:0);let x=p.getX(i)+weather.wind/120*delta;if(y< -3){y=9;x=(Math.random()-.5)*18;}p.setXYZ(i,x,y,p.getZ(i));}p.needsUpdate=true;}
  if(windRef.current){const p=windRef.current.geometry.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i)+delta*(.8+weather.wind/7);if(x>11)x=-11;p.setX(i,x);}p.needsUpdate=true;}
 });
 const ambient=night?.55:golden?1.05:1.35;
 return <>
  <color attach="background" args={["#5aaed8"]}/><fog attach="fog" args={["#5aaed8",16,38]}/>
  <ambientLight intensity={ambient}/>
  <directionalLight position={[-5,8,5]} intensity={night?.5:golden?1.8:2.3} color={golden?"#ffd2a0":"#fff5e4"}/>
  <directionalLight position={[4,3,-4]} intensity={.75} color="#c8e7ff"/>
  {night&&<Stars radius={70} depth={45} count={1500} factor={2.2} fade speed={.55}/>}
  {night?<group position={[-3,3,-4]}><mesh><sphereGeometry args={[.58,40,32]}/><meshStandardMaterial color="#edf4ff" emissive="#b6d5ff" emissiveIntensity={.75}/></mesh><mesh><torusGeometry args={[.86,.025,8,64]}/><meshBasicMaterial color="#dceaff" transparent opacity={.45}/></mesh></group>:<group ref={sunRef}><mesh><sphereGeometry args={[.78,48,48]}/><meshStandardMaterial color="#ffe2a1" emissive="#ffad4a" emissiveIntensity={1.7}/></mesh><mesh ref={haloRef}><torusGeometry args={[1.18,.045,12,96]}/><meshBasicMaterial color="#ffe0a1" transparent opacity={.72}/></mesh><mesh><sphereGeometry args={[1.7,32,32]}/><meshBasicMaterial color="#ffc76d" transparent opacity={.12}/></mesh></group>}
  {kind!=="clear"&&<><CloudLayer night={night} scale={rainy?1.5:1.22}/><CloudLayer night={night} offset={-4.4} scale={.72}/><CloudLayer night={night} offset={4.2} scale={.82}/></>}
  <mesh ref={groundRef} rotation={[-Math.PI/2,0,0]} position={[0,-2.4,0]}><planeGeometry args={[200,200,1,1]}/><meshStandardMaterial color="#4f8b67" roughness={.95}/></mesh>
  <mesh position={[0,-2.55,-1]} scale={[5.8,.3,2.4]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color={snowy?"#d5e8ed":rainy?"#477d8b":"#6c9c70"} roughness={.75}/></mesh>
  <Tree position={[-5,-2.4,-1]} scale={1.25}/><Tree position={[-3.9,-2.4,-2.1]} scale={.78}/><Tree position={[5,-2.4,-1.4]} scale={1.18}/><Tree position={[4.1,-2.4,-2.6]} scale={.72}/>
  {rainy&&<points ref={rainRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[rainPositions,3]}/></bufferGeometry><pointsMaterial color="#d8efff" size={.045} transparent opacity={.78} sizeAttenuation/></points>}
  {snowy&&<points ref={rainRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[rainPositions,3]}/></bufferGeometry><pointsMaterial color="#fff" size={.09} transparent opacity={.96} sizeAttenuation/></points>}
  {windy&&<points ref={windRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[windPositions,3]}/></bufferGeometry><pointsMaterial color="#e3f2e9" size={.035} transparent opacity={Math.min(.8,weather.wind/70)} sizeAttenuation/></points>}
  {kind==="storm"&&<pointLight ref={flashRef} position={[1.5,3,1]} intensity={0} distance={18} color="#eaf2ff"/>}
 </>;
}
export function WeatherScene({weather,hour}:{weather:HourlyWeather;hour:number}) {
 return <Canvas dpr={[1,1.5]} camera={{position:[0,1.25,10],fov:43}} gl={{antialias:true,alpha:false}}><WeatherWorld weather={weather} hour={hour}/></Canvas>;
}
