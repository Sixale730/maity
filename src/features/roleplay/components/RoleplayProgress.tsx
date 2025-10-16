import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Progress } from "@/ui/components/ui/progress";
import { Badge } from "@/ui/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/ui/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/components/ui/tooltip";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { Trophy, Shield, Award, Target, Star, TrendingUp, Brain, Users, Zap, Lock, CheckCircle2 } from "lucide-react";
import { supabase, RoleplayService } from "@maity/shared";

interface RoleCard {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  bgGradient: string;
  progress: number;
  currentLevel: number;
  totalLevels: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
  icon?: React.ReactNode;
  imageUrl?: string;
  unlockMessage?: string;
}

interface SkillData {
  skill: string;
  value: number;
  fullMark: 100;
}

interface VoiceAgentProfile {
  id: string;
  name: string;
  description: string;
  key_focus: string;
  communication_style: string;
  personality_traits: any;
  is_active: boolean;
}

interface UserVoiceProgress {
  id: string;
  user_id: string;
  profile_id: string;
  scenarios_completed: number;
  scenarios_failed: number;
  total_sessions: number;
  current_difficulty_level: number;
  current_scenario_order: number;
  average_score: number | null;
  best_score: number | null;
  streak_days: number;
  last_session_date: string | null;
}


const skillsData: SkillData[] = [
  { skill: "Liderazgo", value: 85, fullMark: 100 },
  { skill: "Comunicación", value: 92, fullMark: 100 },
  { skill: "Estrategia", value: 78, fullMark: 100 },
  { skill: "Innovación", value: 88, fullMark: 100 },
  { skill: "Análisis", value: 75, fullMark: 100 },
  { skill: "Decisión", value: 90, fullMark: 100 }
];

const weeklyProgress = [
  { day: "Lun", value: 85 },
  { day: "Mar", value: 72 },
  { day: "Mie", value: 90 },
  { day: "Jue", value: 88 },
  { day: "Vie", value: 95 },
  { day: "Sáb", value: 78 },
  { day: "Dom", value: 82 }
];

const achievements = [
  { id: 1, name: "Primera Sesión", icon: <Star className="w-6 h-6" />, unlocked: true },
  { id: 2, name: "Racha Semanal", icon: <Zap className="w-6 h-6" />, unlocked: true },
  { id: 3, name: "Líder Nato", icon: <Trophy className="w-6 h-6" />, unlocked: true },
  { id: 4, name: "Estratega", icon: <Target className="w-6 h-6" />, unlocked: false },
  { id: 5, name: "Innovador", icon: <Award className="w-6 h-6" />, unlocked: false },
  { id: 6, name: "Maestro", icon: <Shield className="w-6 h-6" />, unlocked: false }
];

