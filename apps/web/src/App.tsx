import { useEffect, useState } from "react";
import { Activity, AudioLines, BrainCircuit, FlaskConical, GitBranch, Grid2X2, Orbit, Waves } from "lucide-react";
import { VisualLab } from "./components/visual-lab/VisualLab";
import { GamesLab } from "./components/games-lab/GamesLab";
import { AuditoryLab, GlobalMiniPlayer } from "./components/auditory-lab/AuditoryLab";
import { AudioProvider } from "./components/auditory-lab/AudioProvider";

const labs = [
  { id: "01", title: "Visual Lab", description: "Explore mathematical surfaces, 3D scenes and interactive graphics.", icon: Orbit, href: "#/visual-lab" },
  { id: "02", title: "Data Lab", description: "Turn raw data into something visible, useful and understandable.", icon: Grid2X2 },
  { id: "03", title: "Event Lab", description: "Experiment with event streams, Kafka and distributed systems.", icon: Activity },
  { id: "04", title: "AI Lab", description: "A space for models, agents, prompts and autonomous workflows.", icon: FlaskConical },
  { id: "05", title: "Games Lab", description: "Play strategy games against bots that analyze, learn and think ahead.", icon: BrainCircuit, href: "#/games-lab" },
  { id: "06", title: "Auditory Lab", description: "Listen to independent radio and explore sound in real time.", icon: AudioLines, href: "#/auditory-lab" },
];
const ideas = [["01", "Algorithm Visualizer", "ALGORITHMS"], ["02", "Workflow Lab", "PROCESS DESIGN"], ["03", "Backend Lab", "JAVA / SPRING"]];
function AppContent() {
  const [route, setRoute] = useState(window.location.hash);
  useEffect(() => {
    const updateRoute = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);
  if (route === "#/visual-lab") return <VisualLab onBack={() => { window.location.hash = ""; }} />;
  if (route === "#/games-lab") return <GamesLab onBack={() => { window.location.hash = ""; }} />;
  if (route === "#/auditory-lab") return <AuditoryLab onBack={() => { window.location.hash = ""; }} />;
  return <>
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#"><img src="/open-frame.svg" alt="Sandbox" className="h-10 w-10" /><span className="brand-name">SANDBOX</span></a>
        <div className="sidebar-section"><p className="eyebrow">WORKSPACE</p><a className="nav-item active" href="#overview"><Grid2X2 size={16}/> Overview</a><a className="nav-item" href="#roadmap"><GitBranch size={16}/> Roadmap</a></div>
        <div className="sidebar-section"><p className="eyebrow">LABS</p><a className="nav-item" href="#/visual-lab"><Orbit size={16}/> Visual Lab</a><a className="nav-item muted" href="#data-lab"><Grid2X2 size={16}/> Data Lab</a><a className="nav-item muted" href="#event-lab"><Waves size={16}/> Event Lab</a><a className="nav-item muted" href="#ai-lab"><FlaskConical size={16}/> AI Lab</a><a className="nav-item" href="#/games-lab"><BrainCircuit size={16}/> Games Lab</a><a className="nav-item" href="#/auditory-lab"><AudioLines size={16}/> Auditory Lab <span className="nav-index">NEW</span></a></div>
      </aside>
      <main className="main-content" id="overview">
        <section className="intro"><h1>A place to<br/><span>experiment.</span></h1><p className="intro-copy">Build things, break things, learn something new.</p></section>
        <section className="section-block" id="experiments"><div className="section-heading"><h2>Explore the labs</h2></div><div className="lab-grid">
          {labs.map(({id,title,description,icon:Icon,href})=><a className="lab-card" key={id} href={href} aria-disabled={!href}><div className="lab-card-heading"><h3>{title}</h3><Icon size={19} strokeWidth={1.5}/></div><p>{description}</p><div className="lab-card-footer"><span className="arrow">{href?"↗":"—"}</span></div></a>)}
        </div></section>
        <section className="section-block roadmap" id="roadmap"><div className="section-heading"><div><h2>Coming into focus</h2></div><span className="section-count">IDEA BACKLOG</span></div><div className="upcoming-list">{ideas.map(([id,name,category])=><div className="upcoming-item" key={id}><span className="upcoming-index">{id}</span><span className="upcoming-name">{name}</span><span className="upcoming-category">{category}</span><span className="upcoming-plus">+</span></div>)}</div></section>
      </main>
    </div>
  </>;
}
export default function App() {
  return <AudioProvider><AppContent/><GlobalMiniPlayer onOpen={() => { window.location.hash = "#/auditory-lab"; }}/></AudioProvider>;
}
