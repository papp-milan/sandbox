import { useEffect, useState } from "react";
import { Activity, AudioLines, BrainCircuit, FlaskConical, Grid2X2, Info, Orbit, PanelLeftClose, PanelLeftOpen, Waves } from "lucide-react";
import { VisualLab } from "./components/visual-lab/VisualLab";
import { GamesLab } from "./components/games-lab/GamesLab";
import { AuditoryLab, GlobalMiniPlayer } from "./components/auditory-lab/AuditoryLab";
import { AudioProvider } from "./components/auditory-lab/AudioProvider";
import { AboutPage } from "./components/AboutPage";

const labs = [
  { id: "01", title: "Visual Lab", description: "Explore mathematical surfaces, 3D scenes and interactive graphics.", icon: Orbit, path: "/visual-lab" },
  { id: "02", title: "Data Lab", description: "Turn raw data into something visible, useful and understandable.", icon: Grid2X2 },
  { id: "03", title: "Event Lab", description: "Experiment with event streams, Kafka and distributed systems.", icon: Activity },
  { id: "04", title: "AI Lab", description: "A space for models, agents, prompts and autonomous workflows.", icon: FlaskConical },
  { id: "05", title: "Games Lab", description: "Play strategy games against bots that analyze, learn and think ahead.", icon: BrainCircuit, path: "/games-lab" },
  { id: "06", title: "Auditory Lab", description: "Listen to independent radio and explore sound in real time.", icon: AudioLines, path: "/auditory-lab" },
];
const ideas = [
  ["01", "Algorithm Visualizer", "ALGORITHMS"],
  ["02", "Audio Lab", "AUDIO / SIGNALS"],
  ["03", "Workflow Lab", "PROCESS DESIGN"],
  ["04", "Backend Lab", "JAVA / SPRING"],
];
export function navigate(path: string) {
  const target = path.startsWith("/") ? path : `/${path}`;
  if (window.location.pathname !== target || window.location.search || window.location.hash) {
    window.history.pushState({}, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}
function AppContent() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/$/, "") || "/");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const updateRoute = () => setPath(window.location.pathname.replace(/\/$/, "") || "/");
    window.addEventListener("popstate", updateRoute);
    return () => window.removeEventListener("popstate", updateRoute);
  }, []);
  if (path === "/games-lab") return <GamesLab onBack={() => navigate("/")} />;
  if (path === "/visual-lab") return <VisualLab onBack={() => navigate("/")} />;
  if (path === "/auditory-lab") return <AuditoryLab onBack={() => navigate("/")} />;
  if (path === "/about") return <AboutPage onBack={() => navigate("/")} />;
  return (
    <div className={`app-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-brand-row">
          <a className="brand" href="/" onClick={e => { e.preventDefault(); navigate("/"); }} aria-label="Sandbox overview">
            <img src="/open-frame.svg" alt="" className="h-10 w-10" />
            <span className="brand-name">SANDBOX</span>
          </a>
        </div>
        <div className="sidebar-section">
          <p className="eyebrow">WORKSPACE</p>
          <a className="nav-item active" href="/" title="Overview" onClick={e => { e.preventDefault(); navigate("/"); }}><Grid2X2 size={16} /><span>Overview</span></a>
          <a className="nav-item" href="/about" title="About" onClick={e => { e.preventDefault(); navigate("/about"); }}><Info size={16} /><span>About</span></a>
        </div>
        <div className="sidebar-section">
          <p className="eyebrow">LABS</p>
          <a className="nav-item" href="/visual-lab" title="Visual Lab" onClick={e => { e.preventDefault(); navigate("/visual-lab"); }}><Orbit size={16} /><span>Visual Lab</span></a>
          <a className="nav-item muted" href="/data-lab" title="Data Lab"><Grid2X2 size={16} /><span>Data Lab</span></a>
          <a className="nav-item muted" href="/event-lab" title="Event Lab"><Waves size={16} /><span>Event Lab</span></a>
          <a className="nav-item muted" href="/ai-lab" title="AI Lab"><FlaskConical size={16} /><span>AI Lab</span></a>
          <a className="nav-item" href="/games-lab" title="Games Lab" onClick={e => { e.preventDefault(); navigate("/games-lab"); }}><BrainCircuit size={16} /><span>Games Lab</span></a>
          <a className="nav-item" href="/auditory-lab" title="Auditory Lab" onClick={e => { e.preventDefault(); navigate("/auditory-lab"); }}><AudioLines size={16} /><span>Auditory Lab</span></a>
        </div>
        <div className="sidebar-toggle-row">
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setSidebarCollapsed(value => !value)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </aside>
      <main className="main-content" id="overview">
        <section className="intro"><h1>A place to<br /><span>experiment.</span></h1><p className="intro-copy">Build things, break things, learn something new.</p></section>
        <section className="section-block" id="experiments">
          <div className="section-heading"><h2>Explore the labs</h2></div>
          <div className="lab-grid">
            {labs.map(({ id, title, description, icon: Icon, path: target }) => (
              <a className="lab-card" key={id} href={target || "/"} aria-disabled={!target} onClick={target ? e => { e.preventDefault(); navigate(target); } : e => e.preventDefault()}>
                <div className="lab-card-heading"><h3>{title}</h3><Icon size={19} strokeWidth={1.5} /></div>
                <p>{description}</p>
                <div className="lab-card-footer"><span className="arrow">{target ? "↗" : "—"}</span></div>
              </a>
            ))}
          </div>
        </section>
        <section className="section-block roadmap" id="roadmap">
          <div className="section-heading"><div><h2>Coming into focus</h2></div><span className="section-count">IDEA BACKLOG</span></div>
          <div className="upcoming-list">
            {ideas.map(([id, name, category]) => (
              <div className="upcoming-item" key={id}><span className="upcoming-index">{id}</span><span className="upcoming-name">{name}</span><span className="upcoming-category">{category}</span><span className="upcoming-plus">+</span></div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
export default function App() {
  return <AudioProvider><AppContent /><GlobalMiniPlayer onOpen={() => navigate("/auditory-lab")} /></AudioProvider>;
}
