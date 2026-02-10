import { useQuery } from '@tanstack/react-query';
import { GameService } from '../games.service';
import type { GameType } from '../games.types';

export function useGameSessions(gameType?: GameType) {
  return useQuery({
    queryKey: ['game-sessions', gameType],
    queryFn: () => GameService.getUserSessions(gameType),
    staleTime: 30_000,
  });
}

export function useXPSummary() {
  return useQuery({
    queryKey: ['xp-summary'],
    queryFn: () => GameService.getXPSummary(),
    staleTime: 60_000,
  });
}
