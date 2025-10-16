import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Progress } from '@/ui/components/ui/progress';
import { CheckCircle2, Circle, Trophy, Target, TrendingUp } from 'lucide-react';
import { supabase, cn } from '@maity/shared';

interface ScenarioProgress {
  scenarioId: string;
  scenarioName: string;
  scenarioCode: string;
  profileId: string;
  profileName: string;
  difficultyId: string;
  difficultyLevel: number;
  difficultyName: string;
  completed: boolean;
  passed: boolean;
  bestScore: number | null;
  attempts: number;
  lastAttempt: Date | null;
}

interface ProfileProgress {
  profileId: string;
  profileName: string;
  totalScenarios: number;
  completedScenarios: number;
  passedScenarios: number;
  progressPercentage: number;
  difficulties: {
    easy: { total: number; completed: number; passed: number };
    medium: { total: number; completed: number; passed: number };
    hard: { total: number; completed: number; passed: number };
  };
}

interface RoleplayRoadmapProps {
  userId?: string;
}

// Type for voice_profile_scenarios query result
type VoiceProfileScenarioRow = {
  id: string;
  profile_id: string;
  scenario_id: string;
  difficulty_id: string;
  min_score_to_pass: number | null;
  voice_agent_profiles: {
    id: string;
    name: string;
  };
  voice_scenarios: {
    id: string;
    name: string;
    code: string;
    order_index: number;
  };
  voice_difficulty_levels: {
    id: string;
    level: number;
    name: string;
    code: string;
  };
};

