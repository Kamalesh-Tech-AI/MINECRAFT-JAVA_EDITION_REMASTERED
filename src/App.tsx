import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameUI } from './components/GameUI';
import { InventoryUI } from './components/InventoryUI';
import { SettingsUI } from './components/SettingsUI';
import { BlockType, InventorySlot } from './types/Block';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>(BlockType.GRASS);
  const [isGameActive, setIsGameActive] = useState(false);
  const [hotbar, setHotbar] = useState<InventorySlot[]>([]);
  const [selectedHotbarSlot, setSelectedHotbarSlot] = useState(0);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [allInventorySlots, setAllInventorySlots] = useState<InventorySlot[]>([]);
  const [selectedInventorySlot, setSelectedInventorySlot] = useState(-1);
  const [health, setHealth] = useState(20);
  const [maxHealth, setMaxHealth] = useState(20);
  const [hunger, setHunger] = useState(20);
  const [maxHunger, setMaxHunger] = useState(20);
  
  // Settings
  const [sensitivity, setSensitivity] = useState(1.0);
  const [volume, setVolume] = useState(50);
  const [renderDistance, setRenderDistance] = useState(4);

  useEffect(() => {
    if (canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(canvasRef.current);
      
      // Set up callbacks
      gameEngineRef.current.setInventoryUpdateCallback((hotbarSlots) => {
        setHotbar(hotbarSlots);
        setAllInventorySlots(gameEngineRef.current!.getInventory().getAllSlots());
      });
      
      gameEngineRef.current.setHealthUpdateCallback((h, maxH) => {
        setHealth(h);
        setMaxHealth(maxH);
      });
      
      gameEngineRef.current.setHungerUpdateCallback((h, maxH) => {
        setHunger(h);
        setMaxHunger(maxH);
      });
    }

    const handlePointerLockChange = () => {
      setIsGameActive(document.pointerLockElement === document.body);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'e' || event.key === 'E') {
        if (isGameActive) {
          setIsInventoryOpen(!isInventoryOpen);
        }
      } else if (event.key === 'Escape') {
        if (isInventoryOpen) {
          setIsInventoryOpen(false);
        } else if (isGameActive) {
          setIsSettingsOpen(!isSettingsOpen);
        }
      }
      
      // Hotbar selection
      const keyIndex = parseInt(event.key) - 1;
      if (keyIndex >= 0 && keyIndex < 9 && gameEngineRef.current) {
        setSelectedHotbarSlot(keyIndex);
        gameEngineRef.current.setSelectedHotbarSlot(keyIndex);
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGameActive, isInventoryOpen]);

  const handleBlockSelect = (blockType: BlockType) => {
    setSelectedBlock(blockType);
    if (gameEngineRef.current) {
      gameEngineRef.current.setSelectedBlock(blockType);
    }
  };

  const handleHotbarSelect = (index: number) => {
    setSelectedHotbarSlot(index);
    if (gameEngineRef.current) {
      gameEngineRef.current.setSelectedHotbarSlot(index);
    }
  };

  const handleInventorySlotClick = (index: number) => {
    setSelectedInventorySlot(index === selectedInventorySlot ? -1 : index);
  };

  const handleSensitivityChange = (newSensitivity: number) => {
    setSensitivity(newSensitivity);
    if (gameEngineRef.current) {
      gameEngineRef.current.setSensitivity(newSensitivity);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-crosshair"
        style={{ display: 'block' }}
      />
      
      <GameUI 
        selectedBlock={selectedBlock}
        onBlockSelect={handleBlockSelect}
        isGameActive={isGameActive}
        hotbar={hotbar}
        selectedHotbarSlot={selectedHotbarSlot}
        onHotbarSelect={handleHotbarSelect}
        onInventoryOpen={() => setIsInventoryOpen(true)}
        onSettingsOpen={() => setIsSettingsOpen(true)}
        health={health}
        maxHealth={maxHealth}
        hunger={hunger}
        maxHunger={maxHunger}
      />

      <InventoryUI
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={allInventorySlots}
        onSlotClick={handleInventorySlotClick}
        selectedSlot={selectedInventorySlot}
      />

      <SettingsUI
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sensitivity={sensitivity}
        onSensitivityChange={handleSensitivityChange}
        volume={volume}
        onVolumeChange={setVolume}
        renderDistance={renderDistance}
        onRenderDistanceChange={setRenderDistance}
      />

      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
      `}</style>
    </div>
  );
}

export default App;