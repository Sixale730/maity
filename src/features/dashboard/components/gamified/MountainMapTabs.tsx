import { lazy, Suspense, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/components/ui/tabs';
import { MountainMapRendererProps } from './mountain-map-types';
import { BackgroundSelector } from './BackgroundSelector';
import { BACKGROUND_OPTIONS, type BackgroundId } from './background-options';
import { NodeOverlay } from './NodeOverlay';

const MountainMapPhaser = lazy(() => import('./renderers/MountainMapPhaser'));
const MountainMapPixi = lazy(() => import('./renderers/MountainMapPixi'));
const MountainMapKonva = lazy(() => import('./renderers/MountainMapKonva'));
const MountainMapR3F = lazy(() => import('./renderers/MountainMapR3F'));
const MountainMapSVG = lazy(() =>
  import('./MountainMap').then(m => ({ default: m.MountainMap }))
);

const TABS = [
  { id: 'phaser', label: 'Phaser', color: '#f5a623' },
  { id: 'pixi', label: 'PixiJS', color: '#e91e63' },
  { id: 'konva', label: 'Konva', color: '#00bcd4' },
  { id: 'r3f', label: 'R3F', color: '#76ff03' },
  { id: 'svg', label: 'SVG', color: '#9c27b0' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="w-6 h-6 border-2 border-[#f15bb5] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function MountainMapTabs({ nodes, completedNodes }: MountainMapRendererProps) {
  const [activeTab, setActiveTab] = useState<TabId>('phaser');
  const [backgroundId, setBackgroundId] = useState<BackgroundId>('none');

  const activeBg = BACKGROUND_OPTIONS.find((o) => o.id === backgroundId);

  return (
    <div className="flex flex-col h-full">
      <BackgroundSelector value={backgroundId} onChange={setBackgroundId} />
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabId)}
        className="flex flex-col h-full"
      >
        <TabsList className="bg-[#111118] border border-[#1e1e2e] self-center mb-3">
          {TABS.map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-[#1e1e2e] data-[state=active]:text-white text-[#a0a0b0] gap-1.5 text-xs px-2.5"
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: tab.color }}
              />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="flex-1 mt-0" forceMount={undefined}>
            {activeBg?.src ? (
              <div className="w-full h-full min-h-[400px] relative">
                <img
                  src={activeBg.src}
                  alt={activeBg.label}
                  className="w-full h-full object-contain rounded-lg"
                />
                <NodeOverlay nodes={nodes} completedNodes={completedNodes} />
              </div>
            ) : (
              <Suspense fallback={<LoadingSpinner />}>
                {activeTab === tab.id && (
                  <RendererSwitch id={tab.id} nodes={nodes} completedNodes={completedNodes} />
                )}
              </Suspense>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function RendererSwitch({ id, nodes, completedNodes }: { id: TabId } & MountainMapRendererProps) {
  const props = { nodes, completedNodes };
  switch (id) {
    case 'phaser': return <MountainMapPhaser {...props} />;
    case 'pixi': return <MountainMapPixi {...props} />;
    case 'konva': return <MountainMapKonva {...props} />;
    case 'r3f': return <MountainMapR3F {...props} />;
    case 'svg': return <MountainMapSVG {...props} />;
  }
}
