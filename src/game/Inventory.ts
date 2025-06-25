import { InventorySlot, Item } from '../types/Block';

export class Inventory {
  private slots: InventorySlot[] = [];
  private hotbarSize = 9;
  private inventorySize = 36;

  constructor() {
    // Initialize inventory slots
    for (let i = 0; i < this.inventorySize; i++) {
      this.slots.push({ item: null, quantity: 0 });
    }
  }

  addItem(item: Item, quantity: number = 1): number {
    let remainingQuantity = quantity;

    // First, try to add to existing stacks
    for (let i = 0; i < this.slots.length && remainingQuantity > 0; i++) {
      const slot = this.slots[i];
      if (slot.item && slot.item.id === item.id) {
        const canAdd = Math.min(remainingQuantity, item.stackSize - slot.quantity);
        slot.quantity += canAdd;
        remainingQuantity -= canAdd;
      }
    }

    // Then, try to add to empty slots
    for (let i = 0; i < this.slots.length && remainingQuantity > 0; i++) {
      const slot = this.slots[i];
      if (!slot.item) {
        const canAdd = Math.min(remainingQuantity, item.stackSize);
        slot.item = { ...item };
        slot.quantity = canAdd;
        remainingQuantity -= canAdd;
      }
    }

    return quantity - remainingQuantity; // Return how many were actually added
  }

  removeItem(slotIndex: number, quantity: number = 1): Item | null {
    if (slotIndex < 0 || slotIndex >= this.slots.length) return null;

    const slot = this.slots[slotIndex];
    if (!slot.item || slot.quantity === 0) return null;

    const removedQuantity = Math.min(quantity, slot.quantity);
    slot.quantity -= removedQuantity;

    const removedItem = { ...slot.item };

    if (slot.quantity === 0) {
      slot.item = null;
    }

    return removedItem;
  }

  getSlot(index: number): InventorySlot | null {
    if (index < 0 || index >= this.slots.length) return null;
    return this.slots[index];
  }

  getHotbarSlots(): InventorySlot[] {
    return this.slots.slice(0, this.hotbarSize);
  }

  getAllSlots(): InventorySlot[] {
    return [...this.slots];
  }

  swapSlots(index1: number, index2: number) {
    if (index1 < 0 || index1 >= this.slots.length || 
        index2 < 0 || index2 >= this.slots.length) return;

    const temp = this.slots[index1];
    this.slots[index1] = this.slots[index2];
    this.slots[index2] = temp;
  }

  clear() {
    this.slots.forEach(slot => {
      slot.item = null;
      slot.quantity = 0;
    });
  }
}