function HexagonCard({ card, onProfileClick }: { card: RoleCard; onProfileClick?: (profileId: string) => void }) {
  // Helper function to darken a hex color
  const darkenColor = (color: string, percent: number = 30) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 0 ? 0 : R) * 0x10000 + (G < 0 ? 0 : G) * 0x100 + (B < 0 ? 0 : B)).toString(16).slice(1);
  };

  // Hexagon paths
  const hexagonPath = "M86.6 0 L173.2 50 L173.2 150 L86.6 200 L0 150 L0 50 Z";
  // Inner hexagon smaller (scaled 0.45 from top)
  const innerHexagonPath = "M86.6 25 L125.57 47.5 L125.57 92.5 L86.6 115 L47.63 92.5 L47.63 47.5 Z";

  // Create metallic gradient colors
  const getGradientColors = () => {
    if (card.isLocked) {
      return { top: '#374151', middle: '#2a2f3d', bottom: '#1f2937', opacity: 0.6 };
    }
    if (card.isCompleted) {
      return { top: `${card.color}30`, middle: `${card.color}20`, bottom: `${darkenColor(card.color, 20)}15`, opacity: 1 };
    }
    if (card.isActive) {
      return { top: `${card.color}dd`, middle: card.color, bottom: darkenColor(card.color, 50), opacity: 1 };
    }
    return { top: '#2a2a2a', middle: '#252525', bottom: '#1f2937', opacity: 1 };
  };

  const gradientColors = getGradientColors();
  const innerColor = card.isLocked ? '#1a1a1a' : card.isActive ? darkenColor(card.color, 40) : darkenColor(card.color, 35);

  // Unique IDs for gradients
  const mainGradientId = `gradient-main-${card.id}`;
  const mainClipId = `clip-main-${card.id}`;
  const innerClipId = `clip-inner-${card.id}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`relative ${card.isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => !card.isLocked && !card.isActive && onProfileClick?.(card.id)}
            style={{ width: '200px', height: '230px', margin: '20px' }}
          >
            <svg
              width="200"
              height="230"
              viewBox="0 0 173.2 200"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-all duration-300 ${card.isActive ? 'scale-110 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]' : ''} ${card.isLocked ? 'grayscale' : 'hover:scale-[1.15] hover:drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]'}`}
              style={{ opacity: gradientColors.opacity }}
            >
              <defs>
                {/* Main hexagon gradient */}
                <linearGradient id={mainGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={gradientColors.top} />
                  <stop offset="40%" stopColor={gradientColors.middle} />
                  <stop offset="100%" stopColor={gradientColors.bottom} />
                </linearGradient>

                {/* Main hexagon clip path */}
                <clipPath id={mainClipId}>
                  <path d={hexagonPath} />
                </clipPath>

                {/* Inner hexagon clip path */}
                <clipPath id={innerClipId}>
                  <path d={innerHexagonPath} />
                </clipPath>
              </defs>

              {/* Main hexagon background */}
              <path
                d={hexagonPath}
                fill={`url(#${mainGradientId})`}
              />

              {/* Inner hexagon background */}
              <path
                d={innerHexagonPath}
                fill={innerColor}
              />

              {/* Image clipped to inner hexagon */}
              {card.imageUrl && (
                <image
                  href={card.imageUrl}
                  x="17"
                  y="10"
                  width="140"
                  height="140"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#${innerClipId})`}
                  opacity={card.isLocked ? 0.5 : 1}
                  className={card.isLocked ? 'grayscale' : ''}
                />
              )}

              {/* Lock icon for locked cards */}
              {card.isLocked && !card.imageUrl && (
                <g transform="translate(76.6, 60)">
                  <Lock className="w-10 h-10 text-gray-400" />
                </g>
              )}
            </svg>

            {/* Text content overlay */}
            <div className="absolute bottom-10 left-0 right-0 text-center px-3">
              <h3 className={`text-2xl font-bold mb-1 ${card.isLocked ? 'text-gray-400' : 'text-white'} drop-shadow-lg`}>
                {card.title}
              </h3>
              <p className={`text-sm ${card.isLocked ? 'text-gray-500' : 'text-white/80'} drop-shadow-md`}>
                {card.subtitle}
              </p>
            </div>

            {/* Completion badge */}
            {card.isCompleted && !card.isLocked && (
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completado
              </Badge>
            )}

            {/* Lock icon overlay for locked cards */}
            {card.isLocked && card.imageUrl && (
              <div className="absolute top-[55px] left-[90px]">
                <Lock className="w-6 h-6 text-gray-300 bg-gray-700 rounded-full p-1" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        {(card.isLocked || card.isActive) && (
          <TooltipContent className="max-w-xs">
            {card.isLocked ? (
              <p className="font-medium">Termina los escenarios del perfil actual para desbloquear este</p>
            ) : card.isActive ? (
              <div>
                <p className="font-medium mb-1">Perfil Actual</p>
                <p className="text-sm">Nivel {card.currentLevel} de {card.totalLevels} - {card.progress}% completado</p>
              </div>
            ) : null}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export function RoleplayProgress() {
  const [roleCards, setRoleCards] = useState<RoleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [_userProgress, setUserProgress] = useState<UserVoiceProgress[] | null>(null);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all profiles using RPC
      const { data: profiles, error: profilesError } = await supabase
        .rpc('get_voice_agent_profiles') as { data: VoiceAgentProfile[] | null; error: any };

      console.log('Profiles fetched:', profiles, 'Error:', profilesError);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Fetch user's progress using RPC
      const { data: userProgress, error: progressError } = await supabase
        .rpc('get_user_voice_progress', { p_auth_id: user.id }) as { data: UserVoiceProgress[] | null; error: any };

      console.log('User progress fetched:', userProgress, 'Error:', progressError);

      if (progressError) {
        console.error('Error fetching user progress:', progressError);
      }

      // Check if there's any profile currently active
      // The active profile should be the one with progress that's not completed (scenarios_completed < 5)
      // If there are multiple, take the first one (by creation order)
      const activeProgress = userProgress?.find(p => p.scenarios_completed < 5);
      const activeProfileId = activeProgress?.profile_id;
      const hasActiveProfile = !!activeProgress;

      console.log('Has active profile:', hasActiveProfile, 'Active progress:', activeProgress);

      // Map color config for each profile
      const profileConfig: Record<string, any> = {
        'CTO': { color: "#3b82f6", imageUrl: "/lovable-uploads/CTO.png", icon: <Brain className="w-12 h-12" /> },
        'CFO': { color: "#10b981", imageUrl: "/lovable-uploads/CFO.png", icon: <TrendingUp className="w-12 h-12" /> },
        'CEO': { color: "#ef4444", imageUrl: "/lovable-uploads/CEO.png", icon: <Users className="w-12 h-12" /> }
      };

      const subtitles: Record<string, string> = {
        'CTO': 'Jefe de Tecnología',
        'CFO': 'Jefe de Finanzas',
        'CEO': 'Jefe Ejecutivo'
      };

      // Create cards from profiles
      const cards: RoleCard[] = (profiles || []).map(profile => {
        const progress = userProgress?.find(up => up.profile_id === profile.id);
        // Only mark as active if this profile's ID matches the active profile ID
        const isActive = activeProfileId === profile.id;
        const isCompleted = progress?.scenarios_completed >= 5;
        const config = profileConfig[profile.name] || {};

        return {
          id: profile.name.toLowerCase(),
          title: profile.name,
          subtitle: subtitles[profile.name] || profile.name,
          color: config.color || "#6b7280",
          bgGradient: "from-gray-500 to-gray-600",
          progress: progress ? (progress.scenarios_completed / 5) * 100 : 0,
          currentLevel: progress?.current_difficulty_level || 0,
          totalLevels: 5,
          isCompleted,
          isActive,
          isLocked: hasActiveProfile && !isActive && !isCompleted,
          icon: config.icon,
          imageUrl: config.imageUrl,
          unlockMessage: "Termina los escenarios del perfil actual para desbloquear este"
        };
      });

      // If no progress exists for any profile, create default (CEO)
      if (!userProgress || userProgress.length === 0) {
        const ceoProfile = profiles?.find(p => p.name === 'CEO');
        if (ceoProfile) {
          await RoleplayService.createInitialProgress(user.id, 'CEO');

          // Refresh data
          await fetchUserProgress();
          return;
        }
      }

      console.log('Final cards array:', cards);

      setRoleCards(cards);
      setUserProgress(userProgress);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProgress:', error);
      setLoading(false);
    }
  };

  const currentRole = roleCards.find(r => r.isActive);

  const handleProfileChange = async (profileId: string) => {
    // Check if user can change profile (no active incomplete profile)
    const activeProfile = roleCards.find(r => r.isActive && !r.isCompleted);
    if (activeProfile) {
      return; // Can't change if there's an incomplete active profile
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create new progress entry for the selected profile using RPC
      await RoleplayService.createInitialProgress(user.id, profileId.toUpperCase());

      // Refresh the data
      fetchUserProgress();
    } catch (error) {
      console.error('Error changing profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">¡Enfrenta a la Directiva!</h1>
          <p className="text-muted-foreground">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">¡Enfrenta a la Directiva!</h1>
        <p className="text-muted-foreground">Progreso de tus desafíos de roleplay</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Progress value={65} className="w-64" />
          <span className="text-sm font-medium">65%</span>
        </div>
      </div>

      {/* Hexagon Cards - Active in center */}
      <div className="flex justify-center items-center gap-8 mb-8">
        {(() => {
          // Reorder cards to put active one in center for 3 cards
          const activeCard = roleCards.find(card => card.isActive);
          const otherCards = roleCards.filter(card => !card.isActive);

          if (activeCard && roleCards.length === 3 && otherCards.length === 2) {
            // For 3 cards, place active in middle
            return [otherCards[0], activeCard, otherCards[1]]
              .filter(card => card !== undefined)
              .map((card) => (
                <HexagonCard key={card.id} card={card} onProfileClick={handleProfileChange} />
              ));
          }

          // Default order if no active card or not exactly 3 cards
          return roleCards
            .filter(card => card !== undefined)
            .map((card) => (
              <HexagonCard key={card.id} card={card} onProfileClick={handleProfileChange} />
            ));
        })()}
      </div>

      {/* Current Challenge Section */}
      {currentRole && (
        <Card className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Target className="w-5 h-5 text-blue-500" />
              Desafío del {currentRole.title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Completa los objetivos para desbloquear el siguiente nivel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sesiones Completadas</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.floor((currentRole.progress / 100) * 5)}/5
                  </span>
                </div>
                <Progress value={(currentRole.progress / 100) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Puntuación Promedio</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.min(85 + currentRole.currentLevel * 2, 95)}%
                  </span>
                </div>
                <Progress value={Math.min(85 + currentRole.currentLevel * 2, 95)} className="h-2" />
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Nivel Actual:</span> {currentRole.currentLevel}/{currentRole.totalLevels}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills and Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Radar de Habilidades */}
        <Card>
          <CardHeader>
            <CardTitle>Radar de Habilidades</CardTitle>
            <CardDescription>Evaluación de competencias clave</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Puntuación",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillsData}>
                  <PolarGrid stroke="hsl(var(--muted-foreground))" />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Habilidades"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Progreso Semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Arremes de Tecnología</CardTitle>
            <CardDescription>Tu desempeño esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Puntuación",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Logros Desbloqueados</CardTitle>
          <CardDescription>Reconocimientos por tu progreso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted bg-muted/20 text-muted-foreground opacity-50"
                }`}
              >
                {achievement.icon}
                <span className="text-xs mt-2 text-center">{achievement.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Calidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-20 h-20">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 35 * 0.85} ${2 * Math.PI * 35}`}
                      strokeDashoffset="0"
                      className="text-blue-500"
                      transform="rotate(-90 40 40)"
                    />
                  </svg>
                  <span className="absolute text-lg font-bold">85%</span>
                </div>
                <p className="text-sm mt-2">Tasa General</p>
              </div>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-20 h-20">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 35 * 0.92} ${2 * Math.PI * 35}`}
                      strokeDashoffset="0"
                      className="text-green-500"
                      transform="rotate(-90 40 40)"
                    />
                  </svg>
                  <span className="absolute text-lg font-bold">92%</span>
                </div>
                <p className="text-sm mt-2">Tasa Específica</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sesiones Totales</span>
                <Badge variant="secondary">24</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tiempo Total</span>
                <Badge variant="secondary">12.5 hrs</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mejor Puntuación</span>
                <Badge variant="secondary">98%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Racha Actual</span>
                <Badge variant="secondary">7 días</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}