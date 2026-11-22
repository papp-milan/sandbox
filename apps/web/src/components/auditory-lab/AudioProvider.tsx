import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode} from "react";

export type Station = {
    id: string;
    title: string;
    genre: string;
    description: string;
    listeners?: number;
    bitrate?: number;
    playlists?: { url?: string; format?: string; quality?: string }[]
};
type AudioState = {
    stations: Station[];
    station: Station | null;
    playing: boolean;
    loading: boolean;
    volume: number;
    muted: boolean;
    track: string;
    artist: string;
    error: string;
    analyser: AnalyserNode | null;
    favorites: string[];
    play: (station?: Station) => Promise<void>;
    pause: () => void;
    setVolume: (v: number) => void;
    toggleMute: () => void;
    toggleFavorite: (id: string) => void;
};
const curated: Station[] = [
    {
        id: "groovesalad",
        title: "Groove Salad",
        genre: "Downtempo",
        description: "A nicely chilled plate of ambient and downtempo electronica."
    },
    {
        id: "dronezone",
        title: "Drone Zone",
        genre: "Ambient",
        description: "Atmospheric textures with no beats, vocals or commercials."
    },
    {
        id: "defcon",
        title: "DEF CON Radio",
        genre: "Electronic",
        description: "Music for hacking. Electronic, industrial and dark beats."
    },
    {
        id: "deepspaceone",
        title: "Deep Space One",
        genre: "Ambient",
        description: "Deep ambient electronic space music."
    },
    {id: "lush", title: "Lush", genre: "Chill", description: "Sensuous and mellow vocals, mostly female."},
    {
        id: "secretagent",
        title: "Secret Agent",
        genre: "Lounge",
        description: "The soundtrack for your stylish, mysterious life."
    },
    {id: "fluid", title: "Fluid", genre: "Downtempo", description: "A smooth mix of liquid drum and bass."},
    {
        id: "cliqhop",
        title: "cliqhop idm",
        genre: "IDM",
        description: "Intelligent dance music, glitch and leftfield beats."
    },
    {id: "indiepop", title: "Indie Pop Rocks!", genre: "Indie", description: "New and classic indie pop."},
    {id: "metal", title: "Metal Detector", genre: "Rock", description: "Heavy metal, from classic to modern."},
];
const AudioContextState = createContext<AudioState | null>(null);

