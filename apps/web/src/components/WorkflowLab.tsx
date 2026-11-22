import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Info, Play, RotateCcw, Workflow } from "lucide-react";

type NodeKind = "event" | "task" | "user" | "gateway" | "timer" | "error";
type ProcessNode = { id: string; x: number; y: number; kind: NodeKind; title: string; subtitle: string; detail: string; expression?: string };
type ProcessEdge = { id: string; d: string; label?: string; lx?: number; ly?: number };

const nodes: ProcessNode[] = [
  { id: "start", x: 72, y: 370, kind: "event", title: "Order received", subtitle: "Message start", detail: "A new order arrives from the shop. The message start event creates one process instance for this order." },
  { id: "capture", x: 230, y: 370, kind: "task", title: "Capture order", subtitle: "Service task", detail: "The system stores the order, checks required fields and calculates the total. This is an automated service task." },
  { id: "risk", x: 430, y: 370, kind: "gateway", title: "High-value order?", subtitle: "Exclusive gateway · XOR", detail: "An exclusive gateway chooses exactly one outgoing path. The conditions are evaluated from top to bottom; the default path is used if none matches.", expression: "order.total > 500" },
  { id: "review", x: 635, y: 190, kind: "user", title: "Manual review", subtitle: "User task", detail: "A person in the operations team reviews the order and either approves or rejects it. In Camunda, this task can be assigned to a user or candidate group.", expression: "order.total > 500" },
  { id: "auto", x: 635, y: 550, kind: "task", title: "Auto-approve", subtitle: "Service task", detail: "Orders up to €500 pass the risk check automatically. The system records the decision and continues.", expression: "order.total <= 500" },
  { id: "merge", x: 850, y: 370, kind: "gateway", title: "Continue", subtitle: "XOR merge", detail: "This exclusive gateway merges the alternative approval paths. Unlike a parallel gateway, it does not wait for multiple tokens." },
  { id: "payment", x: 1030, y: 370, kind: "task", title: "Charge payment", subtitle: "Service task", detail: "The process calls the payment provider. A successful response continues the order; a declined payment follows the error path." },
  { id: "paid", x: 1215, y: 370, kind: "gateway", title: "Payment OK?", subtitle: "Exclusive gateway · XOR", detail: "The payment result determines the next path. This is a data-based decision, not a user choice.", expression: "payment.status === 'APPROVED'" },
  { id: "failed", x: 1215, y: 690, kind: "error", title: "Payment declined", subtitle: "Error event", detail: "The payment provider declined the transaction. The process releases any temporary reservation, records the failure and ends without shipping." },
  { id: "split", x: 1400, y: 370, kind: "gateway", title: "Prepare order", subtitle: "Parallel gateway · AND", detail: "A parallel gateway creates two tokens. Both branches run independently and both must arrive at the matching join before the process continues." },
  { id: "stock", x: 1580, y: 190, kind: "task", title: "Reserve stock", subtitle: "Service task", detail: "The inventory service reserves the ordered items. If stock is unavailable, an error boundary event can trigger replenishment or compensation." },
  { id: "invoice", x: 1580, y: 550, kind: "task", title: "Create invoice", subtitle: "Service task", detail: "The billing service creates an invoice in parallel with stock reservation. Neither branch needs to wait for the other." },
  { id: "join", x: 1770, y: 370, kind: "gateway", title: "Both ready", subtitle: "Parallel gateway · AND", detail: "The parallel join synchronizes the two branches. It only emits a token after both stock reservation and invoice creation have completed." },
  { id: "dispatch", x: 1950, y: 370, kind: "task", title: "Dispatch order", subtitle: "Service task", detail: "The fulfilment service creates a shipment and sends a dispatch confirmation to the customer." },
  { id: "timer", x: 1950, y: 660, kind: "timer", title: "Delivery timeout", subtitle: "Boundary timer", detail: "A boundary timer models a time limit. If delivery confirmation does not arrive within 48 hours, the process can create an escalation task.", expression: "PT48H" },
  { id: "end", x: 2150, y: 370, kind: "event", title: "Order completed", subtitle: "End event", detail: "The process instance ends after dispatch. In a real process, a message or event could also confirm delivery." },
];

