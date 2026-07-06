import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Hotel, Home } from "lucide-react";

interface EstWithRating {
  id: string | number;
  name: string;
  rating_avg?: number | null;
}

export function TickerBar() {
  const [items, setItems] = useState<EstWithRating[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);

  const fallbacks: EstWithRating[] = [
    { id: "f1", name: "Sabbia By LD Hotels", rating_avg: 5.0 },
    { id: "f2", name: "Waka Wená", rating_avg: 5.0 },
    { id: "f3", name: "Aqua Vista Posada", rating_avg: 5.0 },
    { id: "f4", name: "Waku Lodge", rating_avg: 5.0 },
    { id: "f5", name: "Campamento Canaima", rating_avg: 5.0 },
    { id: "f6", name: "JW Marriott Caracas", rating_avg: 4.8 },
    { id: "f7", name: "Meliá Caracas", rating_avg: 4.7 },
    { id: "f8", name: "Posada La Tortuga", rating_avg: 4.6 },
  ];

  useEffect(() => {
    async function fetchTopEstablishments() {
      try {
        const { data, error } = await supabase
          .from("establishments")
          .select("id, name, rating_avg")
          .eq("status", "approved")
          .gt("rating_avg", 0)
          .order("rating_avg", { ascending: false })
          .limit(40);

        if (error) throw error;
        if (data && data.length >= 5) {
          setItems(data);
        } else {
          setItems(fallbacks);
        }
      } catch (err) {
        console.warn("Error cargando establecimientos para el ticker, usando fallbacks:", err);
        setItems(fallbacks);
      }
    }

    fetchTopEstablishments();
  }, []);

  const displayItems = [...items, ...items, ...items];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || displayItems.length === 0) return;

    const tick = () => {
      if (!pausedRef.current && el) {
        el.scrollLeft += 0.8; // Velocidad de desplazamiento
        const oneThird = el.scrollWidth / 3;
        if (el.scrollLeft >= oneThird * 2) {
          el.scrollLeft -= oneThird;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [displayItems.length]);

  return (
    <div
      className="relative h-8 flex items-center select-none overflow-hidden ticker-gradient"
    >
      {/* Etiqueta Izquierda (Hoteles) */}
      <div
        className="absolute left-0 z-20 flex items-center h-full px-4 gap-1.5 font-bold text-white text-[11px] whitespace-nowrap"
        style={{
          background: "linear-gradient(90deg, #FF0096 85%, transparent)",
          pointerEvents: "none"
        }}
      >
        <Hotel className="w-3.5 h-3.5 text-white" />
        <span>Hoteles</span>
      </div>

      {/* Track de Scroll */}
      <div
        ref={scrollRef}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        style={{
          overflowX: "hidden",
          width: "100%",
          paddingLeft: "7rem",
          paddingRight: "7rem",
          display: "flex",
          alignItems: "center",
          scrollBehavior: "auto",
        }}
      >
        {displayItems.map((est, i) => (
          <span
            key={`${est.id}-${i}`}
            className="text-white text-[11px] font-semibold flex items-center gap-1.5 hover:text-yellow-200 transition-colors cursor-pointer"
            style={{ whiteSpace: "nowrap", marginLeft: "1.5rem", marginRight: "1.5rem", flexShrink: 0 }}
          >
            {est.rating_avg && (
              <span className="flex items-center gap-0.5 text-[9px] text-yellow-300">
                ★ <span className="text-white text-[10px]">{est.rating_avg.toFixed(1)}</span>
              </span>
            )}
            <span>{est.name}</span>
          </span>
        ))}
      </div>

      {/* Etiqueta Derecha (Posadas) */}
      <div
        className="absolute right-0 z-20 flex items-center h-full px-4 gap-1.5 font-bold text-white text-[11px] whitespace-nowrap"
        style={{
          background: "linear-gradient(270deg, #9B00CC 85%, transparent)",
          pointerEvents: "none"
        }}
      >
        <span>Posadas</span>
        <Home className="w-3.5 h-3.5 text-white" />
      </div>
    </div>
  );
}
