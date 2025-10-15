import React from 'react';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { MaityVoiceAssistant } from '../components/MaityVoiceAssistant';

export function CoachPage() {
  return (
    <div className="flex-1 min-h-screen bg-black">
      <main className="w-full">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-white hover:bg-white/10" />
            <div>
              <h1 className="text-3xl font-bold text-white">Coach Maity</h1>
              <p className="text-white/70">Tu coach en habilidades blandas</p>
            </div>
          </div>
        </div>

        {/* Main Content - Voice Coach */}
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <MaityVoiceAssistant />
        </div>
      </main>
    </div>
  );
}