import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Cloud, CloudRain, CloudSnow, CloudSun, Compass, Droplets, Gauge, LocateFixed, RefreshCw, Sun, Sunrise, Thermometer, Wind } from "lucide-react";
import { WeatherScene } from "./WeatherScene";
import { formatDay, formatHour, weatherLabel, weatherKind, type HourlyWeather, type WeatherPayload } from "./weather-utils";

const fallback = { latitude:48.1372, longitude:11.5756, label:"Munich, Germany" };
const endpoint = "https://api.open-meteo.com/v1/forecast";
function mapHour(data:Record<string,unknown>,i:number):HourlyWeather {
 const at=(key:string,def=0)=>Number((data[key] as (number[]|undefined))?.[i] ?? def);
 return {time:String((data.time as string[])[i]),temperature:at("temperature_2m"),apparent:at("apparent_temperature"),precipitation:at("precipitation"),precipitationProbability:at("precipitation_probability"),humidity:at("relative_humidity_2m"),uv:at("uv_index"),wind:at("wind_speed_10m"),windDirection:at("wind_direction_10m"),pressure:at("surface_pressure"),visibility:at("visibility",10000)/1000,code:at("weather_code")};
}
async function loadWeather(latitude:number,longitude:number,signal:AbortSignal):Promise<WeatherPayload>{
 const params=new URLSearchParams({latitude:String(latitude),longitude:String(longitude),timezone:"auto",forecast_days:"7",current:"temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",hourly:"temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,uv_index,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,weather_code",daily:"sunrise,sunset,temperature_2m_max,temperature_2m_min,weather_code"});
 const response=await fetch(endpoint+"?"+params,{signal});
 if(!response.ok) throw new Error("Weather service is currently unavailable.");
 const raw=await response.json();
 const currentTime=String(raw.current.time);
 const hourly=(raw.hourly.time as string[]).map((_:string,i:number)=>mapHour(raw.hourly,i));
 const nextIndex=hourly.findIndex(h=>h.time>currentTime);
 const currentIndex=Math.max(0,nextIndex<0?hourly.length-1:nextIndex-1);
 const current={...hourly[currentIndex],temperature:Number(raw.current.temperature_2m),apparent:Number(raw.current.apparent_temperature),humidity:Number(raw.current.relative_humidity_2m),precipitation:Number(raw.current.precipitation),wind:Number(raw.current.wind_speed_10m),windDirection:Number(raw.current.wind_direction_10m),pressure:Number(raw.current.surface_pressure),code:Number(raw.current.weather_code)};
 return {latitude:raw.latitude,longitude:raw.longitude,timezone:raw.timezone,current,hourly,daily:(raw.daily.time as string[]).map((_date:string,i:number)=>({sunrise:raw.daily.sunrise[i],sunset:raw.daily.sunset[i],max:raw.daily.temperature_2m_max[i],min:raw.daily.temperature_2m_min[i],code:raw.daily.weather_code[i]}))};
}
function WeatherIcon({code}:{code:number}) { const kind=weatherKind(code); const Icon=kind==="rain"||kind==="storm"?CloudRain:kind==="snow"?CloudSnow:kind==="clear"?Sun:kind==="cloudy"?CloudSun:Cloud; return <Icon size={17} strokeWidth={1.5}/>; }

