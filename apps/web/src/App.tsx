import { useEffect, useState } from "react";
import {
  Activity,
  FlaskConical,
  BrainCircuit,
  GitBranch,
  Grid2X2,
  Orbit,
  Waves,
} from "lucide-react";
import { VisualLab } from "./components/visual-lab/VisualLab";
import { GamesLab } from "./components/games-lab/GamesLab";

const labs = [
  { id: "01", title: "Visual Lab", description: "Explore mathematical surfaces, 3D scenes and interactive graphics.", icon: Orbit },
  { id: "02", title: "Data Lab", description: "Turn raw data into something visible, useful and understandable.", icon: Grid2X2 },
  { id: "03", title: "Event Lab", description: "Experiment with event streams, Kafka and distributed systems.", icon: Activity },
  { id: "04", title: "AI Lab", description: "A space for models, agents, prompts and autonomous workflows.", icon: FlaskConical },
  { id: "05", title: "Games Lab", description: "Play strategy games against bots that analyze, learn and think ahead.", icon: BrainCircuit },
];

const ideas = [
  ["01", "Algorithm Visualizer", "ALGORITHMS"],
  ["02", "Audio Lab", "AUDIO / SIGNALS"],
  ["03", "Workflow Lab", "PROCESS DESIGN"],
  ["04", "Backend Lab", "JAVA / SPRING"],
];

export default function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const updateRoute = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  if (route === "#/games-lab") {
    return <GamesLab onBack={() => { window.location.hash = ""; }} />;
  }

  if (route === "#/visual-lab") {
    return <VisualLab onBack={() => { window.location.hash = ""; }} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <img src="/open-frame.svg" alt="Sandbox" className="h-10 w-10" />
          <span className="brand-name">SANDBOX</span>
        </a>

        <div className="sidebar-section">
          <p className="eyebrow">WORKSPACE</p>
          <a className="nav-item active" href="#overview"><Grid2X2 size={16} /> Overview</a>
          <a className="nav-item" href="#roadmap"><GitBranch size={16} /> Roadmap</a>
        </div>

        <div className="sidebar-section">
          <p className="eyebrow">LABS</p>
          <a className="nav-item" href="#/visual-lab"><Orbit size={16} /> Visual Lab</a>
          <a className="nav-item muted" href="#data-lab"><Grid2X2 size={16} /> Data Lab</a>
          <a className="nav-item muted" href="#event-lab"><Waves size={16} /> Event Lab</a>
          <a className="nav-item muted" href="#ai-lab"><FlaskConical size={16} /> AI Lab</a>
          <a className="nav-item" href="#/games-lab"><BrainCircuit size={16} /> Games Lab <span className="nav-index">NEW</span></a>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <section className="intro">
          <h1>A place to<br /><span>experiment.</span></h1>
          <p className="intro-copy">Build things, break things, learn something new.</p>
        </section>

        <section className="section-block" id="experiments">
          <div className="section-heading"><h2>Explore the labs</h2></div>
          <div className="lab-grid">
            {labs.map(({ id, title, description, icon: Icon }) => (
              <a className="lab-card" key={id} href={title === "Visual Lab" ? "#/visual-lab" : title === "Games Lab" ? "#/games-lab" : undefined} aria-disabled={title !== "Visual Lab" && title !== "Games Lab"}>
                <div className="lab-card-heading"><h3>{title}</h3><Icon size={19} strokeWidth={1.5} /></div>
                <p>{description}</p>
                <div className="lab-card-footer"><span className="arrow">↗</span></div>
              </a>
            ))}
          </div>
        </section>

        <section className="section-block roadmap" id="roadmap">
          <div className="section-heading">
            <div><h2>Coming into focus</h2></div>
            <span className="section-count">IDEA BACKLOG</span>
          </div>
          <div className="upcoming-list">
            {ideas.map(([id, name, category]) => (
              <div className="upcoming-item" key={id}>
                <span className="upcoming-index">{id}</span>
                <span className="upcoming-name">{name}</span>
                <span className="upcoming-category">{category}</span>
                <span className="upcoming-plus">+</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
