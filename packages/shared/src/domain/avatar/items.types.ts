/**
 * Item Types for the Shared Items System
 * Items can be equipped on any character type
 */

// ===== Item Categories =====

export type ItemCategory =
  | 'head'        // Gorros, sombreros
  | 'eyes'        // Lentes
  | 'ears'        // Audifonos
  | 'neck'        // Corbatin, collar
  | 'hand_right'  // Espadas, herramientas
  | 'hand_left'   // Escudos, libros
  | 'back';       // Capas, mochilas

// ===== Item Codes =====

export type ItemCode =
  // Head items
  | 'hat_cap'
  | 'hat_beanie'
  // Eye items
  | 'glasses_round'
  | 'glasses_square'
  // Ear items
  | 'headphones'
  // Neck items
  | 'bowtie'
  | 'necklace'
  // Hand right items
  | 'sword'
  | 'wand'
  | 'spatula'
  | 'hammer'
  | 'axe'
  // Hand left items
  | 'shield'
  | 'book'
  // Back items
  | 'cape';

// ===== Item Configuration =====

export interface ItemConfig {
  id: ItemCode;
  name: string;
  emoji: string;
  category: ItemCategory;
  description?: string;
}

// ===== Items Registry =====

export const ITEMS: ItemConfig[] = [
  // Head items
  { id: 'hat_cap', name: 'Gorra', emoji: '🧢', category: 'head', description: 'Gorra deportiva' },
  { id: 'hat_beanie', name: 'Gorro', emoji: '🎓', category: 'head', description: 'Gorro de lana' },

  // Eye items
  { id: 'glasses_round', name: 'Lentes Redondos', emoji: '👓', category: 'eyes', description: 'Lentes estilo Harry Potter' },
  { id: 'glasses_square', name: 'Lentes Cuadrados', emoji: '🕶️', category: 'eyes', description: 'Lentes de sol cuadrados' },

  // Ear items
  { id: 'headphones', name: 'Audifonos', emoji: '🎧', category: 'ears', description: 'Audifonos over-ear' },

  // Neck items
  { id: 'bowtie', name: 'Corbatin', emoji: '🎀', category: 'neck', description: 'Corbatin elegante' },
  { id: 'necklace', name: 'Collar', emoji: '📿', category: 'neck', description: 'Collar con dije' },

  // Hand right items (weapons/tools)
  { id: 'sword', name: 'Espada', emoji: '⚔️', category: 'hand_right', description: 'Espada medieval' },
  { id: 'wand', name: 'Varita', emoji: '🪄', category: 'hand_right', description: 'Varita magica' },
  { id: 'spatula', name: 'Espatula', emoji: '🍳', category: 'hand_right', description: 'Espatula de cocina' },
  { id: 'hammer', name: 'Martillo', emoji: '🔨', category: 'hand_right', description: 'Martillo de trabajo' },
  { id: 'axe', name: 'Hacha', emoji: '🪓', category: 'hand_right', description: 'Hacha de madera' },

  // Hand left items (shields/books)
  { id: 'shield', name: 'Escudo', emoji: '🛡️', category: 'hand_left', description: 'Escudo de defensa' },
  { id: 'book', name: 'Libro', emoji: '📕', category: 'hand_left', description: 'Libro de conocimiento' },

  // Back items
  { id: 'cape', name: 'Capa', emoji: '🦸', category: 'back', description: 'Capa de heroe' },
];

// ===== Category Configuration =====

export interface CategoryConfig {
  id: ItemCategory;
  name: string;
  emoji: string;
  maxItems: number; // Max items per category (usually 1)
}

export const ITEM_CATEGORIES: CategoryConfig[] = [
  { id: 'head', name: 'Cabeza', emoji: '🎩', maxItems: 1 },
  { id: 'eyes', name: 'Ojos', emoji: '👓', maxItems: 1 },
  { id: 'ears', name: 'Orejas', emoji: '🎧', maxItems: 1 },
  { id: 'neck', name: 'Cuello', emoji: '🎀', maxItems: 1 },
  { id: 'hand_right', name: 'Mano Der.', emoji: '⚔️', maxItems: 1 },
  { id: 'hand_left', name: 'Mano Izq.', emoji: '🛡️', maxItems: 1 },
  { id: 'back', name: 'Espalda', emoji: '🦸', maxItems: 1 },
];

// ===== Helper Functions =====

export function getItemById(id: ItemCode): ItemConfig | undefined {
  return ITEMS.find(item => item.id === id);
}

export function getItemsByCategory(category: ItemCategory): ItemConfig[] {
  return ITEMS.filter(item => item.category === category);
}

export function getCategoryConfig(category: ItemCategory): CategoryConfig | undefined {
  return ITEM_CATEGORIES.find(cat => cat.id === category);
}

// Group items by category for UI display
export function getItemsGroupedByCategory(): Record<ItemCategory, ItemConfig[]> {
  const grouped: Record<ItemCategory, ItemConfig[]> = {
    head: [],
    eyes: [],
    ears: [],
    neck: [],
    hand_right: [],
    hand_left: [],
    back: [],
  };

  ITEMS.forEach(item => {
    grouped[item.category].push(item);
  });

  return grouped;
}
