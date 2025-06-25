import React, { useState } from 'react';
import { User, Lock, Server, Users, Play, Settings, UserPlus } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, serverType: 'singleplayer' | 'multiplayer', roomData?: { id: string; password: string }) => void;
  onShowFriends: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onShowFriends }) => {
  const [username, setUsername] = useState('');
  const [serverType, setServerType] = useState<'singleplayer' | 'multiplayer'>('singleplayer');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleLogin = () => {
    if (!username.trim()) return;
    
    if (serverType === 'multiplayer' && (!roomId.trim() || !roomPassword.trim())) {
      return;
    }

    const roomData = serverType === 'multiplayer' ? { id: roomId, password: roomPassword } : undefined;
    onLogin(username, serverType, roomData);
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

      <div className="relative z-10 bg-black bg-opacity-80 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-green-500 border-opacity-30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 mb-2">VoxelCraft</h1>
          <p className="text-green-300 text-lg">Java Edition Remastered</p>
          <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-6">
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
              className="w-full px-4 py-3 bg-gray-900 border border-green-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-20 transition-all"
              placeholder="Enter your username"
              maxLength={16}
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
                className={`p-3 rounded-lg border-2 transition-all ${
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
                className={`p-3 rounded-lg border-2 transition-all ${
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
                  className="text-green-400 hover:text-green-300 text-sm"
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
                    className="flex-1 px-3 py-2 bg-gray-800 border border-green-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                    placeholder="Enter room ID"
                    maxLength={6}
                  />
                  {isCreatingRoom && (
                    <button
                      onClick={generateRoomId}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
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
                  className="w-full px-3 py-2 bg-gray-800 border border-green-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                  placeholder="Enter room password"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={!username.trim() || (serverType === 'multiplayer' && (!roomId.trim() || !roomPassword.trim()))}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all transform hover:scale-105 disabled:hover:scale-100"
            >
              <Play className="w-5 h-5 inline mr-2" />
              Start Game
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onShowFriends}
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Friends
              </button>
              <button className="py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors">
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© 2025 VoxelCraft Remastered</p>
          <p className="mt-1">Enhanced Minecraft Experience</p>
        </div>
      </div>
    </div>
  );
};
