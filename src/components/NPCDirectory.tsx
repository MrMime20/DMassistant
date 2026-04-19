
import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Search, MoreVertical, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NPC } from '../types';
import { storage } from '../lib/storage';
import { campaignService } from '../services/campaignService';

export default function NPCDirectory() {
  const [campaign, setCampaign] = useState(() => campaignService.get());
  const [npcs, setNpcs] = useState<NPC[]>(() => campaign.npcs || []);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const imageUrlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    campaignService.update({ npcs });
    window.dispatchEvent(new Event('campaign-updated'));
  }, [npcs]);

  useEffect(() => {
    const handleUpdate = () => {
      const updated = campaignService.get();
      setCampaign(updated);
      // Only update local npcs if they actually changed (e.g. from an import)
      if (JSON.stringify(updated.npcs) !== JSON.stringify(npcs)) {
        setNpcs(updated.npcs || []);
      }
    };
    window.addEventListener('campaign-updated', handleUpdate);
    return () => window.removeEventListener('campaign-updated', handleUpdate);
  }, [npcs]);

  const activeNpc = npcs.find(n => n.id === activeNpcId);

  const addNpc = () => {
    const newNpc: NPC = {
      id: crypto.randomUUID(),
      name: 'Commoner Name',
      race: 'Human',
      occupation: 'Innkeeper',
      alignment: 'Neutral',
      performance: '',
      notes: '',
      personality: ''
    } as any;
    setNpcs(prev => [newNpc, ...prev]);
    setActiveNpcId(newNpc.id);
  };

  const updateNpc = (updates: Partial<NPC>) => {
    setNpcs(prev => {
      const next = prev.map(n => n.id === activeNpcId ? { ...n, ...updates } : n);
      storage.set('npcs', next);
      return next;
    });
  };

  const removeNpc = (id: string) => {
    setNpcs(prev => prev.filter(n => n.id !== id));
    if (activeNpcId === id) setActiveNpcId(null);
  };

  const filteredNpcs = npcs.filter(n => 
    n.name.toLowerCase().includes(search.toLowerCase()) || 
    n.race.toLowerCase().includes(search.toLowerCase()) ||
    n.occupation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex items-center justify-between border-b border-border-theme pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-olive flex items-center gap-3">
            <Users className="text-olive" />
            NPC Directory
          </h1>
          <p className="text-[10px] font-mono uppercase text-ink-light mt-1 ml-9">
            Manage allies, enemies, and townspeople
          </p>
        </div>
        <button 
          onClick={addNpc}
          className="flex items-center gap-2 px-6 py-2 bg-olive text-white rounded-lg hover:bg-olive/90 transition-all font-mono text-xs uppercase tracking-widest shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          Add NPC
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, race..."
              className="w-full bg-parchment border border-border-theme rounded-lg pl-10 pr-4 py-2.5 text-xs outline-none focus:border-olive/50 shadow-sm transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-parchment border border-border-theme rounded-lg shadow-sm">
            <div className="divide-y divide-border-theme">
              {filteredNpcs.map(n => (
                <div
                  key={n.id}
                  onClick={() => setActiveNpcId(n.id)}
                  className={`w-full text-left p-4 transition-all relative group flex items-center justify-between cursor-pointer ${
                    activeNpcId === n.id 
                      ? 'bg-olive/5 border-l-4 border-olive' 
                      : 'hover:bg-page'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold tracking-tight ${activeNpcId === n.id ? 'text-olive' : 'text-ink'}`}>{n.name}</span>
                    <span className="text-[10px] uppercase font-mono text-ink-light">{n.race} • {n.occupation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeNpc(n.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-ink-light hover:text-crimson transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <UserPlus className={`w-3.5 h-3.5 transition-colors ${activeNpcId === n.id ? 'text-olive' : 'text-border-theme group-hover:text-olive'}`} />
                  </div>
                </div>
              ))}
              {filteredNpcs.length === 0 && (
                <div className="p-8 text-center text-ink-light text-[10px] font-mono uppercase opacity-50 italic">
                  No records in the directory
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-8 overflow-y-auto custom-scrollbar bg-parchment border border-border-theme rounded-xl p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {activeNpc ? (
              <motion.div 
                key={activeNpc.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] font-mono uppercase text-ink-light font-bold block mb-1">Full Identity</span>
                      <input
                        type="text"
                        value={activeNpc.name ?? ''}
                        onChange={e => updateNpc({ name: e.target.value })}
                        className="w-full bg-parchment border border-border-theme rounded-lg p-2.5 text-ink outline-none focus:border-olive/30 shadow-sm"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-[10px] font-mono uppercase text-ink-light font-bold block mb-1">Lineage</span>
                        <input
                          type="text"
                          value={activeNpc.race ?? ''}
                          onChange={e => updateNpc({ race: e.target.value })}
                          className="w-full bg-parchment border border-border-theme rounded-lg p-2.5 text-ink outline-none focus:border-olive/30 shadow-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-mono uppercase text-ink-light font-bold block mb-1">Alignment</span>
                        <input
                          type="text"
                          value={activeNpc.alignment ?? ''}
                          onChange={e => updateNpc({ alignment: e.target.value })}
                          className="w-full bg-parchment border border-border-theme rounded-lg p-2.5 text-ink outline-none focus:border-olive/30 shadow-sm"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-[10px] font-mono uppercase text-ink-light font-bold block mb-1">Occupation / Role</span>
                      <input
                        type="text"
                        value={activeNpc.occupation ?? ''}
                        onChange={e => updateNpc({ occupation: e.target.value })}
                        className="w-full bg-parchment border border-border-theme rounded-lg p-2.5 text-ink outline-none focus:border-olive/30 shadow-sm"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <label className="block h-full flex flex-col">
                      <span className="text-[10px] font-mono uppercase text-ink-light font-bold block mb-1">Personality & Mannerisms</span>
                      <textarea
                        value={activeNpc.personality ?? ''}
                        onChange={e => updateNpc({ personality: e.target.value })}
                        className="flex-1 w-full bg-parchment border border-border-theme rounded-lg p-4 text-sm italic text-ink-light outline-none min-h-[160px] resize-none shadow-sm"
                        placeholder="Talks with a heavy lisp, hates pigeons..."
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-ink-light font-bold">Portrait Gallery</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 flex gap-2">
                        <input 
                          ref={imageUrlRef}
                          type="text"
                          placeholder="Paste Image URL here..."
                          className="flex-1 bg-parchment border border-border-theme rounded px-3 py-2 text-[10px] outline-none focus:border-olive/50 font-mono shadow-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const url = e.currentTarget.value;
                              if (url) {
                                updateNpc({ images: [...(activeNpc.images || []), url] });
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            const url = imageUrlRef.current?.value;
                            if (url) {
                              updateNpc({ images: [...(activeNpc.images || []), url] });
                              if (imageUrlRef.current) imageUrlRef.current.value = '';
                            }
                          }}
                          className="bg-olive text-white p-2 rounded shadow-sm hover:bg-olive/90 transition-colors"
                          title="Add Image"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[8px] text-ink-light opacity-60">Paste URL and press Enter</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar min-h-[128px]">
                      {activeNpc.images?.map((img, i) => (
                        <div key={i} className="relative group shrink-0">
                          <img 
                            src={img} 
                            className="w-24 h-32 object-cover rounded-lg border border-border-theme shadow-sm" 
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            onClick={() => updateNpc({ images: activeNpc.images?.filter((_, idx) => idx !== i) })}
                            className="absolute -top-1 -right-1 bg-crimson text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(!activeNpc.images || activeNpc.images.length === 0) && (
                        <div className="w-24 h-32 bg-page border border-dashed border-border-theme rounded-lg flex items-center justify-center text-[8px] text-ink-light opacity-40 text-center px-2 uppercase">
                          No images
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[10px] font-mono uppercase text-ink-light font-bold block mb-1">Lore & Secret Notes</span>
                    <textarea
                      value={activeNpc.notes ?? ''}
                      onChange={e => updateNpc({ notes: e.target.value })}
                      className="w-full bg-parchment border border-border-theme rounded-lg p-6 text-sm text-ink-light outline-none min-h-[220px] resize-none italic shadow-sm leading-relaxed"
                      placeholder="Actually a spy for the Radiant Order..."
                    />
                  </label>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-ink-light space-y-4 opacity-30">
                <Users className="w-16 h-16" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] italic">Character profiles await your creation</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
