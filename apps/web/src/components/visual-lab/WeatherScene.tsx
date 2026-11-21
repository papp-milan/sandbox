import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { weatherKind, type HourlyWeather } from "./weather-utils";

export type Season = "spring" | "summer" | "autumn" | "winter";
export function getSeason(latitude:number, date=new Date()):Season {
 const month=date.getMonth();
 const north:Season=month>=2&&month<=4?"spring":month>=5&&month<=7?"summer":month>=8&&month<=10?"autumn":"winter";
 if(latitude>=0)return north;
 return north==="spring"?"autumn":north==="autumn"?"spring":north==="summer"?"winter":"summer";
}
const themes:Record<Season,{name:string;sky:string;horizon:string;ground:string;foliage:string;foliage2:string;accent:string;water:string;petal:string}> = {
 spring:{name:"Spring · Awakening",sky:"#8bbbd0",horizon:"#f5c8c3",ground:"#567f59",foliage:"#8fbf79",foliage2:"#c1d99a",accent:"#f5c2d2",water:"#6aa9b4",petal:"#ffd6e3"},
 summer:{name:"Summer · Golden days",sky:"#56a9d0",horizon:"#f6d69a",ground:"#477c4d",foliage:"#2f7546",foliage2:"#70a94f",accent:"#f4d17e",water:"#4babbc",petal:"#f5e6a4"},
 autumn:{name:"Autumn · Falling leaves",sky:"#9a9b9a",horizon:"#e6a36e",ground:"#70533d",foliage:"#b84f2d",foliage2:"#df9b42",accent:"#e9a34f",water:"#557d7c",petal:"#d77a35"},
 winter:{name:"Winter · Frozen kingdom",sky:"#607e9c",horizon:"#c3d8e8",ground:"#d9e5ec",foliage:"#24434a",foliage2:"#7899a5",accent:"#d8f1ff",water:"#a8d7e5",petal:"#f5fbff"}
};
const treePositions:[number,number,number,number][]=[[-7,-1.8,-2,1.2],[-5.8,-1.9,-3.2,.9],[-4.5,-2,-1.6,1.1],[4.4,-1.9,-2.2,1.1],[5.8,-1.8,-3.1,.85],[7,-1.9,-1.8,1.25],[-8,-2.1,-4,.7],[8,-2.1,-4,.75],[-2.7,-2.1,-4.4,.75],[2.9,-2.1,-4.2,.8]];
function SeasonalTree({position,scale,season}:{position:[number,number,number];scale:number;season:Season}){
 const crown=useRef<THREE.Group>(null);
 const palette=themes[season];
 useFrame(({clock})=>{if(crown.current){crown.current.rotation.z=Math.sin(clock.elapsedTime*.8+position[0])* (season==="winter"?.012:.035);crown.current.rotation.x=Math.sin(clock.elapsedTime*.55+position[2])*.018;}});
 const conifer=position[0]===-7||position[0]===7||Math.abs(position[2])>3.8;
 return <group position={position} scale={scale}>
  <mesh position={[0,.72,0]}><cylinderGeometry args={[.09,.17,1.45,7]}/><meshStandardMaterial color={season==="winter"?"#554d47":"#574333"} roughness={1}/></mesh>
  <group ref={crown} position={[0,1.45,0]}>
   {conifer?<>{[0,.55,1.08].map((y,i)=><mesh key={i} position={[0,y,0]}><coneGeometry args={[.72-i*.13,1.25,9]}/><meshStandardMaterial color={season==="winter"?(i===2?"#f2f7f8":"#31545a"):season==="autumn"?"#536b42":palette.foliage} roughness={.94}/></mesh>)}
    {season==="winter"&&<mesh position={[0,1.7,0]}><coneGeometry args={[.2,.48,8]}/><meshStandardMaterial color="#f5fbff"/></mesh>}
   </>:<>{[[0,.35,0],[.42,.65,.12],[-.42,.62,.08],[0,.95,-.12],[.25,1.1,-.2]].map(([x,y,z],i)=><mesh key={i} position={[x,y,z]} scale={i===0?1:.78}><icosahedronGeometry args={[.64,2]}/><meshStandardMaterial color={season==="winter"?"#d8e8ef":i%2?palette.foliage2:palette.foliage} roughness={.88}/></mesh>)}
    {season==="spring"&&[[-.4,.8,.35],[.38,.95,.2],[0,1.3,-.25]].map(([x,y,z],i)=><mesh key={i} position={[x,y,z]}><icosahedronGeometry args={[.22,1]}/><meshStandardMaterial color="#f7c6d8" emissive="#ed9ebd" emissiveIntensity={.12}/></mesh>)}
    {season==="autumn"&&[[.45,.8,.25],[-.35,1.05,.2],[.1,.35,.45]].map(([x,y,z],i)=><mesh key={i} position={[x,y,z]}><icosahedronGeometry args={[.22,1]}/><meshStandardMaterial color={i===1?"#d98b36":"#b94f2e"}/></mesh>)}
    {season==="winter"&&<mesh position={[0,1.2,0]}><sphereGeometry args={[.25,12,10]}/><meshStandardMaterial color="#f6fbff"/></mesh>}
   </>}
  </group>
 </group>;
}
function Mountain({position,scale,season}:{position:[number,number,number];scale:[number,number,number];season:Season}){
 return <group position={position} scale={scale}><mesh><coneGeometry args={[1,2.8,7,1]}/><meshStandardMaterial color={season==="winter"?"#8198a8":season==="autumn"?"#6f6258":"#647e83"} roughness={1}/></mesh><mesh position={[0,.68,.02]}><coneGeometry args={[.43,.9,7,1]}/><meshStandardMaterial color={season==="winter"?"#f3f8fb":"#b8c7c4"} roughness={1}/></mesh></group>;
}
function Cloud({position,scale=1,storm=false}:{position:[number,number,number];scale?:number;storm?:boolean}){
 const ref=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(ref.current){ref.current.position.x=position[0]+Math.sin(clock.elapsedTime*.12+position[2])*.65;ref.current.position.y=position[1]+Math.sin(clock.elapsedTime*.3+position[0])*.12;}});
 return <group ref={ref} position={position} scale={scale}>{[[-.8,0,0],[0,.28,0],[.78,.02,0],[-.25,-.28,.12],[.55,-.3,.1]].map(([x,y,z],i)=><mesh key={i} position={[x,y,z]}><sphereGeometry args={[.68,20,16]}/><meshStandardMaterial color={storm?"#536272":"#edf3f2"} roughness={1}/></mesh>)}</group>;
}
function Cabin({season}:{season:Season}){
 return <group position={[2.3,-1.85,-2.2]} scale={.72}>
  <mesh position={[0,.55,0]}><boxGeometry args={[1.5,1.1,1.15]}/><meshStandardMaterial color={season==="winter"?"#574c46":"#78533b"}/></mesh>
  <mesh position={[0,1.27,0]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[1.12,.85,4]}/><meshStandardMaterial color={season==="winter"?"#edf5f8":season==="autumn"?"#603e35":"#55443a"}/></mesh>
  <mesh position={[.28,.56,.59]}><planeGeometry args={[.27,.38]}/><meshStandardMaterial color="#ffd58a" emissive="#ffb65e" emissiveIntensity={season==="winter"?1.6:.55}/></mesh>
  <mesh position={[-.42,.56,.59]}><planeGeometry args={[.24,.34]}/><meshStandardMaterial color="#ffd58a" emissive="#ffb65e" emissiveIntensity={season==="winter"?1.6:.55}/></mesh>
 </group>;
}
function WeatherParticles({weather,season}:{weather:HourlyWeather;season:Season}){
 const ref=useRef<THREE.Points>(null);
 const kind=weatherKind(weather.code),isSnow=kind==="snow",isRain=kind==="rain"||kind==="storm",count=isRain?1100:isSnow?460:season==="spring"||season==="autumn"?260:season==="summer"?110:0;
 const positions=useMemo(()=>{const a=new Float32Array(count*3);for(let i=0;i<count;i++){a[i*3]=(Math.random()-.5)*24;a[i*3+1]=Math.random()*12-3;a[i*3+2]=(Math.random()-.5)*14;}return a;},[count]);
 useFrame((_,delta)=>{if(!ref.current)return;const p=ref.current.geometry.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(isRain){y-=delta*13;x+=delta*(weather.wind/45+.25);}else{y-=delta*(isSnow?.65:1.05);x+=delta*(Math.sin(y*1.7+i)*.18+weather.wind/90);z+=Math.sin(y+i)*delta*.08;}if(y< -2.5){y=8+Math.random()*3;x=(Math.random()-.5)*24;z=(Math.random()-.5)*14;}p.setXYZ(i,x,y,z);}p.needsUpdate=true;});
 const color=isRain?"#ccecff":isSnow?"#f6fcff":season==="spring"?"#ffd1e2":season==="autumn"?"#d98239":season==="summer"?"#f6df9c":"#eaf7ff";
 return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color={color} size={isRain?.045:isSnow?.075:.105} transparent opacity={isRain?.72:.9} sizeAttenuation/></points>;
}
function LivingWorld({weather,hour,latitude,seasonOverride}:{weather:HourlyWeather;hour:number;latitude:number;seasonOverride?:Season}){
 const season=seasonOverride??getSeason(latitude),theme=themes[season],kind=weatherKind(weather.code),night=hour<5||hour>=21,storm=kind==="storm",cloudy=kind!=="clear",golden=(hour>=5&&hour<=8)||(hour>=17&&hour<=20);
 const ground=useRef<THREE.Mesh>(null),water=useRef<THREE.Mesh>(null),flash=useRef<THREE.PointLight>(null),sun=useRef<THREE.Group>(null),intro=useRef(0),clouds=useRef<THREE.Group>(null);
 const targetSky=new THREE.Color(storm?"#26364d":night?"#101d37":golden?theme.horizon:theme.sky);
 const targetGround=new THREE.Color(theme.ground);
 useFrame((state,delta)=>{
  intro.current=Math.min(1,intro.current+delta*.22);const reveal=THREE.MathUtils.smoothstep(intro.current,0,1);
  state.camera.position.lerp(new THREE.Vector3(0,2.2+(1-reveal)*3,12.4+(1-reveal)*7),1-Math.exp(-delta*1.25));state.camera.lookAt(0,-.2,0);
  const bg=state.scene.background as THREE.Color|null;if(bg)bg.lerp(targetSky,1-Math.exp(-delta*.8));
  if(state.scene.fog instanceof THREE.Fog)state.scene.fog.color.lerp(targetSky,1-Math.exp(-delta*.8));
  if(ground.current){const m=ground.current.material as THREE.MeshStandardMaterial;m.color.lerp(targetGround,1-Math.exp(-delta*1.1));}
  if(water.current){water.current.rotation.z=Math.sin(state.clock.elapsedTime*.2)*.004;const m=water.current.material as THREE.MeshStandardMaterial;m.color.lerp(new THREE.Color(theme.water),1-Math.exp(-delta));}
  if(sun.current){const a=(hour-6)/12*Math.PI;sun.current.position.set(-5+Math.cos(a)*5,Math.max(-.1,Math.sin(a))*5,-3);sun.current.visible=!night;}
  if(flash.current){const pulse=storm&&Math.random()>.992?5.5:0;flash.current.intensity=THREE.MathUtils.damp(flash.current.intensity,pulse,5,delta);}
  if(clouds.current)clouds.current.position.x=Math.sin(state.clock.elapsedTime*.08)*.5;
 });
 return <>
  <color attach="background" args={[theme.sky]}/><fog attach="fog" args={[theme.sky,13,32]}/>
  <ambientLight intensity={night?.48:golden?1.1:1.35}/><directionalLight position={[-5,9,5]} intensity={night?.45:golden?2.0:2.4} color={golden?"#ffd2a0":season==="winter"?"#d9edff":"#fff2d8"}/><directionalLight position={[5,4,-4]} intensity={.65} color="#c9e5ff"/>
  {night&&<Stars radius={65} depth={45} count={1700} factor={2} fade speed={.35}/>}
  {!night&&<group ref={sun}><mesh><sphereGeometry args={[.72,32,32]}/><meshStandardMaterial color="#ffe4a5" emissive="#ffb75b" emissiveIntensity={1.8}/></mesh><mesh><sphereGeometry args={[1.5,24,24]}/><meshBasicMaterial color="#ffd18a" transparent opacity={.12}/></mesh></group>}
  {night&&<mesh position={[-4,4,-5]}><sphereGeometry args={[.48,32,24]}/><meshStandardMaterial color="#e7f0ff" emissive="#b8d5ff" emissiveIntensity={1.2}/></mesh>}
  <group position={[0,0,-5]}><Mountain position={[-7,-.1,0]} scale={[3.3,2.8,1]} season={season}/><Mountain position={[-3.7,.1,-.6]} scale={[3.8,3.5,1]} season={season}/><Mountain position={[.2,-.1,-.9]} scale={[4.5,3.7,1]} season={season}/><Mountain position={[5,-.05,-.5]} scale={[3.6,3.2,1]} season={season}/><Mountain position={[8,-.1,0]} scale={[3,2.7,1]} season={season}/></group>
  {cloudy&&<group ref={clouds}><Cloud position={[-4,3,-3]} scale={storm?1.6:1.2} storm={storm}/><Cloud position={[1.5,3.7,-4]} scale={storm?1.8:1.1} storm={storm}/><Cloud position={[6,2.9,-3]} scale={.9} storm={storm}/></group>}
  <mesh ref={ground} rotation={[-Math.PI/2,0,0]} position={[0,-2.05,0]}><planeGeometry args={[200,200]}/><meshStandardMaterial color={theme.ground} roughness={1}/></mesh>
  <mesh ref={water} rotation={[-Math.PI/2,0,0]} position={[-.5,-1.99,-1.3]} scale={[3.9,1.3,1]}><circleGeometry args={[1,64]}/><meshStandardMaterial color={theme.water} roughness={.16} metalness={.18} transparent opacity={.94}/></mesh>
  {treePositions.map(([x,y,z,s],i)=><SeasonalTree key={i} position={[x,y,z]} scale={s} season={season}/>)}
  <Cabin season={season}/>
  {season==="spring"&&<group>{[-5,-3.5,4,5.5].map((x,i)=><mesh key={i} position={[x,-1.95,1.2]} rotation={[0,0,Math.sin(i)*.12]}><sphereGeometry args={[.12,10,8]}/><meshStandardMaterial color="#f3b8ce"/></mesh>)}</group>}
  {season==="winter"&&<mesh position={[0,-1.94,0]} scale={[9,.08,4]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#f2f8fb" roughness={1}/></mesh>}
  {season==="autumn"&&<mesh position={[0,-1.92,1]} scale={[8,.035,3]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#9b633d" roughness={1}/></mesh>}
  <WeatherParticles weather={weather} season={season}/>
  {storm&&<pointLight ref={flash} position={[1,4,1]} intensity={0} distance={22} color="#dceaff"/>}
 </>;
}
export function WeatherScene({weather,hour,latitude=48.1372,seasonOverride}:{weather:HourlyWeather;hour:number;latitude?:number;seasonOverride?:Season}){
 return <Canvas dpr={[1,1.5]} camera={{position:[0,4,19],fov:42}} gl={{antialias:true,alpha:false}}><LivingWorld weather={weather} hour={hour} latitude={latitude} seasonOverride={seasonOverride}/></Canvas>;
}
