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
  <mesh position={[0,.56,.6]}><boxGeometry args={[.18,.9,.12]}/><meshStandardMaterial color="#49362b"/></mesh>
  <mesh position={[.74,.9,0]}><boxGeometry args={[.22,.9,.22]}/><meshStandardMaterial color="#57453a"/></mesh>
  <mesh position={[.28,.56,.66]}><boxGeometry args={[.31,.42,.035]}/><meshStandardMaterial color="#9b704e"/></mesh>
  <mesh position={[-.42,.56,.66]}><boxGeometry args={[.28,.38,.035]}/><meshStandardMaterial color="#9b704e"/></mesh>
  <mesh position={[.28,.56,.69]}><boxGeometry args={[.025,.38,.02]}/><meshStandardMaterial color="#4a3c34"/></mesh>
  <mesh position={[-.42,.56,.69]}><boxGeometry args={[.025,.34,.02]}/><meshStandardMaterial color="#4a3c34"/></mesh>
 </group>;
}
function WeatherParticles({weather,season}:{weather:HourlyWeather;season:Season}){
 const ref=useRef<THREE.Points>(null);
 const kind=weatherKind(weather.code),isSnow=kind==="snow",isRain=kind==="rain"||kind==="storm",seasonal= !isSnow&&!isRain&&kind!=="fog"&&season!=="winter",count=isRain?(kind==="storm"?1450:900):isSnow?520:seasonal?(season==="spring"?150:season==="autumn"?125:75):0;
 const positions=useMemo(()=>{const a=new Float32Array(count*3);for(let i=0;i<count;i++){a[i*3]=(Math.random()-.5)*24;a[i*3+1]=Math.random()*12-3;a[i*3+2]=(Math.random()-.5)*14;}return a;},[count]);
 useFrame((_,delta)=>{if(!ref.current)return;const p=ref.current.geometry.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(isRain){y-=delta*16;x+=delta*(weather.wind/38+.3);}else if(isSnow){y-=delta*(.55+weather.wind/110);x+=delta*(Math.sin(y*1.7+i)*.28+weather.wind/130);z+=Math.sin(y+i)*delta*.12;}else{y-=delta*(season==="summer"?.18:season==="spring"?.42:.72);x+=delta*(Math.sin(y*1.7+i)*.28+weather.wind/150);z+=Math.sin(y+i)*delta*.1;}if(y< -2.5){y=8+Math.random()*3;x=(Math.random()-.5)*24;z=(Math.random()-.5)*14;}p.setXYZ(i,x,y,z);}p.needsUpdate=true;});
 const color=isRain?"#ccecff":isSnow?"#f6fcff":season==="spring"?"#ffd1e2":season==="autumn"?"#d98239":"#f6df9c";
 return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color={color} size={isRain?.038:isSnow?.085:season==="summer"?.045:.11} transparent opacity={isRain?.78:isSnow?.94:season==="summer"?.55:.86} sizeAttenuation/></points>;
}

