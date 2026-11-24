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

---

## 5. Metodología de Razonamiento, Coherencia y Observación
- **Evitar Bucles y Cambiar Estrategia**: Si una prueba o solución choca contra una pared o estado bloqueante, no insistir ciegamente. Analizar inmediatamente una estrategia alternativa.
- **Observación Minuciosa de Capturas de Pantalla**: Inspeccionar en detalle cada elemento visual que comparta el usuario (estados en blanco, verificaciones pendientes, configuraciones) antes de solicitar pruebas redundantes.
- **Coherencia y Memoria del Flujo**: Mantener un hilo lógico de las tareas ya completadas y no repetir pruebas sobre módulos cuyo bloqueo proviene de proveedores externos (como la verificación de negocio en Meta).

---

## 6. Directiva Crítica de SEO y Mantenimiento de Autoridad (Reglas Inquebrantables)
Cualquier cambio en el diseño, la interfaz (UI) o la jerarquía visual **NUNCA debe alterar, modificar a la ligera ni corromper los metadatos y la estructura SEO** que posicionan a `hotelesdevenezuela.com` en el 1er lugar de Google para `"hoteles en venezuela"` y `"hoteles de venezuela"`.

1. **Meta Título Intocable (Home Principal `/`):**
   - El `<title>` oficial y estrictamente obligatorio para la página de inicio es:
     ```html
     <title>Hoteles de Venezuela | Reservas sin intermediarios | Hoteles en Venezuela</title>
     ```
   - Está terminantemente prohibido cambiarlo, parafrasearlo, acortarlo o adaptarlo en `index.html`, `HomeV2.tsx`, `Home.tsx` y `SeoHead.tsx` a menos que se indique explícitamente una estrategia SEO auditada.

2. **Meta Descripción Oficial:**
   - La descripción debe mantenerse alineada con la intención de búsqueda directa:
     ```html
     <meta name="description" content="Guía turística y directorio oficial de hoteles, posadas boutique, resorts y campamentos en Venezuela. Reserva directo con los anfitriones por WhatsApp sin intermediarios." />
     ```

3. **Jerarquía Visual vs. Semántica (`<h1>` / Headings):**
   - Si se ajusta la jerarquía visual del diseño por motivos estéticos, **la estructura semántica en el código HTML debe permanecer intacta**.
   - Debe existir un único y claro `<h1>` en la página principal (`Hoteles de Venezuela | Reservas sin intermediarios | Hoteles en Venezuela`), pudiendo aplicarse `display: none;` o estilos visuales independientes si el diseño minimalista lo requiere, pero el crawler de Google y herramientas como Seobility **deben** leer el `<h1>`, los encabezados (`<h2>`, `<h3>`) y el bloque semántico pre-renderizado (`#hdv-seo-prerender` en `index.html`) estructurados correctamente sin alterar ni provocar parpadeos en el diseño visual.

4. **Protocolo ante Rediseños:**
   - Antes de modificar componentes visuales principales, verificar siempre que los enlaces internos (hacia las más de 300 URLs del directorio) y los metadatos permanezcan estables para preservar la puntuación máxima en SEO técnico.

---

## 7. Directiva Arquitectónica y Estratégica Obligatoria (No Destructiva)
Toda modificación o nueva directriz que se aplique sobre el sistema debe respetar estas reglas como principio base de ingeniería y estrategia comercial:

1. **Preservación Estricta de Datos, Historial y Estructura Existente (Regla Anti-Borrado):**
   - **Nunca borrar, limpiar, truncar ni reiniciar** registros históricos de pre-registros, folios (`HDV-PR-...`, `HDV-EXO-...`, `HDV-FAC-...`), cupos de Alianza 50 Fundadores, auditorías de IP/consentimiento ni fichas consolidadas existentes en Supabase o almacenamiento persistente.
   - No reemplazar ni eliminar funcionalidades, rutas, módulos ni campos ya operativos al aplicar mejoras visuales o de catálogo; trabajar siempre de forma **aditiva, retrocompatible y mediante `upsert` / `merge` seguro**.
   - Cualquier cambio de esquema o estructura debe ser compatible con los datos ya guardados y conservar el historial íntegro.

2. **Estrategia Comercial en `/pre-registro` (Puerta de Entrada Ágil, Sin Fricción):**
   - Mantener `/pre-registro` enfocado en la conversión y el cierre rápido en 1 sola hoja: datos esenciales del establecimiento, categoría (lista desplegable unificada), ubicación/destino, captura de coordenadas GPS, foto representativa/frontal, contacto directo, aceptación legal y emisión inmediata de su credencial/comprobante con QR.
   - Evitar convertir el pre-registro inicial en un cuestionario o wizard pesado con cientos de etiquetas o configuraciones profundas que frenen el cierre comercial.
   - Conservar la riqueza de categorías, etiquetas y configuración avanzada (Documento 77 V15) para el catálogo integral, la ficha ampliada y la etapa posterior de inducción/atención al cliente según las necesidades de cada establecimiento.

3. **Criterio de Ejecución:**
   - Antes de editar archivos o proponer cambios, verificar el estado actual del código y los datos persistidos para no romper nada ya validado, compilar sin errores (`npx tsc --noEmit`) y hacer `commit` + `git push origin main` cuando esté verificado.



