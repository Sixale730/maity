/**
 * Recorder Logs Page (Admin)
 *
 * Admin-only page to view debug logs from web recorder sessions.
 * Allows debugging of user recording issues post-mortem.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, ArrowLeft } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { useUserRole } from '@maity/shared';
import { RecorderSessionsList } from '../components/RecorderSessionsList';
import { RecorderLogsViewer } from '../components/RecorderLogsViewer';
import type { RecorderSession } from '@maity/shared';

export function RecorderLogsPage() {
  const navigate = useNavigate();
  const { viewRole, isLoading: roleLoading } = useUserRole();
  const [selectedSession, setSelectedSession] = useState<RecorderSession | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (!roleLoading && viewRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [viewRole, roleLoading, navigate]);

  const handleSessionSelect = useCallback((session: RecorderSession) => {
    setSelectedSession(session);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedSession(null);
  }, []);

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (viewRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {selectedSession ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            )}
            <div className="flex items-center gap-3">
              <Bug className="w-6 h-6 text-purple-400" />
              <h1 className="text-xl font-semibold">
                {selectedSession
                  ? `Logs: ${selectedSession.title || 'Sin título'}`
                  : 'Recorder Debug Logs'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {selectedSession ? (
          <RecorderLogsViewer session={selectedSession} />
        ) : (
          <RecorderSessionsList onSelectSession={handleSessionSelect} />
        )}
      </main>
    </div>
  );
}

export default RecorderLogsPage;
