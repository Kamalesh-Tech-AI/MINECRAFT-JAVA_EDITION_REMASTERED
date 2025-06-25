import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system' | 'join' | 'leave';
}

interface ChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  roomId?: string;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  isOpen,
  onClose,
  currentUsername,
  roomId
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      username: 'System',
      message: `Welcome to room ${roomId}!`,
      timestamp: new Date(),
      type: 'system'
    },
    {
      id: '2',
      username: 'Steve_Builder',
      message: 'Hey everyone! Ready to build something awesome?',
      timestamp: new Date(Date.now() - 60000),
      type: 'chat'
    },
    {
      id: '3',
      username: 'Alex_Miner',
      message: 'Found diamonds at coordinates 150, 12, -200!',
      timestamp: new Date(Date.now() - 120000),
      type: 'chat'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [onlinePlayers] = useState(['Steve_Builder', 'Alex_Miner', 'Diamond_Digger']);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      username: currentUsername,
      message: newMessage,
      timestamp: new Date(),
      type: 'chat'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getMessageStyle = (type: ChatMessage['type']) => {
    switch (type) {
      case 'system':
        return 'text-yellow-400 italic';
      case 'join':
        return 'text-green-400';
      case 'leave':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 w-96 h-80 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg border border-gray-600 flex flex-col z-50">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-600">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium">Chat</h3>
          <span className="text-gray-400 text-sm">({onlinePlayers.length} online)</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(message => (
          <div key={message.id} className="text-sm">
            <span className="text-gray-400 text-xs">
              [{formatTime(message.timestamp)}]
            </span>
            {message.type === 'chat' && (
              <>
                <span className="text-blue-400 font-medium ml-1">
                  {message.username}:
                </span>
                <span className="text-white ml-1">{message.message}</span>
              </>
            )}
            {message.type !== 'chat' && (
              <span className={`ml-1 ${getMessageStyle(message.type)}`}>
                {message.message}
              </span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-600">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-400 text-sm"
            maxLength={256}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
          <span>Press Enter to send, Esc to close</span>
          <span>{newMessage.length}/256</span>
        </div>
      </div>

      {/* Online Players Sidebar */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gray-900 bg-opacity-90 rounded-r-lg border-l border-gray-600 p-2">
        <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
          <Users className="w-3 h-3" />
          Online
        </div>
        <div className="space-y-1">
          {onlinePlayers.map(player => (
            <div key={player} className="text-xs text-white truncate" title={player}>
              {player}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
