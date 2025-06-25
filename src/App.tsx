import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameUI } from './components/GameUI';
import { InventoryUI } from './components/InventoryUI';
import { SettingsUI } from './components/SettingsUI';
import { LoginScreen } from './components/LoginScreen';
import { FriendsManager } from './components/FriendsManager';
import { SaveManager } from './components/SaveManager';
import { GameHUD } from './components/GameHUD';
import { ChatSystem } from './components/ChatSystem';
import { BlockType, InventorySlot } from './types/Block';

type GameState = 'login' | 'playing';

interface RoomData {
  id: string;
  password: string;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('login');
  const [username, setUsername] = useState('');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  
  // Game data
  const [selectedBlock, setSelectedBlock] = useState<BlockType>(BlockType.GRASS);
  const [isGameActive, setIsGameActive] = useState(false);
  const [hotbar, setHotbar] = useState<InventorySlot[]>([]);
  const [selectedHotbarSlot, setSelectedHotbarSlot] = useState(0);
  const [allInventorySlots, setAllInventorySlots] = useState<InventorySlot[]>([]);
  const [selectedInventorySlot, setSelectedInventorySlot] = useState(-1);
  const [health, setHealth] = useState(20);
  const [maxHealth, setMaxHealth] = useState(20);
  const [hunger, setHunger] = useState(20);
  const [maxHunger, setMaxHunger] = useState(20);
  const [isThirdPerson, setIsThirdPerson] = useState(false);
  
  // UI states
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isSaveManagerOpen, setIsSaveManagerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRespawnMessage, setShowRespawnMessage] = useState(false);
  
  // Settings
  const [sensitivity, setSensitivity] = useState(1.0);
  const [volume, setVolume] = useState(50);
  const [renderDistance, setRenderDistance] = useState(4);

  // Initialize game engine when entering game
  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current && !gameEngineRef.current) {
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

      gameEngineRef.current.setRespawnCallback(() => {
        setShowRespawnMessage(true);
        setTimeout(() => setShowRespawnMessage(false), 3000);
      });
    }
  }, [gameState]);

  // Control game controls based on UI state
  useEffect(() => {
    if (gameEngineRef.current) {
      const shouldDisableControls = gameState !== 'playing' || 
                                   isInventoryOpen || 
                                   isSettingsOpen || 
                                   isSaveManagerOpen || 
                                   isChatOpen ||
                                   isFriendsOpen;
      gameEngineRef.current.setControlsEnabled(!shouldDisableControls && isGameActive);
    }
  }, [gameState, isGameActive, isInventoryOpen, isSettingsOpen, isSaveManagerOpen, isChatOpen, isFriendsOpen]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handlePointerLockChange = () => {
      setIsGameActive(document.pointerLockElement === document.body);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle game keys if any UI is open or game is not active
      if (!isGameActive || isInventoryOpen || isSettingsOpen || isSaveManagerOpen || isChatOpen || isFriendsOpen) {
        return;
      }

      if (event.key === 'e' || event.key === 'E') {
        setIsInventoryOpen(!isInventoryOpen);
      } else if (event.key === 'Escape') {
        if (isInventoryOpen) {
          setIsInventoryOpen(false);
        } else if (isChatOpen) {
          setIsChatOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isSaveManagerOpen) {
          setIsSaveManagerOpen(false);
        } else if (isFriendsOpen) {
          setIsFriendsOpen(false);
        } else {
          setIsSettingsOpen(!isSettingsOpen);
        }
      } else if (event.key === 't' || event.key === 'T') {
        if (isMultiplayer) {
          setIsChatOpen(true);
        }
      } else if (event.key === 'm' || event.key === 'M') {
        // TODO: Show map
      } else if (event.key === 'f' || event.key === 'F') {
        // Toggle perspective
        if (gameEngineRef.current) {
          setIsThirdPerson(gameEngineRef.current.isInThirdPerson());
        }
      } else if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleQuickSave();
      }
      
      // Hotbar selection
      const keyIndex = parseInt(event.key) - 1;
      if (keyIndex >= 0 && keyIndex < 9 && gameEngineRef.current) {
        setSelectedHotbarSlot(keyIndex);
        gameEngineRef.current.setSelectedHotbarSlot(keyIndex);
      }
    };

    // Handle ESC key for closing UI panels
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isInventoryOpen) {
          setIsInventoryOpen(false);
        } else if (isChatOpen) {
          setIsChatOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isSaveManagerOpen) {
          setIsSaveManagerOpen(false);
        } else if (isFriendsOpen) {
          setIsFriendsOpen(false);
        }
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [gameState, isGameActive, isInventoryOpen, isChatOpen, isMultiplayer, isSettingsOpen, isSaveManagerOpen, isFriendsOpen]);

  const handleLogin = (user: string, serverType: 'singleplayer' | 'multiplayer', roomInfo?: RoomData) => {
    setUsername(user);
    setIsMultiplayer(serverType === 'multiplayer');
    setRoomData(roomInfo || null);
    setGameState('playing');
  };

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

  const handleQuickSave = () => {
    if (!gameEngineRef.current) return;
    
    const worldData = gameEngineRef.current.getWorldData();
    const saveData = {
      id: `quicksave-${Date.now()}`,
      name: `Quick Save ${new Date().toLocaleString()}`,
      timestamp: new Date(),
      isAutoSave: false,
      worldData,
      saveType: 'cloud' // Quick saves go to cloud
    };

    // Save to cloud storage (simulated with localStorage)
    const existingSaves = JSON.parse(localStorage.getItem('voxelcraft-cloud-saves') || '[]');
    const updatedSaves = [saveData, ...existingSaves];
    localStorage.setItem('voxelcraft-cloud-saves', JSON.stringify(updatedSaves));
    
    // Show notification
    console.log('Game saved to cloud successfully!');
  };

  const handleLoadSave = (saveData: any) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.loadWorldData(saveData);
    }
  };

  const handleInviteFriend = (friendId: string) => {
    // TODO: Implement friend invitation system
    console.log(`Inviting friend ${friendId} to room ${roomData?.id}`);
  };

  if (gameState === 'login') {
    return (
      <>
        <LoginScreen 
          onLogin={handleLogin}
          onShowFriends={() => setIsFriendsOpen(true)}
        />
        <FriendsManager
          isOpen={isFriendsOpen}
          onClose={() => setIsFriendsOpen(false)}
          onInviteToRoom={handleInviteFriend}
        />
      </>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-crosshair"
        style={{ display: 'block' }}
      />
      
      {/* Respawn Message */}
      {showRespawnMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-red-600 bg-opacity-90 text-white px-6 py-3 rounded-lg text-xl font-bold">
            You respawned! (-5 Health)
          </div>
        </div>
      )}
      
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
        isThirdPerson={isThirdPerson}
      />

      <GameHUD
        isMultiplayer={isMultiplayer}
        roomId={roomData?.id}
        onSaveGame={handleQuickSave}
        onShowSaveManager={() => setIsSaveManagerOpen(true)}
        onShowSettings={() => setIsSettingsOpen(true)}
        onShowChat={() => setIsChatOpen(true)}
        onShowMap={() => {/* TODO: Implement map */}}
        connectedPlayers={isMultiplayer ? 3 : 1}
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

      <SaveManager
        isOpen={isSaveManagerOpen}
        onClose={() => setIsSaveManagerOpen(false)}
        onLoadSave={handleLoadSave}
        currentWorldData={gameEngineRef.current?.getWorldData()}
      />

      {isMultiplayer && (
        <ChatSystem
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentUsername={username}
          roomId={roomData?.id}
        />
      )}

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
