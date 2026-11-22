import {useEffect, useMemo, useRef, useState} from "react";
import "./auditory-lab.css";
import {
    ArrowLeft,
    AudioLines,
    ChevronDown,
    ExternalLink,
    Heart,
    ListMusic,
    Maximize2,
    Pause,
    Play,
    Radio,
    Search,
    Volume2,
    VolumeX,
    Waves
} from "lucide-react";
import {useAudio, type Station} from "./AudioProvider";

type View = "radio" | "visualizer" | "explorer";
type Viz = "spectrum" | "waveform" | "circular" | "spectrogram";

function AudioCanvas({mode, analyser}: { mode: Viz; analyser: AnalyserNode | null }) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let raf = 0;
        const bins = new Uint8Array(analyser?.frequencyBinCount || 1024),
            wave = new Uint8Array(analyser?.fftSize || 2048);
        const draw = () => {
            const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
            if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
                canvas.width = Math.round(w * dpr);
                canvas.height = Math.round(h * dpr)
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            if (analyser) {
                analyser.getByteFrequencyData(bins);
                analyser.getByteTimeDomainData(wave)
            } else {
                bins.fill(0);
                wave.fill(128)
            }
            const accent = "#e87535";
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = accent;
            ctx.fillStyle = accent;
            if (mode === "waveform") {
                ctx.beginPath();
                for (let i = 0; i < wave.length; i++) {
                    const x = i / (wave.length - 1) * w, y = wave[i] / 255 * h;
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
                }
                ctx.stroke();
                ctx.globalAlpha = .12;
                ctx.lineTo(w, h);
                ctx.lineTo(0, h);
                ctx.fill();
                ctx.globalAlpha = 1
            } else if (mode === "circular") {
                const cx = w / 2, cy = h / 2, r = Math.min(w, h) * .23;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = "#343434";
                ctx.stroke();
                for (let i = 0; i < 100; i++) {
                    const v = bins[Math.floor(i / 100 * bins.length)] / 255;
                    const a = i / 100 * Math.PI * 2;
                    const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r,
                        x2 = cx + Math.cos(a) * (r + v * h * .23), y2 = cy + Math.sin(a) * (r + v * h * .23);
                    ctx.strokeStyle = accent;
                    ctx.globalAlpha = .35 + v * .65;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke()
                }
                ctx.globalAlpha = 1
            } else {
                const count = mode === "spectrogram" ? Math.min(180, bins.length) : Math.min(96, Math.floor(w / 5));
                const gap = mode === "spectrogram" ? 1 : 3;
                const bw = Math.max(1, (w - (count - 1) * gap) / count);
                for (let i = 0; i < count; i++) {
                    const idx = Math.floor(Math.pow(i / count, 1.7) * bins.length), v = bins[idx] / 255;
                    const bh = Math.max(2, v * h * .88), x = i * (bw + gap), y = h - bh;
                    if (mode === "spectrogram") {
                        ctx.fillStyle = `rgba(232,117,53,${.08 + v * .85})`;
                        ctx.fillRect(x, 0, bw, h)
                    } else {
                        ctx.globalAlpha = .28 + v * .72;
                        ctx.fillRect(x, y, bw, bh)
                    }
                }
                ctx.globalAlpha = 1
            }
            raf = requestAnimationFrame(draw)
        };
        draw();
        return () => cancelAnimationFrame(raf)
    }, [mode, analyser]);
    return <canvas ref={ref} className="auditory-canvas" aria-label={mode + " audio visualizer"}/>;
}

