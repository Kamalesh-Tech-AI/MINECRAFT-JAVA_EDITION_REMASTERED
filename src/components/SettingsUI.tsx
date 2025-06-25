import React from 'react';
import { Settings, Volume2, Eye, Gamepad2 } from 'lucide-react';

interface SettingsUIProps {
  isOpen: boolean;
  onClose: () => void;
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  renderDistance: number;
  onRenderDistanceChange: (value: number) => void;
}

export const SettingsUI: React.FC<SettingsUIProps> = ({
  isOpen,
  onClose,
  sensitivity,
  onSensitivityChange,
  volume,
  onVolumeChange,
  renderDistance,
  onRenderDistanceChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl border-2 border-gray-700 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Mouse Sensitivity */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
              <label className="text-white font-medium">Mouse Sensitivity</label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={sensitivity}
                onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white text-sm w-12">{sensitivity.toFixed(1)}</span>
            </div>
          </div>

          {/* Volume */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-5 h-5 text-green-400" />
              <label className="text-white font-medium">Volume</label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={volume}
                onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white text-sm w-12">{volume}%</span>
            </div>
          </div>

          {/* Render Distance */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-purple-400" />
              <label className="text-white font-medium">Render Distance</label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={renderDistance}
                onChange={(e) => onRenderDistanceChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white text-sm w-12">{renderDistance}</span>
            </div>
          </div>

          {/* Controls Info */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-bold mb-2">Controls</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>WASD:</strong> Move</p>
              <p><strong>Mouse:</strong> Look around</p>
              <p><strong>Left Click:</strong> Break blocks</p>
              <p><strong>Right Click:</strong> Place blocks</p>
              <p><strong>Space:</strong> Jump</p>
              <p><strong>E:</strong> Open inventory</p>
              <p><strong>ESC:</strong> Settings</p>
              <p><strong>1-9:</strong> Select hotbar slot</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};