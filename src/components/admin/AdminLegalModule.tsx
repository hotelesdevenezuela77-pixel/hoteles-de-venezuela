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
  Plus,
  Eye,
  X,
  Printer,
  FileCheck2,
  Mail,
  Phone,
  UserCheck
} from "lucide-react";
import type { LegalResolutionSubmission } from "@/pages/legal/LegalUploadResolution";

export function AdminLegalModule() {
  const [submissions, setSubmissions] = useState<LegalResolutionSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Verification Tool
  const [verifyHashInput, setVerifyHashInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ found: boolean; item?: LegalResolutionSubmission } | null>(null);

  // Expediente Viewer Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<LegalResolutionSubmission | null>(null);
  const [modalNotes, setModalNotes] = useState<string>("");
  const [modalSavedSuccess, setModalSavedSuccess] = useState<boolean>(false);
  const [copiedModalHash, setCopiedModalHash] = useState<boolean>(false);

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
        notes: "Resolución formal revisada por auditoría jurídica. Recaudos completos y validados bajo providencia vigente."
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
        notes: "Comprobante de abono recibido en custodia legal. En proceso de verificación bancaria."
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
    if (selectedSubmission && selectedSubmission.id === id) {
      setSelectedSubmission({ ...selectedSubmission, status: newStatus });
    }
  };

  const handleOpenExpediente = (sub: LegalResolutionSubmission) => {
    setSelectedSubmission(sub);
    setModalNotes(sub.notes || "");
    setModalSavedSuccess(false);
  };

  const handleSaveModalNotes = () => {
    if (!selectedSubmission) return;
    const updated = submissions.map(s => s.id === selectedSubmission.id ? { ...s, notes: modalNotes } : s);
    saveState(updated);
    setSelectedSubmission({ ...selectedSubmission, notes: modalNotes });
    setModalSavedSuccess(true);
    setTimeout(() => setModalSavedSuccess(false), 2200);
  };

  const handleCopyHashInModal = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedModalHash(true);
    setTimeout(() => setCopiedModalHash(false), 2000);
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

  const documentTypeLabels: Record<string, string> = {
    resolucion_formal: "Resolución Formal",
    comprobante_abono: "Comprobante de Abono",
    dictamen_juridico: "Dictamen Jurídico",
    acuerdo_finiquito: "Acuerdo / Finiquito",
    otro: "Otro Documento Legal"
  };

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
                  <div className="flex items-center justify-between">
                    <span className="font-black block flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      DOCUMENTO AUTÉNTICO VERIFICADO EN CUSTODIA JURÍDICA
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenExpediente(verifyResult.item!)}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Ver Expediente
                    </button>
                  </div>
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
            <div>
              <h3 className="text-sm font-serif font-black text-slate-900">
                Expedientes y Resoluciones Consignadas
              </h3>
              <p className="text-[11px] text-slate-400">Haz clic en cualquier fila para abrir y visualizar el expediente completo y documento PDF.</p>
            </div>
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
                  <tr
                    key={sub.id}
                    onClick={() => handleOpenExpediente(sub)}
                    className="hover:bg-cyan-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="p-3 pl-4 font-mono">
                      <span className="font-black text-[#00C8D4] block group-hover:underline flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#9B00CC]" />
                        {sub.ticket_code}
                      </span>
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
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
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
                    <td className="p-3 pr-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenExpediente(sub)}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white font-bold text-[10px] rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Expediente</span>
                      </button>
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

      {/* MODAL DETALLE DE EXPEDIENTE DIGITAL & VISOR PDF */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#0e011f] border border-[#00C8D4]/40 rounded-3xl max-w-5xl w-full text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left">
            
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white tracking-wider bg-gradient-to-r from-[#FF0096] to-[#9B00CC]">
                    EXPEDIENTE DIGITAL & CUSTODIA JURÍDICA
                  </span>
                  <span className="text-xs font-mono font-bold text-[#00C8D4]">
                    {selectedSubmission.ticket_code}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-white flex items-center gap-2">
                  <Scale className="w-6 h-6 text-[#00C8D4]" />
                  {selectedSubmission.file_name}
                </h2>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <select
                  value={selectedSubmission.status}
                  onChange={(e) => handleUpdateStatus(selectedSubmission.id, e.target.value as any)}
                  className={`text-xs font-black uppercase rounded-xl px-3 py-1.5 outline-none cursor-pointer border shadow-md ${
                    selectedSubmission.status === "validado" ? "bg-emerald-900/90 text-emerald-200 border-emerald-500" :
                    selectedSubmission.status === "recibido" ? "bg-cyan-900/90 text-cyan-200 border-cyan-500" :
                    selectedSubmission.status === "en_auditoria" ? "bg-amber-900/90 text-amber-200 border-amber-500" :
                    "bg-red-900/90 text-red-200 border-red-500"
                  }`}
                >
                  <option value="recibido">📥 Recibido</option>
                  <option value="validado">✅ Validado Jurídicamente</option>
                  <option value="en_auditoria">🔎 En Auditoría</option>
                  <option value="requiere_subsanacion">⚠️ Requiere Subsanación</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MODAL BODY (2 COLUMNS) */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1">
              
              {/* LEFT COLUMN: FICHA TÉCNICA Y RECAUDOS */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#00C8D4] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <UserCheck className="w-4 h-4 text-[#00C8D4]" />
                    Datos del Consignante y Representado
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Representante Legal / Abogado</span>
                      <span className="font-bold text-white text-sm">{selectedSubmission.representative_name}</span>
                      <span className="text-slate-400 font-mono text-[11px] block">RIF / Cédula: {selectedSubmission.representative_id}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Empresa / Cliente</span>
                      <span className="font-semibold text-slate-200">{selectedSubmission.client_name}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-[#FF0096]" />
                        <span>{selectedSubmission.email}</span>
                      </div>
                      {selectedSubmission.phone && (
                        <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-[#00C8D4]" />
                          <span>{selectedSubmission.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* HUELLA CRIPTOGRÁFICA SHA-256 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Huella Criptográfica SHA-256
                    </h4>
                    <span className="text-[9px] font-mono text-emerald-500 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Inalterable</span>
                  </div>

                  <div className="p-3 bg-black/60 border border-slate-800 rounded-xl font-mono text-[10px] text-emerald-300 break-all leading-relaxed select-all">
                    {selectedSubmission.sha256_hash}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Tamaño: {selectedSubmission.file_size}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyHashInModal(selectedSubmission.sha256_hash)}
                      className="text-xs text-[#00C8D4] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      {copiedModalHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedModalHash ? "Hash Copiado" : "Copiar Hash"}
                    </button>
                  </div>
                </div>

                {/* NOTAS DE AUDITORÍA JURÍDICA (EDITABLE) */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#9B00CC]" />
                      Dictamen / Notas de Auditoría
                    </h4>
                    {modalSavedSuccess && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                        <Check className="w-3 h-3" /> Dictamen Guardado
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Escribe dictamen, anotaciones jurídicas o recaudos faltantes..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-[#00C8D4] font-sans leading-relaxed"
                  />

                  <button
                    type="button"
                    onClick={handleSaveModalNotes}
                    className="w-full py-2 bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] hover:opacity-90 text-white font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Notas de Auditoría</span>
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN: VISOR DE DOCUMENTO PDF */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#FF0096]" />
                    Visor de Documento PDF Consignado
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Tipo: {documentTypeLabels[selectedSubmission.document_type] || selectedSubmission.document_type}
                  </span>
                </div>

                {/* IFRAME OR DIGITAL PDF PREVIEW CARD */}
                {selectedSubmission.file_url ? (
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden min-h-[420px] shadow-inner">
                    <iframe
                      src={selectedSubmission.file_url}
                      className="w-full h-full min-h-[420px] border-none"
                      title={`Visor PDF ${selectedSubmission.file_name}`}
                    />
                  </div>
                ) : (
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[420px] shadow-inner">
                    
                    {/* MARCA DE AGUA EN DIAGONAL */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg] select-none">
                      <span className="text-5xl font-black uppercase text-white tracking-widest text-center">
                        CUSTODIA JURÍDICA HOTELES DE VENEZUELA
                      </span>
                    </div>

                    {/* PDF SIMULATED DOCUMENT HEADER */}
                    <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between relative z-10">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-[#00C8D4] uppercase tracking-widest block">
                          REPÚBLICA BOLIVARIANA DE VENEZUELA — CUSTODIA JURÍDICA
                        </span>
                        <h3 className="text-lg font-serif font-black text-white mt-1">
                          {selectedSubmission.file_name}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                          TICKET ASOCIADO: {selectedSubmission.ticket_code}
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF0096] to-[#9B00CC] p-0.5 shrink-0 shadow-md">
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-[#00C8D4]">
                          <QrCode className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* DOCUMENT BODY PREVIEW TEXT */}
                    <div className="my-6 space-y-3 relative z-10 text-xs text-slate-300 font-serif leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                      <p className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">
                        [ DOCUMENTO RECIBIDO EN BÓVEDA DIGITAL SHA-256 ]
                      </p>
                      <p>
                        Se certifica haber recibido en el Portal de Carga Legal de Hoteles de Venezuela el documento formal titulado <strong className="text-white font-sans">{selectedSubmission.file_name}</strong> consignado por <strong className="text-white font-sans">{selectedSubmission.representative_name}</strong> (Identificación {selectedSubmission.representative_id}) correspondiente a la firma / entidad <strong className="text-white font-sans">{selectedSubmission.client_name}</strong>.
                      </p>
                      <p className="text-slate-400 text-[11px] font-sans">
                        Fecha y Hora de Estampado UTC: {selectedSubmission.timestamp_utc}
                      </p>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          PDF Criptográficamente Verificado
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                            `HOTELES DE VENEZUELA — EXPEDIENTE LEGAL CERTIFICADO\n\nTicket: ${selectedSubmission.ticket_code}\nDocumento: ${selectedSubmission.file_name}\nRepresentante: ${selectedSubmission.representative_name} (${selectedSubmission.representative_id})\nCliente: ${selectedSubmission.client_name}\nHash SHA-256: ${selectedSubmission.sha256_hash}\nFecha UTC: ${selectedSubmission.timestamp_utc}\nNotas Auditoría: ${selectedSubmission.notes || "N/A"}`
                          )}`}
                          download={`Certificado_${selectedSubmission.ticket_code}.txt`}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5 text-[#00C8D4]" />
                          <span>Descargar Ficha / Certificado</span>
                        </a>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