function StationButton({item, onPlay, active, favorite, onFavorite}: {
    item: Station;
    onPlay: () => void;
    active: boolean;
    favorite: boolean;
    onFavorite: () => void
}) {
    return <article className={active ? "auditory-station active" : "auditory-station"}>
        <button className="auditory-station-main" onClick={onPlay}><span className="station-play-icon">{active ?
            <Waves size={17}/> : <Play size={16}/>}</span><span
            className="station-copy"><strong>{item.title}</strong><small>{item.genre} · {item.description}</small></span>
        </button>
        <a className="station-external-link" href={"https://somafm.com/" + item.id + "/"} target="_blank" rel="noreferrer" aria-label={"Open " + item.title + " on SomaFM"} title="Open on SomaFM"><ExternalLink size={13}/></a>
        <button className={favorite ? "station-favorite selected" : "station-favorite"} onClick={onFavorite}
                aria-label={favorite ? "Remove favorite" : "Add favorite"}><Heart size={15}
                                                                                  fill={favorite ? "currentColor" : "none"}/>
        </button>
    </article>
}

export function AuditoryLab({onBack}: { onBack: () => void }) {
    const {
        stations,
        station,
        playing,
        loading,
        volume,
        muted,
        track,
        artist,
        error,
        analyser,
        favorites,
        play,
        pause,
        setVolume,
        toggleMute,
        toggleFavorite
    } = useAudio();
    const [view, setView] = useState<View>("radio"), [query, setQuery] = useState(""), [genre, setGenre] = useState("All"), [viz, setViz] = useState<Viz>("spectrum");
    const curatedIds = ["groovesalad", "dronezone", "defcon", "deepspaceone", "lush", "secretagent", "fluid", "cliqhop"];
    const curated = useMemo(() => curatedIds.map(id => stations.find(s => s.id === id)).filter(Boolean) as Station[], [stations]);
    const genres = useMemo(() => ["All", ...Array.from(new Set(stations.map(s => s.genre))).sort()], [stations]);
    const favoriteKeys = useMemo(() => new Set(favorites.map(value => value.toLocaleLowerCase().replace(/[^a-z0-9]/g, ""))), [favorites]);
    const isFavorite = (s: Station) => favoriteKeys.has(s.id.toLocaleLowerCase().replace(/[^a-z0-9]/g, "")) || favoriteKeys.has(s.title.toLocaleLowerCase().replace(/[^a-z0-9]/g, ""));
    const filtered = useMemo(() => stations.filter(s => (genre === "All" || genre === "Favorites" || s.genre.split("|").some(tag => tag.trim().toLowerCase() === genre.toLowerCase())) && (genre !== "Favorites" || isFavorite(s)) && (s.title + " " + s.genre + " " + s.description).toLowerCase().includes(query.toLowerCase())), [stations, genre, query, favoriteKeys]);
    const currentStation = station || curated[0];
    const choose = (s: Station) => {
        void play(s);
        setView("radio")
    };
    return <div className="auditory-lab">
        <header className="auditory-topbar">
            <button className="auditory-back" onClick={onBack}><ArrowLeft size={16}/> <span>Sandbox</span></button>
            <div className="auditory-brand"><Radio size={16}/> AUDITORY LAB</div>
            <div className="auditory-live"><i className={playing ? "is-live" : ""}/>{playing ? "ON AIR" : "READY"}</div>
        </header>
        <nav className="auditory-tabs" aria-label="Auditory Lab sections">{([{
            id: "radio",
            label: "Radio",
            icon: Radio
        }, {id: "visualizer", label: "Visualizer", icon: AudioLines}, {
            id: "explorer",
            label: "Station Explorer",
            icon: ListMusic
        }] as const).map(({id, label, icon: Icon}) => <button key={id} className={view === id ? "active" : ""}
                                                              onClick={() => setView(id)}><Icon size={15}/>{label}
        </button>)}</nav>
        {view === "radio" && <main className="auditory-radio-view">
            <section className="auditory-now">
                <div className="auditory-now-meta"><span className="auditory-kicker">SOMAFM / INTERNET RADIO</span><span
                    className="auditory-live-label"><i
                    className={playing ? "is-live" : ""}/>{playing ? "LIVE STREAM" : "SELECT A STATION"}</span></div>
                <div className="auditory-hero-grid">
                    <div className="auditory-station-title"><p className="auditory-kicker">NOW PLAYING</p>
                        <h1>{currentStation?.title || "Find your frequency."}</h1><p className="auditory-track">{track}
                            <span>—</span> {artist}</p><p
                            className="auditory-description">{currentStation?.description || "Independent internet radio from SomaFM."}</p>
                        <div className="auditory-controls">
                            <button className="auditory-play"
                                    onClick={() => playing ? pause() : void play(currentStation)} disabled={loading}>
                                <span>{loading ? "…" : playing ? <Pause size={19} fill="currentColor"/> :
                                    <Play size={19}
                                          fill="currentColor"/>}</span>{loading ? "CONNECTING" : playing ? "PAUSE" : "PLAY LIVE"}
                            </button>
                            <button className="auditory-icon-button"
                                    onClick={() => currentStation && toggleFavorite(currentStation.id)}
                                    aria-label="Toggle favorite"><Heart size={18}
                                                                        fill={currentStation && favorites.includes(currentStation.id) ? "currentColor" : "none"}/>
                            </button>
                            <button className="auditory-icon-button" onClick={() => setView("explorer")}
                                    aria-label="Browse stations"><ListMusic size={18}/></button>
                        </div>
                    </div>
                    <div className="auditory-hero-visual"><AudioCanvas mode="spectrum" analyser={analyser}/>
                        <div className="auditory-visual-caption">
                            <span>LIVE AUDIO ANALYSIS</span><span>{analyser ? "SIGNAL CONNECTED" : "WAITING FOR AUDIO"}</span>
                        </div>
                    </div>
                </div>
                <div className="auditory-volume">
                    <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>{muted || volume === 0 ?
                        <VolumeX size={17}/> : <Volume2 size={17}/>}</button>
                    <input aria-label="Volume" type="range" min="0" max="1" step=".01" value={muted ? 0 : volume}
                           onChange={e => setVolume(Number(e.target.value))}/><span>{Math.round((muted ? 0 : volume) * 100)}%</span>
                </div>
            </section>
            <section className="auditory-curated">
                <div className="auditory-section-head">
                    <div><p className="auditory-kicker">HAND-PICKED CHANNELS</p><h2>Find your frequency.</h2></div>
                    <button onClick={() => setView("explorer")}>ALL STATIONS <span>↗</span></button>
                </div>
                <div className="auditory-curated-grid">{curated.map(s => <StationButton key={s.id} item={s}
                                                                                        active={station?.id === s.id}
                                                                                        favorite={isFavorite(s)}
                                                                                        onFavorite={() => toggleFavorite(s.id)}
                                                                                        onPlay={() => choose(s)}/>)}</div>
            </section>
        </main>}
        {view === "visualizer" && <main className="auditory-visualizer-view">
            <div className="auditory-section-head">
                <div><p className="auditory-kicker">REAL-TIME SIGNAL PROCESSING</p><h1>Visualizer</h1><p
                    className="auditory-description">Visualizations are driven by the audio signal currently playing in
                    your browser.</p></div>
                <span className="auditory-signal-status"><i
                    className={analyser ? "is-live" : ""}/>{analyser ? "ANALYSER ACTIVE" : "PLAY A STATION FIRST"}</span>
            </div>
            <div className="auditory-viz-switch">{([{id: "spectrum", label: "Spectrum"}, {
                id: "waveform",
                label: "Waveform"
            }, {id: "circular", label: "Circular"}, {id: "spectrogram", label: "Spectrogram"}] as const).map(x =>
                <button key={x.id} onClick={() => setViz(x.id)}
                        className={viz === x.id ? "active" : ""}>{x.label}</button>)}</div>
            <section className="auditory-viz-panel">
                <div className="auditory-viz-panel-head">
                    <span>{viz.toUpperCase()} / 20 HZ — 20 KHZ</span><span>{station?.title || "NO STATION SELECTED"}</span>
                </div>
                <AudioCanvas mode={viz} analyser={analyser}/>
                <div className="auditory-viz-scale">
                    <span>20 Hz</span><span>100 Hz</span><span>1 kHz</span><span>10 kHz</span><span>20 kHz</span></div>
            </section>
            <p className="auditory-hint">Tip: Audio analysis starts after playback begins. If a stream blocks
                cross-origin analysis, playback can still work but the visualizer may remain unavailable.</p></main>}
        {view === "explorer" && <main className="auditory-explorer-view">
            <div className="auditory-section-head">
                <div><p className="auditory-kicker">SOMAFM CHANNEL DIRECTORY</p><h1>Station Explorer</h1><p
                    className="auditory-description">{stations.length} stations available · streaming directly from
                    SomaFM</p></div>
                <span className="auditory-signal-status">{favorites.length} SAVED</span></div>
            <div className="auditory-explorer-tools"><label className="auditory-search"><Search size={16}/><input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search stations, genres…"/></label><select value={genre}
                                                                        onChange={e => setGenre(e.target.value)}
                                                                        aria-label="Filter by genre">{genres.map(g =>
                <option key={g}>{g}</option>)}
                <option>Favorites</option>
            </select>
                <button className={genre === "Favorites" ? "active" : ""}
                        onClick={() => setGenre(genre === "Favorites" ? "All" : "Favorites")}><Heart
                    size={14}/> Favorites
                </button>
            </div>
            <div className="auditory-explorer-grid">{filtered.map(s => <StationButton key={s.id} item={s}
                                                                                      active={station?.id === s.id}
                                                                                      favorite={favorites.includes(s.id)}
                                                                                      onFavorite={() => toggleFavorite(s.id)}
                                                                                      onPlay={() => choose(s)}/>)}</div>
            {filtered.length === 0 && <p className="auditory-empty">No stations match this search.</p>}</main>}
        {error && <div className="auditory-error" role="status">{error}
            <button onClick={() => setView("explorer")}><ChevronDown size={14}/> Browse stations</button>
        </div>}
        <footer className="auditory-footer"><span>SOMAFM · INDEPENDENT INTERNET RADIO</span><span>DIRECT STREAM · NO RE-BROADCASTING</span>
        </footer>
    </div>;
}

