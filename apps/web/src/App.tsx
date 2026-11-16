import { Activity, AudioLines, Boxes, CircleDot, Command, FlaskConical, GitBranch, Grid2X2, Orbit, Radio, Waves } from "lucide-react";

const labs = [
  { id: "01", title: "Visual Lab", description: "Explore mathematical surfaces, 3D scenes and interactive graphics.", status: "READY TO EXPLORE", icon: Orbit },
  { id: "02", title: "Data Lab", description: "Turn raw data into something visible, useful and understandable.", status: "PLANNED", icon: Grid2X2 },
  { id: "03", title: "Event Lab", description: "Experiment with event streams, Kafka and distributed systems.", status: "PLANNED", icon: Activity },
  { id: "04", title: "AI Lab", description: "A space for models, agents, prompts and autonomous workflows.", status: "PLANNED", icon: FlaskConical },
];
const ideas = [
  ["01", "Algorithm Visualizer", "ALGORITHMS"],
  ["02", "Audio Lab", "AUDIO / SIGNALS"],
  ["03", "Workflow Lab", "PROCESS DESIGN"],
  ["04", "Backend Lab", "JAVA / SPRING"],
];

export default function App() {
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/"><span className="brand-mark">S<span>_</span></span><span className="brand-name">SANDBOX<span>_</span></span></a>
      <div className="sidebar-section"><p className="eyebrow">WORKSPACE</p><a className="nav-item active" href="#overview"><Grid2X2 size={16}/> Overview</a><a className="nav-item" href="#experiments"><Boxes size={16}/> Experiments</a><a className="nav-item" href="#roadmap"><GitBranch size={16}/> Roadmap</a></div>
      <div className="sidebar-section"><p className="eyebrow">LABS</p><a className="nav-item" href="#visual-lab"><Orbit size={16}/> Visual Lab <span className="nav-index">01</span></a><a className="nav-item muted" href="#data-lab"><Grid2X2 size={16}/> Data Lab <span className="nav-index">02</span></a><a className="nav-item muted" href="#event-lab"><Waves size={16}/> Event Lab <span className="nav-index">03</span></a><a className="nav-item muted" href="#ai-lab"><FlaskConical size={16}/> AI Lab <span className="nav-index">04</span></a></div>
      <div className="sidebar-bottom"><div className="system-state"><span className="state-dot"/> SYSTEM ONLINE</div><p className="sidebar-version">PERSONAL PLAYGROUND · V0.1</p></div>
    </aside>
    <main className="main-content" id="overview">
      <header className="topbar"><div className="breadcrumb"><span>WORKSPACE</span><span className="slash">/</span> OVERVIEW</div><div className="topbar-meta"><span>ENVIRONMENT</span><strong>LOCAL DEVELOPMENT</strong><Command size={15}/></div></header>
      <section className="intro"><p className="eyebrow">A PERSONAL TECHNICAL PLAYGROUND</p><h1>A place to<br/><span>experiment.</span></h1><p className="intro-copy">Curiosity is the roadmap. Build things, break things, learn something new. No finish line required.</p><div className="intro-coordinates"><span>OBJECTIVE: EXPLORE</span><span>STATUS: IN PROGRESS</span><span>EST. 2026</span></div></section>
      <section className="section-block" id="experiments"><div className="section-heading"><div><p className="eyebrow">01 — WORKSPACE</p><h2>Explore the labs</h2></div><span className="section-count">04 MODULES</span></div><div className="lab-grid">{labs.map(({id,title,description,status,icon:Icon})=><article className="lab-card" key={id}><div className="lab-card-top"><span className="lab-number">/{id}</span><Icon size={19} strokeWidth={1.5}/></div><div><h3>{title}</h3><p>{description}</p></div><div className="lab-card-footer"><span className={status==="READY TO EXPLORE"?"status-ready":""}><CircleDot size={11}/>{status}</span><span className="arrow">↗</span></div></article>)}</div></section>
      <section className="section-block roadmap" id="roadmap"><div className="section-heading"><div><p className="eyebrow">02 — ON THE RADAR</p><h2>Coming into focus</h2></div><span className="section-count">IDEA BACKLOG</span></div><div className="upcoming-list">{ideas.map(([id,name,category])=><div className="upcoming-item" key={id}><span className="upcoming-index">{id}</span><span className="upcoming-name">{name}</span><span className="upcoming-category">{category}</span><span className="upcoming-plus">+</span></div>)}</div></section>
      <footer className="footer"><span>SANDBOX_ — BUILT FOR CURIOSITY</span><span><Radio size={12}/> ALWAYS EXPERIMENTING</span></footer>
    </main>
  </div>;
}
