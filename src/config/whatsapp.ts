/**
 * Configuración oficial de las líneas telefónicas y canales de WhatsApp de Hoteles de Venezuela
 */
export const OFFICIAL_WHATSAPP_NUMBER = "584145069774";
export const OFFICIAL_WHATSAPP_DISPLAY = "+58 414-5069774";
export const OFFICIAL_WHATSAPP_URL = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=Hola%2C%20quisiera%20informaci%C3%B3n%20sobre%20Hoteles%20de%20Venezuela`;
export const OFFICIAL_CALL_URL = `tel:+584145069774`;

export const SECONDARY_WHATSAPP_NUMBER = "584242608686";
export const SECONDARY_WHATSAPP_DISPLAY = "+58 424-260-8686";
export const SECONDARY_WHATSAPP_URL = `https://wa.me/${SECONDARY_WHATSAPP_NUMBER}?text=Hola%2C%20quisiera%20informaci%C3%B3n%20sobre%20Hoteles%20de%20Venezuela`;
export const SECONDARY_CALL_URL = `tel:+584242608686`;

export const TERTIARY_WHATSAPP_NUMBER = "584244798412";
export const TERTIARY_WHATSAPP_DISPLAY = "+58 424-479-8412";
export const TERTIARY_WHATSAPP_URL = `https://wa.me/${TERTIARY_WHATSAPP_NUMBER}?text=Hola%2C%20quisiera%20informaci%C3%B3n%20sobre%20Hoteles%20de%20Venezuela`;
export const TERTIARY_CALL_URL = `tel:+584244798412`;

export interface FooterContactButton {
  display: string;
  href: string;
  type: "whatsapp" | "call";
  label: string;
  badge: string;
  isExternal: boolean;
}

export const FOOTER_PHONE_BUTTONS: FooterContactButton[] = [
  {
    display: OFFICIAL_WHATSAPP_DISPLAY,
    href: OFFICIAL_WHATSAPP_URL,
    type: "whatsapp",
    label: "Canal Oficial WhatsApp",
    badge: "WhatsApp",
    isExternal: true,
  },
  {
    display: TERTIARY_WHATSAPP_DISPLAY,
    href: TERTIARY_WHATSAPP_URL,
    type: "whatsapp",
    label: "Atención & WhatsApp Directo",
    badge: "WhatsApp",
    isExternal: true,
  },
  {
    display: SECONDARY_WHATSAPP_DISPLAY,
    href: SECONDARY_CALL_URL,
    type: "call",
    label: "Llamada Telefónica Directa",
    badge: "Llamar",
    isExternal: false,
  },
];