export function GlobalMiniPlayer({onOpen}: { onOpen: () => void }) {
    const {station, playing, loading, track, artist, volume, muted, pause, play, setVolume, toggleMute} = useAudio();
    const [route, setRoute] = useState(window.location.pathname);
    const [expired, setExpired] = useState(false);
    useEffect(() => {
        const update = () => setRoute(window.location.pathname);
        window.addEventListener("popstate", update);
        return () => window.removeEventListener("popstate", update)
    }, []);
    useEffect(() => {
        if (playing || loading || !station) { setExpired(false); return; }
        const timeout = window.setTimeout(() => setExpired(true), 10000);
        return () => window.clearTimeout(timeout);
    }, [playing, loading, station?.id]);
    if (!station || expired || route === "/auditory-lab") return null;
    return <aside className={"auditory-mini-player " + (playing ? "is-playing" : "is-paused")}>
        <button className="mini-player-info" onClick={onOpen}><span
            className="mini-player-wave"><i/><i/><i/><i/><i/></span><span><strong>{station.title}</strong><small>{track} · {artist}</small></span>
        </button>
        <button className="mini-player-control" onClick={() => playing ? pause() : void play()}
                aria-label={playing ? "Pause" : "Play"}>{loading ? "…" : playing ?
            <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}</button>
        <button className="mini-player-control mini-volume-toggle" onClick={toggleMute}
                aria-label="Toggle mute">{muted || volume === 0 ? <VolumeX size={16}/> : <Volume2 size={16}/>}</button>
        <input className="mini-volume" aria-label="Volume" type="range" min="0" max="1" step=".01"
               value={muted ? 0 : volume} onChange={e => setVolume(Number(e.target.value))}/>
        <button className="mini-player-close" onClick={onOpen} aria-label="Open Auditory Lab"><Maximize2 size={15}/>
        </button>
        {!playing && !loading && <div className="mini-player-dismiss-track" aria-label="Player closes in 10 seconds"><span/></div>}
    </aside>;
}
