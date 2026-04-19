
import { useState, useEffect } from 'react';
import { 
  Sword, Shield, Heart, User, Ghost, 
  ChevronRight, ChevronLeft, RotateCcw, 
  Plus, Trash2, Edit2, Play, Pause, Save,
  Users, Hash, Sparkles, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Encounter, EncounterParticipant } from '../types';
import { storage } from '../lib/storage';
import { campaignService, PartyMember } from '../services/campaignService';

export default function CombatTracker() {
  const [campaign, setCampaign] = useState(() => campaignService.get());
  const [encounter, setEncounter] = useState<Encounter>(() => 
    storage.get('active_encounter', {
      id: crypto.randomUUID(),
      name: 'Unnamed Encounter',
      participants: [],
      currentTurnIndex: 0,
      round: 1,
      isActive: false
    })
  );
  const [showPartyPicker, setShowPartyPicker] = useState(false);
  const [rewardExpAmount, setRewardExpAmount] = useState(0);

  useEffect(() => {
    storage.set('active_encounter', encounter);
    campaignService.update({ activeEncounter: encounter });
  }, [encounter]);

  useEffect(() => {
    const handleUpdate = () => setCampaign(campaignService.get());
    window.addEventListener('campaign-updated', handleUpdate);
    return () => window.removeEventListener('campaign-updated', handleUpdate);
  }, []);

  const addParticipant = () => {
    const newParticipant: EncounterParticipant = {
      id: crypto.randomUUID(),
      name: 'New Combatant',
      initiative: 0,
      hp: 10,
      maxHp: 10,
      ac: 10,
      isPlayer: false,
      conditions: []
    };
    setEncounter(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));
  };

  const addPlayerToEncounter = (hero: PartyMember) => {
    const exists = encounter.participants.find(p => p.id === hero.id);
    if (exists) return;

    const newParticipant: EncounterParticipant = {
      id: hero.id,
      name: hero.name,
      initiative: 0,
      hp: hero.hp,
      maxHp: hero.maxHp,
      ac: hero.ac,
      isPlayer: true,
      conditions: []
    };
    setEncounter(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));
    setShowPartyPicker(false);
  };

  const removeParticipant = (id: string) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }));
  };

  const updateParticipant = (id: string, updates: Partial<EncounterParticipant>) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
    
    // If it's a player, we sync back to campaign storage
    const participant = encounter.participants.find(p => p.id === id);
    if (participant?.isPlayer) {
      const party = campaign.party.map(m => m.id === id ? { 
        ...m, 
        hp: updates.hp !== undefined ? updates.hp : m.hp,
        ac: updates.ac !== undefined ? updates.ac : m.ac
      } : m);
      campaignService.update({ party });
      window.dispatchEvent(new Event('campaign-updated'));
    }
  };

  const awardExp = () => {
    if (rewardExpAmount <= 0) return;
    const survivors = encounter.participants.filter(p => p.isPlayer);
    const perPerson = Math.floor(rewardExpAmount / (survivors.length || 1));
    
    const party = campaign.party.map(m => {
      if (survivors.find(s => s.id === m.id)) {
        return { ...m, exp: m.exp + perPerson };
      }
      return m;
    });
    
    campaignService.update({ party });
    window.dispatchEvent(new Event('campaign-updated'));
    setRewardExpAmount(0);
    console.log(`Awarded ${perPerson} EXP to each participating hero!`);
  };

  const sortedParticipants = [...encounter.participants].sort((a, b) => b.initiative - a.initiative);

  const nextTurn = () => {
    setEncounter(prev => {
      let nextIndex = prev.currentTurnIndex + 1;
      let nextRound = prev.round;
      if (nextIndex >= prev.participants.length) {
        nextIndex = 0;
        nextRound++;
      }
      return { ...prev, currentTurnIndex: nextIndex, round: nextRound };
    });
  };

  const prevTurn = () => {
    setEncounter(prev => {
      let nextIndex = prev.currentTurnIndex - 1;
      let nextRound = prev.round;
      if (nextIndex < 0) {
        nextIndex = Math.max(0, prev.participants.length - 1);
        nextRound = Math.max(1, prev.round - 1);
      }
      return { ...prev, currentTurnIndex: nextIndex, round: nextRound };
    });
  };

  const toggleCombat = () => {
    setEncounter(prev => ({ ...prev, isActive: !prev.isActive, currentTurnIndex: 0, round: 1 }));
  };

  const resetCombat = () => {
    setEncounter(prev => ({ ...prev, isActive: false, currentTurnIndex: 0, round: 1 }));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-theme pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-olive flex items-center gap-3">
            <Sword className="text-crimson" />
            Combat Encounter
          </h1>
          <p className="text-[10px] font-mono uppercase text-ink-light mt-1 ml-9">
            Manage initiative, health, and rewards
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Party Adder */}
          <div className="relative">
            <button 
              onClick={() => setShowPartyPicker(!showPartyPicker)}
              className="px-3 py-2 bg-parchment border border-border-theme text-olive rounded-lg text-[10px] font-mono uppercase hover:bg-olive/5 transition-all flex items-center gap-2"
            >
              <Users className="w-3.5 h-3.5" />
              Add Party Member
            </button>
            <AnimatePresence>
              {showPartyPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-parchment border border-border-theme rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-2 bg-page border-b border-border-theme">
                    <p className="text-[8px] font-mono uppercase text-ink-light font-bold">Select Hero</p>
                  </div>
                  {campaign.party.map(hero => (
                    <button
                      key={hero.id}
                      onClick={() => addPlayerToEncounter(hero)}
                      className="w-full text-left px-4 py-2 text-xs text-ink hover:bg-olive hover:text-white transition-colors flex justify-between items-center"
                    >
                      <span>{hero.name}</span>
                      <Plus className="w-3 h-3 opacity-50" />
                    </button>
                  ))}
                  {campaign.party.length === 0 && (
                    <div className="p-4 text-center text-ink-light text-[10px] italic">No heroes found</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex bg-parchment border border-border-theme rounded-lg p-1">
            <button 
              onClick={prevTurn}
              className="p-2 hover:bg-page text-ink-light rounded transition-colors"
              disabled={!encounter.isActive}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-1 flex flex-col items-center justify-center border-x border-border-theme">
              <span className="text-[10px] font-mono text-ink-light uppercase">Round</span>
              <span className="text-sm font-bold text-crimson">{encounter.round ?? 1}</span>
            </div>
            <button 
              onClick={nextTurn}
              className="p-2 hover:bg-page text-ink-light rounded transition-colors"
              disabled={!encounter.isActive}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={toggleCombat}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
              encounter.isActive 
                ? 'bg-crimson/10 text-crimson border border-crimson/50 hover:bg-crimson/20 shadow-sm' 
                : 'bg-olive/10 text-olive border border-olive/50 hover:bg-olive/20 shadow-sm'
            }`}
          >
            {encounter.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {encounter.isActive ? 'Stop' : 'Start'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between px-4 py-2 bg-parchment border border-border-theme rounded-t-lg">
            <div className="grid grid-cols-[1fr_80px_100px_80px_50px] gap-4 w-full text-[10px] font-mono uppercase text-ink-light">
              <span>Name / Type</span>
              <span className="text-center">Initiative</span>
              <span className="text-center">HP / Max</span>
              <span className="text-center">AC</span>
              <span className="text-right">Actions</span>
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {sortedParticipants.map((p, idx) => {
                const isTurn = encounter.isActive && idx === encounter.currentTurnIndex;
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: isTurn ? 1.01 : 1,
                    }}
                    className={`grid grid-cols-[1fr_80px_100px_80px_50px] gap-4 items-center px-4 py-3 border rounded-lg transition-all ${
                      isTurn 
                        ? 'bg-parchment border-crimson shadow-[0_0_12px_rgba(140,59,59,0.1)]' 
                        : 'bg-parchment border-border-theme shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full border border-border-theme ${p.isPlayer ? 'bg-olive shadow-[0_0_8px_rgba(90,90,64,0.3)]' : 'bg-crimson shadow-[0_0_8px_rgba(140,59,59,0.3)]'}`} />
                      <input
                        type="text"
                        value={p.name ?? ''}
                        onChange={e => updateParticipant(p.id, { name: e.target.value })}
                        className="bg-transparent text-ink text-sm font-semibold outline-none focus:text-olive w-full"
                      />
                    </div>

                    <div className="flex justify-center">
                      <input
                        type="number"
                        value={p.initiative ?? 0}
                        onChange={e => updateParticipant(p.id, { initiative: parseInt(e.target.value) || 0 })}
                        className="w-12 bg-page border border-border-theme rounded text-center text-xs text-ink p-1 font-serif font-bold"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={p.hp ?? 0}
                        onChange={e => updateParticipant(p.id, { hp: parseInt(e.target.value) || 0 })}
                        className={`w-14 bg-page border border-border-theme rounded text-center text-xs p-1 font-mono font-bold ${(p.hp || 0) < (p.maxHp || 1) * 0.3 ? 'text-crimson' : 'text-olive'}`}
                      />
                      <span className="text-ink-light font-mono text-[10px]">/</span>
                      <input
                        type="number"
                        value={p.maxHp ?? 0}
                        onChange={e => updateParticipant(p.id, { maxHp: parseInt(e.target.value) || 0 })}
                        className="w-14 bg-parchment border border-border-theme rounded text-center text-xs text-ink-light p-1 font-mono"
                      />
                    </div>

                    <div className="flex justify-center">
                      <input
                        type="number"
                        value={p.ac ?? 0}
                        onChange={e => updateParticipant(p.id, { ac: parseInt(e.target.value) || 0 })}
                        className="w-10 bg-page border border-border-theme rounded text-center text-xs text-ink p-1 font-mono"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button 
                        onClick={() => removeParticipant(p.id)}
                        className="p-1 text-ink-light hover:text-crimson transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <button 
            onClick={addParticipant}
            className="w-full py-4 border-2 border-dashed border-border-theme hover:border-olive/50 hover:bg-parchment text-ink-light hover:text-olive transition-all rounded-xl flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest mt-4"
          >
            <Plus className="w-4 h-4" />
            Add Entity
          </button>
        </div>

        <aside className="space-y-4">
          <div className="bg-parchment border border-border-theme p-4 rounded-xl shadow-sm border-t-4 border-t-olive">
            <h3 className="text-[10px] font-mono uppercase text-ink-light mb-4 flex items-center gap-2">
              <Users className="w-3 h-3 text-olive" /> EXP Rewards
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-page border border-border-theme rounded-lg">
                <span className="text-[8px] font-mono uppercase text-ink-light block mb-2 font-bold">Total EXP Pool</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={rewardExpAmount ?? 0}
                    onChange={e => setRewardExpAmount(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-parchment border border-border-theme rounded px-2 py-1.5 text-xs font-mono"
                    placeholder="Enter EXP..."
                  />
                  <button 
                    onClick={awardExp}
                    disabled={rewardExpAmount <= 0}
                    className="p-2 bg-olive text-white rounded hover:bg-olive-dark disabled:opacity-30 disabled:grayscale transition-all"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border-theme">
                {encounter.participants.filter(p => p.isPlayer).map(p => {
                  const hero = campaign.party.find(h => h.id === p.id);
                  return (
                    <div key={p.id} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-ink font-semibold">{p.name ?? ''}</span>
                        <span className={`font-serif font-bold ${(p.hp || 0) < (p.maxHp || 1) * 0.3 ? 'text-crimson' : 'text-olive'}`}>
                          {p.hp ?? 0}/{p.maxHp ?? 1}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-page rounded-full overflow-hidden border border-border-theme">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${(p.hp || 0) < (p.maxHp || 1) * 0.3 ? 'bg-crimson' : 'bg-olive'}`}
                          style={{ width: `${Math.min(100, Math.max(0, ((p.hp || 0) / (p.maxHp || 1)) * 100))}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-ink-light uppercase text-right opacity-60">
                        {hero?.exp ?? 0} Total EXP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-parchment border border-border-theme p-4 rounded-xl shadow-sm border-t-4 border-t-crimson">
            <h3 className="text-[10px] font-mono uppercase text-ink-light mb-4 flex items-center gap-2">
              <Hash className="w-3 h-3 text-crimson" /> Combat Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-page border border-border-theme p-2 rounded text-center">
                <span className="block text-[10px] uppercase text-ink-light font-mono">Enemies</span>
                <span className="text-xl font-serif font-bold text-crimson">
                  {encounter.participants.filter(p => !p.isPlayer).length}
                </span>
              </div>
              <div className="bg-page border border-border-theme p-2 rounded text-center">
                <span className="block text-[10px] uppercase text-ink-light font-mono">Party HP</span>
                <span className="text-xl font-serif font-bold text-ink">
                  {encounter.participants.filter(p => p.isPlayer).reduce((acc, p) => acc + p.hp, 0)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
