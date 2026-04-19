import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Sword, Users, Map as MapIcon, 
  FileText, Book, Dice6, Download, Trash2,
  RefreshCw, Ghost, Zap, Shield, Crown, Upload
} from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../lib/storage';
import { dndApi } from '../services/dndApi';
import { campaignService, CampaignData } from '../services/campaignService';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [randomEncounter, setRandomEncounter] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<CampaignData>(() => campaignService.get());

  useEffect(() => {
    const handleUpdate = () => {
      setCampaign(campaignService.get());
    };
    window.addEventListener('campaign-updated', handleUpdate);
    return () => window.removeEventListener('campaign-updated', handleUpdate);
  }, []);

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        
        let campaignToImport: CampaignData;
        
        if (raw.campaign && typeof raw.campaign === 'object') {
          // It's a legacy structured export
          campaignToImport = {
            ...raw.campaign,
            music: raw.music || raw.campaign.music || [],
            notes: raw.notes || raw.campaign.notes || [],
            npcs: raw.npcs || raw.campaign.npcs || [],
            activeEncounter: raw.activeEncounter || raw.encounter || raw.campaign.activeEncounter
          };
        } else {
          campaignToImport = raw;
        }

        // Apply to service
        campaignService.set(campaignToImport);
        
        // Also sync active encounter to its dedicated storage key for immediate tracker access
        if (campaignToImport.activeEncounter) {
          storage.set('active_encounter', campaignToImport.activeEncounter);
        }

        setCampaign(campaignService.get());
        window.dispatchEvent(new Event('campaign-updated'));
        
        console.log('Chronicle reintegrated successfully.');
      } catch (err) {
        console.error('The tome is unreadable or corrupted.', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportData = () => {
    const data = campaignService.get();
    const date = new Date().toISOString().split('T')[0];
    const filename = `${data.name.toUpperCase().replace(/\s+/g, '_')}_${date}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const clearAll = () => {
    const confirmed = window.confirm('ERASE ALL CAMPAIGN DATA? This cannot be undone.');
    if (confirmed) {
      // Clear all local storage keys starting with our prefix
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('mythos_dm_')) {
          localStorage.removeItem(key);
        }
      });
      // Fallback: clear anything else that might have strayed
      localStorage.removeItem('active_encounter');
      localStorage.removeItem('campaign_data');
      
      console.log('Campaign records purged.');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  return (
    <div className="space-y-8 h-full overflow-y-auto custom-scrollbar pr-4">
      <header className="border-b border-border-theme pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif italic text-olive mb-2">{campaign.name ?? 'Untitled Campaign'}</h1>
          <p className="text-[10px] font-mono uppercase text-ink-light tracking-[0.2em]">{campaign.nextSession ?? 'No session goal set'}</p>
        </div>
        <div className="hidden md:flex flex-col items-end opacity-50">
          <span className="text-[8px] font-mono uppercase text-ink-light">Current Date</span>
          <span className="text-xs font-serif italic text-ink">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-parchment border border-border-theme p-6 rounded-xl space-y-4 shadow-sm">
          <h3 className="text-[10px] font-mono uppercase text-ink-light flex items-center gap-2 font-bold tracking-widest">
            <Crown className="w-3 h-3 text-olive" /> Campaign Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-page border border-border-theme p-4 rounded-xl text-center group hover:border-olive/50 transition-colors">
              <span className="block text-[8px] uppercase text-ink-light font-mono mb-1 font-bold">The Party</span>
              <span className="text-2xl font-bold text-olive">{campaign.party.length}</span>
            </div>
            <div className="bg-page border border-border-theme p-4 rounded-xl text-center group hover:border-crimson/50 transition-colors">
              <span className="block text-[8px] uppercase text-ink-light font-mono mb-1 font-bold">Chronicles</span>
              <span className="text-2xl font-bold text-crimson">{campaign.notes.length}</span>
            </div>
            <div className="bg-page border border-border-theme p-4 rounded-xl text-center group hover:border-olive/50 transition-colors">
              <span className="block text-[8px] uppercase text-ink-light font-mono mb-1 font-bold">Entities</span>
              <span className="text-2xl font-bold text-ink">{campaign.npcs.length}</span>
            </div>
            <div className="bg-page border border-border-theme p-4 rounded-xl text-center group hover:border-olive/50 transition-colors">
              <span className="block text-[8px] uppercase text-ink-light font-mono mb-1 font-bold">Map Cells</span>
              <span className="text-2xl font-bold text-ink">{Math.pow(15, 2)}</span>
            </div>
          </div>
        </div>

        {/* Party Quick View */}
        <div className="bg-parchment border border-border-theme p-6 rounded-xl space-y-4 shadow-sm">
          <h3 className="text-[10px] font-mono uppercase text-ink-light flex items-center gap-2 font-bold tracking-widest">
            <Users className="w-3 h-3 text-olive" /> The Party
          </h3>
          <div className="space-y-2 overflow-y-auto max-h-[160px] custom-scrollbar pr-1">
            {campaign.party.map(hero => (
              <div key={hero.id} className="flex items-center justify-between p-2 bg-page border border-border-theme rounded-lg group hover:border-olive/30 transition-all shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-ink group-hover:text-olive">{hero.name ?? ''}</span>
                  <span className="text-[8px] font-mono uppercase text-ink-light">{hero.class ?? ''}</span>
                </div>
                <span className="text-[10px] font-serif font-bold text-olive bg-parchment px-2 py-0.5 rounded border border-border-theme">LVL {hero.level ?? 1}</span>
              </div>
            ))}
            {campaign.party.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic py-8 border-2 border-dashed border-border-theme rounded-xl">
                <span className="text-[10px] font-mono uppercase">Party dissolved</span>
              </div>
            )}
          </div>
        </div>

        {/* Tools & Archive */}
        <div className="bg-parchment border border-border-theme p-6 rounded-xl space-y-4 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-mono uppercase text-ink-light flex items-center gap-2 font-bold tracking-widest">
            <RefreshCw className="w-3 h-3 text-olive" /> Export/Import
          </h3>
          <div className="space-y-3">
            <button 
              onClick={exportData}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-page border border-border-theme hover:border-olive/50 hover:bg-white transition-all group rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-olive" />
                <span className="text-[10px] font-mono uppercase font-bold text-ink-light group-hover:text-ink">Export Data</span>
              </div>
            </button>
            <label className="w-full flex items-center justify-between px-4 py-2.5 bg-page border border-border-theme hover:border-olive/50 hover:bg-white transition-all group rounded-xl shadow-sm cursor-pointer">
              <div className="flex items-center gap-3">
                <Upload className="w-4 h-4 text-olive" />
                <span className="text-[10px] font-mono uppercase font-bold text-ink-light group-hover:text-ink">Import Data</span>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={importData} />
            </label>
            <button 
              onClick={clearAll}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-page border border-border-theme hover:border-crimson/50 hover:bg-crimson/5 transition-all group rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-crimson" />
                <span className="text-[10px] font-mono uppercase font-bold text-ink-light group-hover:text-ink tracking-tighter italic">Erase All Records</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-parchment p-8 rounded-2xl border border-border-theme shadow-inner border-l-8 border-l-olive/20">
        <h3 className="text-[10px] font-mono uppercase text-ink-light tracking-[0.3em] mb-6 font-bold">Keep in mind!</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Fairness', icon: Shield, desc: 'Rules guide us, but fun leads us.' },
            { label: 'Pacing', icon: Zap, desc: 'Keep momentum, simplify the math.' },
            { label: 'Mystery', icon: Ghost, desc: 'Hide the mechanics, reveal the story.' },
            { label: 'Service', icon: Users, desc: 'You are the stage, they are the actors.' },
          ].map(p => (
            <div key={p.label} className="p-4 bg-parchment border border-border-theme rounded-xl flex items-center gap-4 group hover:border-olive/50 hover:-translate-y-1 transition-all shadow-sm">
              <div className="w-8 h-8 flex items-center justify-center bg-page rounded-lg border border-border-theme group-hover:bg-olive group-hover:text-white transition-colors">
                <p.icon className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-ink group-hover:text-olive uppercase tracking-tight">{p.label}</span>
                <span className="text-[9px] text-ink-light italic leading-tight">{p.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
