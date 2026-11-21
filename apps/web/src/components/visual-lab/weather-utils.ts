export type HourlyWeather = {
  time: string; temperature: number; apparent: number; precipitation: number;
  precipitationProbability: number; humidity: number; uv: number; wind: number;
  windDirection: number; pressure: number; visibility: number; code: number;
};
export type WeatherPayload = { latitude:number; longitude:number; timezone:string; current:HourlyWeather; hourly:HourlyWeather[]; daily:{ sunrise:string; sunset:string; max:number; min:number; code:number }[] };
export function weatherLabel(code:number) {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}
export function weatherKind(code:number):"clear"|"cloudy"|"fog"|"rain"|"snow"|"storm" {
  if (code === 0) return "clear";
  if (code <= 2) return "cloudy";
  if (code <= 48) return "fog";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rain";
  if (code <= 77 || code === 85 || code === 86) return "snow";
  return "storm";
}
export function formatHour(value:string) {
  // Open-Meteo returns wall-clock times in the requested location's timezone.
  // Parsing a timezone-less ISO string with Date would reinterpret it in the browser timezone.
  return value.slice(11,16) || "—";
}
export function formatDay(value:string) {
  const date=value.slice(0,10);
  return new Intl.DateTimeFormat(undefined,{weekday:"short"}).format(new Date(date+"T12:00:00"));
}
