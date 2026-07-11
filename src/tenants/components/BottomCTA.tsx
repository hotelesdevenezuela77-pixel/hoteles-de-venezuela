import React from "react";
import { useTenant } from "../tenantContext";
import { MessageSquare, Calendar, ShieldCheck, Mail } from "lucide-react";

export function BottomCTA() {
  const { config } = useTenant();

  // Enlace directo de WhatsApp
  const whatsappUrl = `https://wa.me/${config.contact.whatsapp.replace(/[^0-9]/g, "")}?text=Hola,%20me%20gustar%C3%ADa%20hacer%20una%20reserva%20en%20${encodeURIComponent(config.name)}`;

  return (
    <section id="contacto" className="py-16 bg-[#0e011f] px-6 select-none">
      <div className="max-w-6xl mx-auto">
        
        {/* Tarjeta de cierre con fondo gradiente Magenta/Púrpura y esquinas redondeadas generosas */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FF0096] via-[#d40085] to-[#9B00CC] rounded-3xl p-8 md:p-16 shadow-2xl shadow-[#FF0096]/20 border border-white/10 text-white">
          
          {/* Fondo sutil texturizado */}
          <div className="absolute inset-0 opacity-15 mix-blend-overlay">
            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#00C8D4] blur-3xl"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Texto de llamado a la acción */}
            <div className="lg:col-span-7">
              <span className="text-[10px] tracking-[0.3em] font-extrabold uppercase text-[#00C8D4] block mb-3">
                PLANIFICA TU ESTADÍA
              </span>
              <h2 className="text-3xl md:text-5xl font-black font-serif leading-tight mb-4">
                ¿Listo para vivir la magia de Venezuela?
              </h2>
              <p className="text-white/90 text-sm md:text-base leading-relaxed font-light">
                Comunícate directamente con nuestro equipo de hospitalidad para gestionar tarifas especiales, traslados exclusivos y reservas de áreas VIP.
              </p>

              <div className="mt-8 flex flex-wrap gap-6 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-[#00C8D4] rounded-md flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>Reserva Garantizada Directa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-[#00C8D4] rounded-md flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>Cancelación Flexible</span>
                </div>
              </div>
            </div>

            {/* Acciones principales y WhatsApp */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Botón blanco con texto en color magenta y el icono de WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#FF0096] rounded-2xl text-sm font-extrabold uppercase tracking-widest hover:bg-slate-50 active:scale-98 transition-all duration-200 shadow-xl shadow-black/20"
              >
                {/* SVG del logo de WhatsApp */}
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.59 1.966 14.12 .941 11.49.941c-5.43 0-9.854 4.37-9.858 9.799 0 1.738.459 3.43 1.33 4.96L1.93 20.154l4.717-1.227z" />
                  <path d="M15.418 12.784c-.272-.137-1.614-.797-1.863-.888-.249-.09-.43-.137-.61.137-.18.272-.7.888-.857 1.07-.158.18-.316.204-.588.067-.272-.137-1.15-.424-2.19-1.352-.809-.723-1.356-1.616-1.515-1.888-.158-.272-.017-.42.12-.556.123-.122.272-.317.408-.475.136-.158.18-.271.272-.453.09-.18.045-.34-.022-.476-.068-.136-.61-1.472-.837-2.015-.22-.53-.443-.458-.609-.467-.158-.008-.339-.01-.52-.01-.18 0-.475.067-.723.34-.249.271-.95.928-.95 2.264 0 1.336.973 2.628 1.109 2.81.136.18 1.914 2.923 4.637 4.1.648.28 1.153.448 1.547.573.65.207 1.243.177 1.71.107.52-.078 1.614-.66 1.84-1.296.226-.638.226-1.186.158-1.296-.068-.113-.249-.181-.52-.317z" />
                </svg>
                WhatsApp Directo
              </a>

              {/* Botón secundario para ver correo */}
              <a
                href={`mailto:${config.contact.email}`}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-white/20 hover:border-white/50 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200"
              >
                <Mail className="w-4 h-4 text-[#00C8D4]" />
                {config.contact.email}
              </a>

            </div>

          </div>
        </div>

        {/* Footer simple del Tenant en el color oscuro de contraste */}
        <div className="mt-12 pt-6 border-t border-[#1a0533] flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} {config.name}. Todos los derechos reservados.</p>
          <p className="mt-2 md:mt-0 flex items-center gap-1.5">
            <span>Socio de la Red</span>
            <a href="https://hotelesdevenezuela.com" target="_blank" rel="noreferrer" className="text-[#00C8D4] hover:underline font-bold">
              Hoteles de Venezuela
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}
