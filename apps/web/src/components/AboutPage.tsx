import { ArrowUpRight, CloudSun, Code2, Cpu, Database, ExternalLink, Layers3 } from "lucide-react";

type Resource = { name: string; role: string; url: string; note?: string };
type Group = { title: string; intro: string; icon: typeof Code2; items: Resource[] };

const groups: Group[] = [
  {
    title: "Core platform",
    intro: "The foundation used to build and run Sandbox.",
    icon: Code2,
    items: [
      { name: "React 19", role: "UI framework", url: "https://react.dev/", note: "Component-based interface and state." },
      { name: "TypeScript", role: "Language", url: "https://www.typescriptlang.org/", note: "Static types across the frontend." },
      { name: "Vite", role: "Build tooling", url: "https://vite.dev/", note: "Development server and production builds." },
      { name: "Tailwind CSS v4", role: "Styling", url: "https://tailwindcss.com/", note: "Utility-first styling." },
      { name: "Lucide", role: "Icons", url: "https://lucide.dev/", note: "Consistent interface icon set." },
      { name: "npm workspaces", role: "Monorepo", url: "https://docs.npmjs.com/cli/using-npm/workspaces", note: "Workspace management from the repository root." },
    ],
  },
  {
    title: "Graphics & interaction",
    intro: "Browser-native APIs and rendering libraries behind the interactive experiments.",
    icon: Layers3,
    items: [
      { name: "Three.js", role: "3D engine", url: "https://threejs.org/", note: "WebGL-powered 3D scenes, geometry, materials and lighting." },
      { name: "React Three Fiber", role: "React renderer", url: "https://r3f.docs.pmnd.rs/", note: "Declarative Three.js scenes in React." },
      { name: "Drei", role: "3D helpers", url: "https://github.com/pmndrs/drei", note: "Reusable controls, environment and scene helpers." },
      { name: "Web Audio API", role: "Audio analysis", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API", note: "AudioContext and AnalyserNode read live frequency and waveform data." },
      { name: "Canvas 2D", role: "2D rendering", url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API", note: "Lightweight spectrum and waveform visualizations." },
      { name: "WebGL", role: "Graphics API", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API", note: "Hardware-accelerated graphics in the browser." },
    ],
  },
  {
    title: "External data & services",
    intro: "Third-party services queried directly by the browser for live content.",
    icon: CloudSun,
    items: [
      { name: "SomaFM", role: "Internet radio", url: "https://somafm.com/", note: "Channel directory, now-playing metadata, playlists and live MP3 streams." },
      { name: "Open-Meteo Forecast API", role: "Weather data", url: "https://open-meteo.com/en/docs", note: "Current conditions, hourly and daily forecasts." },
      { name: "Open-Meteo Ensemble API", role: "Extended forecast", url: "https://open-meteo.com/en/docs/ensemble-api", note: "Ensemble outlook for longer-range forecast context." },
      { name: "Open-Meteo Geocoding API", role: "Place search", url: "https://open-meteo.com/en/docs/geocoding-api", note: "Converts a place name into coordinates for weather lookup." },
      { name: "RainViewer", role: "Precipitation radar", url: "https://www.rainviewer.com/", note: "Radar frame manifest and map overlay tiles." },
      { name: "OpenStreetMap", role: "Map tiles", url: "https://www.openstreetmap.org/copyright", note: "Base map tiles and map data attribution." },
      { name: "Google Fonts", role: "Typography", url: "https://fonts.google.com/", note: "Space Grotesk and DM Mono." },
    ],
  },
  {
    title: "Backend & delivery",
    intro: "The backend foundation and how the current app is shipped.",
    icon: Database,
    items: [
      { name: "Java 21", role: "Backend language", url: "https://openjdk.org/projects/jdk/21/" },
      { name: "Spring Boot 3.5", role: "Backend framework", url: "https://spring.io/projects/spring-boot", note: "REST API and Actuator health endpoint." },
      { name: "Maven", role: "Build tooling", url: "https://maven.apache.org/", note: "Backend dependency and build management." },
      { name: "GitHub Actions", role: "CI/CD", url: "https://github.com/features/actions", note: "Typecheck, frontend build and deployment workflow." },
      { name: "GitHub Pages", role: "Hosting", url: "https://pages.github.com/", note: "Static frontend hosting for sandbox.pappmilan.com." },
    ],
  },
];


const palette = [
  { name: "Spanish Orange", hex: "#E87535", role: "Primary accent · active states and key actions" },
  { name: "Orange Light", hex: "#F18A4B", role: "Accent highlight and hover" },
  { name: "Orange Soft", hex: "#F18A4B", role: "Warm accent tint" },
  { name: "Canvas", hex: "#0A0A0A", role: "Main application background" },
  { name: "Surface", hex: "#111111", role: "Raised surfaces and hover backgrounds" },
  { name: "Surface Deep", hex: "#171412", role: "Warm dark surface" },
  { name: "Border", hex: "#292929", role: "Subtle dividers and outlines" },
  { name: "Text", hex: "#EDEDED", role: "Primary text" },
  { name: "Muted", hex: "#777777", role: "Secondary text and metadata" },
];

const principles = [
  ["Browser-first", "External data and media are fetched by the frontend where practical. No audio proxy or radio rebroadcasting."],
  ["Small by default", "Infrastructure is introduced when an experiment needs it, not pre-emptively."],
  ["Transparent sources", "External services and technical building blocks are listed here so their role is easy to trace."],
];

function ResourceGroup({ group }: { group: Group }) {
  const Icon = group.icon;
  return (
    <section className="about-group">
      <div className="about-group-heading">
        <div className="about-group-icon"><Icon size={17} /></div>
        <div><h2>{group.title}</h2><p>{group.intro}</p></div>
        <span className="about-count">{String(group.items.length).padStart(2, "0")}</span>
      </div>
      <div className="about-resource-list">
        {group.items.map(item => (
          <a className="about-resource" key={item.name} href={item.url} target="_blank" rel="noreferrer">
            <span className="about-resource-main"><strong>{item.name}</strong><small>{item.note || item.role}</small></span>
            <span className="about-resource-role">{item.role}</span>
            <ArrowUpRight size={14} className="about-resource-link" />
          </a>
        ))}
      </div>
    </section>
  );
}

export function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="about-page">
      <header className="visual-topbar">
        <button className="back-link" onClick={onBack}>← <span>Sandbox</span></button>
        <div className="visual-top-meta"><span className="about-live-dot" /> ABOUT SANDBOX</div>
        <span className="visual-top-meta">STACK / SOURCES</span>
      </header>
      <section className="visual-heading about-heading">
        <div><p className="visual-eyebrow">THE BUILDING BLOCKS</p><h1>About <span>Sandbox.</span></h1><p className="visual-subtitle">The technologies, services and browser capabilities behind the experiments.</p></div>
        <div className="about-version">TECHNICAL OVERVIEW<br /><strong>LIVE DOCUMENT</strong></div>
      </section>
      <section className="about-intro-strip">
        <div><span className="visual-eyebrow">WHAT IS THIS?</span><p>Sandbox is a personal technical playground: a collection of small experiments built with web technologies, graphics tools and external data sources.</p></div>
        <div className="about-intro-mark"><Cpu size={24} /><span>BUILT TO EXPLORE</span></div>
      </section>
      <div className="about-groups">
        {groups.map(group => <ResourceGroup key={group.title} group={group} />)}
      </div>

      <section className="about-palette">
        <div className="about-palette-heading">
          <p className="visual-eyebrow">VISUAL SYSTEM</p>
          <h2>Color palette</h2>
          <p>The core interface colors used across Sandbox. Hex values are shown for easy reuse.</p>
        </div>
        <div className="about-palette-grid">
          {palette.map(color => (
            <div className="about-color" key={color.hex + color.name}>
              <span className="about-color-swatch" style={{ backgroundColor: color.hex }} />
              <div className="about-color-details">
                <strong>{color.name}</strong>
                <code>{color.hex}</code>
                <small>{color.role}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-principles">
        <div className="about-principles-heading"><p className="visual-eyebrow">ENGINEERING NOTES</p><h2>How Sandbox is put together</h2></div>
        <div className="about-principle-list">
          {principles.map(([title, body], index) => <div className="about-principle" key={title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><p>{body}</p></div>)}
        </div>
      </section>
      <footer className="about-footer"><span>SANDBOX · A PLACE TO EXPERIMENT</span><a href="https://github.com/papp-milan/sandbox" target="_blank" rel="noreferrer">SOURCE CODE <ExternalLink size={11}/></a></footer>
    </main>
  );
}
