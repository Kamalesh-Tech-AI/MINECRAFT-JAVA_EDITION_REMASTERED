import React, { useState } from 'react';
import { UserPlus, Users, MessageCircle, Play, X, Search, UserCheck, UserX } from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'in-game';
  lastSeen?: string;
  currentRoom?: string;
}

interface FriendsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteToRoom: (friendId: string) => void;
}

export const FriendsManager: React.FC<FriendsManagerProps> = ({ isOpen, onClose, onInviteToRoom }) => {
  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', username: 'Steve_Builder', status: 'online' },
    { id: '2', username: 'Alex_Miner', status: 'in-game', currentRoom: 'ROOM01' },
    { id: '3', username: 'Creeper_Hunter', status: 'offline', lastSeen: '2 hours ago' },
    { id: '4', username: 'Diamond_Digger', status: 'online' },
  ]);
  
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'add'>('friends');

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFriend = () => {
    if (!newFriendUsername.trim()) return;
    
    const newFriend: Friend = {
      id: Date.now().toString(),
      username: newFriendUsername,
      status: 'offline',
      lastSeen: 'Just added'
    };
    
    setFriends([...friends, newFriend]);
    setNewFriendUsername('');
    setActiveTab('friends');
  };

  const removeFriend = (friendId: string) => {
    setFriends(friends.filter(f => f.id !== friendId));
  };

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'in-game': return 'bg-blue-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const getStatusText = (friend: Friend) => {
    switch (friend.status) {
      case 'online': return 'Online';
      case 'in-game': return `Playing in ${friend.currentRoom}`;
      case 'offline': return `Last seen ${friend.lastSeen}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border-2 border-green-600 max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-green-400">Friends Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'friends'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'add'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Add Friend
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {activeTab === 'friends' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                />
              </div>

              {/* Friends List */}
              <div className="space-y-2">
                {filteredFriends.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No friends found</p>
                  </div>
                ) : (
                  filteredFriends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {friend.username[0].toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(friend.status)} rounded-full border-2 border-gray-800`}></div>
                        </div>
                        <div>
                          <p className="text-white font-medium">{friend.username}</p>
                          <p className="text-sm text-gray-400">{getStatusText(friend)}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {friend.status === 'online' && (
                          <>
                            <button
                              onClick={() => onInviteToRoom(friend.id)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                              title="Invite to game"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                              title="Send message"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => removeFriend(friend.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          title="Remove friend"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-green-300 text-sm font-medium mb-2">
                  Add Friend by Username
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFriendUsername}
                    onChange={(e) => setNewFriendUsername(e.target.value)}
                    placeholder="Enter username"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                    maxLength={16}
                  />
                  <button
                    onClick={addFriend}
                    disabled={!newFriendUsername.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-white font-medium mb-2">How to add friends:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Enter their exact username</li>
                  <li>• They must be registered on VoxelCraft</li>
                  <li>• Friend requests are sent automatically</li>
                  <li>• You'll be notified when they accept</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
