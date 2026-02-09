/**
 * Debug Logs Panel
 *
 * Collapsible panel showing real-time debug logs during recording.
 * Displays WebSocket events, Deepgram messages, segments, and errors.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { cn } from '@maity/shared';
import type { DebugLogEntry, DebugLogType } from '../contexts/RecordingContext';

interface DebugLogsPanelProps {
  logs: DebugLogEntry[];
  isExpanded: boolean;
  onToggle: () => void;
}

const TYPE_COLORS: Record<DebugLogType, string> = {
  WS_OPEN: 'text-green-400',
  WS_CLOSE: 'text-red-400',
  WS_ERROR: 'text-red-400',
  DEEPGRAM: 'text-blue-400',
  SEGMENT: 'text-purple-400',
  INTERIM: 'text-gray-400',
  AUDIO: 'text-yellow-400',
  STATE: 'text-orange-400',
  ERROR: 'text-red-400',
  SAVE: 'text-green-400',
  KEEPALIVE: 'text-cyan-400',
  STALL: 'text-amber-400',
};

const TYPE_ICONS: Record<DebugLogType, string> = {
  WS_OPEN: '\u{1F7E2}',  // Green circle
  WS_CLOSE: '\u{1F534}', // Red circle
  WS_ERROR: '\u{1F534}', // Red circle
  DEEPGRAM: '\u{1F535}', // Blue circle
  SEGMENT: '\u{1F7E3}',  // Purple circle
  INTERIM: '\u{26AA}',   // White circle
  AUDIO: '\u{1F7E1}',    // Yellow circle
  STATE: '\u{1F7E0}',    // Orange circle
  ERROR: '\u{1F534}',    // Red circle
  SAVE: '\u{1F7E2}',     // Green circle
  KEEPALIVE: '\u{1F7E6}', // Cyan square (teal)
  STALL: '\u{1F7E7}',     // Orange square (amber warning)
};

function formatTime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  const remainingMs = ms % 1000;
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}.${remainingMs.toString().padStart(3, '0')}`;
}

export function DebugLogsPanel({ logs, isExpanded, onToggle }: DebugLogsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest log when expanded
  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length, isExpanded]);

  const handleCopyLogs = useCallback(() => {
    const logsJson = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(logsJson);
  }, [logs]);

  return (
    <div className="mt-4 rounded-xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-300">
            Debug Logs
          </span>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {logs.length}
          </span>
        </div>

        {isExpanded && logs.length > 0 && (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-gray-400 hover:text-gray-200"
              onClick={handleCopyLogs}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
        )}
      </button>

      {/* Logs Table */}
      {isExpanded && (
        <div
          ref={scrollRef}
          className="max-h-64 overflow-y-auto border-t border-white/10"
        >
          {logs.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              No logs yet. Start recording to see debug output.
            </div>
          ) : (
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/10">
                <tr className="text-gray-500 text-left">
                  <th className="w-20 px-3 py-2">TIME</th>
                  <th className="w-24 px-3 py-2">TYPE</th>
                  <th className="px-3 py-2">DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className={cn(
                      'border-t border-white/5 hover:bg-white/5',
                      log.type === 'ERROR' && 'bg-red-500/10'
                    )}
                  >
                    <td className="px-3 py-1.5 text-gray-500 whitespace-nowrap">
                      {formatTime(log.timestamp)}
                    </td>
                    <td className={cn('px-3 py-1.5 whitespace-nowrap', TYPE_COLORS[log.type])}>
                      <span className="mr-1">{TYPE_ICONS[log.type]}</span>
                      {log.type}
                    </td>
                    <td className="px-3 py-1.5 text-gray-300 break-all">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default DebugLogsPanel;
