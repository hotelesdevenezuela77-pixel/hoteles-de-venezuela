import React from "react";
import { TenantProvider, useTenant } from "./tenantContext";
import { SaaSTenantLandingPage } from "./SaaSTenantLandingPage";

function TenantAppContent() {
  const { config, isLoading, error } = useTenant();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e011f] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00C8D4] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold tracking-widest uppercase text-slate-300">Cargando sitio oficial...</span>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-[#0e011f] flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-black font-serif text-[#FF0096]">Sitio Web No Encontrado</h2>
          <p className="text-xs text-slate-300">{error || "No se pudo cargar la configuración de este establecimiento."}</p>
        </div>
      </div>
    );
  }

  // Renderizar la Landing Page independiente profesional del cliente SaaS
  return <SaaSTenantLandingPage config={config} />;
}

export default function TenantApp() {
  return (
    <TenantProvider>
      <TenantAppContent />
    </TenantProvider>
  );
}
