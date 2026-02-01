import bgMountainTemple from './assets/bg-mountain-temple.svg';
import bgCaveMountain from './assets/bg-cave-mountain.svg';

export type BackgroundId = 'none' | 'mountain-temple' | 'cave-mountain';

export interface BackgroundOption {
  id: BackgroundId;
  label: string;
  src?: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 'none', label: 'None' },
  { id: 'mountain-temple', label: 'Mountain Temple', src: bgMountainTemple },
  { id: 'cave-mountain', label: 'Cave Mountain', src: bgCaveMountain },
];
