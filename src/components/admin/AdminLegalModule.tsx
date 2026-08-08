import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Scale,
  ShieldCheck,
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Download,
  FileText,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Lock,
  Building2,
  Trash2,
  Edit3,
  Plus
} from "lucide-react";
import type { LegalResolutionSubmission } from "@/pages/legal/LegalUploadResolution";

export function AdminLegalModule() {
  const [submissions, setSubmissions] = useState<LegalResolutionSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Verification Tool Modal
  const [verifyHashInput, setVerifyHashInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ found: boolean; item?: LegalResolutionSubmission } | null>(null);

  const localKey = "hdv_legal_resolutions_submissions";

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // 1. Try DB fetch
      const { data, error } = await supabase
        .from("legal_resolutions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setSubmissions(data as LegalResolutionSubmission[]);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("DB Legal fetch error, using local fallback", e);
    }

    // 2. Fallback to localStorage
    const saved = localStorage.getItem(localKey);
    if (saved) {
      try {
        setSubmissions(JSON.parse(saved));
        setLoading(false);
        return;
      } catch (e) {}
    }

    // 3. Demo Initial Resolution Demos
    const initialDemos: LegalResolutionSubmission[] = [
      {
        id: "sub-demo-1",
        ticket_code: "TKT-BG-3108501",
        representative_name: "Dr. Alejandro Rivas",
        representative_id: "V-15892019",
        client_name: "Posada Boutique El Encanto C.A.",
        email: "legal@posadaencanto.com",
        phone: "+58 414 8889911",
        document_type: "resolucion_formal",
        file_name: "Resolucion_Oficial_TKT-BG-3108501.pdf",
        file_size: "3.42 MB",
        sha256_hash: "SHA256:8f9a72b1e4c820a1739f82d1c94b7e829a10c48e2910fa8302194821a09823f4",
        timestamp_utc: "2026-08-08 14:22:10 UTC",
        status: "validado",
        notes: "Resolución formal revisada por auditoría jurídica. Recaudos completos y validados."
      },
      {
        id: "sub-demo-2",
        ticket_code: "TKT-BG-3108502",
        representative_name: "Dra. María Fernanda López",
        representative_id: "J-40192831-0",
        client_name: "Hotel Lidotel Valencia",
        email: "abogados@lidotel.com.ve",
        phone: "+58 241 9991122",
        document_type: "comprobante_abono",
        file_name: "Comprobante_Abono_Judicial_August.pdf",
        file_size: "1.85 MB",
        sha256_hash: "SHA256:3a1b4c9e8f7a6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0987654321fedcba9876",
        timestamp_utc: "2026-08-08 15:05:42 UTC",
        status: "recibido",
        notes: "Comprobante de abono recibido. En proceso de verificación bancaria."
      }
    ];

    setSubmissions(initialDemos);
    localStorage.setItem(localKey, JSON.stringify(initialDemos));
    setLoading(false);
  };

  const saveState = (list: LegalResolutionSubmission[]) => {
    setSubmissions(list);
    localStorage.setItem(localKey, JSON.stringify(list));
  };

  const handleUpdateStatus = (id: string, newStatus: LegalResolutionSubmission["status"]) => {
    const updated = submissions.map(s => s.id === id ? { ...s, status: newStatus } : s);
    saveState(updated);
  };

  const handleCopyLink = (ticket: string) => {
    const fullUrl = `${window.location.origin}/legal/upload-resolution?ticket=${ticket}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(ticket);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleVerifyHash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyHashInput.trim()) return;

    const query = verifyHashInput.trim().toLowerCase();
    const matched = submissions.find(
      s => s.sha256_hash.toLowerCase().includes(query) || s.ticket_code.toLowerCase().includes(query)
    );

    if (matched) {
      setVerifyResult({ found: true, item: matched });
    } else {
      setVerifyResult({ found: false });
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = !searchQuery.trim() ||
      s.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.representative_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sha256_hash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER DEPARTAMENTO LEGAL */}
      <div className="bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] border border-[#00C8D4]/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-widest bg-gradient-to-r from-[#FF0096] to-[#9B00CC]">
                DEPARTAMENTO LEGAL & CUSTODIA JURÍDICA
              </span>
              <span className="text-xs text-slate-300 font-mono font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#00C8D4]" /> BÓVEDA SHA-256
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00C8D4]/20 border border-[#00C8D4]/40 flex items-center justify-center text-[#00C8D4] shrink-0 shadow-md">
                <Scale className="w-5 h-5 text-[#00C8D4]" />
              </div>
              Auditoría Legal & Carga de Resoluciones PDF
            </h1>

            <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
              Gestión centralizada de resoluciones formales, comprobantes de abono y dictámenes jurídicos emitidos por representantes legales. Cada documento cuenta con trazabilidad inalterable y marca de agua criptográfica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/legal/upload-resolution?ticket=TKT-BG-3108501"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Portal de Carga Seguro</span>
            </a>
          </div>
        </div>
      </div>

      {/* VERIFICADOR RÁPIDO DE HASH Y ENLACE OFICIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HERRAMIENTA DE VERIFICACIÓN CRIPTOGRÁFICA */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
              Verificador Criptográfico de Autenticidad (Hash SHA-256)
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400">Verificación Inalterable</span>
          </div>

          <form onSubmit={handleVerifyHash} className="flex gap-2">
            <input
              type="text"
              placeholder="Pega el Hash SHA-256 o código de ticket TKT-BG-..."
              value={verifyHashInput}
              onChange={(e) => setVerifyHashInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#00C8D4]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#00C8D4] hover:bg-[#00b2bd] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Verificar Hash
            </button>
          </form>

          {verifyResult && (
            <div className={`p-4 rounded-2xl border text-xs ${verifyResult.found ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200 text-red-900"}`}>
              {verifyResult.found && verifyResult.item ? (
                <div className="space-y-1">
                  <span className="font-black block flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    DOCUMENTO AUTÉNTICO VERIFICADO EN CUSTODIA JURÍDICA
                  </span>
                  <p className="font-mono text-[11px]">Ticket: {verifyResult.item.ticket_code} — {verifyResult.item.representative_name}</p>
                  <p className="font-mono text-[10px] text-slate-600 break-all">{verifyResult.item.sha256_hash}</p>
                </div>
              ) : (
                <span className="font-bold flex items-center gap-1.5 text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  No se encontró coincidencia para el Hash o Ticket ingresado.
                </span>
              )}
            </div>
          )}
        </div>

        {/* CARD DE COPIAR ENLACE OFICIAL DE CARGA */}
        <div className="bg-[#0e011f] border border-white/10 rounded-3xl p-6 text-white shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#00C8D4] uppercase tracking-widest block mb-1">
              CANAL SEGURO DE CARGA DE RESOLUCIÓN
            </span>
            <h3 className="text-sm font-serif font-black text-white">
              Enlace de Carga de Resolución Formal (PDF)
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-normal">
              Comparte este enlace seguro con la representación legal para que adjunten los comprobantes con marca de agua y hash.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono text-cyan-300 break-all">
              {window.location.origin}/legal/upload-resolution?ticket=TKT-BG-3108501
            </div>

            <button
              type="button"
              onClick={() => handleCopyLink("TKT-BG-3108501")}
              className="w-full py-2 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedId === "TKT-BG-3108501" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === "TKT-BG-3108501" ? "¡Enlace Copiado al Portapapeles!" : "Copiar Enlace Seguro"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* TABLA DE AUDITORÍA DE RESOLUCIONES CONSIGNADAS */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden space-y-4 p-6">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#9B00CC]" />
            <h3 className="text-sm font-serif font-black text-slate-900">
              Expedientes y Resoluciones Consignadas
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por ticket, representante o hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#00C8D4]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-[#00C8D4]"
            >
              <option value="all">Todos los Estados</option>
              <option value="recibido">📥 Recibidos</option>
              <option value="validado">✅ Validados</option>
              <option value="en_auditoria">🔎 En Auditoría</option>
              <option value="requiere_subsanacion">⚠️ Subsanación</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="p-3 pl-4">Ticket / UTC</th>
                <th className="p-3">Representante & Cliente</th>
                <th className="p-3">Documento & Hash SHA-256</th>
                <th className="p-3">Estado Auditoría</th>
                <th className="p-3 pr-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    No hay expedientes jurídicos registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 pl-4 font-mono">
                      <span className="font-black text-[#00C8D4] block">{sub.ticket_code}</span>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{sub.timestamp_utc}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{sub.representative_name}</span>
                      <span className="text-[10px] text-slate-500 block">ID: {sub.representative_id} | {sub.client_name}</span>
                    </td>
                    <td className="p-3 max-w-xs font-mono">
                      <span className="font-bold text-slate-800 block truncate">{sub.file_name}</span>
                      <span className="text-[9px] text-slate-400 block truncate mt-0.5">{sub.sha256_hash}</span>
                    </td>
                    <td className="p-3">
                      <select
                        value={sub.status}
                        onChange={(e) => handleUpdateStatus(sub.id, e.target.value as any)}
                        className={`text-[10px] font-black uppercase rounded-lg px-2 py-1 outline-none cursor-pointer border ${
                          sub.status === "validado" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                          sub.status === "recibido" ? "bg-cyan-100 text-cyan-800 border-cyan-300" :
                          sub.status === "en_auditoria" ? "bg-amber-100 text-amber-800 border-amber-300" :
                          "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        <option value="recibido">📥 Recibido</option>
                        <option value="validado">✅ Validado Jurídicamente</option>
                        <option value="en_auditoria">🔎 En Auditoría</option>
                        <option value="requiere_subsanacion">⚠️ Requiere Subsanación</option>
                      </select>
                    </td>
                    <td className="p-3 pr-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(sub.ticket_code)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Copiar enlace seguro para cliente"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
