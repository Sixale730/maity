---
name: brand-design-constitution
description: Constitución de Diseño y Marca Maity Antigravity. Define identidad, tipografías, colores y filosofía.
version: 1.0.0
author: "Antigravity Assistant"
---

# 🥇 Brand & Design Constitution (Constitución de Marca y Diseño)

## 🛠 Estructura Estándar
- **Configuración**: Esta skill se rige por el estándar Meta-Antigravity.
- **Activos**: Los recursos de marca (Fonts, Logos) deben referenciarse preferiblemente desde `resources/input` para máxima portabilidad, aunque se permite el acceso a la carpeta global `Manual Maity` si está presente.

> [!IMPORTANT]
> **ESTA SKILL ES LA LEY SUPREMA DEL DISEÑO.**
> Cualquier cambio visual debe adherirse estrictamente a estas reglas. Si una instrucción del usuario contradice esta constitución, **solicita confirmación antes de proceder**.

## 🧠 Filosofía Central: Adaptación no Destructiva
Antes de aplicar cualquier estilo, el agente debe asumir el rol de **"Guardián del Código"**.
1.  **Respeto Estructural**: El código existente (lógica, funciones, rutas) es el esqueleto. La marca Maity es la piel. No rompas los huesos para cambiar la piel.
2.  **Evolución, no Revolución**: Adapta los elementos visuales existentes al estilo Maity. No borres secciones enteras a menos que sea explícitamente solicitado.
3.  **Verificación de Funcionalidad**: Si un cambio estético amenaza con romper una funcionalidad (ej. un botón se vuelve ilegible o inalcanzable), **DETENTE**. La funcionalidad tiene prioridad sobre la estética ciega.

## 🎨 Identidad Visual (Visual Identity)

### 1. Tipografías (Typography)
Estas son las **únicas** tipografías permitidas. No uses Arial, Roboto, ni otras fuentes genéricas a menos que sea un fallback del sistema.

*   **Principal (Cuerpo/UI)**: **Inter**
    *   Uso: Textos largos, botones, UI general.
    *   Ubicación de referencia: `D:\Proyectos Poncho Antigravity\Skills Antigravity Web\Manual Maity\Fonts\Inter-VariableFont_opsz,wght.ttf`
    *   *Nota*: Si usas Google Fonts, importa `Inter`.

*   **Secundaria / Títulos**: **Geist**
    *   Uso: Títulos grandes, headers, momentos de impacto "tech".
    *   Ubicación de referencia: `D:\Proyectos Poncho Antigravity\Skills Antigravity Web\Manual Maity\Fonts\Geist-VariableFont_wght.ttf`

### 2. Colores (Colors)
El esquema de colores debe evocar "Tecnología Humana" y "Magia".

*   **Maity Rosa (Primary Brand Color)**:
    *   Referencia visual: `Maity Rosa.png`
    *   Uso: Gradientes, botones primarios (CTAs), acentos importantes.
    *   Hex (Oficial): `#ff0050`
    *   CMYK: `0% 95% 50% 0%`

*   **Fondo & Base (Backgrounds)**:
    *   **Dark Mode First**: La estética es predominantemente oscura, elegante, "espacial" o "cyber".
    *   **Blanco/Claro**: Usado para texto sobre fondos oscuros.
    *   Referencia Logos: `Logo Text White.png` (Texto blanco sobre fondo oscuro).

### 3. Estilo & Tono (Style & Tone)
*   **Minimalismo Premium**: Menos es más, pero lo que hay debe verse *caro* y *pulido*.
*   **Micro-interacciones**: Todo debe sentirse vivo. Hover effects suaves, transiciones sutiles.
*   **Glassmorphism**: Uso de traspariencias y desenfoques (blur) para dar profundidad. 

---

## 🛡️ Reglas de Protección (The Shield)
1.  **Nunca cambiar tipografías** fuera de las autorizadas.
2.  **No eliminar secciones existentes** para "limpiar" el diseño sin preguntar.
3.  **No cambiar el orden de los bloques** sin autorización expresa.
4.  **Consistencia**: Todo nuevo diseño debe parecer que siempre perteneció al universo Maity.

## 🗣️ Instrucciones para el Agente
Cuando el usuario pida un cambio de diseño:
1.  Consulta esta constitución.
2.  Identifica qué elementos del código actual violan la constitución (ej. "tienen tipografía Times New Roman").
3.  Genera un plan de cambio que **solo** afecte esos elementos, manteniendo la estructura intacta.
