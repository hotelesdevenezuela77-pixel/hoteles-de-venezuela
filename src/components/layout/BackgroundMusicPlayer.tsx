import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Play, Pause, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem("hdv_music_volume");
    return saved ? parseFloat(saved) : 0.3; // 30% volumen ambiente suave por defecto
  });
  const [audioError, setAudioError] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Intentar audio predeterminado /audio/musica-corporativa.mp3
  const [audioSrc, setAudioSrc] = useState<string>(() => {
    return localStorage.getItem("hdv_custom_audio_url") || "/audio/musica-corporativa.mp3";
  });

  // Consultar la URL del audio configurada dinámicamente desde el Panel Administrativo en Supabase
  useEffect(() => {
    async function loadAudioSetting() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("setting_value")
          .eq("setting_key", "bg_music_url")
          .maybeSingle();

        if (!error && data?.setting_value && data.setting_value.trim()) {
          const remoteUrl = data.setting_value.trim();
          setAudioSrc(remoteUrl);
          localStorage.setItem("hdv_custom_audio_url", remoteUrl);
        }
      } catch (e) {
        console.warn("Error consultando configuración de música corporativa:", e);
      }
    }

    loadAudioSetting();
  }, []);

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Intentar Autoplay automático
    const attemptAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setAudioError(false);
      } catch (err) {
        // El navegador bloqueó el autoplay sin interacción previa.
        // Agregamos un listener global al primer clic/tap en cualquier parte del sitio para iniciarlo suavemente.
        const handleFirstInteraction = async () => {
          try {
            await audio.play();
            setIsPlaying(true);
            setAudioError(false);
          } catch (e) {
            console.warn("Audio play error post interaction:", e);
          } finally {
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("touchstart", handleFirstInteraction);
          }
        };

        window.addEventListener("click", handleFirstInteraction, { once: true });
        window.addEventListener("touchstart", handleFirstInteraction, { once: true });
      }
    };

    attemptAutoplay();

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioSrc]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      localStorage.setItem("hdv_music_volume", volume.toString());
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(false);
        })
        .catch(err => {
          console.warn("Error reproduciendo audio:", err);
          setAudioError(true);
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 font-sans select-none">
      <div className="relative group flex items-center gap-2 bg-[#0e011f]/90 backdrop-blur-md text-white border border-[#00C8D4]/40 p-2 pl-3 rounded-full shadow-2xl hover:border-[#FF0096]/60 transition-all duration-300">
        
        {/* Visualizador de Ondas / Icono Principal */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
          title={isPlaying ? "Pausar Música Corporativa" : "Reproducir Música Corporativa"}
        >
          {isPlaying ? (
            <div className="flex items-center gap-1 h-4 w-4 justify-center">
              <span className="w-1 bg-[#00C8D4] h-full rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1 bg-[#FF0096] h-full rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1 bg-[#00C8D4] h-full rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          ) : (
            <Music className="w-4 h-4 text-gray-400 group-hover:text-[#00C8D4] transition-colors" />
          )}

          <span className="text-[11px] font-bold tracking-wide pr-1 text-gray-200 hidden sm:inline-block">
            {isPlaying ? "Música HDV" : "Música de Fondo"}
          </span>
        </button>

        {/* Botón Play / Pause */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#FF0096] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        {/* Botón Mute / Volumen desplegable */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={toggleMute}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#00C8D4] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title={isMuted ? "Activar Sonido" : "Silenciar"}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Desplegable de Control de Volumen */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-5 h-5 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <ChevronUp className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
          </button>

          {isExpanded && (
            <div className="absolute bottom-10 left-0 bg-[#0e011f] border border-[#00C8D4]/40 p-3 rounded-2xl shadow-xl flex flex-col gap-2 min-w-[140px] text-xs">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Volumen Ambiente</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full accent-[#00C8D4] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                <span>0%</span>
                <span>{Math.round((isMuted ? 0 : volume) * 100)}%</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
