# Estructura del Body para n8n → evaluation-complete

## Body Actual (Nueva Estructura) ✅

```json
{
  "request_id": "ed165a4a-0be6-4625-86f5-36142afd8f5a",
  "status": "complete",
  "result": {
    "clarity": 20,
    "structure": 10,
    "connection": 15,
    "influence": 10,
    "feedback": "Comenzar con una presentación clara y profesional en menos de 30 segundos"
  }
}
```

**Notas**:
- El `score` general se calcula automáticamente: `(clarity + structure + connection + influence) / 4`
- Las métricas individuales están en base 0-100 cada una
- El score final es el promedio de las 4 métricas (0-100)
- El campo `feedback` es obligatorio

---

## Body Alternativo (Con score explícito)

Si prefieres enviar el score directamente:

```json
{
  "request_id": "{{ $('Data').item.json.request_id }}",
  "status": "complete",
  "result": {
    "score": 85,
    "feedback": "{{ $json.output.ai_notes }}",
    "clarity": 22,
    "structure": 20,
    "connection": 23,
    "influence": 20
  }
}
```

---

## Campos Requeridos

### 1. `clarity` (number, required)
Claridad en la comunicación (0-100)
- Evalúa qué tan claro y comprensible fue el mensaje

### 2. `structure` (number, required)
Estructura de la presentación (0-100)
- Evalúa la organización y coherencia del discurso

### 3. `connection` (number, required)
Conexión con el interlocutor (0-100)
- Evalúa el rapport y empatía generada

### 4. `influence` (number, required)
Influencia y persuasión (0-100)
- Evalúa la capacidad de influir y persuadir

### 5. `feedback` (string, required)
Retroalimentación específica en texto
- Debe ser concreta y accionable
- Ejemplo: "Comenzar con una presentación clara y profesional en menos de 30 segundos"

### 6. `score` (number, optional - se calcula automáticamente)
Puntuación general de 0-100
- Si no se proporciona, se calcula automáticamente: `(clarity + structure + connection + influence) / 4`
- Si se proporciona explícitamente, se usa ese valor

---

## Ejemplo Completo

```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "complete",
  "result": {
    "clarity": 88,
    "structure": 80,
    "connection": 92,
    "influence": 80,
    "feedback": "Excelente presentación con estructura clara. Lograste establecer un buen rapport inicial y mantener la atención del interlocutor. Para mejorar: trabaja en cerrar con una llamada a la acción más directa y específica."
  }
}
```

**Nota**: El campo `score` es opcional. Si no se envía, se calculará automáticamente como promedio: `(88 + 80 + 92 + 80) / 4 = 85`

---

## Cómo se ve en el Frontend

Con la estructura completa, el usuario verá:

1. **Score Principal**: Número grande con color (verde/amarillo/rojo) - Promedio de las 4 métricas (0-100)
2. **Métricas por Categoría**: 4 barras de progreso:
   - **Claridad** (0-100): Claridad en la comunicación
   - **Estructura** (0-100): Estructura de la presentación
   - **Conexión** (0-100): Conexión con el interlocutor
   - **Influencia** (0-100): Influencia y persuasión
3. **Feedback General**: Texto descriptivo con recomendaciones específicas

---

## Notas Importantes

- Las métricas `clarity`, `structure`, `connection`, `influence` deben estar en el rango 0-100 cada una
- El campo `feedback` es obligatorio y debe ser específico y accionable
- Si no envías `score`, se calculará automáticamente como promedio: `(clarity + structure + connection + influence) / 4`
- Si envías `score` explícitamente, ese valor tendrá prioridad sobre el cálculo automático

---

## Configuración en n8n

1. En el nodo HTTP Request que llama a `/api/evaluation-complete`
2. Configurar el body como JSON
3. Usar las variables de tu flujo de LLM para completar los campos:
   ```json
   {
     "request_id": "{{ $('Webhook').item.json.request_id }}",
     "status": "complete",
     "result": {
       "clarity": {{ $json.scores.clarity }},
       "structure": {{ $json.scores.structure }},
       "connection": {{ $json.scores.connection }},
       "influence": {{ $json.scores.influence }},
       "feedback": "{{ $json.feedback }}"
     }
   }
   ```
4. Asegúrate de que tu LLM devuelva scores en el rango correcto (0-100 para cada métrica)
5. El promedio se calculará automáticamente en el backend
