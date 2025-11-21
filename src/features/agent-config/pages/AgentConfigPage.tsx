/**
 * Agent Configuration Page
 *
 * Admin-only page for managing voice agent profiles and scenarios.
 * Features split view with list on left and editor on right.
 */

import { useState } from 'react';
import { Card } from '@/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs';
import { Settings2 } from 'lucide-react';
import type { AgentConfigTab } from '@maity/shared';

import { ProfilesList } from '../components/ProfilesList';
import { ProfileEditor } from '../components/ProfileEditor';
import { ScenariosList } from '../components/ScenariosList';
import { ScenarioEditor } from '../components/ScenarioEditor';

export default function AgentConfigPage() {
  const [activeTab, setActiveTab] = useState<AgentConfigTab>('profiles');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value as AgentConfigTab);
    // Clear selections when switching tabs
    setSelectedProfileId(null);
    setSelectedScenarioId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <Settings2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Configuración de Agentes</h1>
            <p className="text-slate-600">
              Gestiona perfiles de agentes y escenarios de práctica
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="border-b bg-slate-50/50 px-6 pt-6">
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger value="profiles" className="px-8">
                  Perfiles de Agentes
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="px-8">
                  Escenarios
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profiles Tab */}
            <TabsContent value="profiles" className="m-0">
              <div className="grid grid-cols-[400px_1fr] divide-x">
                {/* Left Panel - Profiles List */}
                <div className="h-[calc(100vh-280px)] overflow-y-auto">
                  <ProfilesList
                    selectedProfileId={selectedProfileId}
                    onSelectProfile={setSelectedProfileId}
                  />
                </div>

                {/* Right Panel - Profile Editor */}
                <div className="h-[calc(100vh-280px)] overflow-y-auto bg-slate-50/30">
                  <ProfileEditor
                    profileId={selectedProfileId}
                    onClose={() => setSelectedProfileId(null)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Scenarios Tab */}
            <TabsContent value="scenarios" className="m-0">
              <div className="grid grid-cols-[400px_1fr] divide-x">
                {/* Left Panel - Scenarios List */}
                <div className="h-[calc(100vh-280px)] overflow-y-auto">
                  <ScenariosList
                    selectedScenarioId={selectedScenarioId}
                    onSelectScenario={setSelectedScenarioId}
                  />
                </div>

                {/* Right Panel - Scenario Editor */}
                <div className="h-[calc(100vh-280px)] overflow-y-auto bg-slate-50/30">
                  <ScenarioEditor
                    scenarioId={selectedScenarioId}
                    onClose={() => setSelectedScenarioId(null)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
