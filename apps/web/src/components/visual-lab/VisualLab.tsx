import { useMemo, useState } from "react";
import { ArrowLeft, Orbit, RotateCcw, Scan, SlidersHorizontal } from "lucide-react";
import { GraphCanvas } from "./GraphCanvas";
import { WeatherLab } from "./WeatherLab";
import { compileSurfaceExpression } from "./graph-utils";

const presets = [
  { name: "Radial ripple", expression: "sin(sqrt(x*x+y*y))", note: "Concentric waves from the origin" },
  { name: "Sine wave", expression: "sin(x)*cos(y)", note: "A repeating wave field" },
  { name: "Gaussian", expression: "exp(-(x*x+y*y))", note: "A smooth bell-shaped surface" },
  { name: "Saddle", expression: "(x*x-y*y)/5", note: "A hyperbolic paraboloid" },
  { name: "Egg carton", expression: "cos(x)*cos(y)", note: "A periodic surface" },
];

type RenderMode = "combined" | "solid" | "wireframe";

export function VisualLab({ onBack }: { onBack: () => void }) {
  const [expression, setExpression] = useState(presets[0].expression);
  const [draft, setDraft] = useState(presets[0].expression);
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const [mode, setMode] = useState<RenderMode>("combined");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"graph" | "weather">("graph");

  if (activeTab === "weather") return <WeatherLab onBack={() => setActiveTab("graph")} />;

  const activePreset = presets.find((preset) => preset.expression === expression)?.name ?? "Custom function";
  const formulaValid = useMemo(() => {
    try { compileSurfaceExpression(draft); return true; } catch { return false; }
  }, [draft]);\n\n  if (activeTab === "weather") return <WeatherLab onBack={() => setActiveTab("graph")} />;

  const applyExpression = () => {
    try {
      compileSurfaceExpression(draft);
      setExpression(draft);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid expression.");
    }
  };

  const reset = () => {
    setAmplitude(1);
    setFrequency(1);
    setMode("combined");
  };

  return (
    <main className="visual-lab">
      <header className="visual-topbar">
        <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to Sandbox</button>
        <div className="visual-top-meta"><span>VISUAL LAB</span><i /> EXPERIMENT 001</div>
      </header>
      <div className="lab-switcher"><span>VISUAL LAB</span><button className="switch-active" onClick={() => setActiveTab("graph")}>GRAPH VISUALIZER</button><button onClick={() => setActiveTab("weather")}>WEATHER</button></div>
      <section className="visual-heading">
        <div>
          <p className="visual-eyebrow">MATHEMATICAL EXPLORATION</p>
          <h1>3D Graph <span>Visualizer</span></h1>
          <p className="visual-subtitle">Shape a function. Explore its surface.</p>
        </div>
        <div className="visual-coordinate"><Orbit size={16} /> X / Y / Z SPACE</div>
      </section>
      <section className="visual-workspace">
        <aside className="visual-controls">
          <div className="control-section">
            <div className="control-label"><span>FUNCTION</span><span className="control-state">{formulaValid ? "READY" : "INVALID"}</span></div>
            <form className="function-form" onSubmit={(event) => { event.preventDefault(); applyExpression(); }}>
              <label htmlFor="graph-expression">z = f(x, y)</label>
              <textarea id="graph-expression" value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} rows={3} />
              <button type="submit" className="apply-button">Apply function <span>↗</span></button>
              {error && <p className="function-error" role="alert">{error}</p>}
            </form>
            <p className="function-hint">Use x, y, +, −, *, /, ^ and functions like sin(), cos(), sqrt(), exp().</p>
          </div>
          <div className="control-section">
            <div className="control-label"><span>PRESETS</span><span className="control-muted">EXPLORE</span></div>
            <div className="preset-list">
              {presets.map((preset) => (
                <button key={preset.name} className={expression === preset.expression ? "preset-button active" : "preset-button"} onClick={() => { setDraft(preset.expression); setExpression(preset.expression); setError(""); }}>
                  <span>{preset.name}</span><small>{preset.note}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="control-section">
            <div className="control-label"><span>PARAMETERS</span><SlidersHorizontal size={13} /></div>
            <label className="range-control"><span>Amplitude</span><output>{amplitude.toFixed(1)}</output><input type="range" min="0.2" max="2.5" step="0.1" value={amplitude} onChange={(event) => setAmplitude(Number(event.target.value))} /></label>
            <label className="range-control"><span>Frequency</span><output>{frequency.toFixed(1)}</output><input type="range" min="0.4" max="2.5" step="0.1" value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} /></label>
            <p className="function-hint">Amplitude scales height. Frequency scales the surface detail.</p>
          </div>
          <button className="reset-button" onClick={reset}><RotateCcw size={13} /> Reset parameters</button>
        </aside>
        <div className="visual-stage">
          <div className="stage-toolbar">
            <div><span className="stage-dot" /> {activePreset}</div>
            <div className="render-modes" aria-label="Rendering mode">
              {(["combined", "solid", "wireframe"] as RenderMode[]).map((item) => (
                <button key={item} className={mode === item ? "selected" : ""} onClick={() => setMode(item)}>{item}</button>
              ))}
            </div>
          </div>
          <div className="graph-canvas">
            <GraphCanvas expression={expression} amplitude={amplitude} frequency={frequency} mode={mode} />
            <div className="canvas-hint"><Scan size={12} /> DRAG TO ROTATE <span>·</span> SCROLL TO ZOOM</div>
          </div>
          <div className="stage-footer"><span>DOMAIN&nbsp; −5 ≤ x, y ≤ 5</span><span>110 × 110 SEGMENTS</span><span>CLIENT-SIDE RENDERING</span></div>
        </div>
      </section>
      <footer className="visual-footer"><span>BUILT TO EXPLORE</span><span>THREE.JS / REACT THREE FIBER</span></footer>
    </main>
  );
}