export function AudioProvider({children}: { children: ReactNode }) {
    const audioRef = useRef<HTMLAudioElement>(null), contextRef = useRef<AudioContext | null>(null),
        sourceRef = useRef<MediaElementAudioSourceNode | null>(null), metaTimer = useRef<number | undefined>(undefined);
    const [stations, setStations] = useState<Station[]>(curated), [station, setStation] = useState<Station | null>(null), [playing, setPlaying] = useState(false), [loading, setLoading] = useState(false), [volume, setVolumeState] = useState(.40), [muted, setMuted] = useState(false), [track, setTrack] = useState("Live stream"), [artist, setArtist] = useState("SomaFM"), [error, setError] = useState(""), [analyser, setAnalyser] = useState<AnalyserNode | null>(null), [favorites, setFavorites] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem("auditory-favorites") || "[]")
        } catch {
            return []
        }
    });
    useEffect(() => {
        let active = true;
        fetch("https://api.somafm.com/channels.json").then(r => {
            if (!r.ok) throw new Error("Station list unavailable");
            return r.json()
        }).then(data => {
            const rows = Array.isArray(data) ? data : data.channels || [];
            if (!active) return;
            const all: Station[] = rows.map((x: any) => ({
                id: String(x.id),
                title: x.title || x.name || String(x.id),
                genre: x.genre || "Other",
                description: x.description || x.listeners || "SomaFM live radio",
                listeners: Number(x.listeners) || undefined,
                bitrate: Number(x.bitrate) || 128,
                playlists: x.playlists || []
            }));
            if (all.length) setStations(all)
        }).catch(() => { /* curated stations remain available */
        });
        return () => {
            active = false
        }
    }, []);
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.muted = muted
        }
    }, [volume, muted]);
    useEffect(() => {
        localStorage.setItem("auditory-favorites", JSON.stringify(favorites))
    }, [favorites]);
    const refreshMetadata = useCallback(async (id: string) => {
        try {
            const r = await fetch(`https://somafm.com/songs/${id}.json`, {cache: "no-store"});
            if (!r.ok) return;
            const d = await r.json();
            const song = d.song || d.songs?.[0] || d;
            if (song.title) setTrack(song.title);
            if (song.artist) setArtist(song.artist); else if (song.album) setArtist(song.album)
        } catch {/* Metadata is optional; playback is independent. */
        }
    }, []);
    const resolveStreamUrl = useCallback(async (target: Station) => {
        const playlist = target.playlists?.filter(p => p.url && p.format?.toLowerCase() === "mp3").sort((a, b) => {
            const rank = (q?: string) => q === "highest" ? 3 : q === "high" ? 2 : q === "low" ? 1 : 0;
            return rank(b.quality) - rank(a.quality)
        })[0];
        if (playlist?.url) {
            try {
                const response = await fetch(playlist.url, {cache: "no-store"});
                if (response.ok) {
                    const body = await response.text();
                    const match = body.match(/^File\d+=(https?:\/\/[^\s\r\n]+)/im);
                    if (match?.[1]) return match[1].trim();
                }
            } catch {/* Fall back to a direct SomaFM stream below. */
            }
        }
        return `https://ice1.somafm.com/${target.id}-128-mp3`;
    }, []);
    const play = useCallback(async (next?: Station) => {
        const target = next || station || stations[0];
        if (!target) return;
        const audio = audioRef.current;
        if (!audio) return;
        setError("");
        const changing = !!next || target.id !== station?.id;
        if (changing) {
            setStation(target);
            setTrack("Connecting to stream…");
            setArtist(target.title);
            setLoading(true);
            audio.pause();
            audio.crossOrigin = "anonymous";
            audio.removeAttribute("src");
            audio.load()
        }
        try {
            const streamUrl = changing ? await resolveStreamUrl(target) : audio.currentSrc || audio.src;
            if (!streamUrl) throw new Error("Für diesen Sender wurde keine Stream-Adresse gefunden.");
            if (audio.src !== streamUrl) {
                audio.src = streamUrl;
                audio.load()
            }
            const Ctx = window.AudioContext || ((window as any).webkitAudioContext as typeof AudioContext);
            if (Ctx) {
                if (!contextRef.current) contextRef.current = new Ctx();
                const ctx = contextRef.current;
                if (ctx.state === "suspended") await ctx.resume();
                if (!sourceRef.current) {
                    sourceRef.current = ctx.createMediaElementSource(audio);
                    const node = ctx.createAnalyser();
                    node.fftSize = 2048;
                    node.smoothingTimeConstant = .82;
                    sourceRef.current.connect(node);
                    node.connect(ctx.destination);
                    setAnalyser(node)
                }
            }
            await audio.play();
            setPlaying(true);
            setLoading(false);
            if (metaTimer.current) window.clearInterval(metaTimer.current);
            void refreshMetadata(target.id);
            metaTimer.current = window.setInterval(() => void refreshMetadata(target.id), 30000)
        } catch (e) {
            setLoading(false);
            setPlaying(false);
            setError(e instanceof Error ? e.message : "Stream konnte nicht gestartet werden.")
        }
    }, [station, stations, refreshMetadata, resolveStreamUrl]);
    const pause = useCallback(() => {
        audioRef.current?.pause();
        setPlaying(false)
    }, []);
    const setVolume = useCallback((v: number) => setVolumeState(Math.max(0, Math.min(1, v))), []);
    const toggleFavorite = useCallback((id: string) => setFavorites(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]), []);
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onPlay = () => {
            setPlaying(true);
            setLoading(false)
        };
        const onPause = () => setPlaying(false);
        const onWaiting = () => setLoading(true);
        const onCanPlay = () => setLoading(false);
        const onError = () => {
            setLoading(false);
            setPlaying(false);
            setError("Stream nicht erreichbar. Bitte versuche einen anderen SomaFM-Server oder Sender.")
        };
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("waiting", onWaiting);
        audio.addEventListener("canplay", onCanPlay);
        audio.addEventListener("error", onError);
        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("waiting", onWaiting);
            audio.removeEventListener("canplay", onCanPlay);
            audio.removeEventListener("error", onError)
        }
    }, []);
    useEffect(() => () => {
        if (metaTimer.current) window.clearInterval(metaTimer.current);
        audioRef.current?.pause();
    }, []);
    const value = useMemo(() => ({
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
        toggleMute: () => setMuted(v => !v),
        toggleFavorite
    }), [stations, station, playing, loading, volume, muted, track, artist, error, analyser, favorites, play, pause, setVolume, toggleFavorite]);
    return <AudioContextState.Provider value={value}>
        <audio ref={audioRef} preload="none" crossOrigin="anonymous" className="auditory-audio"/>
        {children}</AudioContextState.Provider>;
}

export function useAudio() {
    const value = useContext(AudioContextState);
    if (!value) throw new Error("useAudio must be used inside AudioProvider");
    return value
}