function FogBanks(){
 const ref=useRef<THREE.Group>(null);
 useFrame(({clock},delta)=>{if(ref.current){ref.current.position.x=Math.sin(clock.elapsedTime*.035)*.65;ref.current.children.forEach((child,i)=>{child.position.z=-5+i*1.5;});}});
 return <group ref={ref}>
  {[-1.9,-.95,-.15].map((y,i)=><group key={i} position={[0,y,-5+i*1.5]}>
   {[-8,-5,-2,1,4,7].map((x,j)=><mesh key={j} position={[x+(i%2)*1.3,Math.sin(j*1.7+i)*.22,0]} scale={[2.8+i*.25,.42+i*.12,.65]}><sphereGeometry args={[1,20,12]}/><meshBasicMaterial color={i===2?"#e8f0f1":"#f4f7f6"} transparent opacity={.12+i*.025} depthWrite={false}/></mesh>)}
  </group>)}
 </group>;
}
function TerrainDetails({season}:{season:Season}){
 const palette=themes[season];
 const rockColor=season==="winter"?"#aabac4":season==="autumn"?"#756253":"#68796e";
 const pathColor=season==="winter"?"#d2dfe4":season==="autumn"?"#9b7958":"#b7a98a";
 const rocks=useMemo(()=>Array.from({length:22},(_,i)=>({x:-9.2+(i*1.73)%18.4,z:-.2+(i*2.37)%4.8,s:.18+(i%4)*.12,rot:i*.71})),[]);
 const shrubs=useMemo(()=>Array.from({length:18},(_,i)=>({x:-8.5+(i*2.11)%17,z:.1+(i*1.39)%3.5,s:.22+(i%3)*.12})),[]);
 const grass=useMemo(()=>Array.from({length:16},(_,i)=>({x:-8+(i*2.17)%16,z:.5+(i*1.13)%3.5,r:i*.8})),[]);
 const path=useMemo(()=>Array.from({length:13},(_,i)=>({x:3.1-i*.42,z:2.7-i*.23,s:.3+(i%3)*.08})),[]);
 return <>
  <group>
   <mesh position={[0,-2.035,1.35]} rotation={[-Math.PI/2,0,0]} scale={[3.2,1.2,1]}><circleGeometry args={[1,48]}/><meshStandardMaterial color={season==="winter"?"#c9d9df":season==="autumn"?"#a68a69":"#9b9a78"} roughness={1}/></mesh>
   <mesh position={[-.5,-2.08,-1.3]} rotation={[-Math.PI/2,0,0]} scale={[3.75,1.22,1]}><circleGeometry args={[1,64]}/><meshStandardMaterial color={palette.water} roughness={.2} metalness={.16} transparent opacity={.96}/></mesh>
   {Array.from({length:5},(_,i)=><mesh key={i} position={[-.5+(i-2)*.95,-2.055,-1.45+Math.sin(i)*.24]} rotation={[-Math.PI/2,0,0]} scale={[.38,.035,1]}><circleGeometry args={[1,24]}/><meshBasicMaterial color="#d7f0ed" transparent opacity={.18}/></mesh>)}
  </group>
  {rocks.map((r,i)=><mesh key={"rock"+i} position={[r.x,-2.03+r.s*.28,r.z]} rotation={[r.rot*.1,r.rot,r.rot*.17]} scale={[r.s*1.35,r.s,r.s*.9]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={rockColor} roughness={1}/></mesh>)}
  {shrubs.map((b,i)=><group key={"shrub"+i} position={[b.x,-1.98,b.z]} scale={b.s}><mesh position={[0,.22,0]}><icosahedronGeometry args={[.65,1]}/><meshStandardMaterial color={palette.foliage} roughness={1}/></mesh><mesh position={[.32,.16,.08]}><icosahedronGeometry args={[.43,1]}/><meshStandardMaterial color={palette.foliage2} roughness={1}/></mesh></group>)}
  {grass.map((g,i)=><group key={"grass"+i} position={[g.x,-1.98,g.z]} rotation={[0,g.r,0]}>{[0,1,2].map(j=><mesh key={j} position={[(j-1)*.09,.18,0]} rotation={[0,0,(j-1)*-.22]}><coneGeometry args={[.055,.42,5]}/><meshStandardMaterial color={season==="winter"?"#dce8eb":palette.foliage2} roughness={1}/></mesh>)}</group>)}
  {path.map((p,i)=><mesh key={"path"+i} position={[p.x,-2.015,p.z]} rotation={[-Math.PI/2,0,(i%2)*.12]} scale={[p.s*1.5,p.s*.7,.04]}><circleGeometry args={[1,8]}/><meshStandardMaterial color={pathColor} roughness={1}/></mesh>)}
  {[-6.7,-5.9,-5.1,5.1,5.9,6.7].map((x,i)=><group key={"flower"+i} position={[x,-1.97,2.8+(i%2)*.25]}><mesh position={[0,.18,0]}><cylinderGeometry args={[.012,.018,.36,5]}/><meshStandardMaterial color="#477344"/></mesh><mesh position={[0,.38,0]}><sphereGeometry args={[.105,10,8]}/><meshStandardMaterial color={season==="spring"?"#f5bfd4":season==="summer"?"#f2d16e":season==="autumn"?"#d77b37":"#f4f7f8"}/></mesh></group>)}
  <group position={[-3.9,-1.94,-2.2]}>
   <mesh position={[0,.06,0]}><boxGeometry args={[2.6,.12,.25]}/><meshStandardMaterial color="#73583f"/></mesh>
   {[-1.05,1.05].map(x=><mesh key={x} position={[x,.36,0]}><boxGeometry args={[.1,.65,.1]}/><meshStandardMaterial color="#5f4936"/></mesh>)}
   <mesh position={[0,.48,0]}><boxGeometry args={[2.3,.09,.09]}/><meshStandardMaterial color="#806347"/></mesh>
  </group>
  <group position={[-5.3,-1.98,-3.1]}>
   <mesh position={[0,.65,0]}><boxGeometry args={[.28,1.3,.28]}/><meshStandardMaterial color="#e9f3f3" emissive="#bde8f2" emissiveIntensity={.15}/></mesh>
   <mesh position={[.22,.1,0]}><boxGeometry args={[.7,.08,.65]}/><meshStandardMaterial color="#d9eef1" roughness={.25}/></mesh>
  </group>
 </>;
}

function LivingWorld({weather,hour,latitude,seasonOverride}:{weather:HourlyWeather;hour:number;latitude:number;seasonOverride?:Season}){
 const season=seasonOverride??getSeason(latitude),theme=themes[season],kind=weatherKind(weather.code),night=hour<5||hour>=21,storm=kind==="storm",foggy=kind==="fog",cloudy=kind!=="clear"&&!foggy,golden=(hour>=5&&hour<=8)||(hour>=17&&hour<=20);
 const ground=useRef<THREE.Mesh>(null),water=useRef<THREE.Mesh>(null),flash=useRef<THREE.PointLight>(null),sun=useRef<THREE.Group>(null),intro=useRef(0),clouds=useRef<THREE.Group>(null);
 const targetSky=new THREE.Color(storm?"#26364d":foggy?"#aab8bd":night?"#101d37":golden?theme.horizon:theme.sky);
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
  <color attach="background" args={[foggy?"#aab8bd":theme.sky]}/><fog attach="fog" args={[foggy?"#aab8bd":theme.sky,foggy?4:13,foggy?18:32]}/>
  <ambientLight intensity={night?.48:golden?1.1:1.35}/><directionalLight position={[-5,9,5]} intensity={night?.45:golden?2.0:2.4} color={golden?"#ffd2a0":season==="winter"?"#d9edff":"#fff2d8"}/><directionalLight position={[5,4,-4]} intensity={.65} color="#c9e5ff"/>
  {night&&<Stars radius={65} depth={45} count={1700} factor={2} fade speed={.35}/>}
  {!night&&<group ref={sun}><mesh><sphereGeometry args={[.72,32,32]}/><meshStandardMaterial color="#ffe4a5" emissive="#ffb75b" emissiveIntensity={1.8}/></mesh><mesh><sphereGeometry args={[1.5,24,24]}/><meshBasicMaterial color="#ffd18a" transparent opacity={.12}/></mesh></group>}
  {night&&<mesh position={[-4,4,-5]}><sphereGeometry args={[.48,32,24]}/><meshStandardMaterial color="#e7f0ff" emissive="#b8d5ff" emissiveIntensity={1.2}/></mesh>}
  <group position={[0,0,-5]}><Mountain position={[-7,-.1,0]} scale={[3.3,2.8,1]} season={season}/><Mountain position={[-3.7,.1,-.6]} scale={[3.8,3.5,1]} season={season}/><Mountain position={[.2,-.1,-.9]} scale={[4.5,3.7,1]} season={season}/><Mountain position={[5,-.05,-.5]} scale={[3.6,3.2,1]} season={season}/><Mountain position={[8,-.1,0]} scale={[3,2.7,1]} season={season}/></group>
  {foggy&&<FogBanks/>}
  {cloudy&&<group ref={clouds}><Cloud position={[-4,3,-3]} scale={storm?1.6:1.2} storm={storm}/><Cloud position={[1.5,3.7,-4]} scale={storm?1.8:1.1} storm={storm}/><Cloud position={[6,2.9,-3]} scale={.9} storm={storm}/></group>}
  <mesh ref={ground} rotation={[-Math.PI/2,0,0]} position={[0,-2.05,0]}><planeGeometry args={[200,200]}/><meshStandardMaterial color={theme.ground} roughness={1}/></mesh>
  <mesh ref={water} rotation={[-Math.PI/2,0,0]} position={[-.5,-1.99,-1.3]} scale={[3.9,1.3,1]}><circleGeometry args={[1,64]}/><meshStandardMaterial color={theme.water} roughness={.16} metalness={.18} transparent opacity={.94}/></mesh>
  <TerrainDetails season={season}/>
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
