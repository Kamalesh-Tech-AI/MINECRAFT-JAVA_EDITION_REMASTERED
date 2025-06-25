import React from 'react';
import { InventorySlot } from '../types/Block';
import { Package, X } from 'lucide-react';

interface InventoryUIProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventorySlot[];
  onSlotClick: (index: number) => void;
  selectedSlot: number;
}

export const InventoryUI: React.FC<InventoryUIProps> = ({
  isOpen,
  onClose,
  inventory,
  onSlotClick,
  selectedSlot
}) => {
  if (!isOpen) return null;

  const renderSlot = (slot: InventorySlot, index: number) => {
    const isSelected = selectedSlot === index;
    const isHotbar = index < 9;
    
    return (
      <button
        key={index}
        onClick={() => onSlotClick(index)}
        className={`
          w-12 h-12 border-2 rounded-lg flex items-center justify-center relative
          transition-all duration-200 hover:scale-105
          ${isSelected 
            ? 'border-yellow-400 bg-yellow-400 bg-opacity-20' 
            : 'border-gray-500 hover:border-gray-300'
          }
          ${isHotbar ? 'bg-blue-900 bg-opacity-30' : 'bg-gray-800'}
        `}
        title={slot.item?.name || `Slot ${index + 1}`}
      >
        {slot.item ? (
          <>
            <Package className="w-6 h-6 text-white" />
            {slot.quantity > 1 && (
              <span className="absolute bottom-0 right-0 text-xs text-white bg-gray-900 rounded px-1">
                {slot.quantity}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-500 text-xs">{index + 1}</span>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl border-2 border-gray-700 max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Inventory</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Hotbar */}
          <div>
            <h3 className="text-white font-medium mb-3">Hotbar (1-9)</h3>
            <div className="grid grid-cols-9 gap-2">
              {inventory.slice(0, 9).map((slot, index) => renderSlot(slot, index))}
            </div>
          </div>

          {/* Main Inventory */}
          <div>
            <h3 className="text-white font-medium mb-3">Inventory</h3>
            <div className="grid grid-cols-9 gap-2">
              {inventory.slice(9, 36).map((slot, index) => renderSlot(slot, index + 9))}
            </div>
          </div>

          {/* Item Info */}
          {selectedSlot >= 0 && inventory[selectedSlot]?.item && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="text-white font-medium">{inventory[selectedSlot].item!.name}</h4>
              <p className="text-gray-300 text-sm">Quantity: {inventory[selectedSlot].quantity}</p>
              <p className="text-gray-300 text-sm">Type: {inventory[selectedSlot].item!.type}</p>
              {inventory[selectedSlot].item!.durability !== undefined && (
                <p className="text-gray-300 text-sm">
                  Durability: {inventory[selectedSlot].item!.durability}/{inventory[selectedSlot].item!.maxDurability}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
