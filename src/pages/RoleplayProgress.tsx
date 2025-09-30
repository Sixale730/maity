import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { RoleplayRoadmap } from '@/components/roleplay/RoleplayRoadmap';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Map, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function RoleplayProgress() {
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex-1 h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden flex flex-col">
      <main className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="p-4 pb-2 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Map className="w-6 h-6 text-purple-500" />
                  Mi Progreso en Roleplay
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visualiza tu avance en los diferentes escenarios y perfiles
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/roleplay')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Roleplay
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {userId ? (
              <RoleplayRoadmap userId={userId} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Cargando tu progreso...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}