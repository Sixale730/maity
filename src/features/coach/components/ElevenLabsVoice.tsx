import React, { useEffect, useState } from 'react';
import { env } from '@maity/shared';
import type { AgentState } from './CoachPage';

interface ElevenLabsVoiceProps {
  agentState: AgentState;
  onStateChange: (state: AgentState) => void;
  isEnabled: boolean;
}

export function ElevenLabsVoice({ agentState, onStateChange, isEnabled }: ElevenLabsVoiceProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Load ElevenLabs SDK script
  useEffect(() => {
    if (!isEnabled || !env.elevenLabsApiKey) return;

    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [isEnabled]);

  // Initialize conversation widget
  useEffect(() => {
    if (!isScriptLoaded || !env.elevenLabsApiKey || !env.elevenLabsAgentId) return;

    const initWidget = () => {
      try {
        // @ts-ignore - ElevenLabs widget global
        if (window.ElevenLabsConvAI) {
          // @ts-ignore
          const widget = new window.ElevenLabsConvAI({
            agentId: env.elevenLabsAgentId,
            onConnect: () => {
              console.log('ElevenLabs connected');
              onStateChange('idle');
            },
            onDisconnect: () => {
              console.log('ElevenLabs disconnected');
              onStateChange('idle');
            },
            onModeChange: (mode: any) => {
              console.log('Mode changed:', mode);
              switch (mode.mode) {
                case 'listening':
                  onStateChange('listening');
                  break;
                case 'thinking':
                  onStateChange('thinking');
                  break;
                case 'speaking':
                  onStateChange('speaking');
                  break;
                default:
                  onStateChange('idle');
              }
            },
            onMessage: (message: any) => {
              console.log('Agent message:', message);
              // Handle agent responses here
            },
            onError: (error: any) => {
              console.error('ElevenLabs error:', error);
              onStateChange('idle');
            }
          });

          setConversationId(widget.id);
        }
      } catch (error) {
        console.error('Failed to initialize ElevenLabs widget:', error);
      }
    };

    // Wait a bit for the script to fully load
    setTimeout(initWidget, 1000);
  }, [isScriptLoaded, onStateChange]);

  if (!isEnabled || !env.elevenLabsApiKey || !env.elevenLabsAgentId) {
    return null;
  }

  return (
    <div className="elevenlabs-voice-container">
      {/* The ElevenLabs widget will inject itself here */}
      <div id="elevenlabs-convai-widget" />
    </div>
  );
}