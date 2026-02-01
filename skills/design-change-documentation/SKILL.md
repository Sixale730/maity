---
name: design-change-documentation
description: Historial de decisiones de diseño. Documenta qué cambió, por qué y el impacto esperado.
version: 1.0.0
author: "Antigravity Assistant"
---

## 🛠 Estructura Estándar
- El archivo `DESIGN_LOG.md` se encuentra en la raíz del proyecto para facilitar el acceso inmediato.


# 🏅 Design Change Documentation Skill (El Historiador)

## 🧠 Objetivo
Evitar la amnesia del proyecto. Cada cambio visual importante debe dejar un rastro que explique el "Por qué".

## 📌 Cuándo Documentar (REGLA DE ORO)
- **ANTES** de tocar el código: Registrar la intención, la sección y la razón.
- **DURANTE** el cambio: Si surgen decisiones técnicas o de diseño imprevistas.
- **AL TERMINAR**: Confirmar el éxito del cambio y cualquier observación relevante.
- **PROHIBICIÓN**: No se permite realizar `replace_file_content` o similares sin una entrada previa en el log.

## 📝 Formato de Registro
Crea o actualiza un archivo `DESIGN_LOG.md` (o sección en el changelog) con:

### [Fecha] - [Nombre del Cambio]
*   **📍 Sección**: (e.g., Header, Footer, Hero)
*   **🔄 Cambio**: (e.g., "Se cambió la fuente de Roboto a Geist")
*   **❓ Razón**: (e.g., "Alineación con la Constitución Maity")
*   **📸 Antes/Después**: (Descripción breve o referencia a screenshot si es posible)
*   **⚠️ Impacto**: (e.g., "Afecta a todas las páginas que usan el componente Button")

## 🛡️ Beneficios
1.  **Defensa**: Si alguien pregunta "¿Por qué esto es rosa?", tienes la respuesta documentada.
2.  **Consistencia**: Ayuda a futuros agentes/desarrolladores a entender la evolución visual.
3.  **Reversibilidad**: Facilita entender qué deshacer si algo no gusta.
