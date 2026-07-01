import { Link } from "wouter";
import { Compass, Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-coral/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="glass-panel max-w-md w-full rounded-3xl p-8 md:p-12 text-center relative z-10 border border-brand-coral/20 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-coral/10 flex items-center justify-center border border-brand-coral/20 mx-auto mb-6">
          <Compass className="w-8 h-8 text-brand-coral animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <h1 className="text-7xl font-black text-brand-coral mb-2">404</h1>
        <h2 className="text-xl font-bold text-white mb-4">¿Te has perdido en el Caribe?</h2>
        
        <p className="text-gray-400 text-xs leading-relaxed mb-8">
          La página o destino que buscas no se encuentra en nuestro itinerario actual. Puede haber cambiado de coordenadas o haber sido archivada temporalmente.
        </p>

        <Link href="/">
          <button className="btn-gold-glow w-full flex items-center justify-center gap-2 bg-brand-gold text-black font-bold py-3.5 rounded-xl hover:scale-102 active:scale-98 transition-all text-sm">
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
