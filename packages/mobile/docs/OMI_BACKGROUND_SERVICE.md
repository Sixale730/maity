# Omi Background Service - Documentación Técnica

## 📋 Descripción General

El `OmiLifeLoggingService` es un servicio en segundo plano que mantiene conexión continua con el dispositivo Omi, captura audio streaming, detecta conversaciones mediante VAD (Voice Activity Detection), y procesa automáticamente las transcripciones.

---

## 🏗️ Arquitectura del Servicio

### Componentes Principales

```
OmiLifeLoggingService
├── BLEConnectionManager
│   ├── Mantiene conexión BLE estable
│   ├── Maneja reconexión automática
│   └── Monitorea calidad de señal
│
├── AudioStreamHandler
│   ├── Recibe paquetes OPUS via BLE
│   ├── Decodifica OPUS → PCM
│   └── Buffer de audio en memoria
│
├── VADProcessor
│   ├── Analiza frames de audio en tiempo real
│   ├── Detecta inicio/fin de voz
│   ├── Segmenta conversaciones
│   └── Threshold configurab

le
│
├── SegmentProcessor
│   ├── Recibe segments completos del VAD
│   ├── Guarda audio temporal
│   ├── Transcribe con Whisper API
│   ├── Genera embeddings (OpenAI)
│   └── Guarda en Supabase
│
└── NotificationManager
    ├── Foreground service notification
    ├── Progress updates
    └── User alerts
```

---

## 🎙️ Voice Activity Detection (VAD)

### ¿Qué es VAD?

Voice Activity Detection es un algoritmo que distingue entre:
- **Voz humana** (speech)
- **Silencio** (silence)
- **Ruido de fondo** (noise)

### ¿Por qué es necesario?

Sin VAD, tendríamos que:
1. Grabar audio continuamente (consume batería)
2. Transcribir TODO (caro con Whisper API)
3. No sabríamos dónde cortar segments

Con VAD:
1. Solo procesamos cuando hay voz
2. Detectamos inicio/fin natural de conversaciones
3. Optimizamos costos y batería

### Funcionamiento del VAD

```typescript
// Configuración típica
const vadConfig = {
  // Audio configuration
  sampleRate: 16000,         // 16kHz (estándar para speech)
  frameDuration: 30,         // 30ms por frame

  // Detection thresholds
  positiveSpeechThreshold: 0.8,  // 80% confianza = voz
  negativeSpeechThreshold: 0.5,  // 50% confianza = no voz
  minSpeechFrames: 3,            // 3 frames consecutivos para confirmar

  // Segmentation
  silenceDuration: 2000,     // 2 segundos de silencio = fin
  maxSegmentDuration: 300000, // 5 minutos máximo por segment
};
```

### Estados del VAD

```
IDLE (Esperando)
  ↓ (detecta voz)
LISTENING (Grabando)
  ↓ (silencio > 2s)
PROCESSING (Transcribiendo)
  ↓ (guardado exitoso)
IDLE (Volver a esperar)
```

### Ejemplo de Flujo

```typescript
class VADProcessor {
  private audioBuffer: Float32Array[] = [];
  private state: 'idle' | 'listening' | 'processing' = 'idle';
  private lastVoiceTimestamp: number = 0;
  private segmentStartTime: number = 0;

  async processAudioFrame(frame: Float32Array): Promise<VADResult> {
    // 1. Analizar frame actual
    const vadResult = await this.vadModel.processFrame(frame);
    const hasVoice = vadResult.probability > 0.8;

    // 2. Máquina de estados
    switch (this.state) {
      case 'idle':
        if (hasVoice) {
          console.log('[VAD] 🎤 Voz detectada - Iniciando grabación');
          this.state = 'listening';
          this.segmentStartTime = Date.now();
          this.audioBuffer = [frame];
        }
        break;

      case 'listening':
        if (hasVoice) {
          // Continuar grabando
          this.audioBuffer.push(frame);
          this.lastVoiceTimestamp = Date.now();
        } else {
          // Verificar si es silencio prolongado
          const silenceDuration = Date.now() - this.lastVoiceTimestamp;

          if (silenceDuration >= 2000) {
            console.log('[VAD] 🔇 Silencio detectado - Finalizando segment');
            return this.completeSegment();
          }
        }

        // Verificar duración máxima
        if (Date.now() - this.segmentStartTime >= 300000) {
          console.log('[VAD] ⏱️ Duración máxima alcanzada');
          return this.completeSegment();
        }
        break;

      case 'processing':
        // Ignorar audio mientras procesa
        break;
    }

    return { type: 'continue' };
  }

  private async completeSegment(): Promise<VADResult> {
    this.state = 'processing';

    const segment = {
      audio: this.concatenateBuffers(this.audioBuffer),
      duration: Date.now() - this.segmentStartTime,
      startedAt: new Date(this.segmentStartTime),
      endedAt: new Date(),
    };

    // Limpiar buffer
    this.audioBuffer = [];

    // Volver a idle después de procesar
    this.state = 'idle';

    return { type: 'segment_complete', segment };
  }
}
```

