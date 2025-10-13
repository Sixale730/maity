import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useVAD, VADAudioSegment } from '../../hooks/useVAD';
import { useOmiAudioStream } from '../../hooks/useOmiAudioStream';
import { useWhisper, WhisperResult } from '../../hooks/useWhisper';
import { omiBluetoothService } from '../../services/omiBluetoothService';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const VAD_THRESHOLD = parseFloat(process.env.EXPO_PUBLIC_VAD_THRESHOLD || '0.5');
const SILENCE_DURATION = parseInt(process.env.EXPO_PUBLIC_SILENCE_DURATION || '2000', 10);

interface TranscriptionRecord {
  id: string;
  timestamp: Date;
  duration: number;
  result: WhisperResult;
}

export default function OmiVADTestScreen() {
  const [transcriptions, setTranscriptions] = useState<TranscriptionRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOmiConnected, setIsOmiConnected] = useState(false);

  // Check Omi connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsOmiConnected(omiBluetoothService.isConnected());
    };

    checkConnection();

    // Listen for connection changes
    const listener = () => checkConnection();
    omiBluetoothService.addConnectionListener(listener);

    return () => {
      omiBluetoothService.removeConnectionListener(listener);
    };
  }, []);

  // Whisper hook
  const {
    transcribe,
    isTranscribing,
    error: whisperError,
  } = useWhisper({
    apiKey: OPENAI_API_KEY,
    language: 'es',
  });

  // Handle voice segment end
  const handleVoiceEnd = useCallback(
    async (segment: VADAudioSegment) => {
      console.log('[VAD Test] Voice segment ended:', {
        duration: segment.duration,
        fileUri: segment.fileUri,
      });

      try {
        setIsProcessing(true);

        // Transcribe the audio file
        const result = await transcribe(segment.fileUri);

        // Add to transcriptions list
        const record: TranscriptionRecord = {
          id: Date.now().toString(),
          timestamp: segment.startTime,
          duration: segment.duration,
          result,
        };

        setTranscriptions((prev) => [record, ...prev]);
        console.log('[VAD Test] Transcription complete:', result);
      } catch (error: any) {
        console.error('[VAD Test] Transcription error:', error);
        Alert.alert('Error', `Transcription failed: ${error.message}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [transcribe]
  );

  // Phone microphone VAD hook
  const phoneVAD = useVAD({
    config: {
      threshold: VAD_THRESHOLD,
      silenceDuration: SILENCE_DURATION,
      sampleRate: 16000,
    },
    onVoiceStart: () => {
      console.log('[VAD Test] Phone recording started');
    },
    onVoiceEnd: handleVoiceEnd,
    onError: (error) => {
      console.error('[VAD Test] Phone VAD error:', error);
      Alert.alert('Error', error.message);
    },
  });

  // Omi BLE stream hook
  const omiStream = useOmiAudioStream({
    config: {
      silenceDuration: SILENCE_DURATION,
      sampleRate: 16000,
    },
    onVoiceStart: () => {
      console.log('[VAD Test] Omi streaming started');
    },
    onVoiceEnd: handleVoiceEnd,
    onError: (error) => {
      console.error('[VAD Test] Omi stream error:', error);
      Alert.alert('Error', error.message);
    },
  });

  // Use appropriate hook based on Omi connection
  const {
    state: vadState,
    startRecording,
    stopRecording,
    resetState,
  } = isOmiConnected ? omiStream : phoneVAD;

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to stop recording');
    }
  };

  const handleClearTranscriptions = () => {
    setTranscriptions([]);
    resetState();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Omi Voice Test (Manual)</Text>
        <Text style={styles.subtitle}>
          Press Start to record, Stop when finished
        </Text>
      </View>

      {/* Configuration Display */}
      <View style={styles.configCard}>
        <Text style={styles.configTitle}>Configuration</Text>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Audio Source:</Text>
          <Text style={[
            styles.configValue,
            isOmiConnected && styles.configValueHighlight,
          ]}>
            {isOmiConnected ? 'Omi Device (BLE)' : 'Phone Microphone'}
          </Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Recording Mode:</Text>
          <Text style={styles.configValue}>Manual (Button Control)</Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Transcription:</Text>
          <Text style={styles.configValue}>OpenAI Whisper API</Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Language:</Text>
          <Text style={styles.configValue}>Spanish (es)</Text>
        </View>
      </View>

      {/* VAD State Display */}
      <View style={styles.stateCard}>
        <View style={styles.stateHeader}>
          <Text style={styles.stateTitle}>Recording State</Text>
          {vadState.isRecording && (
            <View style={styles.recordingIndicator} />
          )}
        </View>

        <View style={styles.stateGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={[
              styles.statValue,
              vadState.isRecording && styles.statValueActive,
            ]}>
              {vadState.isRecording ? 'Recording' : 'Idle'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>
              {vadState.audioDuration.toFixed(1)}s
            </Text>
          </View>
        </View>

        {vadState.error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{vadState.error}</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsSection}>
        {!vadState.isRecording ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartRecording}
            disabled={isProcessing}
          >
            <Text style={styles.startButtonText}>
              {isProcessing ? 'Processing...' : 'Start Recording'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopRecording}
          >
            <Text style={styles.stopButtonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}

        {transcriptions.length > 0 && !vadState.isRecording && !isProcessing && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearTranscriptions}
          >
            <Text style={styles.clearButtonText}>Clear Results</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={styles.processingCard}>
          <ActivityIndicator color="#3B82F6" />
          <Text style={styles.processingText}>
            Transcribing audio...
          </Text>
        </View>
      )}

      {/* Transcriptions List */}
      <ScrollView style={styles.transcriptionsContainer}>
        <View style={styles.transcriptionsHeader}>
          <Text style={styles.transcriptionsTitle}>
            Transcriptions ({transcriptions.length})
          </Text>
          {isTranscribing && (
            <ActivityIndicator size="small" color="#3B82F6" />
          )}
        </View>

        {transcriptions.length === 0 && !vadState.isRecording && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Press "Start Recording" to begin testing
            </Text>
            <Text style={styles.emptySubtext}>
              Speak naturally, then press Stop when finished
            </Text>
          </View>
        )}

        {transcriptions.map((record) => (
          <View key={record.id} style={styles.transcriptionCard}>
            <View style={styles.transcriptionHeader}>
              <Text style={styles.transcriptionTime}>
                {record.timestamp.toLocaleTimeString()}
              </Text>
              <Text style={styles.transcriptionDuration}>
                {record.duration.toFixed(1)}s
              </Text>
            </View>

            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultMode}>OpenAI Whisper</Text>
                <Text style={styles.resultLatency}>
                  {record.result.duration}ms
                </Text>
              </View>

              {record.result.error ? (
                <Text style={styles.resultError}>{record.result.error}</Text>
              ) : (
                <Text style={styles.resultText}>{record.result.transcript}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  configCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  configTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  configLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  configValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  configValueHighlight: {
    color: '#10B981',
  },
  stateCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  stateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  statValueActive: {
    color: '#3B82F6',
  },
  errorBanner: {
    backgroundColor: '#7F1D1D',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
  },
  controlsSection: {
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  stopButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  processingCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  processingText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  transcriptionsContainer: {
    flex: 1,
  },
  transcriptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transcriptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  transcriptionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  transcriptionTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transcriptionDuration: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultMode: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'uppercase',
  },
  resultLatency: {
    fontSize: 11,
    color: '#6B7280',
  },
  resultText: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
  },
  resultError: {
    fontSize: 12,
    color: '#FCA5A5',
    fontStyle: 'italic',
  },
});
