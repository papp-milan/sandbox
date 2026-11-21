import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Cloud, CloudRain, CloudSnow, CloudSun, Compass, Droplets, Gauge, LocateFixed, RefreshCw, Sun, Sunrise, Thermometer, Wind, Map, Play, Pause, ChevronLeft, ChevronRight, X, GitCompareArrows, Trees, Waves, CalendarDays } from "lucide-react";
import { WeatherScene } from "./WeatherScene";
import { formatHour, weatherLabel, weatherKind, type HourlyWeather, type WeatherPayload } from "./weather-utils";

const fallback={latitude:48.1372,longitude:11.5756,label:"Munich, Germany"};
const endpoint="https://api.open-meteo.com/v1/forecast";
const ensembleEndpoint="https://ensemble-api.open-meteo.com/v1/ensemble";
type DailyWeather={date:string;sunrise:string;sunset:string;max:number;min:number;code:number;precipitation:number;snowfall:number;wind:number;cloud:number;confidence:"forecast"|"ensemble"};
type RadarFrame={time:number;path:string};
type RadarManifest={host:string;radar:{past:RadarFrame[]}};
function mapHour(data:Record<string,unknown>,i:number):HourlyWeather {
 const at=(key:string,def=0)=>Number((data[key] as (number[]|undefined))?.[i]??def);
 return {time:String((data.time as string[])[i]),temperature:at("temperature_2m"),apparent:at("apparent_temperature"),precipitation:at("precipitation"),precipitationProbability:at("precipitation_probability"),humidity:at("relative_humidity_2m"),uv:at("uv_index"),wind:at("wind_speed_10m"),windDirection:at("wind_direction_10m"),pressure:at("surface_pressure"),visibility:at("visibility",10000)/1000,code:at("weather_code")};
}
function meanSeries(data:Record<string,unknown>,key:string):number[] {
 const arrays=Object.entries(data).filter(([name])=>name===key||name.startsWith(key+"_member")||name.startsWith(key+"_gfs")||name.startsWith(key+"_ncep")).map(([,value])=>value).filter((value):value is number[]=>Array.isArray(value)) as number[][];
 if(!arrays.length)return [];
 const length=arrays[0].length;
 return Array.from({length},(_,i)=>{const values=arrays.map(a=>a[i]).filter((v):v is number=>Number.isFinite(v));return values.length?values.reduce((a,b)=>a+b,0)/values.length:0;});
}
function inferredCode(snow:number,precip:number,hours:number,cloud:number,temp:number) {
 if(snow>.05|| (temp<=0&&precip>.3))return 71;
 if(precip>2||hours>4)return rainCode(precip);
 if(cloud>82)return 3;
 if(cloud>38)return 2;
 return 0;
}
function rainCode(precip:number){return precip>8?65:61;}
async function loadWeather(latitude:number,longitude:number,signal:AbortSignal):Promise<{payload:WeatherPayload;days:DailyWeather[]}>{
 const params=new URLSearchParams({latitude:String(latitude),longitude:String(longitude),timezone:"auto",forecast_days:"16",current:"temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",hourly:"temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,uv_index,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,weather_code",daily:"sunrise,sunset,temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,snowfall_sum,wind_speed_10m_max,cloud_cover_mean"});
 const ensembleParams=new URLSearchParams({latitude:String(latitude),longitude:String(longitude),timezone:"auto",models:"gfs05",forecast_days:"30",daily:"temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,precipitation_hours,wind_speed_10m_max,cloud_cover_mean"});
 const [response,extendedResponse]=await Promise.all([fetch(endpoint+"?"+params,{signal}),fetch(ensembleEndpoint+"?"+ensembleParams,{signal})]);
 if(!response.ok)throw new Error("Weather service is currently unavailable.");
 if(!extendedResponse.ok)throw new Error("The 30-day ensemble outlook is currently unavailable.");
 const [raw,extended]=await Promise.all([response.json(),extendedResponse.json()]);
 const currentTime=String(raw.current.time);
 const hourly=(raw.hourly.time as string[]).map((_:string,i:number)=>mapHour(raw.hourly,i));
 const nextIndex=hourly.findIndex(h=>h.time>currentTime);
 const currentIndex=Math.max(0,nextIndex<0?hourly.length-1:nextIndex-1);
 const current={...hourly[currentIndex],temperature:Number(raw.current.temperature_2m),apparent:Number(raw.current.apparent_temperature),humidity:Number(raw.current.relative_humidity_2m),precipitation:Number(raw.current.precipitation),wind:Number(raw.current.wind_speed_10m),windDirection:Number(raw.current.wind_direction_10m),pressure:Number(raw.current.surface_pressure),code:Number(raw.current.weather_code)};
 const primary=(raw.daily.time as string[]).map((date:string,i:number)=>({date,sunrise:raw.daily.sunrise[i],sunset:raw.daily.sunset[i],max:Number(raw.daily.temperature_2m_max[i]),min:Number(raw.daily.temperature_2m_min[i]),code:Number(raw.daily.weather_code[i]),precipitation:Number(raw.daily.precipitation_sum?.[i]??0),snowfall:Number(raw.daily.snowfall_sum?.[i]??0),wind:Number(raw.daily.wind_speed_10m_max?.[i]??0),cloud:Number(raw.daily.cloud_cover_mean?.[i]??0),confidence:"forecast" as const}));
 const ext=extended.daily as Record<string,unknown>;
 const dates=ext.time as string[];
 const max=meanSeries(ext,"temperature_2m_max"),min=meanSeries(ext,"temperature_2m_min"),precip=meanSeries(ext,"precipitation_sum"),snow=meanSeries(ext,"snowfall_sum"),hours=meanSeries(ext,"precipitation_hours"),wind=meanSeries(ext,"wind_speed_10m_max"),cloud=meanSeries(ext,"cloud_cover_mean");
 const near=primary.map(day=>({...day,confidence:"forecast" as const}));
 const extendedDays=dates.map((date:string,i:number)=>{
  const p=precip[i]??0,s=snow[i]??0,h=hours[i]??0,c=cloud[i]??0,t=max[i]??0;
  return {date,sunrise:"",sunset:"",max:t,min:min[i]??t,code:inferredCode(s,p,h,c,t),precipitation:p,snowfall:s,wind:wind[i]??0,cloud:c,confidence:"ensemble" as const};
 });
 const merged=extendedDays.map(day=>near.find(item=>item.date===day.date)??day);
 return {payload:{latitude:raw.latitude,longitude:raw.longitude,timezone:raw.timezone,current,hourly,daily:primary},days:merged};
}
function WeatherIcon({code}:{code:number}){const kind=weatherKind(code);const Icon=kind==="rain"||kind==="storm"?CloudRain:kind==="snow"?CloudSnow:kind==="clear"?Sun:kind==="cloudy"?CloudSun:Cloud;return <Icon size={18} strokeWidth={1.5}/>;}
function dayName(date:string){return new Intl.DateTimeFormat(undefined,{weekday:"short",day:"numeric",month:"short"}).format(new Date(date+"T12:00:00"));}
function worldPixel(lat:number,lon:number,z:number){
 const scale=256*2**z,clamped=Math.max(-85.05112878,Math.min(85.05112878,lat));
 const sin=Math.sin(clamped*Math.PI/180);
 return {x:(lon+180)/360*scale,y:(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*scale};
}
function RadarView({latitude,longitude,label}:{latitude:number;longitude:number;label:string}){
 const mapRef=useRef<HTMLDivElement>(null);
 const [manifest,setManifest]=useState<RadarManifest|null>(null),[frame,setFrame]=useState(0),[zoom,setZoom]=useState(5),[playing,setPlaying]=useState(false),[radarFailed,setRadarFailed]=useState(false),[size,setSize]=useState({width:960,height:410}),[pan,setPan]=useState({x:0,y:0});
 const [drag,setDrag]=useState<{x:number;y:number;panX:number;panY:number}|null>(null);
 useEffect(()=>{const el=mapRef.current;if(!el)return;const observer=new ResizeObserver(entries=>{const rect=entries[0]?.contentRect;if(rect)setSize({width:rect.width,height:rect.height});});observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>{const controller=new AbortController();fetch("https://api.rainviewer.com/public/weather-maps.json",{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error("Radar unavailable");return r.json();}).then(data=>{const valid=(data.radar?.past??[]).filter((item:RadarFrame)=>item?.path&&Number.isFinite(item.time));setManifest({...data,radar:{past:valid}});setFrame(Math.max(0,valid.length-1));setRadarFailed(false);}).catch(()=>{if(!controller.signal.aborted)setRadarFailed(true);});return()=>controller.abort();},[]);
 useEffect(()=>{if(!playing||!manifest?.radar.past.length)return;const timer=window.setInterval(()=>setFrame(v=>(v+1)%manifest.radar.past.length),900);return()=>window.clearInterval(timer);},[playing,manifest]);
 const frames=manifest?.radar.past??[],selected=frames[frame],center=worldPixel(latitude,longitude,zoom),centerX=center.x+pan.x,centerY=center.y+pan.y;
 const firstX=Math.floor((centerX-size.width/2)/256),lastX=Math.floor((centerX+size.width/2)/256),firstY=Math.floor((centerY-size.height/2)/256),lastY=Math.floor((centerY+size.height/2)/256);
 const tiles=Array.from({length:(lastX-firstX+1)*(lastY-firstY+1)},(_,i)=>({x:firstX+i%(lastX-firstX+1),y:firstY+Math.floor(i/(lastX-firstX+1))}));
 const tileX=(x:number)=>((x%(2**zoom))+(2**zoom))%(2**zoom);
 const pointerDown=(e:React.PointerEvent<HTMLDivElement>)=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);setDrag({x:e.clientX,y:e.clientY,panX:pan.x,panY:pan.y});};
 const pointerMove=(e:React.PointerEvent<HTMLDivElement>)=>{if(drag)setPan({x:drag.panX-(e.clientX-drag.x),y:drag.panY-(e.clientY-drag.y)});};
 const pointerUp=()=>setDrag(null);
 const changeZoom=(delta:number)=>{setZoom(v=>Math.max(3,Math.min(7,v+delta)));setPan({x:0,y:0});};
 return <div className="radar-panel">
  <div className="radar-toolbar"><div><span className="radar-live-dot"/>{selected?"PAST RADAR · 10 MIN INTERVALS":"RADAR DATA UNAVAILABLE"}</div><div className="radar-actions"><button onClick={()=>changeZoom(-1)} aria-label="Zoom out" disabled={zoom<=3}>−</button><span>ZOOM {zoom}</span><button onClick={()=>changeZoom(1)} aria-label="Zoom in" disabled={zoom>=7}>+</button></div></div>
  <div className="radar-map" ref={mapRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} style={{cursor:drag?"grabbing":"grab"}}>
   <div className="radar-tile-plane">{tiles.map(tile=>{const valid=tile.y>=0&&tile.y<2**zoom;const left=tile.x*256-(centerX-size.width/2),top=tile.y*256-(centerY-size.height/2),x=tileX(tile.x);const base="https://tile.openstreetmap.org/"+zoom+"/"+x+"/"+tile.y+".png";const overlay=selected&&manifest?manifest.host+selected.path+"/256/"+zoom+"/"+x+"/"+tile.y+"/2/1_0.png":"";return valid?<div className="radar-tile" key={tile.x+"-"+tile.y} style={{left,top}}><img src={base} alt="" draggable={false}/>{overlay&&<img className="radar-overlay" src={overlay} alt="" draggable={false} onError={()=>setRadarFailed(true)}/>}</div>:null;})}</div>
   <div className="radar-pin"><LocateFixed size={18}/><span>{label}</span></div>{radarFailed&&<div className="radar-warning">Radar overlay unavailable for this frame or area. Base map remains available.</div>}
  </div>
  <div className="radar-playback"><button onClick={()=>setPlaying(v=>!v)} aria-label={playing?"Pause radar":"Play radar"} disabled={!frames.length}>{playing?<Pause size={14}/>:<Play size={14}/>}</button><button onClick={()=>setFrame(v=>Math.max(0,v-1))} aria-label="Previous radar frame" disabled={!frames.length||frame===0}><ChevronLeft size={14}/></button><input aria-label="Radar time" type="range" min="0" max={Math.max(0,frames.length-1)} value={frame} disabled={!frames.length} onChange={e=>setFrame(Number(e.target.value))}/><button onClick={()=>setFrame(v=>Math.min(frames.length-1,v+1))} aria-label="Next radar frame" disabled={!frames.length||frame===frames.length-1}><ChevronRight size={14}/></button><span>{selected?new Date(selected.time*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"Loading…"}</span></div>
  <p className="radar-attribution">Map © OpenStreetMap · Radar © <a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer">RainViewer</a> · Past radar only · Drag to pan</p>
 </div>;
}
type LocationOption={name:string;latitude:number;longitude:number;country:string;admin1?:string};\ntype WeatherFilter="all"|"sun"|"clouds"|"rain"|"snow"|"storm";
export function WeatherLab({onBack,onGraphClick}:{onBack:()=>void;onGraphClick:()=>void}){
 const [position,setPosition]=useState({...fallback}),[payload,setPayload]=useState<WeatherPayload|null>(null),[days,setDays]=useState<DailyWeather[]>([]),[selected,setSelected]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState(""),[locationNote,setLocationNote]=useState("Using Munich as a starting point"),[reload,setReload]=useState(0),[weatherFilter,setWeatherFilter]=useState<WeatherFilter>("all"),[view,setView]=useState<"world"|"radar">("world"),[detail,setDetail]=useState<DailyWeather|null>(null),[compareMode,setCompareMode]=useState(false),[compare,setCompare]=useState<string[]>([]),[locationOpen,setLocationOpen]=useState(false),[locationQuery,setLocationQuery]=useState(""),[locationResults,setLocationResults]=useState<LocationOption[]>([]),[locationSearching,setLocationSearching]=useState(false),[locationError,setLocationError]=useState("");
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError("");loadWeather(position.latitude,position.longitude,controller.signal).then(result=>{setPayload(result.payload);setDays(result.days);const today=result.payload.hourly.filter(h=>h.time.slice(0,10)===result.payload.current.time.slice(0,10));const index=today.findIndex(h=>h.time===result.payload.current.time);setSelected(index>=0?index:0);}).catch(cause=>{if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:"Unable to load weather.");}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[position.latitude,position.longitude,reload]);
 useEffect(()=>{if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(({coords})=>{setPosition({latitude:coords.latitude,longitude:coords.longitude,label:"Your location"});setLocationNote("Using your current location");},()=>setLocationNote("Location permission unavailable — showing Munich"),{enableHighAccuracy:false,timeout:8000,maximumAge:300000});},[]);
 const locate=()=>{if(!navigator.geolocation){setLocationNote("Geolocation is not supported — showing Munich");setPosition({...fallback});return;}navigator.geolocation.getCurrentPosition(({coords})=>{setPosition({latitude:coords.latitude,longitude:coords.longitude,label:"Your location"});setLocationNote("Using your current location");setLocationOpen(false);},()=>{setPosition({...fallback});setLocationNote("Location permission unavailable — showing Munich");},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});};
 const searchLocation=async()=>{const query=locationQuery.trim();if(query.length<2){setLocationError("Enter at least two characters.");return;}setLocationSearching(true);setLocationError("");try{const params=new URLSearchParams({name:query,count:"6",language:"en",format:"json"});const response=await fetch("https://geocoding-api.open-meteo.com/v1/search?"+params);if(!response.ok)throw new Error("Location search is unavailable.");const data=await response.json();const results=(data.results??[]) as LocationOption[];setLocationResults(results);if(!results.length)setLocationError("No matching places found.");}catch(error){setLocationError(error instanceof Error?error.message:"Could not search locations.");}finally{setLocationSearching(false);}};
 const chooseLocation=(place:LocationOption)=>{setPosition({latitude:place.latitude,longitude:place.longitude,label:[place.name,place.admin1,place.country].filter(Boolean).join(", ")});setLocationNote("Location selected manually");setLocationOpen(false);setLocationResults([]);setLocationQuery("");setReload(v=>v+1);};
