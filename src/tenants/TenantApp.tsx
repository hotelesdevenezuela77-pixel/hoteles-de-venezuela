import React from "react";
import { TenantProvider, useTenant } from "./tenantContext";
import { TemplateA } from "./templates/TemplateA";
import { TemplateB } from "./templates/TemplateB";

function TenantAppContent() {
  const { config } = useTenant();

  // Renderizar la plantilla correspondiente según la configuración del Tenant
  if (config.template === "A") {
    return <TemplateA />;
  }

  if (config.template === "B") {
    return <TemplateB />;
  }

  return (
    <div className="min-h-screen bg-[#0e011f] flex items-center justify-center text-white text-xs">
      Error: Plantilla no soportada ({config.template}) para {config.name}.
    </div>
  );
}

export default function TenantApp() {
  return (
    <TenantProvider>
      <TenantAppContent />
    </TenantProvider>
  );
}
