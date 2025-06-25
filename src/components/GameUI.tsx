import React from 'react';
import { BlockType, InventorySlot } from '../types/Block';
import { Pickaxe, Hammer, TreePine, Mountain, Grab as Grass, Package, Settings, Eye } from 'lucide-react';

interface GameUIProps {
  selectedBlock: BlockType;
  onBlockSelect: (blockType: BlockType) => void;
  isGameActive: boolean;
  hotbar: InventorySlot[];
  selectedHotbarSlot: number;
  onHotbarSelect: (index: number) => void;
  onInventoryOpen: () => void;
  onSettingsOpen: () => void;
  health: number;
  maxHealth: number;
  hunger: number;
  maxHunger: number;
  isThirdPerson: boolean;
}

const blockData = [
  { type: BlockType.GRASS, name: 'Grass', icon: Grass, color: 'bg-green-500', key: '1' },
  { type: BlockType.DIRT, name: 'Dirt', icon: Mountain, color: 'bg-amber-600', key: '2' },
  { type: BlockType.STONE, name: 'Stone', icon: Mountain, color: 'bg-gray-500', key: '3' },
  { type: BlockType.WOOD, name: 'Wood', icon: TreePine, color: 'bg-amber-800', key: '4' },
  { type: BlockType.LEAVES, name: 'Leaves', icon: TreePine, color: 'bg-green-400', key: '5' },
];

export const GameUI: React.FC<GameUIProps> = ({ 
  selectedBlock, 
  onBlockSelect, 
  isGameActive,
  hotbar,
  selectedHotbarSlot,
  onHotbarSelect,
  onInventoryOpen,
  onSettingsOpen,
  health,
  maxHealth,
  hunger,
  maxHunger,
  isThirdPerson
}) => {
  const getItemIcon = (slot: InventorySlot, index: number) => {
    if (slot.item) {
      const blockInfo = blockData.find(b => b.type === slot.item?.blockType);
      if (blockInfo) {
        const Icon = blockInfo.icon;
        return <Icon className="w-6 h-6 text-white" />;
      }
      return <Package className="w-6 h-6 text-white" />;
    }
    return <span className="text-gray-500 text-xs">{index + 1}</span>;
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Crosshair */}
      {isGameActive && !isThirdPerson && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 flex items-center justify-center">
            <div className="w-0.5 h-4 bg-white opacity-75"></div>
            <div className="w-4 h-0.5 bg-white opacity-75 absolute"></div>
          </div>
        </div>
      )}

      {/* Health and Hunger Bars */}
      {isGameActive && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          {/* Health */}
          <div className="flex items-center gap-2 bg-black bg-opacity-60 px-3 py-2 rounded-lg backdrop-blur-sm">
            <div className="text-red-500">❤</div>
            <div className="w-24 h-2 bg-gray-700 rounded-full">
              <div 
                className="h-full bg-red-500 rounded-full transition-all duration-300"
                style={{ width: `${(health / maxHealth) * 100}%` }}
              ></div>
            </div>
            <span className="text-white text-sm">{health}/{maxHealth}</span>
          </div>

          {/* Hunger */}
          <div className="flex items-center gap-2 bg-black bg-opacity-60 px-3 py-2 rounded-lg backdrop-blur-sm">
            <div className="text-orange-500">🍖</div>
            <div className="w-24 h-2 bg-gray-700 rounded-full">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${(hunger / maxHunger) * 100}%` }}
              ></div>
            </div>
            <span className="text-white text-sm">{hunger}/{maxHunger}</span>
          </div>
        </div>
      )}

      {/* Perspective Indicator */}
      {isGameActive && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 text-white text-sm">
            <Eye className="w-4 h-4" />
            <span>{isThirdPerson ? 'Third Person' : 'First Person'}</span>
            <span className="text-gray-300">(F)</span>
          </div>
        </div>
      )}

      {/* Hotbar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="flex gap-1 bg-black bg-opacity-60 p-2 rounded-lg backdrop-blur-sm">
          {hotbar.map((slot, index) => (
            <button
              key={index}
              onClick={() => onHotbarSelect(index)}
              className={`
                w-14 h-14 rounded-lg border-2 flex items-center justify-center relative
                transition-all duration-200 hover:scale-105
                ${selectedHotbarSlot === index 
                  ? 'border-white bg-white bg-opacity-20' 
                  : 'border-gray-500 hover:border-gray-300'
                }
                bg-gray-800
              `}
              title={slot.item?.name || `Slot ${index + 1}`}
            >
              {getItemIcon(slot, index)}
              {slot.quantity > 1 && (
                <span className="absolute bottom-0 right-0 text-xs text-white bg-gray-900 rounded px-1">
                  {slot.quantity}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {isGameActive && (
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={onInventoryOpen}
            className="w-12 h-12 bg-black bg-opacity-60 rounded-lg flex items-center justify-center hover:bg-opacity-80 transition-all"
            title="Inventory (E)"
          >
            <Package className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={onSettingsOpen}
            className="w-12 h-12 bg-black bg-opacity-60 rounded-lg flex items-center justify-center hover:bg-opacity-80 transition-all"
            title="Settings (ESC)"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Instructions */}
      {!isGameActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-black bg-opacity-90 text-white p-8 rounded-xl backdrop-blur-sm max-w-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">VoxelCraft</h2>
            <div className="space-y-3 text-sm">
              <p className="text-center text-gray-300 mb-4">Enhanced Minecraft-like Experience</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong className="text-blue-400">WASD:</strong> Move around</p>
                  <p><strong className="text-blue-400">Mouse:</strong> Look around</p>
                  <p><strong className="text-blue-400">Space:</strong> Jump</p>
                  <p><strong className="text-blue-400">Left Click:</strong> Break blocks</p>
                  <p><strong className="text-blue-400">F:</strong> Toggle perspective</p>
                </div>
                <div>
                  <p><strong className="text-green-400">Right Click:</strong> Place blocks</p>
                  <p><strong className="text-green-400">E:</strong> Open inventory</p>
                  <p><strong className="text-green-400">ESC:</strong> Settings</p>
                  <p><strong className="text-green-400">1-9:</strong> Select hotbar</p>
                  <p><strong className="text-green-400">T:</strong> Chat (Multiplayer)</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <p className="text-center text-yellow-300 font-bold">Click anywhere to start playing!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Title */}
      <div className="absolute top-4 left-4">
        <h1 className="text-white text-2xl font-bold drop-shadow-lg">VoxelCraft</h1>
        <p className="text-white text-sm opacity-75">Enhanced Edition</p>
      </div>

      {/* Selected Item Info */}
      {isGameActive && hotbar[selectedHotbarSlot]?.item && (
        <div className="absolute top-20 right-4 bg-black bg-opacity-60 text-white p-3 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              {getItemIcon(hotbar[selectedHotbarSlot], selectedHotbarSlot)}
            </div>
            <span className="text-sm font-medium">
              {hotbar[selectedHotbarSlot].item!.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
