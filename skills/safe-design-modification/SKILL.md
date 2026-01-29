---
name: safe-design-modification
description: Ejecutor cuidadoso de cambios de diseño. Aplica reglas visuales sin romper estructura ni funcionalidad.
version: 1.0.0
author: "Antigravity Assistant"
---

## 🛠 Estructura Estándar
- Los reportes de ejecución deben guardarse en `resources/output`.


# 🥉 Safe Design Modification Skill (El Cirujano)

## 🧠 Objetivo
Aplicar los cambios definidos por el *Design-Only Planner* con precisión quirúrgica, asegurando que la funcionalidad y estructura base permanezcan intactas.

## ⚠️ Protocolo de Seguridad (CRÍTICO)
Antes de editar cualquier archivo, el agente **DEBE**:
1.  **Backup Obligatorio**: Crear una copia de seguridad física (`.bak`) del archivo antes de la edición.
    *   *Comando sugerido*: `copy-item "ruta/archivo.jsx" "ruta/archivo.jsx.bak"`
2.  **Registro en DESIGN_LOG.md**: Es OBLIGATORIO abrir y actualizar el `DESIGN_LOG.md` con el detalle del cambio ANTES de aplicar la edición. No se permite modificar código sin un registro previo en el log.
3.  **Read-Before-Write**: Entender completamente el componente actual.
4.  **Scope Check**: Asegurarse de tocar solo lo planeado.

## 📌 Reglas de Ejecución

### 1. Gestión de Errores y Reversión
- Si el cambio falla, el agente **DEBE RESTAURAR** inmediatamente la versión `.bak`.
- Nunca dejes el código en un estado roto "buscando la solución"; restaura y re-analiza.
- Informa al usuario: "El cambio falló, he restaurado la versión anterior para mantener la estabilidad."

### 2. Spacing & Layout
- No cambies el layout estructural (Grid/Flex) a menos que sea el objetivo específico.
- Usa padding y margin para ajustar "aire", no para mover bloques estructurales.

### 2. Copy & Contenido
- **Nunca** borres texto real para reemplazarlo con "Lorem Ipsum".
- Mantén los IDs y Clases existentes si son usados por JavaScript. Si necesitas estilos nuevos, **añade** clases, no reemplaces las viejas si dudas de su uso.

### 3. Componentes
- Al estilizar un componente, verifica su estado en responsive (Mobile/Desktop).
- Respeta la jerarquía visual definida en la *Constitución* (H1 > H2 > H3).

### 4. Prohibiciones Absolutas (The Red Lines)
❌ Borrar secciones enteras porque "no combinan". (Mejor adáptalas).
❌ "Optimizar" código lógico (JS/TS) mientras haces tareas de CSS/Diseño.
❌ Cambiar nombres de variables o funciones.

## 🛡️ Verificación Post-Cambio
Después de editar:
1.  ¿El código compila/renderiza?
2.  ¿Los botones siguen siendo clickeables?
3.  ¿El texto es legible (contraste)?
4.  ¿Se respeta la *Constitución Maity*?
5.  ¿Se ha cerrado el registro en el `DESIGN_LOG.md` con el resultado final?
