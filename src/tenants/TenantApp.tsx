import React from "react";
import { TenantProvider, useTenant } from "./tenantContext";
import { EstablecimientoDetalle } from "../pages/EstablecimientoDetalle";

function TenantAppContent() {
  const { config } = useTenant();

  // Renderizar la vista OnePage moderna del establecimiento
  return <EstablecimientoDetalle tenantSlug={config.slug} />;
}

export default function TenantApp() {
  return (
    <TenantProvider>
      <TenantAppContent />
    </TenantProvider>
  );
}
