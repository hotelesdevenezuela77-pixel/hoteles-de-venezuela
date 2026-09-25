/**
 * Configuración oficial de las líneas telefónicas y canales de WhatsApp de Hoteles de Venezuela
 */
export const OFFICIAL_WHATSAPP_NUMBER = "584145069774";
export const OFFICIAL_WHATSAPP_DISPLAY = "+58 414-5069774";
export const OFFICIAL_WHATSAPP_URL = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}`;
export const OFFICIAL_CALL_URL = `tel:+584145069774`;

export const SECONDARY_WHATSAPP_NUMBER = "584242608686";
export const SECONDARY_WHATSAPP_DISPLAY = "+58 424-260-8686";
export const SECONDARY_WHATSAPP_URL = `https://wa.me/${SECONDARY_WHATSAPP_NUMBER}`;
export const SECONDARY_CALL_URL = `tel:+584242608686`;

export const TERTIARY_WHATSAPP_NUMBER = "584244798412";
export const TERTIARY_WHATSAPP_DISPLAY = "+58 424-479-8412";
export const TERTIARY_WHATSAPP_URL = `https://wa.me/${TERTIARY_WHATSAPP_NUMBER}`;
export const TERTIARY_CALL_URL = `tel:+584244798412`;

export const OFFICIAL_PHONE_NUMBERS = [
  {
    display: OFFICIAL_WHATSAPP_DISPLAY,
    tel: OFFICIAL_CALL_URL,
    whatsapp: OFFICIAL_WHATSAPP_URL,
    label: "Línea Principal",
  },
  {
    display: SECONDARY_WHATSAPP_DISPLAY,
    tel: SECONDARY_CALL_URL,
    whatsapp: SECONDARY_WHATSAPP_URL,
    label: "Atención & Reservas",
  },
  {
    display: TERTIARY_WHATSAPP_DISPLAY,
    tel: TERTIARY_CALL_URL,
    whatsapp: TERTIARY_WHATSAPP_URL,
    label: "Soporte Directo",
  },
];


