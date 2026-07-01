import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Wrench, 
  Clock, 
  Calendar, 
  Mail, 
  Phone, 
  MessageSquare, 
  Lock, 
  AlertCircle,
  Sparkles
} from "lucide-react";

const PHONE = "+58 414-5069774";
const EMAIL = "partner@hotelesdevenezuela.com";

export function Mantenimiento() {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 30, seconds: 0 });

  // Countdown timer simulation for realistic effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#0a0314] via-[#0e011f] to-[#1a0533] px-4 py-12 font-sans">
      
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full blur-[120px] opacity-25 bg-brand-magenta" style={{ backgroundColor: "#FF0096" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full blur-[120px] opacity-20 bg-brand-turquesa" style={{ backgroundColor: "#00C8D4" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] opacity-10 bg-brand-purple" style={{ backgroundColor: "#9B00CC" }} />
      </div>

      {/* Main Glassmorphic Container */}
      <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 text-center flex flex-col items-center">
        
        {/* Animated Icon Header */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#9B00CC] to-[#FF0096] p-[1px] shadow-lg shadow-purple-950/40 mb-8 animate-bounce duration-[2000ms]">
          <div className="w-full h-full bg-[#0a0314]/90 rounded-[15px] flex items-center justify-center">
            <Wrench className="w-8 h-8 text-[#FF0096] animate-pulse" />
          </div>
        </div>

        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-4 border bg-amber-500/10 border-amber-500/30 text-amber-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Mantenimiento Programado</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4 uppercase">
          Mejorando la <br/>
          <span className="bg-gradient-to-r from-[#FF0096] to-[#00C8D4] bg-clip-text text-transparent">Experiencia Turística</span>
        </h1>

        {/* Paragraph */}
        <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-lg mb-8 font-medium">
          Estamos realizando actualizaciones en la infraestructura digital de <strong>Hoteles de Venezuela</strong> para ofrecerte una navegación ultra-rápida y reservas directas sin comisiones optimizadas. Estaremos de vuelta muy pronto.
        </p>

        {/* Realistic Timer */}
        <div className="grid grid-cols-3 gap-4 max-w-sm w-full mb-10 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Horas</div>
          </div>
          <div className="border-r border-white/10 h-10 my-auto"></div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Minutos</div>
          </div>
          <div className="border-r border-white/10 h-10 my-auto"></div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Segundos</div>
          </div>
        </div>

        {/* Progress bar simulation */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-8 border border-white/5 max-w-md">
          <div className="bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#00C8D4] h-full rounded-full w-3/4 animate-pulse"></div>
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold border-t border-white/10 pt-8 w-full max-w-md">
          <a href={`https://wa.me/${PHONE.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#00C8D4] transition-colors">
            <Phone className="w-4 h-4 text-[#00C8D4]" />
            <span>Soporte</span>
          </a>
          <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 hover:text-[#FF0096] transition-colors">
            <Mail className="w-4 h-4 text-[#FF0096]" />
            <span>{EMAIL}</span>
          </a>
        </div>
      </div>

      {/* Hidden Admin Login Access Portal for strict deployment security */}
      <div className="mt-8 relative z-10 text-center">
        <Link href="/hdv-acceso-llc2027" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-slate-400 transition-colors">
          <Lock className="w-3 h-3" />
          <span>Acceso Administrativo</span>
        </Link>
      </div>
    </div>
  );
}
