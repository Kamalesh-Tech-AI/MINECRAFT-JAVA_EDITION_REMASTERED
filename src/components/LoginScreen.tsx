import React, { useState, useEffect } from 'react';
import { User, Lock, Server, Users, Play, Settings, UserPlus, Upload, Download, ToggleLeft as Google, Apple, Github, Facebook } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, serverType: 'singleplayer' | 'multiplayer', roomData?: { id: string; password: string }) => void;
  onShowFriends: () => void;
}

interface SaveFile {
  id: string;
  name: string;
  timestamp: Date;
  worldData: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onShowFriends }) => {
  const [username, setUsername] = useState('');
  const [serverType, setServerType] = useState<'singleplayer' | 'multiplayer'>('singleplayer');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showSaveManager, setShowSaveManager] = useState(false);
  const [localSaves, setLocalSaves] = useState<SaveFile[]>([]);
  const [selectedSave, setSelectedSave] = useState<SaveFile | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    loadLocalSaves();
  }, []);

  const loadLocalSaves = () => {
    try {
      const localSavesData = localStorage.getItem('voxelcraft-saves');
      const cloudSavesData = localStorage.getItem('voxelcraft-cloud-saves');
      
      let allSaves: SaveFile[] = [];
      
      if (localSavesData) {
        const parsedLocal = JSON.parse(localSavesData).map((save: any) => ({
          ...save,
          timestamp: new Date(save.timestamp)
        }));
        allSaves = [...allSaves, ...parsedLocal];
      }
      
      if (cloudSavesData) {
        const parsedCloud = JSON.parse(cloudSavesData).map((save: any) => ({
          ...save,
          timestamp: new Date(save.timestamp)
        }));
        allSaves = [...allSaves, ...parsedCloud];
      }
      
      allSaves.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setLocalSaves(allSaves);
    } catch (error) {
      console.error('Error loading saves:', error);
      setLocalSaves([]);
    }
  };

  const handleLogin = () => {
    if (isLoggingIn) return; // Prevent double-clicking
    
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      alert('Please enter a username');
      return;
    }
    
    if (serverType === 'multiplayer' && (!roomId.trim() || !roomPassword.trim())) {
      alert('Please enter room ID and password for multiplayer');
      return;
    }

    setIsLoggingIn(true);
    
    console.log('Starting login process...', { username: trimmedUsername, serverType });

    const roomData = serverType === 'multiplayer' ? { id: roomId.trim(), password: roomPassword.trim() } : undefined;
    
    // Add a small delay to show loading state
    setTimeout(() => {
      onLogin(trimmedUsername, serverType, roomData);
      setIsLoggingIn(false);
    }, 500);
  };

  const handleSocialLogin = (provider: string) => {
    if (isLoggingIn) return;
    
    // Simulate social login - in real implementation, this would integrate with OAuth providers
    const socialUsernames = {
      google: 'GoogleUser_' + Math.random().toString(36).substring(7),
      apple: 'AppleUser_' + Math.random().toString(36).substring(7),
      github: 'GitHubUser_' + Math.random().toString(36).substring(7),
      facebook: 'FacebookUser_' + Math.random().toString(36).substring(7)
    };
    
    const generatedUsername = socialUsernames[provider as keyof typeof socialUsernames] || 'SocialUser';
    setUsername(generatedUsername);
    setIsLoggingIn(true);
    
    console.log('Social login with provider:', provider, 'username:', generatedUsername);
    
    // Auto-login after social authentication
    setTimeout(() => {
      onLogin(generatedUsername, serverType);
      setIsLoggingIn(false);
    }, 1000);
  };

  const handleLoadSave = (save: SaveFile) => {
    if (isLoggingIn) return;
    
    setSelectedSave(save);
    const saveUsername = username.trim() || 'Player';
    setIsLoggingIn(true);
    
    console.log('Loading save:', save.name, 'for user:', saveUsername);
    
    // Store the save data to be loaded after login
    sessionStorage.setItem('voxelcraft-load-save', JSON.stringify(save));
    
    setTimeout(() => {
      onLogin(saveUsername, 'singleplayer');
      setIsLoggingIn(false);
    }, 500);
  };

  const handleImportSave = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target?.result as string);
        const importedSave: SaveFile = {
          id: `imported-${Date.now()}`,
          name: file.name.replace('.voxelcraft', '').replace('.json', ''),
          timestamp: new Date(),
          worldData: saveData
        };

        // Save to local storage
        const existingSaves = JSON.parse(localStorage.getItem('voxelcraft-saves') || '[]');
        const updatedSaves = [importedSave, ...existingSaves];
        localStorage.setItem('voxelcraft-saves', JSON.stringify(updatedSaves));
        
        loadLocalSaves();
        alert('Save file imported successfully!');
      } catch (error) {
        alert('Invalid save file format');
      }
    };
    reader.readAsText(file);
  };

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      {/* Animated background blocks */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 bg-green-600 opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Loading Overlay */}
      {isLoggingIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-white">Starting VoxelCraft...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 bg-black bg-opacity-80 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-green-500 border-opacity-30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 mb-2">VoxelCraft</h1>
          <p className="text-green-300 text-lg">Java Edition Remastered</p>
          <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto mt-4 rounded-full"></div>
        </div>

        {!showSaveManager ? (
          <div className="space-y-6">
            {/* Social Login Options */}
            <div>
              <label className="block text-green-300 text-sm font-medium mb-3">
                Quick Login
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoggingIn}
                  className="flex items-center justify-center gap-2 p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                  <Google className="w-4 h-4" />
                  Google
                </button>
                <button
                  onClick={() => handleSocialLogin('apple')}
                  disabled={isLoggingIn}
                  className="flex items-center justify-center gap-2 p-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                  <Apple className="w-4 h-4" />
                  Apple
                </button>
                <button
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoggingIn}
                  className="flex items-center justify-center gap-2 p-2 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </button>
                <button
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isLoggingIn}
                  className="flex items-center justify-center gap-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-1 border-t border-green-600"></div>
              <span className="px-3 text-green-300 text-sm">or</span>
              <div className="flex-1 border-t border-green-600"></div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-green-300 text-sm font-medium mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoggingIn}
                className="w-full px-4 py-3 bg-gray-900 border border-green-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-20 transition-all disabled:opacity-50"
                placeholder="Enter your username"
                maxLength={16}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {/* Server Type Selection */}
            <div>
              <label className="block text-green-300 text-sm font-medium mb-3">
                <Server className="w-4 h-4 inline mr-2" />
                Game Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setServerType('singleplayer')}
                  disabled={isLoggingIn}
                  className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                    serverType === 'singleplayer'
                      ? 'border-green-400 bg-green-400 bg-opacity-20 text-green-300'
                      : 'border-gray-600 text-gray-400 hover:border-green-600'
                  }`}
                >
                  <Play className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Singleplayer</span>
                </button>
                <button
                  onClick={() => setServerType('multiplayer')}
                  disabled={isLoggingIn}
                  className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                    serverType === 'multiplayer'
                      ? 'border-green-400 bg-green-400 bg-opacity-20 text-green-300'
                      : 'border-gray-600 text-gray-400 hover:border-green-600'
                  }`}
                >
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Multiplayer</span>
                </button>
              </div>
            </div>

            {/* Multiplayer Room Settings */}
            {serverType === 'multiplayer' && (
              <div className="space-y-4 p-4 bg-gray-900 bg-opacity-50 rounded-lg border border-green-600 border-opacity-30">
                <div className="flex items-center justify-between">
                  <h3 className="text-green-300 font-medium">Room Settings</h3>
                  <button
                    onClick={() => setIsCreatingRoom(!isCreatingRoom)}
                    disabled={isLoggingIn}
                    className="text-green-400 hover:text-green-300 text-sm disabled:opacity-50"
                  >
                    {isCreatingRoom ? 'Join Room' : 'Create Room'}
                  </button>
                </div>

                <div>
                  <label className="block text-green-300 text-sm mb-2">Room ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      disabled={isLoggingIn}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-green-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-400 disabled:opacity-50"
                      placeholder="Enter room ID"
                      maxLength={6}
                    />
                    {isCreatingRoom && (
                      <button
                        onClick={generateRoomId}
                        disabled={isLoggingIn}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                      >
                        Generate
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-green-300 text-sm mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    disabled={isLoggingIn}
                    className="w-full px-3 py-2 bg-gray-800 border border-green-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-400 disabled:opacity-50"
                    placeholder="Enter room password"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                disabled={isLoggingIn || !username.trim() || (serverType === 'multiplayer' && (!roomId.trim() || !roomPassword.trim()))}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all transform hover:scale-105 disabled:hover:scale-100"
              >
                <Play className="w-5 h-5 inline mr-2" />
                {isLoggingIn ? 'Starting Game...' : 'Start Game'}
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShowSaveManager(true)}
                  disabled={isLoggingIn}
                  className="py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Load Save
                </button>
                <button
                  onClick={onShowFriends}
                  disabled={isLoggingIn}
                  className="py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
                >
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  Friends
                </button>
                <button 
                  disabled={isLoggingIn}
                  className="py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Save Manager */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-green-300 font-medium text-lg">Load Saved World</h3>
              <button
                onClick={() => setShowSaveManager(false)}
                disabled={isLoggingIn}
                className="text-gray-400 hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Import Save File */}
            <div>
              <label className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Import Save File
                <input
                  type="file"
                  accept=".voxelcraft,.json"
                  onChange={handleImportSave}
                  disabled={isLoggingIn}
                  className="hidden"
                />
              </label>
            </div>

            {/* Saved Worlds List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {localSaves.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No saved worlds found</p>
                  <p className="text-sm">Import a save file to get started</p>
                </div>
              ) : (
                localSaves.map(save => (
                  <div key={save.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{save.name}</h4>
                      <p className="text-sm text-gray-400">
                        {save.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoadSave(save)}
                      disabled={isLoggingIn}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                    >
                      {isLoggingIn ? 'Loading...' : 'Load'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowSaveManager(false)}
              disabled={isLoggingIn}
              className="w-full py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© 2025 VoxelCraft Remastered</p>
          <p className="mt-1">Enhanced Minecraft Experience</p>
        </div>
      </div>
    </div>
  );
};
