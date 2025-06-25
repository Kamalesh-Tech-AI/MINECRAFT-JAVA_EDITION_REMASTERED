import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Trash2, Clock, HardDrive } from 'lucide-react';

interface SaveFile {
  id: string;
  name: string;
  timestamp: Date;
  size: string;
  isAutoSave: boolean;
  worldData: any;
}

interface SaveManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSave: (saveData: any) => void;
  currentWorldData: any;
}

export const SaveManager: React.FC<SaveManagerProps> = ({ 
  isOpen, 
  onClose, 
  onLoadSave, 
  currentWorldData 
}) => {
  const [saves, setSaves] = useState<SaveFile[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(5); // minutes
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    // Load saves from localStorage
    const savedFiles = localStorage.getItem('voxelcraft-saves');
    if (savedFiles) {
      const parsedSaves = JSON.parse(savedFiles).map((save: any) => ({
        ...save,
        timestamp: new Date(save.timestamp)
      }));
      setSaves(parsedSaves);
    }

    // Load auto-save settings
    const autoSaveSettings = localStorage.getItem('voxelcraft-autosave-settings');
    if (autoSaveSettings) {
      const settings = JSON.parse(autoSaveSettings);
      setAutoSaveEnabled(settings.enabled);
      setAutoSaveInterval(settings.interval);
    }
  }, [isOpen]);

  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout;
    
    if (autoSaveEnabled && currentWorldData) {
      autoSaveTimer = setInterval(() => {
        performAutoSave();
      }, autoSaveInterval * 60 * 1000);
    }

    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [autoSaveEnabled, autoSaveInterval, currentWorldData]);

  const performAutoSave = () => {
    if (!currentWorldData) return;

    const autoSave: SaveFile = {
      id: `autosave-${Date.now()}`,
      name: `AutoSave ${new Date().toLocaleString()}`,
      timestamp: new Date(),
      size: calculateSize(currentWorldData),
      isAutoSave: true,
      worldData: currentWorldData
    };

    const updatedSaves = [autoSave, ...saves.filter(s => !s.isAutoSave || s.id !== autoSave.id)];
    
    // Keep only the 5 most recent auto-saves
    const autoSaves = updatedSaves.filter(s => s.isAutoSave).slice(0, 5);
    const manualSaves = updatedSaves.filter(s => !s.isAutoSave);
    
    const finalSaves = [...autoSaves, ...manualSaves];
    setSaves(finalSaves);
    savesToStorage(finalSaves);
  };

  const calculateSize = (data: any): string => {
    const sizeInBytes = new Blob([JSON.stringify(data)]).size;
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const savesToStorage = (savesToStore: SaveFile[]) => {
    localStorage.setItem('voxelcraft-saves', JSON.stringify(savesToStore));
  };

  const saveAutoSaveSettings = () => {
    localStorage.setItem('voxelcraft-autosave-settings', JSON.stringify({
      enabled: autoSaveEnabled,
      interval: autoSaveInterval
    }));
  };

  const manualSave = () => {
    if (!currentWorldData || !saveName.trim()) return;

    const newSave: SaveFile = {
      id: `save-${Date.now()}`,
      name: saveName,
      timestamp: new Date(),
      size: calculateSize(currentWorldData),
      isAutoSave: false,
      worldData: currentWorldData
    };

    const updatedSaves = [newSave, ...saves];
    setSaves(updatedSaves);
    savesToStorage(updatedSaves);
    setSaveName('');
  };

  const deleteSave = (saveId: string) => {
    const updatedSaves = saves.filter(s => s.id !== saveId);
    setSaves(updatedSaves);
    savesToStorage(updatedSaves);
  };

  const loadSave = (save: SaveFile) => {
    onLoadSave(save.worldData);
    onClose();
  };

  const exportSave = (save: SaveFile) => {
    const dataStr = JSON.stringify(save.worldData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${save.name}.voxelcraft`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importSave = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const worldData = JSON.parse(e.target?.result as string);
        const importedSave: SaveFile = {
          id: `imported-${Date.now()}`,
          name: file.name.replace('.voxelcraft', ''),
          timestamp: new Date(),
          size: calculateSize(worldData),
          isAutoSave: false,
          worldData
        };

        const updatedSaves = [importedSave, ...saves];
        setSaves(updatedSaves);
        savesToStorage(updatedSaves);
      } catch (error) {
        alert('Invalid save file format');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border-2 border-green-600 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-green-400">Save Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
          {/* Manual Save Section */}
          <div className="space-y-3">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Save className="w-5 h-5" />
              Manual Save
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter save name..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
              />
              <button
                onClick={manualSave}
                disabled={!saveName.trim() || !currentWorldData}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {/* Auto-Save Settings */}
          <div className="space-y-3 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Auto-Save Settings
            </h3>
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Enable Auto-Save</label>
              <button
                onClick={() => {
                  setAutoSaveEnabled(!autoSaveEnabled);
                  saveAutoSaveSettings();
                }}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoSaveEnabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  autoSaveEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
            {autoSaveEnabled && (
              <div className="flex items-center gap-3">
                <label className="text-gray-300">Interval:</label>
                <select
                  value={autoSaveInterval}
                  onChange={(e) => {
                    setAutoSaveInterval(parseInt(e.target.value));
                    saveAutoSaveSettings();
                  }}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            )}
          </div>

          {/* Import/Export */}
          <div className="flex gap-2">
            <label className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg cursor-pointer transition-colors">
              <Upload className="w-4 h-4 inline mr-2" />
              Import Save
              <input
                type="file"
                accept=".voxelcraft,.json"
                onChange={importSave}
                className="hidden"
              />
            </label>
          </div>

          {/* Saves List */}
          <div className="space-y-3">
            <h3 className="text-white font-medium flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Saved Worlds ({saves.length})
            </h3>
            
            {saves.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No saves found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {saves.map(save => (
                  <div key={save.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{save.name}</h4>
                        {save.isAutoSave && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                            AUTO
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {save.timestamp.toLocaleString()} • {save.size}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadSave(save)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => exportSave(save)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSave(save.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