export function WeatherLab({onBack}:{onBack:()=>void}) {
 const [position,setPosition]=useState({latitude:fallback.latitude,longitude:fallback.longitude,label:fallback.label});
 const [payload,setPayload]=useState<WeatherPayload|null>(null);
 const [selected,setSelected]=useState(0);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [locationNote,setLocationNote]=useState("Using Munich as a starting point");
 const [reload,setReload]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError("");
  loadWeather(position.latitude,position.longitude,controller.signal).then(result=>{
   setPayload(result);const index=Math.max(0,result.hourly.findIndex(h=>h.time===result.current.time));
   setSelected(index>=0?index:0);
  }).catch(cause=>{if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:"Unable to load weather.");})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[position.latitude,position.longitude,reload]);
 useEffect(()=>{
  if(!navigator.geolocation)return;
  navigator.geolocation.getCurrentPosition(({coords})=>{
   setPosition({latitude:coords.latitude,longitude:coords.longitude,label:"Your location"});
   setLocationNote("Using your current location");
  },()=>setLocationNote("Location permission unavailable — showing Munich"),{enableHighAccuracy:false,timeout:8000,maximumAge:300000});
 },[]);
 const locate=()=>{
  if(!navigator.geolocation){setLocationNote("Geolocation is not supported by this browser");return;}
  navigator.geolocation.getCurrentPosition(({coords})=>{
   setPosition({latitude:coords.latitude,longitude:coords.longitude,label:"Your location"});setLocationNote("Using your current location");
  },()=>setLocationNote("Location unavailable — showing Munich"),{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
 };
 const hours=payload?.hourly??[];
 const visible=useMemo(()=>hours.slice(selected,selected+24),[hours,selected]);
 const active=hours[selected]??payload?.current;
 const selectedHour=active?new Date(active.time).getHours():12;
 const daily=payload?.daily??[];
 const metrics=active?[
  {label:"Feels like",value:Math.round(active.apparent)+"°",icon:Thermometer},
  {label:"Precipitation",value:active.precipitation.toFixed(1)+" mm",icon:Droplets},
  {label:"Rain chance",value:Math.round(active.precipitationProbability)+"%",icon:CloudRain},
  {label:"UV index",value:active.uv.toFixed(1),icon:Sun},
  {label:"Wind",value:Math.round(active.wind)+" km/h",icon:Wind},
  {label:"Humidity",value:Math.round(active.humidity)+"%",icon:Droplets},
  {label:"Pressure",value:Math.round(active.pressure)+" hPa",icon:Gauge},
  {label:"Visibility",value:active.visibility.toFixed(1)+" km",icon:Compass}
 ]:[];
 return <main className="visual-lab weather-lab">
  <header className="visual-topbar"><button className="back-link" onClick={onBack}><ArrowLeft size={15}/> Back to Visual Lab</button><div className="visual-top-meta"><span>VISUAL LAB</span><i/> EXPERIMENT 002</div></header>
  <div className="lab-switcher"><span>VISUAL LAB</span><a href="#/visual-lab">GRAPH VISUALIZER</a><span className="switch-active">WEATHER</span></div>
  <section className="visual-heading weather-heading"><div><p className="visual-eyebrow">ATMOSPHERIC EXPLORATION</p><h1>Weather <span>World</span></h1><p className="visual-subtitle">A living snapshot of the atmosphere around you.</p></div><button className="location-button" onClick={locate}><LocateFixed size={14}/> Use my location</button></section>
  <section className="weather-layout">
   <div className="weather-scene-panel">
    <div className="weather-scene-meta"><span><i className="stage-dot"/> LIVE CONDITIONS</span><span>{position.label.toUpperCase()}</span></div>
    <div className="weather-scene">
     {active&&<WeatherScene weather={active} hour={selectedHour} />}
     <div className="weather-hero-copy">
      <span className="weather-hero-kicker">{active?weatherLabel(active.code).toUpperCase():"WEATHER LOADING"} · {active?formatHour(active.time):"—"}</span>
      <strong>{active?Math.round(active.temperature)+"°":"—"}</strong>
      <span className="weather-hero-feels">FEELS LIKE {active?Math.round(active.apparent)+"°":"—"}</span>
     </div>
     <div className="weather-hero-location">{position.label.toUpperCase()}<span>{selected===0?"LIVE CONDITIONS":"FORECAST EXPLORATION"}</span></div>
     {loading&&<div className="weather-loading">READING THE ATMOSPHERE…</div>}
    </div>
   </div>
   <aside className="weather-side">
    <div className="weather-side-head"><span>ATMOSPHERIC DATA</span><button onClick={()=>setReload(value=>value+1)} aria-label="Refresh weather"><RefreshCw size={13}/></button></div>
    <div className="weather-metrics">{metrics.map(({label,value,icon:Icon})=><div className="weather-metric" key={label}><Icon size={14}/><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="sun-cycle"><div><Sunrise size={15}/><span>Sunrise</span><strong>{daily[0]?.sunrise?formatHour(daily[0].sunrise):"—"}</strong></div><div><Sun size={15}/><span>Sunset</span><strong>{daily[0]?.sunset?formatHour(daily[0].sunset):"—"}</strong></div></div>
   </aside>
  </section>
  <section className="forecast-panel">
   <div className="forecast-heading"><div><p className="visual-eyebrow">MOVE THROUGH TIME</p><h2>Hourly forecast</h2></div><span>DRAG TO EXPLORE · 24 HOURS</span></div>
   {hours.length>0&&<><input aria-label="Select forecast hour" className="weather-timeline" type="range" min="0" max={Math.max(0,hours.length-1)} value={selected} onChange={e=>setSelected(Number(e.target.value))}/><div className="timeline-labels"><span>{formatHour(hours[0].time)}</span><span>SELECTED</span><span>{formatDay(hours[Math.min(hours.length-1,selected+23)].time)}</span></div><div className="hour-strip">{visible.map((h,i)=><button key={h.time} className={i===0?"hour-card selected":"hour-card"} onClick={()=>setSelected(selected+i)}><span>{formatHour(h.time)}</span><WeatherIcon code={h.code}/><strong>{Math.round(h.temperature)}°</strong><small>{Math.round(h.precipitationProbability)}%</small></button>)}</div></>}
  </section>
  <section className="forecast-panel week-panel"><div className="forecast-heading"><div><p className="visual-eyebrow">LOOK AHEAD</p><h2>Next 7 days</h2></div><span>DAILY OUTLOOK</span></div><div className="week-strip">{daily.map((d,i)=><div className="day-card" key={d.sunrise}><span>{i===0?"Today":formatDay(d.sunrise)}</span><WeatherIcon code={d.code}/><strong>{Math.round(d.max)}° <small>{Math.round(d.min)}°</small></strong></div>)}</div></section>
  {error&&<p className="weather-error" role="alert">{error} <button onClick={()=>setReload(value=>value+1)}>Try again</button></p>}
  <p className="weather-attribution">WEATHER DATA BY OPEN-METEO · {locationNote.toUpperCase()} · UPDATES ON REFRESH</p>
 </main>;
}