export function RoleplayRoadmap({ userId }: RoleplayRoadmapProps) {
  const [loading, setLoading] = useState(true);
  const [scenarioProgress, setScenarioProgress] = useState<ScenarioProgress[]>([]);
  const [profileProgress, setProfileProgress] = useState<ProfileProgress[]>([]);

  useEffect(() => {
    if (userId) {
      loadProgress();
    }
  }, [userId]);

  const loadProgress = async () => {
    if (!userId) return; // Guard: userId is required

    try {
      setLoading(true);

      // Cargar todos los escenarios disponibles con sus perfiles y dificultades
      const { data: allScenariosRaw, error: scenariosError } = await supabase
        .schema('maity')
        .from('voice_profile_scenarios')
        .select(`
          id,
          profile_id,
          scenario_id,
          difficulty_id,
          min_score_to_pass,
          voice_agent_profiles!inner (
            id,
            name
          ),
          voice_scenarios!inner (
            id,
            name,
            code,
            order_index
          ),
          voice_difficulty_levels!inner (
            id,
            level,
            name,
            code
          )
        `)
        .eq('voice_agent_profiles.is_active', true)
        .eq('voice_scenarios.is_active', true)
        .order('voice_scenarios.order_index');

      if (scenariosError || !allScenariosRaw) {
        console.error('Error loading scenarios:', scenariosError);
        throw scenariosError || new Error('No scenarios data');
      }

      // Type assertion for the query result
      const allScenarios = allScenariosRaw as VoiceProfileScenarioRow[];

      console.log('📊 Roadmap - Scenarios loaded:', {
        count: allScenarios.length,
        sample: allScenarios[0]
      });

      // Cargar las sesiones completadas del usuario
      const { data: userSessions, error: sessionsError } = await supabase
        .schema('maity')
        .from('voice_sessions')
        .select(`
          id,
          profile_scenario_id,
          score,
          passed,
          ended_at,
          session_metadata
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .not('score', 'is', null);

      if (sessionsError) throw sessionsError;

      // Procesar los datos para crear el progreso por escenario
      const progressMap = new Map<string, ScenarioProgress>();

      allScenarios.forEach((scenario, index) => {
        try {
          // Validar que todas las relaciones existan y tengan las propiedades necesarias
          if (!scenario?.voice_scenarios?.id ||
              !scenario?.voice_agent_profiles?.id ||
              !scenario?.voice_difficulty_levels?.id) {
            console.warn('📊 Roadmap - Escenario con datos incompletos, omitiendo:', {
              index,
              scenarioId: scenario?.id,
              hasVoiceScenarios: !!scenario?.voice_scenarios,
              hasVoiceProfiles: !!scenario?.voice_agent_profiles,
              hasDifficultyLevels: !!scenario?.voice_difficulty_levels
            });
            return;
          }

          const profileScenarioId = scenario.id;
          const userSessionsForScenario = userSessions?.filter(
            s => s.profile_scenario_id === profileScenarioId
          ) || [];

          const completed = userSessionsForScenario.length > 0;
          const passed = userSessionsForScenario.some(s => s.passed === true);
          const bestScore = userSessionsForScenario.reduce((max, s) =>
            Math.max(max, s.score || 0), 0
          ) || null;
          const lastSession = userSessionsForScenario.sort((a, b) =>
            new Date(b.ended_at).getTime() - new Date(a.ended_at).getTime()
          )[0];

          progressMap.set(profileScenarioId, {
            scenarioId: scenario.scenario_id,
            scenarioName: scenario.voice_scenarios.name,
            scenarioCode: scenario.voice_scenarios.code,
            profileId: scenario.profile_id,
            profileName: scenario.voice_agent_profiles.name,
            difficultyId: scenario.difficulty_id,
            difficultyLevel: scenario.voice_difficulty_levels.level,
            difficultyName: scenario.voice_difficulty_levels.name,
            completed,
            passed,
            bestScore,
            attempts: userSessionsForScenario.length,
            lastAttempt: lastSession ? new Date(lastSession.ended_at) : null
          });
        } catch (err) {
          console.error('📊 Roadmap - Error processing scenario:', {
            index,
            scenarioId: scenario?.id,
            error: err
          });
        }
      });

      const progressArray = Array.from(progressMap.values());
      setScenarioProgress(progressArray);

      console.log('📊 Roadmap - Progress array created:', {
        totalScenarios: progressArray.length,
        completedScenarios: progressArray.filter(s => s.completed).length,
        passedScenarios: progressArray.filter(s => s.passed).length
      });

      // Calcular progreso por perfil
      const profileMap = new Map<string, ProfileProgress>();

      progressArray.forEach(scenario => {
        if (!scenario?.profileId || !scenario?.profileName) {
          console.warn('📊 Roadmap - Scenario missing profile data:', scenario);
          return;
        }

        if (!profileMap.has(scenario.profileId)) {
          profileMap.set(scenario.profileId, {
            profileId: scenario.profileId,
            profileName: scenario.profileName,
            totalScenarios: 0,
            completedScenarios: 0,
            passedScenarios: 0,
            progressPercentage: 0,
            difficulties: {
              easy: { total: 0, completed: 0, passed: 0 },
              medium: { total: 0, completed: 0, passed: 0 },
              hard: { total: 0, completed: 0, passed: 0 }
            }
          });
        }

        const profile = profileMap.get(scenario.profileId)!;
        profile.totalScenarios++;

        if (scenario.completed) profile.completedScenarios++;
        if (scenario.passed) profile.passedScenarios++;

        // Categorizar por dificultad (1=fácil, 2=medio, 3=difícil)
        const diffKey = scenario.difficultyLevel === 1 ? 'easy' :
                       scenario.difficultyLevel === 2 ? 'medium' : 'hard';

        profile.difficulties[diffKey].total++;
        if (scenario.completed) profile.difficulties[diffKey].completed++;
        if (scenario.passed) profile.difficulties[diffKey].passed++;
      });

      // Calcular porcentaje de progreso
      profileMap.forEach(profile => {
        profile.progressPercentage = profile.totalScenarios > 0
          ? Math.round((profile.passedScenarios / profile.totalScenarios) * 100)
          : 0;
      });

      const profileProgressArray = Array.from(profileMap.values());
      setProfileProgress(profileProgressArray);

      console.log('📊 Roadmap - Profile progress created:', {
        totalProfiles: profileProgressArray.length,
        profiles: profileProgressArray.map(p => ({ name: p.profileName, progress: p.progressPercentage }))
      });

    } catch (error) {
      console.error('📊 Roadmap - Error loading roadmap progress:', error);
      console.error('📊 Roadmap - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: number) => {
    switch(level) {
      case 1: return 'text-green-500';
      case 2: return 'text-yellow-500';
      case 3: return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyBgColor = (level: number) => {
    switch(level) {
      case 1: return 'bg-green-50 dark:bg-green-950/20';
      case 2: return 'bg-yellow-50 dark:bg-yellow-950/20';
      case 3: return 'bg-red-50 dark:bg-red-950/20';
      default: return 'bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getProfileIcon = (profileName: string) => {
    if (profileName.includes('CEO')) return '👔';
    if (profileName.includes('CTO')) return '💻';
    if (profileName.includes('CFO')) return '💰';
    return '👤';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Progreso General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {scenarioProgress.filter(s => s.completed).length}
              </div>
              <div className="text-sm text-muted-foreground">Escenarios Completados</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {scenarioProgress.filter(s => s.passed).length}
              </div>
              <div className="text-sm text-muted-foreground">Escenarios Aprobados</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {scenarioProgress.length > 0
                  ? Math.round((scenarioProgress.filter(s => s.passed).length / scenarioProgress.length) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Progreso Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progreso por Perfil */}
      {profileProgress.map(profile => (
        <Card key={profile.profileId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{getProfileIcon(profile.profileName)}</span>
                {profile.profileName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {profile.passedScenarios} / {profile.totalScenarios} aprobados
                </span>
                <div className="w-32">
                  <Progress value={profile.progressPercentage} className="h-2" />
                </div>
                <span className="text-sm font-bold">{profile.progressPercentage}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs de Dificultad */}
            <div className="space-y-4">
              {/* Fácil */}
              <div className={cn("p-4 rounded-lg", getDifficultyBgColor(1))}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={cn("font-medium flex items-center gap-2", getDifficultyColor(1))}>
                    <Target className="w-4 h-4" />
                    Nivel Fácil
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {profile.difficulties.easy.passed} / {profile.difficulties.easy.total} aprobados
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {scenarioProgress
                    .filter(s => s.profileId === profile.profileId && s.difficultyLevel === 1)
                    .sort((a, b) => a.scenarioName.localeCompare(b.scenarioName))
                    .map(scenario => (
                      <div
                        key={scenario.scenarioId + scenario.difficultyId}
                        className={cn(
                          "p-2 rounded border text-sm flex items-center gap-2",
                          scenario.passed
                            ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                            : scenario.completed
                            ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                            : "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        {scenario.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : scenario.completed ? (
                          <Circle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 truncate">
                          <div className="font-medium truncate">{scenario.scenarioName}</div>
                          {scenario.bestScore !== null && (
                            <div className="text-xs text-muted-foreground">
                              Mejor: {scenario.bestScore}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Intermedio */}
              <div className={cn("p-4 rounded-lg", getDifficultyBgColor(2))}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={cn("font-medium flex items-center gap-2", getDifficultyColor(2))}>
                    <TrendingUp className="w-4 h-4" />
                    Nivel Intermedio
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {profile.difficulties.medium.passed} / {profile.difficulties.medium.total} aprobados
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {scenarioProgress
                    .filter(s => s.profileId === profile.profileId && s.difficultyLevel === 2)
                    .sort((a, b) => a.scenarioName.localeCompare(b.scenarioName))
                    .map(scenario => (
                      <div
                        key={scenario.scenarioId + scenario.difficultyId}
                        className={cn(
                          "p-2 rounded border text-sm flex items-center gap-2",
                          scenario.passed
                            ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                            : scenario.completed
                            ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                            : "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        {scenario.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : scenario.completed ? (
                          <Circle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 truncate">
                          <div className="font-medium truncate">{scenario.scenarioName}</div>
                          {scenario.bestScore !== null && (
                            <div className="text-xs text-muted-foreground">
                              Mejor: {scenario.bestScore}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Difícil */}
              <div className={cn("p-4 rounded-lg", getDifficultyBgColor(3))}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={cn("font-medium flex items-center gap-2", getDifficultyColor(3))}>
                    <Trophy className="w-4 h-4" />
                    Nivel Difícil
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {profile.difficulties.hard.passed} / {profile.difficulties.hard.total} aprobados
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {scenarioProgress
                    .filter(s => s.profileId === profile.profileId && s.difficultyLevel === 3)
                    .sort((a, b) => a.scenarioName.localeCompare(b.scenarioName))
                    .map(scenario => (
                      <div
                        key={scenario.scenarioId + scenario.difficultyId}
                        className={cn(
                          "p-2 rounded border text-sm flex items-center gap-2",
                          scenario.passed
                            ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                            : scenario.completed
                            ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                            : "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        {scenario.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : scenario.completed ? (
                          <Circle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 truncate">
                          <div className="font-medium truncate">{scenario.scenarioName}</div>
                          {scenario.bestScore !== null && (
                            <div className="text-xs text-muted-foreground">
                              Mejor: {scenario.bestScore}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Leyenda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Aprobado</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-yellow-600" />
              <span>Completado (No aprobado)</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-gray-400" />
              <span>No intentado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}