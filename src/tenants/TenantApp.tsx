import React, { Component, ErrorInfo, ReactNode } from "react";
import { TenantProvider, useTenant } from "./tenantContext";
import { SaaSTenantLandingPage } from "./SaaSTenantLandingPage";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class TenantErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[TenantApp ErrorBoundary] Runtime render error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0e011f] flex flex-col items-center justify-center p-6 text-center text-white space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#FF0096]/20 border border-[#FF0096]/40 flex items-center justify-center text-[#FF0096] text-2xl font-black shadow-2xl">
            ⚠️
          </div>
          <div className="max-w-md space-y-3">
            <h2 className="text-2xl font-black font-serif text-white">Sello de Excelencia • Hoteles de Venezuela</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ha ocurrido una breve interrupción visual al cargar el sitio. Presiona el botón a continuación para recargar la experiencia.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-extrabold text-xs shadow-xl cursor-pointer hover:opacity-90 transition-all active:scale-95"
          >
            🔄 Recargar Sitio Web
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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

  return <SaaSTenantLandingPage config={config} />;
}

export default function TenantApp() {
  return (
    <TenantErrorBoundary>
      <TenantProvider>
        <TenantAppContent />
      </TenantProvider>
    </TenantErrorBoundary>
  );
}
