/**
 * Web Recorder Feature
 *
 * Browser-based audio recording with real-time transcription.
 */

// Pages
export { RecorderLandingPage } from './pages/RecorderLandingPage';
export { RecorderPage } from './pages/RecorderPage';

// Components
export { RecordingTimer } from './components/RecordingTimer';
export { AudioVisualizer, CircularVisualizer } from './components/AudioVisualizer';
export { RecordingController, CompactRecordingController } from './components/RecordingController';
export { LiveTranscript, CompactTranscript, TranscriptStats } from './components/LiveTranscript';
export { SessionSummary, SummaryStats } from './components/SessionSummary';

// Context
export { RecordingProvider, useRecording } from './contexts/RecordingContext';

// Hooks
export { useAudioCapture } from './hooks/useAudioCapture';
export { useDeepgramSocket } from './hooks/useDeepgramSocket';
export { useRecordingSession } from './hooks/useRecordingSession';

// Lib
export { AudioCapture, isAudioCaptureSupported, isIOSSafari } from './lib/audioCapture';
export { DeepgramSocket, createDeepgramSocket } from './lib/deepgramSocket';