---

## 📱 Background Service en Android/iOS

### Android: Foreground Service

En Android, para mantener un servicio corriendo incluso cuando la app está en background, necesitamos un **Foreground Service** con una notificación persistente.

```typescript
import BackgroundService from 'react-native-background-actions';

const task = async (taskDataArguments: any) => {
  const { delay } = taskDataArguments;

  await new Promise(async (resolve) => {
    // Loop principal
    for (let i = 0; BackgroundService.isRunning(); i++) {
      // Procesar audio
      await processAudioLoop();

      // Actualizar notificación
      await BackgroundService.updateNotification({
        taskTitle: 'Omi Recording',
        taskDesc: `Memories: ${memoriesCount} | ${formatDuration(totalDuration)}`,
        progressBar: { max: 100, value: batteryLevel },
      });

      await sleep(delay);
    }
  });
};

const options = {
  taskName: 'OmiLifeLogging',
  taskTitle: 'Omi está grabando',
  taskDesc: 'Capturando conversaciones...',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#3B82F6',
  linkingURI: 'maity://omi',
  parameters: {
    delay: 1000, // Check cada segundo
  },
};

await BackgroundService.start(task, options);
```

### iOS: Background Modes

En iOS, necesitamos declarar background modes:

```xml
<!-- ios/maity/Info.plist -->
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
  <string>location</string>
  <string>bluetooth-central</string>
</array>
```

**Limitaciones iOS:**
- Background tasks tienen límite de tiempo (~3 min sin audio activo)
- Para mantener activo: reproducir audio silencioso periódicamente
- Location updates ayudan a mantener app activa

---

## 🔋 Optimización de Batería

### Estrategias

**1. Processing Inteligente**
```typescript
// No procesar TODO inmediatamente
const shouldProcessNow = (segment: AudioSegment) => {
  // Si hay WiFi y cargando → procesar ahora
  if (isConnectedToWiFi() && isCharging()) {
    return true;
  }

  // Si batería baja → encolar para después
  if (batteryLevel < 20) {
    queueForLater(segment);
    return false;
  }

  // Si no hay red → guardar local
  if (!hasInternetConnection()) {
    saveToLocalQueue(segment);
    return false;
  }

  return true;
};
```

**2. Adaptive Frame Rate**
```typescript
// Ajustar frecuencia según estado
const getFrameProcessingInterval = () => {
  if (batteryLevel < 15) return 100;  // Cada 100ms (bajo consumo)
  if (batteryLevel < 30) return 50;   // Cada 50ms (moderado)
  return 30;                           // Cada 30ms (normal)
};
```

**3. Connection Management**
```typescript
// Reconexión con exponential backoff
let reconnectAttempts = 0;

const reconnect = async () => {
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 60000);
  await sleep(delay);

  try {
    await omiBluetoothService.reconnect();
    reconnectAttempts = 0; // Reset on success
  } catch (error) {
    reconnectAttempts++;
    await reconnect();
  }
};
```

---

## 📊 Monitoring y Métricas

### Métricas Importantes

```typescript
interface ServiceMetrics {
  // Conexión
  bleConnectionQuality: number;    // 0-100
  reconnectCount: number;
  lastReconnectTime: Date | null;

  // Audio
  audioPacketsReceived: number;
  audioPacketsLost: number;
  currentBufferSize: number;       // bytes

  // VAD
  segmentsDetected: number;
  activeRecordingDuration: number; // ms
  silenceDuration: number;         // ms

  // Processing
  segmentsProcessed: number;
  segmentsPending: number;
  transcriptionErrors: number;

  // Device
  omiBatteryLevel: number;
  phoneBatteryLevel: number;
  isCharging: boolean;

  // Performance
  avgProcessingTime: number;       // ms per segment
  apiLatency: number;              // ms
}
```

### Logging

```typescript
class ServiceLogger {
  log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level,
      message,
      data,
      metrics: getCurrentMetrics(),
    };

    // Log to console
    console.log(`[OmiService] [${level}] ${message}`, data);

    // Send to analytics (opcional)
    analytics.track('omi_service_log', entry);

    // Persist critical errors
    if (level === 'error') {
      persistErrorLog(entry);
    }
  }
}
```

