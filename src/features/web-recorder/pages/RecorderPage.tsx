/**
 * Recorder Page
 *
 * Main recording interface with live transcription.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { RecordingProvider, useRecording } from '../contexts/RecordingContext';
import { RecordingTimer } from '../components/RecordingTimer';
import { CircularVisualizer } from '../components/AudioVisualizer';
import { RecordingController } from '../components/RecordingController';
import { LiveTranscript, TranscriptStats } from '../components/LiveTranscript';
import { SessionSummary } from '../components/SessionSummary';

function RecorderContent() {
  const navigate = useNavigate();
  const {
    state,
    initialize,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    saveRecording,
    reset,
  } = useRecording();

  const [showSummary, setShowSummary] = useState(false);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show summary after stopping
  useEffect(() => {
    if (state.status === 'processing') {
      // Wait a moment then show summary
      const timer = setTimeout(() => {
        setShowSummary(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.status]);

  const handleSave = async () => {
    try {
      const conversationId = await saveRecording();
      // Navigate to the conversation detail
      navigate(`/omi?conversation=${conversationId}`);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDiscard = () => {
    reset();
    setShowSummary(false);
    navigate('/recorder');
  };

  const handleBack = () => {
    if (state.status === 'recording' || state.status === 'paused') {
      // Confirm before leaving during recording
      if (window.confirm('¿Seguro que quieres salir? Se perderá la grabación actual.')) {
        reset();
        navigate('/recorder');
      }
    } else {
      navigate('/recorder');
    }
  };

  // Convert segments to display format
  const displaySegments = state.segments.map((seg) => ({
    id: seg.id,
    text: seg.text,
    isFinal: seg.isFinal,
  }));

  // Calculate word count
  const wordCount = state.segments.reduce((count, seg) => {
    return count + seg.text.split(/\s+/).filter(Boolean).length;
  }, 0);

  // Show summary view
  if (showSummary && (state.status === 'processing' || state.status === 'saving' || state.status === 'completed')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <SessionSummary
          segments={displaySegments}
          durationSeconds={state.durationSeconds - state.pausedDuration}
          onSave={handleSave}
          onDiscard={handleDiscard}
          isSaving={state.status === 'saving'}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold">Grabadora</h1>
        <div className="flex-1" />
        {state.status !== 'idle' && state.status !== 'initializing' && (
          <TranscriptStats segments={displaySegments} />
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Error Display */}
        {state.error && (
          <Card className="w-full max-w-md border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {state.error}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visualizer */}
        <CircularVisualizer
          level={state.audioLevel}
          isActive={state.status === 'recording'}
          size={140}
        />

        {/* Timer */}
        <RecordingTimer
          seconds={state.durationSeconds}
          isPaused={state.status === 'paused'}
        />

        {/* Status Label */}
        <div className="text-sm text-muted-foreground">
          {state.status === 'idle' && 'Listo para grabar'}
          {state.status === 'initializing' && 'Inicializando...'}
          {state.status === 'ready' && 'Presiona para grabar'}
          {state.status === 'recording' && 'Grabando...'}
          {state.status === 'paused' && 'En pausa'}
          {state.status === 'processing' && 'Procesando...'}
          {state.status === 'saving' && 'Guardando...'}
        </div>

        {/* Controls */}
        <RecordingController
          status={state.status}
          onStart={startRecording}
          onPause={pauseRecording}
          onResume={resumeRecording}
          onStop={stopRecording}
        />
      </main>

      {/* Live Transcript */}
      {(state.status === 'recording' || state.status === 'paused') && (
        <div className="border-t p-4">
          <LiveTranscript
            segments={displaySegments}
            interimText={state.interimText}
            maxHeight="200px"
          />
        </div>
      )}
    </div>
  );
}

export function RecorderPage() {
  return (
    <RecordingProvider>
      <RecorderContent />
    </RecordingProvider>
  );
}

export default RecorderPage;
