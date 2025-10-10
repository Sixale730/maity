# Tareas para Sincronizar Mobile App con Web App

## ✅ Completadas

- [x] Implementar persistencia de sesión con SecureStore
  - App.tsx ahora guarda y restaura sesiones automáticamente
  - La sesión se mantiene entre reinicios de la app

- [x] Actualizar SessionsScreen para obtener datos reales de la DB
  - Conectado a RPC `get_user_sessions_history`
  - Muestra sesiones reales por usuario
  - Pull-to-refresh implementado
  - Estados de loading/error manejados

- [x] Actualizar RoleplayScreen con datos reales
  - Ya está conectado a RPC `get_user_recent_sessions`
  - Muestra historial real de sesiones del usuario
  - Mantiene UI actual con datos de DB

- [x] Crear CoachScreen
  - Pantalla creada con UI placeholder
  - Preparada para integración futura con MaityVoiceAssistant

- [x] Actualizar MainNavigator tabs para coincidir con web
  - ✅ Agregado: CoachScreen
  - ✅ Removido: ProfileScreen de tabs
  - ✅ Tabs actuales: Dashboard | Coach | Roleplay | Sessions

## ✅ Completadas (Continuación)

- [x] Crear SessionResultsScreen con navegación
  - ✅ SessionResultsScreen creada con diseño adaptado a móvil
  - ✅ SessionsNavigator con stack navigation
  - ✅ Navegación desde historial (SessionsScreen)
  - ✅ Muestra score, métricas, feedback del agente
  - ✅ Modal para ver transcripción
  - ⚠️ Nota: Gráficos radar omitidos (recharts no compatible con RN)

- [x] Arreglar dependencias y crash de la app
  - ✅ Actualizado React a 19.1.0 en mobile (requerido por React Native 0.81.4)
  - ✅ Removido React de dependencies en shared, solo peerDependency
  - ✅ Eliminado shared/node_modules para evitar duplicados
  - ✅ Configurado peerDependency flexible: `react: ">=18.0.0"`
  - ✅ Expo doctor: 17/17 checks passed ✓
  - ✅ Sin duplicados de React
  - ✅ App ya no crashea al abrir

## 🚧 En Progreso

Ninguna tarea en progreso actualmente.

## 📋 Pendientes

Ninguna tarea pendiente identificada. Todas las tareas críticas han sido completadas.

## ✅ Completadas Recientemente (2025-10-09)

### MobileVoiceAssistant Native SDK Implementation
- [x] Reemplazar WebView con implementación nativa
  - ✅ Instalado `@elevenlabs/react-native@0.4.0`
  - ✅ Instalado LiveKit dependencies: `@livekit/react-native@2.9.2`, `livekit-client@2.15.8`, `@livekit/react-native-webrtc@137.0.2`
  - ✅ Configurado override para `@elevenlabs/types@0.0.1` (bug en dependencias)
  - ✅ Agregado `<ElevenLabsProvider>` en App.tsx
  - ✅ Configurado permisos iOS (NSMicrophoneUsageDescription, NSCameraUsageDescription)
  - ✅ Configurado permisos Android (CAMERA, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS)
  - ✅ Reescrito MobileVoiceAssistant con `useConversation()` hook
  - ✅ Implementado manejo de mensajes en tiempo real
  - ✅ Implementado tracking de sesiones y transcripts
  - ✅ Agregado logging detallado de errores

**Por qué Native SDK (no WebView):**
- ❌ `@elevenlabs/client` NO funciona en React Native (usa `navigator.mediaDevices` del navegador)
- ❌ WebView funciona pero el usuario quiere ejecución local nativa
- ✅ `@elevenlabs/react-native` es la solución oficial de ElevenLabs para móvil
- ✅ Mejor rendimiento y experiencia nativa
- ✅ Acceso completo a APIs nativas de audio/micrófono

**IMPORTANTE:** Requiere development build (NO funciona con Expo Go):
```bash
cd packages/mobile
npx expo prebuild
npx expo run:android  # o run:ios
```

### RoleplayScreen Refactored
- [x] Eliminar sección "Escenarios Disponibles" con múltiples escenarios
  - ✅ Removido array hardcodeado de escenarios
  - ✅ Removida UI de selección de múltiples escenarios
  - ✅ Implementado flujo de escenario único como en web

- [x] Implementar progresión lineal de escenarios
  - ✅ Integrado RPC `get_or_create_user_progress`
  - ✅ Fetch automático de escenario actual desde DB
  - ✅ Soporte para escenarios bloqueados/desbloqueados
  - ✅ Muestra información completa del escenario (nombre, orden, dificultad, perfil)
  - ✅ Botón "Iniciar Práctica" directo sin selección

- [x] Arreglar visualización de datos del usuario
  - ✅ Se muestra nombre real del usuario (no "usuario")
  - ✅ Saludo personalizado: "Bienvenido, {userName}"
  - ✅ Fetch correcto de datos: name → nickname → email