---

## ⚠️ Error Handling

### Categorías de Errores

**1. BLE Connection Errors**
```typescript
try {
  await omiBluetoothService.connect(deviceId);
} catch (error) {
  if (error.code === 'DEVICE_NOT_FOUND') {
    // Device apagado o fuera de rango
    await showNotification('Omi no encontrado', 'Acércate al dispositivo');
    await scheduleReconnect(10000); // Retry en 10s
  } else if (error.code === 'CONNECTION_TIMEOUT') {
    // Timeout de conexión
    await reconnectWithBackoff();
  } else {
    // Error desconocido
    logger.error('BLE connection failed', error);
    await pauseRecording();
  }
}
```

**2. Transcription Errors**
```typescript
try {
  const transcript = await whisperAPI.transcribe(audioFile);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Rate limit de OpenAI
    await queueSegmentForRetry(segment, 60000); // Retry en 1 min
  } else if (error.code === 'NETWORK_ERROR') {
    // Sin conexión
    await saveSegmentToLocalQueue(segment);
  } else if (error.code === 'AUDIO_TOO_SHORT') {
    // Audio muy corto (< 1s)
    logger.warn('Audio segment too short, skipping');
  } else {
    // Error general
    logger.error('Transcription failed', error);
    await saveSegmentForManualReview(segment);
  }
}
```

**3. Storage Errors**
```typescript
try {
  await supabase.from('omi_memories').insert(memory);
} catch (error) {
  if (error.code === 'PGRST116') {
    // Duplicate key (ya existe)
    logger.warn('Memory already exists, skipping');
  } else if (error.message.includes('vector')) {
    // Error en embedding
    logger.error('Invalid embedding vector', { memoryId, error });
    await retryWithNewEmbedding(memory);
  } else {
    // Error general de DB
    await saveToLocalBackup(memory);
    throw error;
  }
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
describe('VADProcessor', () => {
  it('should detect voice activity', async () => {
    const vad = new VADProcessor();
    const voiceFrame = generateVoiceFrame();

    const result = await vad.processFrame(voiceFrame);
    expect(result.hasVoice).toBe(true);
  });

  it('should segment on silence', async () => {
    const vad = new VADProcessor();

    // Simular voz
    for (let i = 0; i < 100; i++) {
      await vad.processFrame(generateVoiceFrame());
    }

    // Simular silencio
    for (let i = 0; i < 100; i++) {
      const result = await vad.processFrame(generateSilenceFrame());
      if (result.type === 'segment_complete') {
        expect(result.segment).toBeDefined();
        expect(result.segment.audio.length).toBeGreaterThan(0);
        return;
      }
    }

    fail('Should have completed segment');
  });
});
```

### Integration Tests

```typescript
describe('OmiLifeLoggingService', () => {
  it('should process end-to-end', async () => {
    const service = new OmiLifeLoggingService();

    // Mock Omi device
    const mockDevice = createMockOmiDevice();

    // Start service
    await service.start(mockDevice);

    // Simulate audio stream
    mockDevice.emitAudioPackets(generateTestAudio(30000)); // 30s

    // Wait for processing
    await waitFor(() => service.getMetrics().segmentsProcessed > 0);

    // Verify in database
    const { data } = await supabase
      .from('omi_memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    expect(data).toHaveLength(1);
    expect(data[0].transcript).toBeDefined();
    expect(data[0].embedding).toBeDefined();
  });
});
```

---

## 📝 Checklist de Implementación

- [ ] Configurar permisos (BLE, audio, location, background)
- [ ] Implementar BLEConnectionManager
- [ ] Implementar AudioStreamHandler (OPUS decoder)
- [ ] Integrar VAD library
- [ ] Implementar VADProcessor con state machine
- [ ] Implementar SegmentProcessor
- [ ] Integrar Whisper API
- [ ] Integrar OpenAI Embeddings
- [ ] Configurar Foreground Service (Android)
- [ ] Configurar Background Modes (iOS)
- [ ] Implementar error handling robusto
- [ ] Agregar logging y métricas
- [ ] Optimizar para batería
- [ ] Testing unitario
- [ ] Testing de integración
- [ ] Testing en device real (24h)

---

## 🔗 Referencias

- [React Native Background Actions](https://github.com/Rapsssito/react-native-background-actions)
- [VAD React Native](https://github.com/ricky0123/vad)
- [Android Foreground Services](https://developer.android.com/develop/background-work/services/foreground-services)
- [iOS Background Modes](https://developer.apple.com/documentation/xcode/configuring-background-execution-modes)

---

**Última actualización:** 2025-10-13
