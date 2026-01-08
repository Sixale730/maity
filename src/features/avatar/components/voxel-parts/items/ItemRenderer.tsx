/**
 * ItemRenderer - Dispatches and positions items on characters
 * Routes to the correct item component based on itemId
 */

import type { ItemCode, ItemCategory } from '@maity/shared';
import type { AttachmentPoint } from '@maity/shared';
import { Sword } from './Sword';
import { Shield } from './Shield';
import { Wand } from './Wand';
import { Spatula } from './Spatula';
import { Hammer } from './Hammer';
import { Axe } from './Axe';
import { Book } from './Book';
import { Cape } from './Cape';

interface ItemRendererProps {
  itemId: ItemCode;
  attachmentPoint: AttachmentPoint;
}

// Map item codes to their categories for attachment point selection
const ITEM_TO_CATEGORY: Record<ItemCode, ItemCategory> = {
  // Head
  hat_cap: 'head',
  hat_beanie: 'head',
  // Eyes
  glasses_round: 'eyes',
  glasses_square: 'eyes',
  // Ears
  headphones: 'ears',
  // Neck
  bowtie: 'neck',
  necklace: 'neck',
  // Hand right
  sword: 'hand_right',
  wand: 'hand_right',
  spatula: 'hand_right',
  hammer: 'hand_right',
  axe: 'hand_right',
  // Hand left
  shield: 'hand_left',
  book: 'hand_left',
  // Back
  cape: 'back',
};

// Item-specific rotation adjustments (in degrees)
const ITEM_ROTATIONS: Partial<Record<ItemCode, [number, number, number]>> = {
  sword: [0, 0, -15],      // Slight tilt outward
  shield: [0, 90, 0],      // Face forward
  book: [0, 90, 0],        // Face forward
  wand: [0, 0, -10],       // Slight tilt
  spatula: [0, 0, -10],    // Slight tilt
  hammer: [0, 0, -20],     // More tilt for natural hold
  axe: [0, 0, -20],        // More tilt for natural hold
  cape: [0, 0, 0],         // No rotation
};

export function ItemRenderer({ itemId, attachmentPoint }: ItemRendererProps) {
  const position: [number, number, number] = [
    attachmentPoint.x,
    attachmentPoint.y,
    attachmentPoint.z,
  ];

  const baseRotation: [number, number, number] = [
    attachmentPoint.rotationX || 0,
    attachmentPoint.rotationY || 0,
    attachmentPoint.rotationZ || 0,
  ];

  // Add item-specific rotation
  const itemRotation = ITEM_ROTATIONS[itemId] || [0, 0, 0];
  const finalRotation: [number, number, number] = [
    baseRotation[0] + itemRotation[0],
    baseRotation[1] + itemRotation[1],
    baseRotation[2] + itemRotation[2],
  ];

  const scale = attachmentPoint.scale || 1;

  // Dispatch to correct item component
  switch (itemId) {
    // Hand right items
    case 'sword':
      return <Sword position={position} rotation={finalRotation} scale={scale} />;
    case 'wand':
      return <Wand position={position} rotation={finalRotation} scale={scale} />;
    case 'spatula':
      return <Spatula position={position} rotation={finalRotation} scale={scale} />;
    case 'hammer':
      return <Hammer position={position} rotation={finalRotation} scale={scale} />;
    case 'axe':
      return <Axe position={position} rotation={finalRotation} scale={scale} />;

    // Hand left items
    case 'shield':
      return <Shield position={position} rotation={finalRotation} scale={scale} />;
    case 'book':
      return <Book position={position} rotation={finalRotation} scale={scale} />;

    // Back items
    case 'cape':
      return <Cape position={position} rotation={finalRotation} scale={scale} />;

    // Head/Eyes/Ears/Neck items are handled by VoxelAccessories
    // Return null for items not handled here
    default:
      return null;
  }
}

export default ItemRenderer;

// Helper to get category for an item
export function getItemCategory(itemId: ItemCode): ItemCategory {
  return ITEM_TO_CATEGORY[itemId];
}

// Helper to check if item is a new shared item (not accessory)
export function isSharedItem(itemId: ItemCode): boolean {
  const category = ITEM_TO_CATEGORY[itemId];
  return category === 'hand_right' || category === 'hand_left' || category === 'back';
}
