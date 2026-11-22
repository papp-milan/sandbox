import { ArrowLeft, Check, Circle, Compass, FlaskConical, Layers3 } from "lucide-react";

const platformItems = [
  { title: "Repository and application structure", done: true },
  { title: "React + TypeScript + Vite frontend", done: true },
  { title: "Monochrome Swiss-grid starting layout", done: true },
  { title: "Spring Boot API skeleton", done: true },
  { title: "Feature Explorer (idea / planned / in progress / done)", done: false },
  { title: "CI checks", done: false },
  { title: "Deploy at sandbox.pappmilan.com", done: false },
];

const labItems = [
  { title: "Visual Lab", description: "Interactive 3D mathematical surfaces and graphics", done: false, tag: "3D / GRAPHICS" },
  { title: "Audio Lab", description: "SomaFM radio, audio tools and visualizations", done: false, tag: "AUDIO / SIGNALS" },
  { title: "Algorithm Visualizer", description: "Sorting, pathfinding and data structures", done: false, tag: "ALGORITHMS" },
  { title: "Data Lab", description: "Data exploration and visualization", done: false, tag: "DATA" },
  { title: "Event Lab", description: "Kafka and event streaming", done: false, tag: "STREAMING" },
  { title: "AI Lab", description: "LLMs, agents and prompt experiments", done: false, tag: "AI / AGENTS" },
  { title: "Workflow Lab", description: "BPMN and Camunda", done: false, tag: "PROCESS DESIGN" },
  { title: "Backend Lab", description: "Spring Boot and API experiments", done: false, tag: "JAVA / SPRING" },
];

const principles = [
  "Add features when there is genuine curiosity.",
  "Keep experiments small and modular.",
  "Avoid infrastructure before it has a real use case.",
];

function Status({ done }: { done: boolean }) {
  return <span className={`roadmap-status ${done ? "is-done" : "is-planned"}`}>{done ? <><Check size={12} /> DONE</> : <><Circle size={9} /> PLANNED</>}</span>;
}

export function RoadmapPage({ onBack }: { onBack: () => void }) {
  const completed = platformItems.filter(item => item.done).length;
  return (
    <main className="roadmap-page">
      <div className="roadmap-topbar">
        <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Overview</button>
        <div className="visual-top-meta"><span>WORKSPACE</span><i /> ROADMAP</div>
      </div>

      <header className="roadmap-heading">
        <div>
          <p className="visual-eyebrow">SANDBOX / WHAT'S NEXT</p>
          <h1>Room to <span>explore.</span></h1>
          <p className="visual-subtitle">An evolving map of experiments, ideas and platform foundations. No fixed finish line — just the next interesting thing to build.</p>
        </div>
        <div className="roadmap-heading-mark"><Compass size={34} strokeWidth={1} /><span>ROADMAP<br />001 — OPEN ENDED</span></div>
      </header>

      <section className="roadmap-overview">
        <div className="roadmap-overview-label"><Layers3 size={15} /> PLATFORM FOUNDATION</div>
        <div className="roadmap-progress-copy"><strong>{completed.toString().padStart(2, "0")} <span>/ {platformItems.length.toString().padStart(2, "0")}</span></strong><small>FOUNDATION ITEMS COMPLETED</small></div>
        <div className="roadmap-progress-track"><span style={{ width: `${completed / platformItems.length * 100}%` }} /></div>
      </section>

      <section className="roadmap-section">
        <div className="roadmap-section-heading"><div><p className="visual-eyebrow">01 / FOUNDATION</p><h2>Platform</h2></div><span>{completed} / {platformItems.length} COMPLETE</span></div>
        <div className="roadmap-platform-list">
          {platformItems.map((item, index) => <div className="roadmap-platform-item" key={item.title}><span className="roadmap-item-index">{String(index + 1).padStart(2, "0")}</span><span className="roadmap-item-title">{item.title}</span><Status done={item.done} /></div>)}
        </div>
      </section>

      <section className="roadmap-section roadmap-labs-section">
        <div className="roadmap-section-heading"><div><p className="visual-eyebrow">02 / EXPERIMENTS</p><h2>Labs</h2></div><span>{labItems.length.toString().padStart(2, "0")} IDEAS IN THE MAP</span></div>
        <div className="roadmap-lab-grid">
          {labItems.map((item, index) => <article className="roadmap-lab-card" key={item.title}>
            <div className="roadmap-lab-card-top"><span>{String(index + 1).padStart(2, "0")}</span><Status done={item.done} /></div>
            <div className="roadmap-lab-card-content"><h3>{item.title}</h3><p>{item.description}</p></div>
            <div className="roadmap-lab-card-foot"><span>{item.tag}</span><FlaskConical size={16} strokeWidth={1.4} /></div>
          </article>)}
        </div>
      </section>

      <section className="roadmap-principles">
        <div><p className="visual-eyebrow">03 / HOW WE BUILD</p><h2>Guiding principles</h2></div>
        <div className="roadmap-principle-list">{principles.map((principle, index) => <div className="roadmap-principle" key={principle}><span>{String(index + 1).padStart(2, "0")}</span><p>{principle}</p></div>)}</div>
      </section>

      <footer className="roadmap-footer"><span>ROADMAP / LIVING DOCUMENT</span><button onClick={onBack}><ArrowLeft size={13} /> BACK TO OVERVIEW</button></footer>
    </main>
  );
}
