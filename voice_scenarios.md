# Voice Scenarios - Maity Platform

Este documento describe los escenarios de roleplay de voz disponibles en la plataforma Maity.

## Resumen

Total de escenarios activos: **5**

---

## 1. Primera Visita

**Código:** `first_visit`
**Categoría:** Discovery
**Orden:** 1
**Duración estimada:** 5 minutos

### Contexto
Primer contacto con el prospecto para entender sus necesidades y pain points. El agente no conoce tu empresa ni tu solución.

### Objetivos

**Objetivo Principal:**
- Identificar necesidades y pain points

**Objetivos Secundarios:**
- Establecer rapport profesional
- Calificar al lead
- Entender contexto del negocio
- Identificar presupuesto disponible

**Métricas de Éxito:**
- pain_points_identified
- budget_discussed
- next_steps_defined

---

## 2. Presentación de Producto

**Código:** `product_demo`
**Categoría:** Presentation
**Orden:** 2
**Duración estimada:** 7 minutos

### Contexto
Demostración de la solución adaptada a las necesidades identificadas. El agente ya conoce tu propuesta inicial.

### Objetivos

**Objetivo Principal:**
- Mostrar valor de la solución

**Objetivos Secundarios:**
- Conectar features con pain points
- Generar interés
- Responder preguntas técnicas
- Demostrar diferenciadores

**Métricas de Éxito:**
- value_proposition_clear
- differentiators_communicated
- interest_generated

---

## 3. Manejo de Objeciones

**Código:** `objection_handling`
**Categoría:** Negotiation
**Orden:** 3
**Duración estimada:** 6 minutos

### Contexto
El cliente presenta dudas y objeciones sobre la solución propuesta. Está evaluando riesgos y alternativas.

### Objetivos

**Objetivo Principal:**
- Resolver objeciones efectivamente

**Objetivos Secundarios:**
- Mantener confianza
- Reforzar propuesta de valor
- Identificar objeciones ocultas
- Proporcionar pruebas sociales

**Métricas de Éxito:**
- objections_addressed
- trust_maintained
- concerns_mitigated

---

## 4. Negociación y Cierre

**Código:** `closing`
**Categoría:** Closing
**Orden:** 4
**Duración estimada:** 8 minutos

### Contexto
Negociación de términos y cierre de la venta. El cliente está listo para decidir pero busca mejores condiciones.

### Objetivos

**Objetivo Principal:**
- Cerrar el acuerdo

**Objetivos Secundarios:**
- Negociar términos favorables
- Asegurar compromiso
- Definir próximos pasos
- Crear urgencia

**Métricas de Éxito:**
- deal_closed
- terms_agreed
- timeline_defined

---

## 5. Seguimiento Post-Demo

**Código:** `follow_up`
**Categoría:** Nurturing
**Orden:** 5
**Duración estimada:** 4 minutos

### Contexto
Seguimiento después de la demostración para mantener el momentum. Han pasado días desde el último contacto.

### Objetivos

**Objetivo Principal:**
- Mantener interés activo

**Objetivos Secundarios:**
- Resolver dudas pendientes
- Avanzar en el proceso
- Involucrar stakeholders
- Superar inercia

**Métricas de Éxito:**
- momentum_maintained
- next_meeting_scheduled
- stakeholders_engaged

---

## Categorías de Escenarios

1. **Discovery** - Descubrimiento de necesidades
2. **Presentation** - Presentación de soluciones
3. **Negotiation** - Negociación y manejo de objeciones
4. **Closing** - Cierre de ventas
5. **Nurturing** - Seguimiento y nutrición de leads

## Estructura de Datos

Cada escenario contiene:
- **ID**: Identificador único UUID
- **Name**: Nombre descriptivo en español
- **Code**: Código interno único
- **Order Index**: Orden en la secuencia de práctica
- **Base Context**: Contexto del escenario para el roleplay
- **Objectives**: Estructura JSON con objetivos primarios, secundarios y métricas
- **Estimated Duration**: Duración estimada en segundos
- **Category**: Categoría del escenario
- **Is Active**: Estado de activación

---

*Generado automáticamente desde la base de datos Maity*
