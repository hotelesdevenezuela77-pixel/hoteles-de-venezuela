# Directrices de Diseño e Identidad Visual Oficial

Este documento define la línea corporativa obligatoria de diseño para todas las páginas personalizadas, vistas y landing pages dentro de la plataforma **Hoteles de Venezuela**. Todo agente que trabaje en esta base de código debe ceñirse estrictamente a estas reglas.

---

## 1. Paleta de Colores Oficiales (Sin Negro Puro)
Queda prohibido el uso de negro puro (`#000000`) o gris carbón genérico (`#1a1a1a`) en textos primarios o fondos. Se debe usar la paleta oficial:
- **Azul Turquesa (Cian)**: `#00C8D4` (Utilizado para acentos primarios, llamadas a la acción B2B y elementos recomendados).
- **Magenta / Fucsia**: `#FF0096` (Utilizado para botones premium, llamados de atención del consumidor y etiquetas destacadas).
- **Púrpura Profundo**: `#9B00CC` (Utilizado en combinación con el Magenta para gradientes corporativos).
- **Oscuros de Contraste**: `#0e011f` y `#1a0533` (Utilizados para secciones de fondo oscuro o tarjetas destacadas; reemplazan al negro puro).
- **Color de Texto Base**: `#1e293b` (Slate-800) o `#0f172a` (Slate-900) para asegurar legibilidad elegante.

---

## 2. Tipografía Premium y Estilo de Banners
- **Fuentes**: 
  - Títulos principales en tipografía Serif elegante (*Playfair Display* o *Cinzel*).
  - Subtítulos y textos de cuerpo en tipografía Sans-Serif limpia (*Montserrat*, *Outfit* o *Inter*).
- **Banners de Portada (Full-Bleed)**:
  - Siempre deben ocupar el **100% del ancho de la pantalla (full-width)**, sin márgenes laterales ni bordes redondeados en la cabecera.
  - La imagen del banner debe tener la clase `scale-[1.08]` para recortar de forma limpia cualquier borde negro o letterbox que tenga el archivo original.
  - Debe contener un degradado blanco en la parte inferior (`from-white via-white/50 to-transparent`) que se funda de manera invisible con el fondo de la página, dando ilusión de continuidad.
  - Los títulos deben estar **centrados vertical y horizontalmente** dentro del banner, acompañados de un texto previo en mayúsculas espaciado (ej. `EL PARAÍSO TE ESPERA`).

---

## 3. Iconografía y Tablas B2B
- **Iconos Unicolor**: Queda prohibido el uso de emojis de sistema (`💰`, `🎯`, `🏆`, etc.). Se deben usar iconos SVG modernos de Lucide o similares de la siguiente forma:
  - Colocados dentro de **cajas de fondo sólido de color** (Cian, Magenta, Púrpura, Verde Esmeralda, etc.) con el vector SVG calado en **blanco puro por dentro**.
- **Tarjetas y Tablas Comparativas**:
  - Las opciones por defecto deben tener fondo blanco y borde gris sutil.
  - Las opciones destacadas o recomendadas deben tener un fondo de color sólido (como Azul Turquesa `#00C8D4` o el gradiente Púrpura Profundo `#0e011f` a `#1a0533`) con textos y checks en blanco puro, coronadas con la etiqueta rosa de *"Recomendado"*.

---

## 4. Secciones de Cierre (Bottom CTA)
- Las secciones de cierre para suscripción o contacto de WhatsApp deben presentarse en una tarjeta de fondo gradiente Magenta/Púrpura (`linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)`) con esquinas redondeadas generosas (`rounded-2xl` / `rounded-3xl`).
- Los botones de acción deben ser blancos con el texto en el color de acento magenta (`#FF0096`), acompañados del icono de WhatsApp.
