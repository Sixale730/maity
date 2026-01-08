/**
 * VoxelCharacter - Character Dispatcher
 * Routes to the appropriate character component based on preset
 */

import { VoxelHuman } from './VoxelHuman';
import { VoxelChicken, VoxelDog, VoxelLionKnight, VoxelKnight, VoxelRobot, VoxelKenneyHuman } from './characters';
import type { CharacterPreset, HeadType, BodyType, AccessoryCode, OutfitPreset } from '@maity/shared';

interface VoxelCharacterProps {
  characterPreset?: CharacterPreset;
  outfitPreset?: OutfitPreset;
  headType?: HeadType;
  bodyType?: BodyType;
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
  pantsColor?: string;
  accessories?: AccessoryCode[];
  animate?: boolean;
}

export function VoxelCharacter({
  characterPreset = 'human',
  outfitPreset,
  headType = 'default',
  bodyType = 'default',
  skinColor = '#FFD7C4',
  hairColor = '#3D2314',
  shirtColor = '#4A90D9',
  pantsColor = '#3D3D3D',
  accessories = [],
  animate = false,
}: VoxelCharacterProps) {
  // Dispatch to the correct character component based on preset
  switch (characterPreset) {
    case 'chicken':
      return <VoxelChicken animate={animate} />;

    case 'dog':
      return <VoxelDog animate={animate} />;

    case 'lion_knight':
      return <VoxelLionKnight animate={animate} />;

    case 'knight':
      return <VoxelKnight animate={animate} />;

    case 'robot':
      return <VoxelRobot animate={animate} />;

    case 'kenney_human':
      return <VoxelKenneyHuman animate={animate} />;

    case 'human':
    default:
      return (
        <VoxelHuman
          headType={headType}
          bodyType={bodyType}
          skinColor={skinColor}
          hairColor={hairColor}
          shirtColor={shirtColor}
          pantsColor={pantsColor}
          accessories={accessories}
          outfitPreset={outfitPreset}
          animate={animate}
        />
      );
  }
}

export default VoxelCharacter;