const edges: ProcessEdge[] = [
  { id: "e1", d: "M 96 370 H 198" },
  { id: "e2", d: "M 262 370 H 394" },
  { id: "e3", d: "M 454 346 C 500 346 520 190 603 190", label: "Yes · > €500", lx: 515, ly: 250 },
  { id: "e4", d: "M 454 394 C 500 394 520 550 603 550", label: "No · ≤ €500", lx: 515, ly: 490 },
  { id: "e5", d: "M 667 190 C 760 190 760 370 826 370", label: "Approved", lx: 748, ly: 255 },
  { id: "e6", d: "M 667 550 C 760 550 760 370 826 370" },
  { id: "e7", d: "M 882 370 H 998" },
  { id: "e8", d: "M 1062 370 H 1185" },
  { id: "e9", d: "M 1243 370 H 1368", label: "Approved", lx: 1305, ly: 350 },
  { id: "e10", d: "M 1215 402 V 656", label: "Declined", lx: 1260, ly: 535 },
  { id: "e11", d: "M 1432 346 C 1480 346 1490 190 1548 190" },
  { id: "e12", d: "M 1432 394 C 1480 394 1490 550 1548 550" },
  { id: "e13", d: "M 1612 190 C 1690 190 1690 370 1742 370" },
  { id: "e14", d: "M 1612 550 C 1690 550 1690 370 1742 370" },
  { id: "e15", d: "M 1798 370 H 1918" },
  { id: "e16", d: "M 1982 370 H 2120" },
  { id: "e17", d: "M 1950 402 V 626", label: "No confirmation", lx: 2020, ly: 525 },
];

const scenarios = [
  { id: "standard", label: "Standard order", description: "€129 order · automatic approval · payment accepted", path: ["start", "capture", "risk", "auto", "merge", "payment", "paid", "split", "stock", "invoice", "join", "dispatch", "end"] },
  { id: "manual", label: "Manual review", description: "€890 order · operations approval · payment accepted", path: ["start", "capture", "risk", "review", "merge", "payment", "paid", "split", "stock", "invoice", "join", "dispatch", "end"] },
  { id: "declined", label: "Payment declined", description: "€129 order · automatic approval · payment rejected", path: ["start", "capture", "risk", "auto", "merge", "payment", "paid", "failed"] },
];

const edgeByPair: Record<string, string> = {
  "start:capture": "e1", "capture:risk": "e2", "risk:review": "e3", "risk:auto": "e4",
  "review:merge": "e5", "auto:merge": "e6", "merge:payment": "e7", "payment:paid": "e8",
  "paid:split": "e9", "paid:failed": "e10", "split:stock": "e11", "split:invoice": "e12",
  "stock:join": "e13", "invoice:join": "e14", "join:dispatch": "e15", "dispatch:end": "e16",
};

function nodeShape(node: ProcessNode) {
  if (node.kind === "gateway") return <polygon points="0,-28 28,0 0,28 -28,0" />;
  if (node.kind === "event" || node.kind === "timer" || node.kind === "error") return <circle r="25" />;
  return <rect x="-57" y="-27" width="114" height="54" rx="7" />;
}

