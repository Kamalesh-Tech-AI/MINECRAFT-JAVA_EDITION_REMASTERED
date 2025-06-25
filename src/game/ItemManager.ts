import { Item, ItemType, BlockType } from '../types/Block';

export class ItemManager {
  private static items: Map<string, Item> = new Map();

  static initialize() {
    // Block items
    this.registerItem({
      id: 'grass',
      name: 'Grass Block',
      type: ItemType.BLOCK,
      blockType: BlockType.GRASS,
      stackSize: 64
    });

    this.registerItem({
      id: 'dirt',
      name: 'Dirt',
      type: ItemType.BLOCK,
      blockType: BlockType.DIRT,
      stackSize: 64
    });

    this.registerItem({
      id: 'stone',
      name: 'Stone',
      type: ItemType.BLOCK,
      blockType: BlockType.STONE,
      stackSize: 64
    });

    this.registerItem({
      id: 'wood',
      name: 'Wood Planks',
      type: ItemType.BLOCK,
      blockType: BlockType.WOOD,
      stackSize: 64
    });

    this.registerItem({
      id: 'leaves',
      name: 'Leaves',
      type: ItemType.BLOCK,
      blockType: BlockType.LEAVES,
      stackSize: 64
    });

    // Tools
    this.registerItem({
      id: 'wooden_pickaxe',
      name: 'Wooden Pickaxe',
      type: ItemType.TOOL,
      durability: 59,
      maxDurability: 59,
      damage: 2,
      stackSize: 1
    });

    this.registerItem({
      id: 'stone_pickaxe',
      name: 'Stone Pickaxe',
      type: ItemType.TOOL,
      durability: 131,
      maxDurability: 131,
      damage: 3,
      stackSize: 1
    });

    this.registerItem({
      id: 'iron_sword',
      name: 'Iron Sword',
      type: ItemType.WEAPON,
      durability: 250,
      maxDurability: 250,
      damage: 6,
      stackSize: 1
    });

    // Armor
    this.registerItem({
      id: 'leather_helmet',
      name: 'Leather Helmet',
      type: ItemType.ARMOR,
      durability: 55,
      maxDurability: 55,
      protection: 1,
      stackSize: 1
    });

    // Food
    this.registerItem({
      id: 'bread',
      name: 'Bread',
      type: ItemType.FOOD,
      stackSize: 64
    });

    this.registerItem({
      id: 'apple',
      name: 'Apple',
      type: ItemType.FOOD,
      stackSize: 64
    });
  }

  static registerItem(item: Item) {
    this.items.set(item.id, { ...item });
  }

  static getItem(id: string): Item | null {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  static getAllItems(): Item[] {
    return Array.from(this.items.values()).map(item => ({ ...item }));
  }

  static getBlockItem(blockType: BlockType): Item | null {
    for (const item of this.items.values()) {
      if (item.blockType === blockType) {
        return { ...item };
      }
    }
    return null;
  }
}