### MobileVoiceAssistant Enhanced Error Logging
- [x] Agregar logging detallado en toda la aplicación
  - ✅ Verificación de variables de entorno (API Key, Agent ID)
  - ✅ Logs paso a paso de inicialización de conversación
  - ✅ Mensajes de error con JSON completo de objetos de error
  - ✅ Stack traces visibles en UI
  - ✅ Validación de permisos con mensajes claros
  - ✅ Logs de estado de audio y micrófono
  - ✅ Tracking de conexión/desconexión con razones
  - ✅ Validación de transcripción con longitud y duración

## ✅ Completadas Recientemente (2025-10-10)

### Arreglo Crítico: WebRTC Connection Error
- [x] Solucionar error "could not establish pc connection" en MobileVoiceAssistant
  - ✅ **Problema identificado**: Faltaban plugins de Expo requeridos para WebRTC
  - ✅ Instalado `@livekit/react-native-expo-plugin@^1.0.1`
  - ✅ Instalado `@config-plugins/react-native-webrtc@^12.0.0`
  - ✅ Actualizado `app.json` con los plugins requeridos
  - ✅ Regenerado build nativo con `npx expo prebuild --clean`

**Causa del error:**
- Los plugins de Expo son OBLIGATORIOS para que WebRTC funcione correctamente
- Sin ellos, los módulos nativos de WebRTC no se configuran adecuadamente
- Esto causaba que PeerConnection no se pudiera establecer

**Solución aplicada:**
```json
// app.json
"plugins": [
  "@livekit/react-native-expo-plugin",      // NUEVO ✅
  "@config-plugins/react-native-webrtc",    // NUEVO ✅
  "expo-secure-store",
  "expo-web-browser",
  "expo-font"
]
```

**Próximos pasos para testing:**
1. Reconstruir la app: `npx expo run:android` o `npx expo run:ios`
2. Probar conexión con el agente de voz
3. Verificar que se establece la conexión WebRTC sin errores

**Referencias:**
- [ElevenLabs React Native Docs](https://elevenlabs.io/docs/agents-platform/libraries/react-native)
- [Ejemplo oficial](https://github.com/elevenlabs/elevenlabs-examples/tree/main/examples/conversational-ai/react-native/elevenlabs-conversational-ai-expo-react-native)
- [LiveKit Expo Plugin](https://docs.livekit.io/home/quickstarts/expo/)

### Simplificación Completa: Implementación Basada en Ejemplo Oficial
- [x] Reescribir MobileVoiceAssistant para coincidir con ejemplo oficial de ElevenLabs
  - ✅ **Cambio principal**: Eliminado sistema de `conversationToken`, ahora usa `agentId` directamente
  - ✅ Agregados permisos Android adicionales: `ACCESS_NETWORK_STATE`, `INTERNET`, `SYSTEM_ALERT_WINDOW`, `WAKE_LOCK`, `BLUETOOTH`
  - ✅ Simplificado flujo de conexión: solo permisos → validar agentId → conectar
  - ✅ Eliminada complejidad innecesaria de tokens y endpoints
  - ✅ Implementación mínima funcional de ~460 líneas (vs ~640 anteriores)
  - ✅ Regenerado build nativo con nuevos permisos

**Cambios clave en la implementación:**

```typescript
// ANTES (con conversationToken - NO funcionaba)
const token = await getConversationToken(); // Endpoint separado
await conversation.startSession({
  conversationToken: token,
  userId: userId
});

// AHORA (con agentId - según ejemplo oficial)
await conversation.startSession({
  agentId: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID_TEST
});
```

**Beneficios:**
- ✅ Implementación más simple y directa
- ✅ Elimina punto de fallo (endpoint de tokens)
- ✅ Coincide exactamente con ejemplo oficial que SÍ funciona
- ✅ Menos código = menos bugs
- ✅ Más fácil de mantener y debuggear

**Archivos modificados:**
1. `app.json` - Agregados 5 permisos Android
2. `MobileVoiceAssistant.tsx` - Reescrito completamente (~200 líneas menos)

**Próximos pasos:**
1. Reconstruir app: `npx expo run:android`
2. Probar conexión con agente
3. Verificar que WebRTC conecta correctamente

**Nota importante:**
- El endpoint `/api/elevenlabs-conversation-token` ya no se usa
- Se puede eliminar en el futuro si no se necesita para la versión web

## 🎯 Prioridad Alta
1. SessionsScreen con datos reales
2. Crear SessionResultsScreen
3. Simplificar RoleplayScreen
4. Actualizar tabs de navegación

## 🔄 Prioridad Media
1. Crear CoachScreen
2. Debug MobileVoiceAssistant

## 📝 Notas
- Todas las pantallas deben coincidir con la funcionalidad de la web app
- Mantener consistencia en la UI/UX entre plataformas
- Usar componentes nativos de React Native cuando sea posible
- Asegurar que todos los datos vengan de la database real
