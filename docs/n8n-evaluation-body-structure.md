# Estructura del Body para n8n → evaluation-complete

## Body Actual (Incompleto) ❌

```json
{
  "request_id": "{{ $('Data').item.json.request_id }}",
  "status": "complete",
  "result": {
    "score": {{ $json.output.scores.overall_score }},
    "feedback": "{{ $json.output.ai_notes }}"
  }
}
```

**Problema**: Solo envía `score` y `feedback`, pero el frontend espera más campos para mostrar la evaluación completa.

---

## Body Corregido (Completo) ✅

```json
{
  "request_id": "{{ $('Data').item.json.request_id }}",
  "status": "complete",
  "result": {
    "score": {{ $json.output.scores.overall_score }},
    "feedback": "{{ $json.output.ai_notes }}",
    "metrics": {
      "communication": {{ $json.output.scores.communication || 0 }},
      "salesTechnique": {{ $json.output.scores.sales_technique || 0 }},
      "productKnowledge": {{ $json.output.scores.product_knowledge || 0 }},
      "objectionHandling": {{ $json.output.scores.objection_handling || 0 }},
      "closing": {{ $json.output.scores.closing || 0 }}
    },
    "strengths": {{ JSON.stringify($json.output.strengths || []) }},
    "weaknesses": {{ JSON.stringify($json.output.weaknesses || []) }}
  }
}
```

---

## Campos Requeridos

### 1. `score` (number, required)
Puntuación general de 0-100

### 2. `feedback` (string, required)
Retroalimentación general en texto

### 3. `metrics` (object, optional pero recomendado)
Desglose de puntuaciones por categoría:
- `communication`: Habilidades de comunicación (0-100)
- `salesTechnique`: Técnicas de ventas (0-100)
- `productKnowledge`: Conocimiento del producto (0-100)
- `objectionHandling`: Manejo de objeciones (0-100)
- `closing`: Técnicas de cierre (0-100)

### 4. `strengths` (array de strings, optional pero recomendado)
Lista de fortalezas identificadas:
```json
[
  "Excelente rapport inicial con el cliente",
  "Buena identificación de pain points",
  "Comunicación clara y concisa"
]
```

### 5. `weaknesses` (array de strings, optional pero recomendado)
Lista de áreas de mejora:
```json
[
  "Profundizar más en las necesidades específicas",
  "Ser más específico con los beneficios cuantificables",
  "Mejorar el manejo de objeciones de precio"
]
```

---

## Ejemplo Completo

```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "complete",
  "result": {
    "score": 85,
    "feedback": "Excelente desempeño en la sesión. El vendedor demostró buenas habilidades de comunicación y conocimiento del producto. Se recomienda trabajar en el cierre de objeciones.",
    "metrics": {
      "communication": 90,
      "salesTechnique": 85,
      "productKnowledge": 88,
      "objectionHandling": 75,
      "closing": 82
    },
    "strengths": [
      "Excelente rapport inicial con el cliente",
      "Buena identificación de pain points",
      "Presentación clara del valor del producto",
      "Escucha activa y empática"
    ],
    "weaknesses": [
      "Profundizar más en las objeciones de presupuesto",
      "Proporcionar más ejemplos cuantificables",
      "Mejorar el tiempo de cierre"
    ]
  }
}
```

---

## Cómo se ve en el Frontend

Con la estructura completa, el usuario verá:

1. **Score Principal**: Número grande con color (verde/amarillo/rojo)
2. **Métricas por Categoría**: Barras de progreso para cada categoría
3. **Fortalezas**: Lista con checkmarks verdes
4. **Áreas de Mejora**: Lista con alertas amarillas
5. **Feedback General**: Texto descriptivo al final

---

## Notas Importantes

- Si `metrics`, `strengths` o `weaknesses` no están disponibles, el frontend mostrará valores por defecto
- El campo `feedback` siempre se muestra si existe
- Todos los scores deben estar entre 0-100
- Los arrays pueden estar vacíos `[]` si no hay datos

---

## Configuración en n8n

1. En el nodo HTTP Request que llama a `/api/evaluation-complete`
2. Configurar el body como JSON
3. Usar las variables de tu flujo de LLM para completar los campos
4. Asegúrate de que los arrays usen `JSON.stringify()` para formatear correctamente
