/**
 * Attachment Points for Character Items
 * Defines where items attach to each character type
 */

import type { CharacterPreset } from './avatar.types';

// ===== Attachment Point Types =====

export interface AttachmentPoint {
  x: number;
  y: number;
  z: number;
  // Optional rotation in radians
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  // Optional scale multiplier for this attachment
  scale?: number;
}

export interface CharacterAttachmentPoints {
  head: AttachmentPoint;        // For hats, helmets
  eyes: AttachmentPoint;        // For glasses
  ears: AttachmentPoint;        // For headphones (positioned at ear level)
  neck: AttachmentPoint;        // For bowtie, necklace
  handRight: AttachmentPoint;   // For sword, tools (dominant hand)
  handLeft: AttachmentPoint;    // For shield, book
  back: AttachmentPoint;        // For cape, backpack
}

// ===== Attachment Points by Character =====

/**
 * Human character attachment points
 * Based on VoxelHead (y=0.75, headH=0.85) and VoxelBody (torsoW=0.65, armX=0.405)
 */
const HUMAN_ATTACHMENTS: CharacterAttachmentPoints = {
  head: { x: 0, y: 1.22, z: 0 },           // Top of head (0.75 + 0.85/2 + offset)
  eyes: { x: 0, y: 0.79, z: 0.39 },        // Eye level, front face
  ears: { x: 0.42, y: 0.75, z: 0 },        // Side of head (headW/2)
  neck: { x: 0, y: 0.35, z: 0.24 },        // Below head, front chest
  handRight: { x: 0.41, y: -0.1, z: 0 },   // Right hand position
  handLeft: { x: -0.41, y: -0.1, z: 0 },   // Left hand position
  back: { x: 0, y: 0.1, z: -0.25 },        // Back of torso
};

/**
 * Chicken character attachment points
 * Based on VoxelChicken - head at y=0.65, eyes at y=0.7, wings at x=±0.5
 */
const CHICKEN_ATTACHMENTS: CharacterAttachmentPoints = {
  head: { x: 0, y: 1.05, z: 0.15 },        // Above crest
  eyes: { x: 0, y: 0.7, z: 0.46 },         // Eye level
  ears: { x: 0.35, y: 0.65, z: 0.2 },      // Side of head
  neck: { x: 0, y: 0.3, z: 0.4 },          // Below beak
  handRight: { x: 0.55, y: 0.0, z: 0 },    // Wing tip right
  handLeft: { x: -0.55, y: 0.0, z: 0 },    // Wing tip left
  back: { x: 0, y: 0.2, z: -0.55 },        // Behind tail
};

/**
 * Dog character attachment points
 * Based on VoxelDog - head at y=0.5 z=0.3, legs shorter
 */
const DOG_ATTACHMENTS: CharacterAttachmentPoints = {
  head: { x: 0, y: 0.95, z: 0.3 },         // Top of head
  eyes: { x: 0, y: 0.6, z: 0.71 },         // Eye level
  ears: { x: 0.5, y: 0.7, z: 0.1 },        // Ear position
  neck: { x: 0, y: 0.25, z: 0.5 },         // Below chin
  handRight: { x: 0.25, y: -0.5, z: 0.1 }, // Front right paw
  handLeft: { x: -0.25, y: -0.5, z: 0.1 }, // Front left paw
  back: { x: 0, y: 0.1, z: -0.5 },         // Back
};

/**
 * Lion Knight character attachment points
 * Based on VoxelLionKnight - helmet at y=1.15, shoulders at x=±0.55
 */
const LION_KNIGHT_ATTACHMENTS: CharacterAttachmentPoints = {
  head: { x: 0, y: 1.6, z: -0.1 },         // Above plume
  eyes: { x: 0, y: 0.82, z: 0.33 },        // Eye level
  ears: { x: 0.5, y: 0.75, z: 0 },         // Side of mane
  neck: { x: 0, y: 0.35, z: 0.3 },         // Below chin mane
  handRight: { x: 0.65, y: 0.1, z: 0 },    // Right shoulder/arm
  handLeft: { x: -0.65, y: 0.1, z: 0 },    // Left shoulder/arm
  back: { x: 0, y: 0.2, z: -0.4 },         // Behind armor
};

/**
 * Knight character attachment points
 * Based on VoxelKnight - helmet at y=0.8, sword at x=0.35
 */
const KNIGHT_ATTACHMENTS: CharacterAttachmentPoints = {
  head: { x: 0, y: 1.1, z: -0.05 },        // Above helmet plume
  eyes: { x: 0, y: 0.75, z: 0.17 },        // Visor level
  ears: { x: 0.2, y: 0.8, z: 0 },          // Side of helmet
  neck: { x: 0, y: 0.55, z: 0.17 },        // Below helmet
  handRight: { x: 0.35, y: 0.15, z: 0 },   // Sword hand position
  handLeft: { x: -0.35, y: 0.25, z: 0.05 },// Shield hand position
  back: { x: 0, y: 0.4, z: -0.18 },        // Behind armor
};

/**
 * Robot character attachment points
 * Based on VoxelRobot - antenna at y=1.15, arms at x=±0.35
 */
const ROBOT_ATTACHMENTS: CharacterAttachmentPoints = {
  head: { x: 0, y: 1.22, z: 0 },           // Above antenna ball
  eyes: { x: 0, y: 0.78, z: 0.19 },        // Eye panel level
  ears: { x: 0.25, y: 0.75, z: 0 },        // Side of head
  neck: { x: 0, y: 0.55, z: 0.19 },        // Below head
  handRight: { x: 0.35, y: 0.1, z: 0 },    // Right hand
  handLeft: { x: -0.35, y: 0.1, z: 0 },    // Left hand
  back: { x: 0, y: 0.35, z: -0.2 },        // Behind body
};

/**
 * Kenney Human character attachment points
 * Based on VoxelKenneyHuman - head at y=0.75, hands at y=0.18
 */
const KENNEY_HUMAN_ATTACHMENTS: CharacterAttachmentPoints = {
  head: { x: 0, y: 1.05, z: -0.02 },       // Above hair
  eyes: { x: 0, y: 0.78, z: 0.19 },        // Eye level
  ears: { x: 0.25, y: 0.75, z: 0 },        // Side of head
  neck: { x: 0, y: 0.55, z: 0.16 },        // Below head
  handRight: { x: 0.3, y: 0.18, z: 0 },    // Right hand
  handLeft: { x: -0.3, y: 0.18, z: 0 },    // Left hand
  back: { x: 0, y: 0.38, z: -0.17 },       // Behind body
};

// ===== Attachment Points Registry =====

export const CHARACTER_ATTACHMENTS: Record<CharacterPreset, CharacterAttachmentPoints> = {
  human: HUMAN_ATTACHMENTS,
  chicken: CHICKEN_ATTACHMENTS,
  dog: DOG_ATTACHMENTS,
  lion_knight: LION_KNIGHT_ATTACHMENTS,
  knight: KNIGHT_ATTACHMENTS,
  robot: ROBOT_ATTACHMENTS,
  kenney_human: KENNEY_HUMAN_ATTACHMENTS,
};

// ===== Helper Functions =====

export function getAttachmentPoints(characterPreset: CharacterPreset): CharacterAttachmentPoints {
  return CHARACTER_ATTACHMENTS[characterPreset];
}

export function getAttachmentPoint(
  characterPreset: CharacterPreset,
  attachmentType: keyof CharacterAttachmentPoints
): AttachmentPoint {
  return CHARACTER_ATTACHMENTS[characterPreset][attachmentType];
}