export function WorkflowLab({ onBack }: { onBack: () => void }) {
  const [scenarioId, setScenarioId] = useState("standard");
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState("risk");
  const [showConditions, setShowConditions] = useState(true);
  const scenario = scenarios.find(item => item.id === scenarioId) ?? scenarios[0];
  const currentId = scenario.path[Math.min(step, scenario.path.length - 1)];
  const selected = nodes.find(node => node.id === selectedId) ?? nodes[0];
  const activeNodes = useMemo(() => new Set(scenario.path.slice(0, step + 1)), [scenario, step]);
  const activeEdges = useMemo(() => new Set(scenario.path.slice(1, step + 1).map((id, index) => edgeByPair[`${scenario.path[index]}:${id}`]).filter(Boolean)), [scenario, step]);

  const chooseScenario = (id: string) => { setScenarioId(id); setStep(0); setSelectedId("start"); };
  const advance = () => { setStep(value => Math.min(value + 1, scenario.path.length - 1)); setSelectedId(scenario.path[Math.min(step + 1, scenario.path.length - 1)]); };
  const retreat = () => { setStep(value => Math.max(0, value - 1)); setSelectedId(scenario.path[Math.max(step - 1, 0)]); };

  return (
    <main className="workflow-lab">
      <header className="visual-topbar">
        <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Sandbox</button>
        <div className="visual-top-meta"><span>WORKSPACE</span><i /> WORKFLOW LAB</div>
      </header>

      <section className="visual-heading workflow-heading">
        <div><p className="visual-eyebrow">PROCESS DESIGN / BPMN 2.0</p><h1>Make work <span>flow.</span></h1><p className="visual-subtitle">Explore how a business process moves through tasks, events, decisions and parallel paths — one token at a time.</p></div>
        <div className="workflow-heading-mark"><Workflow size={30} strokeWidth={1.2} /><span>INTERACTIVE MODEL<br />BPMN 2.0 CONCEPTS</span></div>
      </section>

      <section className="workflow-intro-strip">
        <div><span className="visual-eyebrow">THE EXAMPLE</span><p>An online order moves from checkout to fulfilment. Depending on its value and payment result, the process takes different routes — then coordinates independent work before dispatch.</p></div>
        <div className="workflow-stats"><span><strong>17</strong> ELEMENTS</span><span><strong>3</strong> SCENARIOS</span><span><strong>2</strong> GATEWAY TYPES</span></div>
      </section>

      <section className="workflow-explorer">
        <div className="workflow-toolbar">
          <div><span className="workflow-live-dot" /> PROCESS EXPLORER <span className="workflow-version">ORDER-TO-DELIVERY / V1.0</span></div>
          <button className={showConditions ? "workflow-toggle active" : "workflow-toggle"} onClick={() => setShowConditions(value => !value)}><Info size={13} /> CONDITIONS {showConditions ? "ON" : "OFF"}</button>
        </div>
        <div className="workflow-scenario-bar">
          <div className="workflow-scenarios" role="group" aria-label="Choose process scenario">
            {scenarios.map(item => <button key={item.id} className={scenarioId === item.id ? "selected" : ""} onClick={() => chooseScenario(item.id)}>{item.label}</button>)}
          </div>
          <p>{scenario.description}</p>
        </div>
        <div className="workflow-canvas-scroll">
          <svg className="workflow-diagram" viewBox="0 0 2230 780" role="img" aria-label="Interactive BPMN order to delivery process diagram">
            <defs>
              <marker id="workflow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#777" /></marker>
              <marker id="workflow-arrow-active" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#E87535" /></marker>
            </defs>
            <g className="workflow-edges">
              {edges.map(edge => <g key={edge.id}>
                <path d={edge.d} className={activeEdges.has(edge.id) ? "workflow-edge active" : "workflow-edge"} markerEnd={activeEdges.has(edge.id) ? "url(#workflow-arrow-active)" : "url(#workflow-arrow)"} />
                {showConditions && edge.label && <text x={edge.lx} y={edge.ly} className="workflow-edge-label">{edge.label}</text>}
              </g>)}
            </g>
            {nodes.map(node => {
              const active = activeNodes.has(node.id);
              const current = currentId === node.id;
              const chosen = selectedId === node.id;
              return <g key={node.id} transform={`translate(${node.x} ${node.y})`} className={`workflow-node kind-${node.kind}${active ? " visited" : ""}${current ? " current" : ""}${chosen ? " chosen" : ""}`} role="button" tabIndex={0} aria-label={`${node.title}: ${node.subtitle}`} onClick={() => setSelectedId(node.id)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") setSelectedId(node.id); }}>
                {nodeShape(node)}
                {node.kind === "gateway" && <path d="M-9 -9 L9 9 M9 -9 L-9 9" className="workflow-gateway-mark" />}
                {node.kind === "user" && <><circle cx="0" cy="-8" r="5" className="workflow-symbol" /><path d="M-10 10 Q0 -3 10 10" className="workflow-symbol" /></>}
                {node.kind === "task" && <path d="M-46 -17 H-40 M-46 -17 V-11" className="workflow-task-mark" />}
                {node.kind === "timer" && <><path d="M-7 -30 H7 M0 -30 V-25" className="workflow-symbol" /><path d="M0 -12 V0 L8 5" className="workflow-symbol" /></>}
                {node.kind === "error" && <path d="M-7 -8 L0 -14 L7 -8 L4 2 L-4 2 Z M0 2 V9" className="workflow-symbol" />}
                <text y="48" className="workflow-node-title">{node.title}</text>
                <text y="64" className="workflow-node-subtitle">{node.subtitle}</text>
              </g>;
            })}
            {showConditions && <g className="workflow-condition-tags"><rect x="480" y="112" width="154" height="25" rx="4" /><text x="557" y="128" textAnchor="middle">order.total &gt; 500</text><rect x="480" y="610" width="154" height="25" rx="4" /><text x="557" y="626" textAnchor="middle">order.total ≤ 500</text><rect x="1280" y="300" width="120" height="24" rx="4" /><text x="1340" y="316" textAnchor="middle">payment approved</text></g>}
          </svg>
        </div>
        <div className="workflow-legend">
          <span><i className="legend-event" /> EVENT</span><span><i className="legend-task" /> TASK</span><span><i className="legend-gateway" /> GATEWAY</span><span><i className="legend-active" /> EXECUTED PATH</span><span><i className="legend-condition" /> CONDITION</span>
        </div>
        <div className="workflow-player">
          <div className="workflow-step-copy"><span>SIMULATION STEP</span><strong>{String(step + 1).padStart(2, "0")} <small>/ {String(scenario.path.length).padStart(2, "0")}</small></strong><div className="workflow-progress"><i style={{ width: `${(step + 1) / scenario.path.length * 100}%` }} /></div></div>
          <div className="workflow-player-actions"><button onClick={() => { setStep(0); setSelectedId("start"); }} title="Restart"><RotateCcw size={15} /> RESET</button><button onClick={retreat} disabled={step === 0} title="Previous step"><ArrowLeft size={15} /> BACK</button><button className="workflow-next" onClick={advance} disabled={step === scenario.path.length - 1}><Play size={13} /> {step === scenario.path.length - 1 ? "COMPLETED" : "NEXT STEP"} <ArrowRight size={14} /></button></div>
        </div>
      </section>

      <section className="workflow-detail-layout">
        <article className="workflow-detail-card">
          <div className="workflow-detail-header"><span className="visual-eyebrow">SELECTED ELEMENT / {selected.kind.toUpperCase()}</span><span className={activeNodes.has(selected.id) ? "workflow-detail-status active" : "workflow-detail-status"}>{activeNodes.has(selected.id) ? <><Check size={11} /> REACHED</> : <><CircleHelp size={11} /> NOT REACHED</>}</span></div>
          <h2>{selected.title}</h2><p>{selected.detail}</p>
          {selected.expression && <div className="workflow-expression"><span>EXPRESSION / CONDITION</span><code>{selected.expression}</code></div>}
          <div className="workflow-detail-foot"><span>ELEMENT ID</span><code>{selected.id}</code><span>CLICK ANY NODE TO INSPECT</span></div>
        </article>
        <aside className="workflow-current-card">
          <span className="visual-eyebrow">SIMULATION CURSOR</span><div className="workflow-current-icon"><Play size={15} fill="currentColor" /></div><h3>{nodes.find(node => node.id === currentId)?.title}</h3><p>The orange path shows the route taken so far. Move through the process to see where the token goes next.</p>
          <div className="workflow-current-meta"><span>SCENARIO</span><strong>{scenario.label}</strong></div>
        </aside>
      </section>

      <section className="workflow-learning">
        <div className="workflow-learning-heading"><p className="visual-eyebrow">READ THE DIAGRAM</p><h2>What are you looking at?</h2><p>In BPMN, the diagram is more than a flowchart: it describes who or what performs work, what triggers it, and how the process reacts to different outcomes.</p></div>
        <div className="workflow-concept-grid">
          <article><span className="concept-index">01 / FLOW</span><h3>Sequence flows</h3><p>Arrows define the order in which activities and events happen. A process token travels along these arrows.</p></article>
          <article><span className="concept-index">02 / DECISIONS</span><h3>Exclusive gateway (XOR)</h3><p>Chooses one route based on conditions. Here, the order value decides whether manual review is needed.</p></article>
          <article><span className="concept-index">03 / PARALLELISM</span><h3>Parallel gateway (AND)</h3><p>Splits one token into concurrent paths and synchronizes them later. The invoice and stock reservation happen independently.</p></article>
          <article><span className="concept-index">04 / WORK</span><h3>Tasks</h3><p>Rounded rectangles represent work. Service tasks are automated; user tasks require a human to complete them.</p></article>
          <article><span className="concept-index">05 / TIME</span><h3>Timer events</h3><p>A timer can wait until a date or duration, or interrupt a task when a deadline is exceeded.</p></article>
          <article><span className="concept-index">06 / EXCEPTIONS</span><h3>Error handling</h3><p>Errors and boundary events model exceptional outcomes such as a declined payment or unavailable stock.</p></article>
        </div>
      </section>

      <section className="workflow-camunda-note"><div><span className="visual-eyebrow">FROM MODEL TO EXECUTION</span><h2>How this maps to Camunda</h2></div><p>This is an interactive teaching model of BPMN concepts, not yet an executable Camunda process. In a real Camunda model, tasks are connected to workers or forms, gateway conditions read process variables, and the engine persists tokens and waits for messages, timers or human input.</p><a href="https://docs.camunda.io/docs/components/modeler/bpmn/" target="_blank" rel="noreferrer">EXPLORE CAMUNDA BPMN DOCS <ArrowRight size={13} /></a></section>

      <footer className="about-footer"><span>WORKFLOW LAB · BPMN 2.0 / LEARNING MODEL</span><button className="workflow-back-top" onClick={onBack}><ArrowLeft size={13} /> BACK TO OVERVIEW</button></footer>
    </main>
  );
}
