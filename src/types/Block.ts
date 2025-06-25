export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  WOOD = 4,
  LEAVES = 5,
  SAND = 6,
  WATER = 7,
  COAL_ORE = 8,
  IRON_ORE = 9,
  GOLD_ORE = 10,
  DIAMOND_ORE = 11
}

export interface Block {
  type: BlockType;
  x: number;
  y: number;
  z: number;
}

export interface BlockFace {
  vertices: number[];
  normal: number[];
  uvs: number[];
}

export enum ItemType {
  BLOCK = 'block',
  TOOL = 'tool',
  WEAPON = 'weapon',
  ARMOR = 'armor',
  FOOD = 'food'
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  blockType?: BlockType;
  durability?: number;
  maxDurability?: number;
  damage?: number;
  protection?: number;
  stackSize: number;
}

export interface InventorySlot {
  item: Item | null;
  quantity: number;
}