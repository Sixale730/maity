---
name: design-only-planner
description: Planificador de cambios de diseño. Convierte ideas abstractas en planes de acción concretos sin tocar código.
version: 1.0.0
author: "Antigravity Assistant"
---

## 🛠 Estructura Estándar
- Todo plan generado debe depositarse en `resources/output` para seguir el estándar de portabilidad.


# 🥈 Design-Only Planner Skill (El Estratega)

## 🧠 Objetivo
Transformar solicitudes vagas como "mejora el home" en un plan de batalla técnico preciso. **Nadie escribe código hasta que este plan exista.**

## 📌 Proceso de Planificación
Sigue estos pasos para cada solicitud de diseño:

### 1. Auditoría de Estado Actual (Gap Analysis)
Antes de proponer, observa lo que ya existe.
- ¿Qué secciones componen la página actual?
- ¿Qué elementos ya cumplen con la *Constitución de Marca*?
- ¿Qué elementos la violan?

### 2. Definición del Alcance (Scope)
Clasifica los cambios:
- **[TOCAR]**: Secciones que necesitan rediseño.
- **[NO TOCAR]**: Secciones que deben permanecer idénticas (Critical Preservation).
- **[AÑADIR]**: Nuevos elementos que no existen.

### 3. Mapeo de Estilos (Style Mapping)
Define explícitamente qué variables de la constitución se aplicarán.
- *Ejemplo*: "Header -> Cambiar fondo a Dark (#111), fuente a Geist Bold, mantener links actuales".

## 🛡️ Reglas del Planificador
1.  **Evita cambios impulsivos**: Pregúntate "¿Es necesario mover esto?".
2.  **Narrativa Visual**: Asegura que el flujo visual tenga sentido de arriba a abajo.
3.  **No duplicar**: Verifica si un componente ya existe antes de planear uno nuevo.
4.  **Estrategia de Rollback**: Todo plan debe contemplar cómo restaurar la versión anterior si el diseño no convence.

## 📝 Salida Esperada (Output)
Genera un plan o lista de verificación en markdown:
```markdown
# Plan de Diseño: [Nombre de la Tarea]

## Secciones a Modificar
1. [Nombre Sección]
   - Cambio: [Descripción]
   - Razón: [Constitución / Petición Usuario]
   - Riesgo: [Bajo/Medio/Alto]

## Elementos Intocables (Protected)
- [Lista de elementos que no se deben romper]

## Plan de Verificación y Respaldo
- [ ] Backup realizado (`.bak`).
- [ ] Verificación post-cambio (Compilación + Responsividad).
- [ ] Procedimiento de restauración en caso de error.
```
