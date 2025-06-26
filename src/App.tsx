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
import { CraftingUI } from './components/CraftingUI';
import { BlockType, InventorySlot } from './types/Block';
import { CraftingRecipe } from './types/Crafting';
import { CraftingManager } from './game/CraftingManager';
import { Inventory } from './game/Inventory';

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
  const [isCraftingOpen, setIsCraftingOpen] = useState(false);
  const [showRespawnMessage, setShowRespawnMessage] = useState(false);
  
  // Settings
  const [sensitivity, setSensitivity] = useState(1.0);
  const [volume, setVolume] = useState(50);
  const [renderDistance, setRenderDistance] = useState(4);

  // Initialize game engine when entering game
  useEffect(() => {
    console.log('Game state changed to:', gameState);
    
    if (gameState === 'playing' && canvasRef.current && !gameEngineRef.current) {
      console.log('Initializing game engine...');
      
      try {
        // Initialize crafting system
        CraftingManager.initialize();
        
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

        // Check if there's a save to load from session storage
        const saveToLoad = sessionStorage.getItem('voxelcraft-load-save');
        if (saveToLoad) {
          try {
            const saveData = JSON.parse(saveToLoad);
            gameEngineRef.current.loadWorldData(saveData.worldData);
            sessionStorage.removeItem('voxelcraft-load-save');
            console.log('Loaded save data successfully');
          } catch (error) {
            console.error('Error loading save:', error);
          }
        }
        
        console.log('Game engine initialized successfully');
      } catch (error) {
        console.error('Error initializing game engine:', error);
      }
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
                                   isFriendsOpen ||
                                   isCraftingOpen;
      gameEngineRef.current.setControlsEnabled(!shouldDisableControls && isGameActive);
    }
  }, [gameState, isGameActive, isInventoryOpen, isSettingsOpen, isSaveManagerOpen, isChatOpen, isFriendsOpen, isCraftingOpen]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handlePointerLockChange = () => {
      setIsGameActive(document.pointerLockElement === document.body);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle game keys if any UI is open or game is not active
      if (!isGameActive || isInventoryOpen || isSettingsOpen || isSaveManagerOpen || isChatOpen || isFriendsOpen || isCraftingOpen) {
        return;
      }

      if (event.key === 'e' || event.key === 'E') {
        setIsInventoryOpen(!isInventoryOpen);
      } else if (event.key === 'c' || event.key === 'C') {
        setIsCraftingOpen(!isCraftingOpen);
      } else if (event.key === 'Escape') {
        if (isInventoryOpen) {
          setIsInventoryOpen(false);
        } else if (isCraftingOpen) {
          setIsCraftingOpen(false);
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
        } else if (isCraftingOpen) {
          setIsCraftingOpen(false);
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
  }, [gameState, isGameActive, isInventoryOpen, isCraftingOpen, isChatOpen, isMultiplayer, isSettingsOpen, isSaveManagerOpen, isFriendsOpen]);

  const handleLogin = (user: string, serverType: 'singleplayer' | 'multiplayer', roomInfo?: RoomData) => {
    console.log('Login attempt:', { user, serverType, roomInfo });
    
    // Validate input
    if (!user || user.trim().length === 0) {
      console.error('Invalid username');
      alert('Please enter a valid username');
      return;
    }

    if (serverType === 'multiplayer' && roomInfo && (!roomInfo.id.trim() || !roomInfo.password.trim())) {
      console.error('Invalid room data for multiplayer');
      alert('Please enter valid room ID and password for multiplayer');
      return;
    }

    console.log('Setting login state...');
    
    // Set all the state at once to prevent race conditions
    setUsername(user.trim());
    setIsMultiplayer(serverType === 'multiplayer');
    setRoomData(roomInfo || null);
    
    // Use a timeout to ensure all state updates are processed
    setTimeout(() => {
      console.log('Transitioning to game state...');
      setGameState('playing');
    }, 50);
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

  const handleCraft = (recipe: CraftingRecipe) => {
    if (!gameEngineRef.current) return;
    
    const inventory = gameEngineRef.current.getInventory();
    if (CraftingManager.craftRecipe(recipe, inventory)) {
      // Update UI
      setHotbar(inventory.getHotbarSlots());
      setAllInventorySlots(inventory.getAllSlots());
      console.log(`Crafted: ${recipe.name}`);
    }
  };

  const handleInviteFriend = (friendId: string) => {
    // TODO: Implement friend invitation system
    console.log(`Inviting friend ${friendId} to room ${roomData?.id}`);
  };

  const handleBackToLogin = () => {
    console.log('Returning to login screen...');
    
    // Clean up game engine
    if (gameEngineRef.current) {
      // Save current state before going back
      try {
        handleQuickSave();
      } catch (error) {
        console.error('Error saving before logout:', error);
      }
    }
    
    // Reset all game state
    setIsGameActive(false);
    setIsInventoryOpen(false);
    setIsSettingsOpen(false);
    setIsSaveManagerOpen(false);
    setIsChatOpen(false);
    setIsFriendsOpen(false);
    setIsCraftingOpen(false);
    
    // Clear game engine reference
    gameEngineRef.current = null;
    
    // Return to login
    setGameState('login');
  };

  // Render login screen
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

  // Render game screen
  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-crosshair"
        style={{ display: 'block' }}
      />
      
      {/* Back to Login Button */}
      <button
        onClick={handleBackToLogin}
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        Back to Login
      </button>
      
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
        onCraftingOpen={() => setIsCraftingOpen(true)}
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

      <CraftingUI
        isOpen={isCraftingOpen}
        onClose={() => setIsCraftingOpen(false)}
        inventory={gameEngineRef.current?.getInventory() || new Inventory()}
        onCraft={handleCraft}
        isCraftingTable={false} // For now, always use 2x2 grid
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
