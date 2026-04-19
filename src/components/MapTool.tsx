import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, RotateCcw, Plus, Trash2, 
  Users, Image as ImageIcon,
  ChevronLeft, ChevronRight, Hash,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { campaignService, CampaignData, MapData, MapToken } from '../services/campaignService';

export default function MapTool() {
  const [campaign, setCampaign] = useState<CampaignData>(() => campaignService.get());
  const [currentMapIndex, setCurrentMapIndex] = useState(0);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [customTokenName, setCustomTokenName] = useState('');
  const [customTokenEmoji, setCustomTokenEmoji] = useState('🛡️');
  const containerRef = useRef<HTMLDivElement>(null);

  const maps = campaign?.maps || [];
  const currentMap = maps[currentMapIndex] || maps[0] || { id: 'default', name: 'Unknown', backgroundUrl: null, tokens: [] };

  useEffect(() => {
    const handleUpdate = () => {
      const updated = campaignService.get();
      if (JSON.stringify(updated.maps) !== JSON.stringify(campaign?.maps)) {
        setCampaign(updated);
      }
    };
    window.addEventListener('campaign-updated', handleUpdate);
    return () => window.removeEventListener('campaign-updated', handleUpdate);
  }, [campaign]);

  useEffect(() => {
    if (campaign) {
      campaignService.set(campaign);
      window.dispatchEvent(new Event('campaign-updated'));
    }
  }, [campaign]);

  const updateCurrentMap = (updates: Partial<MapData>) => {
    const newMaps = [...maps];
    const index = maps.length > currentMapIndex ? currentMapIndex : 0;
    newMaps[index] = { ...currentMap, ...updates };
    setCampaign(prev => ({ ...prev, maps: newMaps }));
  };

  const addToken = (token: Partial<MapToken>) => {
    const newToken: MapToken = {
      id: crypto.randomUUID(),
      name: token.name || 'New Token',
      x: 50,
      y: 50,
      emoji: token.emoji || '🛡️',
      imageUrl: token.imageUrl,
      isPlayer: token.isPlayer ?? false,
      type: token.type || 'actor',
      rotation: 0,
      size: token.size || 1
    };
    updateCurrentMap({ tokens: [...currentMap.tokens, newToken] });
    setSelectedTokenId(newToken.id);
  };

  const updateToken = (id: string, updates: Partial<MapToken>) => {
    updateCurrentMap({
      tokens: currentMap.tokens.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !selectedTokenId) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    updateToken(selectedTokenId, { x, y });
  };

  const removeToken = (id: string) => {
    updateCurrentMap({
      tokens: currentMap.tokens.filter(t => t.id !== id)
    });
    setSelectedTokenId(null);
  };

  return (
    <div className="h-full flex flex-col gap-6 select-none">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-theme pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-olive flex items-center gap-3">
            <MapIcon className="text-olive" />
            Celestial Atlas
          </h1>
          <div className="flex items-center gap-2 mt-1 ml-9">
            <button 
              onClick={() => setCurrentMapIndex(prev => Math.max(0, prev - 1))}
              disabled={currentMapIndex === 0}
              className="p-1 text-ink-light disabled:opacity-20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono uppercase text-ink font-bold tracking-widest">{currentMap?.name}</span>
            <button 
              onClick={() => setCurrentMapIndex(prev => Math.min(maps.length - 1, prev + 1))}
              disabled={currentMapIndex === maps.length - 1}
              className="p-1 text-ink-light disabled:opacity-20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAddingToken(!isAddingToken)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all shadow-sm ${isAddingToken ? 'bg-olive text-white border-olive' : 'bg-parchment border-border-theme text-olive hover:bg-olive/5'}`}
          >
            <Plus className="w-4 h-4" />
            Summon Token
          </button>
          <button 
            onClick={() => updateCurrentMap({ tokens: [] })}
            className="p-2 border border-border-theme bg-parchment text-ink-light hover:text-crimson rounded-lg transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="flex-1 bg-ink border border-border-theme rounded-2xl relative overflow-hidden group shadow-2xl">
          <div 
            ref={containerRef}
            className="w-full h-full relative cursor-crosshair"
            style={{
              backgroundImage: currentMap?.backgroundUrl ? `url(${currentMap.backgroundUrl})` : 'none',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            onClick={handleMapClick}
          >
            {!currentMap?.backgroundUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-parchment/10 space-y-4">
                <ImageIcon className="w-24 h-24" />
                <p className="font-mono text-xs uppercase tracking-[0.4em]">Background missing</p>
              </div>
            )}

            {currentMap?.tokens.map(token => (
              <div
                key={token.id}
                className={`absolute ${token.type === 'terrain' ? 'z-0 opacity-80' : selectedTokenId === token.id ? 'z-50' : 'z-10'} cursor-pointer flex items-center justify-center transition-all duration-300`}
                style={{ 
                  left: `${token.x}%`, 
                  top: `${token.y}%`,
                  width: `${(token.size || 1) * 48}px`,
                  height: `${(token.size || 1) * 48}px`,
                  marginLeft: `-${((token.size || 1) * 48) / 2}px`,
                  marginTop: `-${((token.size || 1) * 48) / 2}px`,
                  transform: `rotate(${token.rotation || 0}deg)`
                }}
                onClick={(e) => { e.stopPropagation(); setSelectedTokenId(token.id); }}
              >
                <div className={`w-full h-full flex items-center justify-center text-sm relative ${
                  token.type === 'terrain' 
                    ? 'rounded-none border-none scale-150' 
                    : `rounded-full border-2 bg-white/10 backdrop-blur-sm shadow-lg ${token.isPlayer ? 'border-olive bg-olive/20' : 'border-crimson bg-crimson/20'}`
                } ${selectedTokenId === token.id ? 'scale-125 ring-4 ring-white/50' : ''}`}>
                  <span style={{ fontSize: `${(token.size || 1) * 1.5}rem` }}>{token.emoji}</span>
                  {selectedTokenId === token.id && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeToken(token.id); }}
                      className="absolute -top-2 -right-2 bg-crimson text-white rounded-full p-0.5 shadow-md z-[60]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-mono font-bold uppercase text-white bg-black/70 px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100">
                    {token.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute top-4 right-4 bg-black/60 p-2 rounded text-[8px] font-mono text-white/50 uppercase tracking-widest">
            {selectedTokenId ? 'Click on map to place' : 'Select a token to move'}
          </div>
        </div>

        <AnimatePresence>
          {isAddingToken && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-full lg:w-72 bg-parchment border border-border-theme rounded-2xl p-6 shadow-xl flex flex-col gap-6 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border-theme pb-4">
                <h3 className="text-xs font-mono font-bold uppercase text-olive flex items-center gap-2">Summoning Circle</h3>
                <button onClick={() => setIsAddingToken(false)} className="text-ink-light"><Hash className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                {selectedTokenId ? (
                  <div className="p-4 bg-page border border-olive/20 rounded-xl space-y-4">
                    <h4 className="text-[10px] font-mono uppercase text-olive font-bold">refine and transform</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[8px] font-mono uppercase text-ink-light">Rotation</span>
                        <input type="range" min="0" max="360" value={currentMap.tokens.find(t => t.id === selectedTokenId)?.rotation || 0} onChange={(e) => updateToken(selectedTokenId, { rotation: parseInt(e.target.value) })} className="w-full accent-olive" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[8px] font-mono uppercase text-ink-light">Scale</span>
                        <input type="range" min="0.5" max="5" step="0.1" value={currentMap.tokens.find(t => t.id === selectedTokenId)?.size || 1} onChange={(e) => updateToken(selectedTokenId, { size: parseFloat(e.target.value) })} className="w-full accent-olive" />
                      </div>
                      <button onClick={() => setSelectedTokenId(null)} className="w-full py-1.5 bg-parchment border border-border-theme rounded text-[8px] font-mono uppercase">Done</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 p-4 bg-page rounded-xl border border-border-theme">
                       <h4 className="text-[10px] font-mono uppercase font-bold text-olive">Custom Token</h4>
                       <input value={customTokenName} onChange={e => setCustomTokenName(e.target.value)} placeholder="Name..." className="w-full bg-parchment border border-border-theme px-2 py-1 text-xs rounded" />
                       <input value={customTokenEmoji} onChange={e => setCustomTokenEmoji(e.target.value)} placeholder="Emoji..." className="w-full bg-parchment border border-border-theme px-2 py-1 text-xs rounded" />
                       <button onClick={() => { addToken({ name: customTokenName, emoji: customTokenEmoji }); setCustomTokenName(''); }} className="w-full py-1 bg-olive text-white rounded text-[8px] font-mono uppercase tracking-widest">Manifest</button>
                    </div>
                    <section>
                      <h4 className="text-[9px] font-mono uppercase text-ink-light font-bold mb-3 border-l-2 border-olive pl-2">The Fellowship</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {campaign.party.map(hero => (
                          <button key={hero.id} onClick={() => addToken({ name: hero.name, isPlayer: true, emoji: '🛡️', type: 'actor' })} className="flex items-center justify-between p-3 bg-page border border-border-theme rounded-xl text-left group">
                            <span className="text-xs font-bold text-ink">{hero.name}</span>
                            <Plus className="w-3 h-3 text-ink-light" />
                          </button>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
