import { useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { 
  CreditCard, Upload, CheckCircle2, ChevronRight, AlertCircle, 
  ArrowLeft, Landmark, DollarSign, Calendar, MessageSquare, Loader2
} from "lucide-react";

const REASONS = [
  { value: "membresia", label: "Membresía del Directorio" },
  { value: "reserva_hotel", label: "Reserva de Hotel / Posada" },
  { value: "reserva_paquete", label: "Reserva de Paquete Turístico" },
  { value: "otro", label: "Otro Concepto" }
];

const METHODS = [
  { value: "pago_movil", label: "Pago Móvil (Bs.)" },
  { value: "zelle", label: "Zelle (USD)" },
  { value: "usdt", label: "USDT / Binance Pay" },
  { value: "paypal", label: "PayPal (USD)" }
];

export function ReportarPago() {
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    reason: "membresia",
    reasonDetail: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    paymentMethod: "pago_movil",
    bankName: "",
    bankPhone: "",
    bankId: "",
    zelleName: "",
    zelleEmail: "",
    reference: "",
    amount: "",
    currency: "USD",
    paymentDate: new Date().toISOString().slice(0, 10),
    screenshotUrl: "",
    notes: ""
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const setF = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const reportMutation = useMutation({
    mutationFn: async () => {
      let finalScreenshotUrl = form.screenshotUrl;
      
      // Upload image to Supabase if it's base64
      if (finalScreenshotUrl && finalScreenshotUrl.startsWith("data:")) {
        const response = await fetch(finalScreenshotUrl);
        const blob = await response.blob();
        const fileName = `captures/payment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("establecimientos")
          .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("establecimientos")
          .getPublicUrl(fileName);
          
        finalScreenshotUrl = publicUrl;
      }

      // Save record
      const payload = {
        payment_reason: form.reason,
        reason_detail: form.reasonDetail,
        client_name: form.clientName,
        client_email: form.clientEmail,
        client_phone: form.clientPhone,
        payment_method: form.paymentMethod,
        bank_name: form.bankName || null,
        bank_phone: form.bankPhone || null,
        bank_id: form.bankId || null,
        zelle_name: form.zelleName || null,
        zelle_email: form.zelleEmail || null,
        reference: form.reference,
        amount: parseFloat(form.amount) || 0,
        currency: form.currency,
        payment_date: form.paymentDate,
        screenshot_url: finalScreenshotUrl || null,
        status: "pendiente",
        notes: form.notes || null
      };

      try {
        const { error } = await supabase
          .from("reported_payments")
          .insert([payload]);
        if (error) throw error;
      } catch (err) {
        console.warn("DB insert failed, falling back to local storage:", err);
        // Fallback local storage
        const key = "hdv_reported_payments";
        const local = JSON.parse(localStorage.getItem(key) || "[]");
        localStorage.setItem(key, JSON.stringify([
          ...local,
          { id: Date.now(), created_at: new Date().toISOString(), ...payload }
        ]));
      }

      return { success: true };
    },
    onSuccess: () => {
      setSuccess(true);
      window.scrollTo(0, 0);
    },
    onError: (err: any) => {
      alert(`Error al reportar el pago: ${err.message || "Por favor, inténtelo de nuevo."}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName || !form.clientEmail || !form.reference || !form.amount) {
      alert("Por favor, rellene todos los campos requeridos (*).");
      return;
    }
    if (!form.screenshotUrl) {
      alert("Por favor, suba el capture de la transferencia.");
      return;
    }
    reportMutation.mutate();
  };

  const inp = "w-full border border-slate-200 focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4] rounded-xl px-4 py-3 text-xs bg-white text-gray-900 font-bold outline-none transition-all shadow-xs";
  const labelCls = "text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1.5 block";

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 py-20">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[6px]" style={{ background: "linear-gradient(90deg, #00C8D4, #FF0096)" }} />
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">¡Pago Reportado Exitosamente!</h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-3.5 max-w-md mx-auto">
            Hemos recibido el comprobante de tu transacción. Nuestro equipo de administración verificará los fondos en un plazo máximo de 24 horas hábiles. Recibirás un correo electrónico una vez que tu pago haya sido aprobado y procesado.
          </p>
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100/50 mt-6 text-left space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Concepto:</span>
              <span className="text-slate-800 uppercase">{REASONS.find(r => r.value === form.reason)?.label}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Referencia:</span>
              <span className="text-slate-800 font-mono">#{form.reference}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Monto reportado:</span>
              <span className="text-brand-magenta font-black">{form.amount} {form.currency}</span>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer">
              Ir al Inicio
            </Link>
            <Link href="/mis-negocios" className="px-6 py-3 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 shadow-md">
              Mis Negocios
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-16" style={{ background: "linear-gradient(135deg, #0e0120 0%, #1a0533 100%)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#00C8D4" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <Link href="/membresias" className="inline-flex items-center gap-2 text-xs font-bold text-[#00C8D4] hover:underline mb-3">
              <ArrowLeft className="w-4 h-4" /> Volver a Membresías
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Reportar Pago Alternativo</h1>
            <p className="text-white/60 text-xs font-semibold mt-1">Sube el comprobante de tu transferencia en Zelle, Pago Móvil, USDT o PayPal.</p>
          </div>
          <div className="flex gap-2 justify-center shrink-0">
            <span className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-wider">Verificación Rápida</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl shadow-lg p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Concept / Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Concepto / Motivo *</label>
                  <select 
                    value={form.reason} 
                    onChange={e => {
                      setF("reason", e.target.value);
                      if (e.target.value === "membresia") {
                        setF("currency", "USD");
                      }
                    }} 
                    className={inp + " h-[46px]"}
                  >
                    {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Detalle del concepto *</label>
                  <input 
                    type="text"
                    value={form.reasonDetail}
                    onChange={e => setF("reasonDetail", e.target.value)}
                    placeholder="Ej: Mensualidad Posada Galápagos o Reserva #1024"
                    className={inp}
                    required
                  />
                </div>
              </div>

              {/* Client Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-2">Información del Cliente</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Nombre del Cliente / Titular *</label>
                    <input 
                      type="text" 
                      value={form.clientName} 
                      onChange={e => setF("clientName", e.target.value)} 
                      placeholder="Ej: Carlos Mendoza" 
                      className={inp} 
                      required 
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Teléfono de Contacto *</label>
                    <input 
                      type="text" 
                      value={form.clientPhone} 
                      onChange={e => setF("clientPhone", e.target.value)} 
                      placeholder="Ej: +58 412 1234567" 
                      className={inp} 
                      required 
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={labelCls}>Correo Electrónico *</label>
                    <input 
                      type="email" 
                      value={form.clientEmail} 
                      onChange={e => setF("clientEmail", e.target.value)} 
                      placeholder="carlos@correo.com" 
                      className={inp} 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-2">Información de la Transacción</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Método de Pago Utilizado *</label>
                    <select 
                      value={form.paymentMethod} 
                      onChange={e => {
                        setF("paymentMethod", e.target.value);
                        setF("currency", e.target.value === "pago_movil" ? "VES" : "USD");
                      }} 
                      className={inp + " h-[46px]"}
                    >
                      {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Monto *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={form.amount} 
                        onChange={e => setF("amount", e.target.value)} 
                        placeholder="0.00" 
                        className={inp} 
                        required 
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Moneda</label>
                      <select 
                        value={form.currency} 
                        onChange={e => setF("currency", e.target.value)} 
                        className={inp + " h-[46px] text-brand-magenta font-black"}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="VES">VES (Bs.)</option>
                        <option value="USDT">USDT (₮)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Conditional Fields based on Payment Method */}
                {form.paymentMethod === "pago_movil" && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Banco Emisor *</label>
                      <input type="text" value={form.bankName} onChange={e => setF("bankName", e.target.value)} placeholder="Ej: Banesco" className={inp} required />
                    </div>
                    <div>
                      <label className={labelCls}>Teléfono Pago Móvil *</label>
                      <input type="text" value={form.bankPhone} onChange={e => setF("bankPhone", e.target.value)} placeholder="04141234567" className={inp} required />
                    </div>
                    <div>
                      <label className={labelCls}>Cédula/RIF Titular *</label>
                      <input type="text" value={form.bankId} onChange={e => setF("bankId", e.target.value)} placeholder="V-12345678" className={inp} required />
                    </div>
                  </div>
                )}

                {form.paymentMethod === "zelle" && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Nombre Titular Cuenta Zelle *</label>
                      <input type="text" value={form.zelleName} onChange={e => setF("zelleName", e.target.value)} placeholder="Ej: John Doe" className={inp} required />
                    </div>
                    <div>
                      <label className={labelCls}>Correo Cuenta Zelle *</label>
                      <input type="email" value={form.zelleEmail} onChange={e => setF("zelleEmail", e.target.value)} placeholder="john@zelle.com" className={inp} required />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Número de Referencia / ID *</label>
                    <input 
                      type="text" 
                      value={form.reference} 
                      onChange={e => setF("reference", e.target.value)} 
                      placeholder="Ej: 1234567890 o Hash ID" 
                      className={inp + " font-mono"} 
                      required 
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Fecha del Pago *</label>
                    <input 
                      type="date" 
                      value={form.paymentDate} 
                      onChange={e => setF("paymentDate", e.target.value)} 
                      className={inp} 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Upload Screenshot capture */}
              <div>
                <label className={labelCls}>Capture de Pantalla / Comprobante *</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl">
                  {previewUrl ? (
                    <div className="relative w-28 h-28 border border-slate-200 rounded-xl overflow-hidden shrink-0 shadow-sm bg-white">
                      <img src={previewUrl} alt="Capture preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => { setPreviewUrl(null); setF("screenshotUrl", ""); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs font-black cursor-pointer shadow-sm"
                        title="Quitar imagen"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <Upload className="w-6 h-6 mb-1 text-slate-350" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Sin Archivo</span>
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-700">Selecciona el comprobante de pago</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Formatos admitidos: JPG, PNG. Tamaño máximo: 5MB.</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 mt-3 border-2 border-dashed border-[#00C8D4]/40 bg-[#00C8D4]/5 hover:bg-[#00C8D4]/10 rounded-xl text-xs font-bold uppercase text-[#00C8D4] tracking-wider cursor-pointer transition-colors">
                      Elegir archivo
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          // Show local preview
                          const localUrl = URL.createObjectURL(file);
                          setPreviewUrl(localUrl);

                          // Load base64
                          const r = new FileReader();
                          r.onload = () => setF("screenshotUrl", r.result as string);
                          r.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label className={labelCls}>Notas Adicionales</label>
                <textarea 
                  value={form.notes} 
                  onChange={e => setF("notes", e.target.value)} 
                  rows={3} 
                  placeholder="Cualquier información adicional para validar la transacción..." 
                  className={inp + " resize-none"}
                />
              </div>

              <button 
                type="submit" 
                disabled={reportMutation.isPending}
                className="w-full py-4 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(90deg, #00C8D4, #FF0096)" }}
              >
                {reportMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando y Subiendo Comprobante...
                  </>
                ) : (
                  <>
                    Enviar Reporte de Pago <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-6">
            
            {/* Payment Details Card */}
            <div className="bg-[#100921] text-white border border-slate-800 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-[4px] h-full bg-[#00C8D4]" />
              <h3 className="font-black text-xs uppercase tracking-widest text-[#00C8D4] mb-4">Cuentas Oficiales</h3>
              
              <div className="space-y-4 text-xs">
                
                {/* Pago Móvil */}
                <div className="border-b border-slate-800/80 pb-3">
                  <div className="font-bold flex items-center gap-1.5 text-white/90">
                    <Landmark className="w-3.5 h-3.5 text-[#00C8D4]" /> Pago Móvil (VES)
                  </div>
                  <div className="font-semibold text-slate-400 mt-1 space-y-0.5 font-mono text-[10px]">
                    <p>Banco: Banesco (0102)</p>
                    <p>Teléfono: 0414-5069774</p>
                    <p>Rif: J-123456789</p>
                  </div>
                </div>

                {/* Zelle */}
                <div className="border-b border-slate-800/80 pb-3">
                  <div className="font-bold flex items-center gap-1.5 text-white/90">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-450" /> Zelle (USD)
                  </div>
                  <div className="font-semibold text-slate-400 mt-1 font-mono text-[10px]">
                    <p>Correo: payments@hotelesdevenezuela.com</p>
                    <p>Titular: Hoteles de Venezuela LLC</p>
                  </div>
                </div>

                {/* USDT */}
                <div className="border-b border-slate-800/80 pb-3">
                  <div className="font-bold flex items-center gap-1.5 text-white/90">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" /> USDT (Binance Pay)
                  </div>
                  <div className="font-semibold text-slate-400 mt-1 font-mono text-[10px]">
                    <p>Binance ID: 774892102</p>
                    <p>Email: binance@hotelesdevenezuela.com</p>
                  </div>
                </div>

                {/* PayPal */}
                <div>
                  <div className="font-bold flex items-center gap-1.5 text-white/90">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> PayPal (USD)
                  </div>
                  <div className="font-semibold text-slate-400 mt-1 font-mono text-[10px]">
                    <p>Correo: paypal@hotelesdevenezuela.com</p>
                    <p>Nota: Sumar la comisión correspondiente</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#FF0096]" /> ¿Necesitas Ayuda?
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Si tienes problemas para subir tu comprobante de pago o prefieres reportarlo por atención directa, puedes comunicarte con nuestro equipo soporte VIP vía WhatsApp:
              </p>
              <a 
                href="https://wa.me/584145069774?text=Hola,%20tengo%20problemas%20para%2520reportar%2520un%2520pago%2520desde%2520la%2520plataforma." 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
              >
                Soporte por WhatsApp
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
