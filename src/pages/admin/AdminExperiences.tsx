import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { 
  Compass, 
  Check, 
  X, 
  Loader2, 
  MapPin, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  FileText
} from "lucide-react";
import type { Experience } from "@/types/modules";

export function AdminExperiences() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch experiences awaiting review
  const { data: experiences = [], isLoading: loadingExp } = useQuery<Experience[]>({
    queryKey: ["admin-pending-experiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Query to fetch experience bookings
  const { data: bookings = [], isLoading: loadingBookings } = useQuery<any[]>({
    queryKey: ["admin-experience-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience_bookings")
        .select(`
          *,
          experiences (name, location),
          user_profiles:user_id (name, email)
        `)
        .order("booking_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Approve experience
  const approveExperience = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("experiences").update({ status: 'approved' }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending-experiences"] });
      alert("Experiencia aprobada y publicada exitosamente.");
    }
  });

  // Reject experience
  const rejectExperience = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("experiences").update({ status: 'rejected' }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending-experiences"] });
      alert("Experiencia rechazada.");
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e011f] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#00C8D4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <AdminTabBar />

      {/* Hero Header */}
      <section className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-[#0e011f] mb-10 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e011f] to-[#1a0533] opacity-90 z-10" />
        <div className="relative z-20 text-center text-white px-4">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00C8D4] mb-3 block">
            MARKETPLACE DE TURISMO
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-white">
            Experiencias y Guías Locales
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* Review list */}
        <h2 className="text-base font-black uppercase tracking-wider text-gray-900 mb-6 text-left">Excursiones y Experiencias en Revisión</h2>
        
        {loadingExp ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#00C8D4]" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 mb-12 shadow-xs">
            <p className="text-xs text-gray-400 font-bold">No hay excursiones registradas para revisión.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {experiences.map((exp) => (
              <div key={exp.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md flex flex-col justify-between hover:shadow-lg transition-all text-left">
                <div>
                  {exp.main_image && (
                    <div className="h-40 w-full rounded-2xl overflow-hidden mb-4 bg-gray-100">
                      <img src={exp.main_image} alt={exp.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-extrabold text-sm text-gray-900">{exp.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#00C8D4]" />
                    <span>{exp.location}</span>
                  </div>

                  <p className="text-xs text-gray-500 font-semibold mt-3 line-clamp-3 leading-relaxed">
                    {exp.description}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-gray-50 pt-3 text-xs text-gray-600 font-semibold">
                    <div className="flex justify-between">
                      <span>Precio / pax:</span>
                      <span className="font-bold text-gray-900">${exp.price_per_person}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración:</span>
                      <span className="font-bold text-gray-900">{exp.duration_hours} horas</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categoría:</span>
                      <span className="font-bold text-gray-900 uppercase text-[#9B00CC]">{exp.category}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2.5">
                  {exp.status === "pending_approval" ? (
                    <>
                      <button 
                        onClick={() => rejectExperience.mutate(exp.id)}
                        className="flex-1 border border-rose-200 text-[#FF0096] hover:bg-rose-55/10 font-extrabold py-2 px-4 rounded-xl text-[10px] cursor-pointer transition-colors"
                      >
                        Rechazar
                      </button>
                      <button 
                        onClick={() => approveExperience.mutate(exp.id)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2 px-4 rounded-xl text-[10px] cursor-pointer transition-colors shadow-sm"
                      >
                        Aprobar y Publicar
                      </button>
                    </>
                  ) : (
                    <div className="text-[10px] font-black uppercase text-gray-400">
                      ESTADO: <span className={exp.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}>{exp.status}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings Section */}
        <h2 className="text-base font-black uppercase tracking-wider text-gray-900 mb-6 text-left">Reservas de Excursiones Recientes</h2>
        {loadingBookings ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#00C8D4]" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-xs">
            <p className="text-xs text-gray-400 font-bold">No hay reservas de experiencias en el sistema.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden text-left mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-gray-600">
                <thead>
                  <tr className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4 px-6 text-left">Turista</th>
                    <th className="py-4 px-6 text-left">Experiencia</th>
                    <th className="py-4 px-6 text-left">Ubicación</th>
                    <th className="py-4 px-6 text-left">Fecha y Pax</th>
                    <th className="py-4 px-6 text-right">Precio Total</th>
                    <th className="py-4 px-6 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-gray-900">{booking.user_profiles?.name || "Turista"}</div>
                        <div className="text-[10px] text-gray-400 font-bold mt-0.5">{booking.user_profiles?.email || "Sin email"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-gray-900">{booking.experiences?.name || "Excursión"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 font-extrabold text-gray-900">
                          <MapPin className="w-3.5 h-3.5 text-[#00C8D4]" />
                          <span>{booking.experiences?.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold mt-0.5">{booking.pax_count} pax</div>
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-gray-900">
                        ${booking.total_price}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {booking.status === "confirmed" && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider">
                            <CheckCircle className="w-3 h-3 text-emerald-500" /> Confirmado
                          </span>
                        )}
                        {booking.status === "pending" && (
                          <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider">
                            <Clock className="w-3 h-3 text-amber-500" /> Pendiente
                          </span>
                        )}
                        {booking.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider">
                            <XCircle className="w-3 h-3 text-rose-500" /> Cancelado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
