import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { 
  Shield, 
  Check, 
  X, 
  Loader2, 
  User, 
  FileText, 
  Eye,
  AlertCircle
} from "lucide-react";
import type { KYCVerification } from "@/types/modules";

export function AdminKYC() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Fetch pending KYC submissions
  const { data: verifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin-pending-kyc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kyc_verifications")
        .select(`
          *,
          user_profiles:user_id (name, email)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Approve KYC mutation
  const approveKyc = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("kyc_verifications")
        .update({
          status: 'approved',
          verified_at: new Date().toISOString(),
          verifier_id: user?.id
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending-kyc"] });
      alert(" KYC verificado y aprobado con éxito.");
    }
  });

  // Reject KYC mutation
  const rejectKyc = useMutation({
    mutationFn: async (id: string) => {
      if (!rejectReason) {
        alert("Indica la razón de rechazo.");
        return;
      }
      const { error } = await supabase
        .from("kyc_verifications")
        .update({
          status: 'rejected',
          notes: rejectReason,
          verified_at: new Date().toISOString(),
          verifier_id: user?.id
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending-kyc"] });
      setRejectId(null);
      setRejectReason("");
      alert("KYC rechazado. Se notificará al usuario.");
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
            AUDITORÍA DE IDENTIDADES
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-white">
            Verificaciones KYC Pendientes
          </h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#00C8D4]" />
          </div>
        ) : verifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
            <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-700">Al día con las verificaciones</h3>
            <p className="text-xs text-gray-400 mt-1">No hay solicitudes KYC pendientes de auditoría en este momento.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {verifications.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-50 pb-4 mb-4 gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">{item.user_profiles?.name || "Usuario HDV"}</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{item.user_profiles?.email || "Sin email"}</p>
                  </div>
                  <div className="flex gap-3 text-xs font-semibold">
                    <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg">
                      TIPO: <span className="uppercase font-bold">{item.document_type}</span>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg">
                      NÚMERO: <span className="font-bold">{item.document_number}</span>
                    </div>
                  </div>
                </div>

                {/* Photo grid comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-[10px] uppercase font-black tracking-wider text-gray-400 mb-2">Foto del Documento</h4>
                    <a href={item.document_image_url} target="_blank" rel="noreferrer" className="block relative h-64 rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50">
                      <img src={item.document_image_url} alt="Documento" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Eye className="w-4 h-4" /> Ampliar Imagen
                      </div>
                    </a>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] uppercase font-black tracking-wider text-gray-400 mb-2">Foto Selfie con Documento</h4>
                    <a href={item.selfie_image_url} target="_blank" rel="noreferrer" className="block relative h-64 rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50">
                      <img src={item.selfie_image_url} alt="Selfie" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Eye className="w-4 h-4" /> Ampliar Imagen
                      </div>
                    </a>
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4 border-t border-gray-50">
                  <div className="text-[10px] text-gray-400 font-bold">
                    Solicitado el {new Date(item.created_at).toLocaleString()}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setRejectId(item.id)}
                      className="border border-rose-200 text-[#FF0096] hover:bg-rose-50 font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" /> Rechazar
                    </button>
                    <button 
                      onClick={() => approveKyc.mutate(item.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    >
                      <Check className="w-4 h-4 text-white" /> Aprobar Identidad
                    </button>
                  </div>
                </div>

                {/* Reject dialog */}
                {rejectId === item.id && (
                  <div className="mt-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <label className="block text-[10px] uppercase font-bold text-rose-700 tracking-wider mb-1.5">Motivo del Rechazo</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        placeholder="ej. La foto de la selfie es borrosa o ilegible" 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="flex-1 border border-rose-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none bg-white"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => rejectKyc.mutate(item.id)}
                          className="bg-[#FF0096] hover:bg-[#D80073] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                        >
                          Confirmar Rechazo
                        </button>
                        <button 
                          onClick={() => { setRejectId(null); setRejectReason(""); }}
                          className="border border-gray-200 hover:bg-gray-100 text-gray-600 font-extrabold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
