import { useState, useEffect } from 'react';
import { Settings, Users, Plus, Trash2, Save, Sparkles, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { campaignService, CampaignData, PartyMember } from '../services/campaignService';

export default function CampaignSettings() {
  const [data, setData] = useState<CampaignData>(() => campaignService.get());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    campaignService.set(data);
    // Trigger a custom event so App.tsx knows to refresh
    window.dispatchEvent(new Event('campaign-updated'));
  }, [data]);

  const addMember = () => {
    const newMember: PartyMember = {
      id: crypto.randomUUID(),
      name: 'New Hero',
      class: 'Fighter',
      level: 1,
      hp: 10,
      maxHp: 10,
      ac: 10,
      exp: 0
    };
    setData(prev => ({ ...prev, party: [...prev.party, newMember] }));
  };

  const removeMember = (id: string) => {
    setData(prev => ({ ...prev, party: prev.party.filter(m => m.id !== id) }));
  };

  const updateMember = (id: string, updates: Partial<PartyMember>) => {
    setData(prev => ({
      ...prev,
      party: prev.party.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const addMap = () => {
    const newMap = {
      id: crypto.randomUUID(),
      name: 'New Region',
      backgroundUrl: null,
      tokens: []
    };
    setData(prev => ({ ...prev, maps: [...(prev.maps || []), newMap] }));
  };

  const updateMap = (id: string, updates: any) => {
    setData(prev => ({
      ...prev,
      maps: prev.maps.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const removeMap = (id: string) => {
    if (data.maps.length <= 1) return;
    setData(prev => ({
      ...prev,
      maps: prev.maps.filter(m => m.id !== id)
    }));
  };

  return (
    <div className="h-full flex flex-col gap-8 max-w-6xl mx-auto py-4 overflow-y-auto custom-scrollbar pr-2">
      <header className="flex items-center justify-between border-b border-border-theme pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-olive flex items-center gap-3">
            <Settings className="text-olive" />
            Campaign Settings
          </h1>
          <p className="text-[10px] font-mono uppercase text-ink-light mt-1 ml-9">
            Refine the souls and lands of your world
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Campaign & Maps */}
        <div className="space-y-8">
          <section className="bg-parchment border border-border-theme rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-mono uppercase text-olive font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Campaign Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[10px] font-mono uppercase text-ink-light font-bold block mb-1">Title</span>
                <input
                  type="text"
                  value={data.name ?? ''}
                  onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-page border border-border-theme rounded-lg px-4 py-2 text-sm text-ink outline-none focus:border-olive/50 transition-colors"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-mono uppercase text-ink-light font-bold block mb-1">Session Goal</span>
                <input
                  type="text"
                  value={data.nextSession ?? ''}
                  onChange={e => setData(prev => ({ ...prev, nextSession: e.target.value }))}
                  className="w-full bg-page border border-border-theme rounded-lg px-4 py-2 text-sm text-ink outline-none focus:border-olive/50 transition-colors"
                />
              </label>
            </div>
          </section>

          <section className="bg-parchment border border-border-theme rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono uppercase text-olive font-bold flex items-center gap-2">
                <MapIcon className="w-4 h-4" />
                World Maps
              </h3>
              <button 
                onClick={addMap}
                className="p-1 px-3 bg-olive/10 text-olive text-[9px] font-mono uppercase rounded-full hover:bg-olive hover:text-white transition-all border border-olive/20"
              >
                Discover Region
              </button>
            </div>
            <div className="space-y-4">
              {data.maps?.map(m => (
                <div key={m.id} className="bg-page p-4 rounded-xl border border-border-theme space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m.name}
                      onChange={e => updateMap(m.id, { name: e.target.value })}
                      className="flex-1 bg-parchment border border-border-theme/30 rounded px-3 py-1.5 text-xs outline-none focus:border-olive/50"
                      placeholder="Map Name"
                    />
                    <button 
                      onClick={() => removeMap(m.id)}
                      className="p-1.5 text-ink-light hover:text-crimson transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase text-ink-light font-bold w-20">URL</span>
                    <input
                      type="text"
                      value={m.backgroundUrl || ''}
                      onChange={e => updateMap(m.id, { backgroundUrl: e.target.value })}
                      className="flex-1 bg-parchment border border-border-theme/30 rounded px-3 py-1 text-[10px] font-mono outline-none focus:border-olive/50"
                      placeholder="https://example.com/map.jpg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Party Management */}
        <section className="bg-parchment border border-border-theme rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-mono uppercase text-olive font-bold flex items-center gap-2">
              <Users className="w-4 h-4" />
              The Party
            </h3>
            <button 
              onClick={addMember}
              className="p-2 px-4 bg-olive text-white text-[10px] font-mono uppercase rounded-lg hover:shadow-lg transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              Add Member
            </button>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {data.party.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-page p-4 rounded-2xl border border-border-theme group relative"
                >
                  <div className="grid grid-cols-12 gap-3 mb-3">
                    <div className="col-span-12 sm:col-span-6">
                      <span className="text-[8px] font-mono uppercase text-ink-light block mb-1">Name</span>
                      <input
                        type="text"
                        value={m.name ?? ''}
                        onChange={e => updateMember(m.id, { name: e.target.value })}
                        className="w-full bg-parchment border border-border-theme/30 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-olive/50"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <span className="text-[8px] font-mono uppercase text-ink-light block mb-1">Class</span>
                      <input
                        type="text"
                        value={m.class ?? ''}
                        onChange={e => updateMember(m.id, { class: e.target.value })}
                        className="w-full bg-parchment border border-border-theme/30 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-olive/50"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <span className="text-[8px] font-mono uppercase text-ink-light block mb-1">Lvl</span>
                      <input
                        type="number"
                        value={m.level ?? 1}
                        onChange={e => updateMember(m.id, { level: parseInt(e.target.value) || 1 })}
                        className="w-full bg-parchment border border-border-theme/30 rounded-lg px-2 py-1.5 text-xs outline-none text-center focus:border-olive/50 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <span className="text-[8px] font-mono uppercase text-ink-light block mb-1">HP</span>
                      <input
                        type="number"
                        value={m.hp ?? 0}
                        onChange={e => updateMember(m.id, { hp: parseInt(e.target.value) || 0 })}
                        className="w-full bg-parchment border border-border-theme/30 rounded-lg px-2 py-1 text-xs outline-none text-center text-crimson font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] font-mono uppercase text-ink-light block mb-1">Max HP</span>
                      <input
                        type="number"
                        value={m.maxHp ?? 1}
                        onChange={e => updateMember(m.id, { maxHp: parseInt(e.target.value) || 0 })}
                        className="w-full bg-parchment border border-border-theme/30 rounded-lg px-2 py-1 text-xs outline-none text-center font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] font-mono uppercase text-ink-light block mb-1">AC</span>
                      <input
                        type="number"
                        value={m.ac ?? 10}
                        onChange={e => updateMember(m.id, { ac: parseInt(e.target.value) || 0 })}
                        className="w-full bg-parchment border border-border-theme/30 rounded-lg px-2 py-1 text-xs outline-none text-center text-olive font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] font-mono uppercase text-ink-light block mb-1">EXP</span>
                      <input
                        type="number"
                        value={m.exp ?? 0}
                        onChange={e => updateMember(m.id, { exp: parseInt(e.target.value) || 0 })}
                        className="w-full bg-parchment border border-border-theme/30 rounded-lg px-2 py-1 text-xs outline-none text-center font-mono"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => removeMember(m.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-parchment border border-border-theme rounded-full flex items-center justify-center text-ink-light hover:text-crimson hover:border-crimson transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <footer className="mt-auto border-t border-border-theme pt-6 flex justify-end">
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-mono uppercase text-ink-light italic opacity-50">
            Records are automatically etched into storage
          </p>
        </div>
      </footer>
    </div>
  );
}
