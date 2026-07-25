import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserCheck, 
  ArrowLeft,
  FileText,
  Camera
} from "lucide-react";
import type { KYCVerification } from "@/types/modules";

export function PerfilKYC() {
  const { user, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const [docType, setDocType] = useState<'passport' | 'dni' | 'driver_license'>('dni');
  const [docNumber, setDocNumber] = useState("");
  const [docImage, setDocImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      nav("/login");
    }
  }, [user, authLoading]);

  // Query to fetch active KYC verification
  const { data: kyc, isLoading: loadingKyc } = useQuery<KYCVerification | null>({
    queryKey: ["kyc-verification", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("kyc_verifications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    },
    enabled: !!user
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'doc' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'doc') {
        setDocImage(reader.result as string);
      } else {
        setSelfieImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload logic helper
  const uploadToStorage = async (dataUrl: string, path: string): Promise<string> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const { error: uploadError } = await supabase.storage
      .from("establecimientos") // use existing bucket
      .upload(path, blob, { contentType: blob.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("establecimientos")
      .getPublicUrl(path);

    return publicUrl;
  };

  // Submit mutation
  const submitKyc = useMutation({
    mutationFn: async () => {
      if (!docNumber || !docImage || !selfieImage) {
        alert("Por favor, completa todos los campos y sube ambas imágenes.");
        return;
      }
      setUploading(true);

      try {
        const docPath = `kyc/${user?.id}/document-${Date.now()}.jpg`;
        const selfiePath = `kyc/${user?.id}/selfie-${Date.now()}.jpg`;

        const [docUrl, selfieUrl] = await Promise.all([
          uploadToStorage(docImage, docPath),
          uploadToStorage(selfieImage, selfiePath)
        ]);

        const { error } = await supabase.from("kyc_verifications").upsert({
          user_id: user?.id,
          document_type: docType,
          document_number: docNumber,
          document_image_url: docUrl,
          selfie_image_url: selfieUrl,
          status: 'pending'
        }, { onConflict: 'user_id' });

        if (error) throw error;
        alert("Tus documentos han sido cargados exitosamente. Nuestro equipo los validará en breve.");
      } catch (err: any) {
        alert("Error cargando verificación: " + err.message);
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kyc-verification", user?.id] });
    }
  });

  if (authLoading || loadingKyc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Clock className="w-8 h-8 animate-spin text-[#00C8D4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-10">
      <div className="max-w-3xl mx-auto px-4">
        
        <button 
          onClick={() => nav("/perfil")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-xs font-bold uppercase tracking-wider mb-8 cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a mi Perfil</span>
        </button>

        {/* KYC Header Section */}
        <div className="bg-[#0e011f] rounded-3xl p-8 text-white relative overflow-hidden mb-8 border border-white/10 shadow-lg text-left">
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-20" style={{ background: "#FF0096" }} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00C8D4]/20 flex items-center justify-center border border-[#00C8D4]/30 shadow-md shrink-0">
              <Shield className="w-6 h-6 text-[#00C8D4]" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00C8D4] block mb-1">SEGURIDAD VERIFICADA</span>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-white">Verificación KYC Turística</h1>
              <p className="text-xs text-gray-300 font-medium mt-1">Valida tu identidad para reservar de forma segura sin intermediarios.</p>
            </div>
          </div>
        </div>

        {/* State Banner */}
        {kyc && (
          <div className="mb-8 text-left">
            {kyc.status === "approved" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-emerald-800 uppercase tracking-wider">Identidad Verificada</h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    Tu cuenta ha sido completamente verificada el {kyc.verified_at ? new Date(kyc.verified_at).toLocaleDateString() : "recientemente"}. ¡Disfruta de todos los beneficios de trato directo!
                  </p>
                </div>
              </div>
            )}

            {kyc.status === "pending" && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-amber-800 uppercase tracking-wider">Verificación Pendiente</h3>
                  <p className="text-xs text-amber-600 font-semibold mt-1">
                    Tus documentos están siendo analizados por nuestro equipo de auditoría física. Te notificaremos vía email o WhatsApp.
                  </p>
                </div>
              </div>
            )}

            {kyc.status === "rejected" && (
              <div className="bg-rose-50 border border-rose-250 rounded-3xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shrink-0">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-sm text-rose-900 uppercase tracking-wider">Verificación Rechazada</h3>
                  <p className="text-xs text-rose-700 font-semibold mt-1">
                    Lamentablemente no pudimos validar tus documentos. Razón: {kyc.notes || "Las imágenes no son legibles"}. Por favor, vuelve a intentarlo abajo.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Form - Rendered if not verified or rejected */}
        {(!kyc || kyc.status === "rejected") && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-md text-left">
            <h2 className="font-black text-sm uppercase tracking-wider text-gray-900 mb-6">Subir Documentos</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Tipo de Documento</label>
                  <select 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors bg-white cursor-pointer"
                  >
                    <option value="dni">Cédula de Identidad (DNI)</option>
                    <option value="passport">Pasaporte</option>
                    <option value="driver_license">Licencia de Conducir</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Número de Identidad</label>
                  <input 
                    type="text" 
                    placeholder="ej. V-12345678" 
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                  />
                </div>
              </div>

              {/* Upload grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 1. Document Image */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Foto del Documento (Frente)</label>
                  <label className="relative border-2 border-dashed border-gray-200 hover:border-[#00C8D4] rounded-2xl h-44 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group bg-gray-50/50">
                    {docImage ? (
                      <img src={docImage} alt="Documento" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-gray-500 group-hover:bg-[#00C8D4]/10 group-hover:text-[#00C8D4] transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">Haz clic para subir documento</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'doc')} />
                  </label>
                </div>

                {/* 2. Selfie Image */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Selfie con Documento</label>
                  <label className="relative border-2 border-dashed border-gray-200 hover:border-[#00C8D4] rounded-2xl h-44 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group bg-gray-50/50">
                    {selfieImage ? (
                      <img src={selfieImage} alt="Selfie" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-gray-500 group-hover:bg-[#00C8D4]/10 group-hover:text-[#00C8D4] transition-colors">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">Sube tu selfie con el documento</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'selfie')} />
                  </label>
                </div>

              </div>

              {/* Submit button */}
              <button 
                onClick={() => submitKyc.mutate()}
                disabled={uploading || submitKyc.isPending}
                className="w-full btn-magenta-gradient text-white font-extrabold py-3.5 px-4 rounded-xl text-xs hover:scale-101 transition-transform cursor-pointer shadow-md shadow-[#FF0096]/15 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {(uploading || submitKyc.isPending) ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin text-white" />
                    <span>Cargando Documentos...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-white" />
                    <span>Enviar para Validación</span>
                  </>
                )}
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
