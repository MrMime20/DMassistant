import { useState, useEffect } from 'react';
import { 
  BarChart3, Sword, Users, Map as MapIcon, 
  FileText, Book, Dice6, ChevronRight, 
  Settings, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import CombatTracker from './components/CombatTracker';
import Library from './components/Library';
import NPCDirectory from './components/NPCDirectory';
import Notes from './components/Notes';
import MapTool from './components/MapTool';
import DiceRoller from './components/DiceRoller';
import CampaignSettings from './components/CampaignSettings';
import MusicLibrary from './components/MusicLibrary';
import { Music, Sun, Moon } from 'lucide-react';
import { campaignService, CampaignData } from './services/campaignService';

type View = 'dashboard' | 'combat' | 'library' | 'npcs' | 'notes' | 'map' | 'music' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isDiceVisible, setIsDiceVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [campaign, setCampaign] = useState<CampaignData>(() => campaignService.get());

  const toggleTheme = () => {
    const newTheme = campaign.theme === 'dark' ? 'light' : 'dark';
    const updated = campaignService.update({ theme: newTheme });
    setCampaign(updated);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (campaign.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [campaign.theme]);

  useEffect(() => {
    const handleUpdate = () => {
      setCampaign(campaignService.get());
    };
    window.addEventListener('campaign-updated', handleUpdate);
    return () => window.removeEventListener('campaign-updated', handleUpdate);
  }, []);

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: BarChart3, color: 'text-olive' },
    { id: 'combat' as View, label: 'Encounter', icon: Sword, color: 'text-crimson' },
    { id: 'library' as View, label: 'Archive', icon: Book, color: 'text-olive' },
    { id: 'npcs' as View, label: 'Directory', icon: Users, color: 'text-olive' },
    { id: 'notes' as View, label: 'Notes', icon: FileText, color: 'text-olive' },
    { id: 'map' as View, label: 'Map', icon: MapIcon, color: 'text-olive' },
    { id: 'music' as View, label: 'Music', icon: Music, color: 'text-olive' },
  ];

  return (
    <div className={`flex h-screen bg-page text-ink font-sans selection:bg-olive/20 ${campaign.theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar Navigation */}
      <aside 
        className={`bg-parchment border-r border-border-theme transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-olive rounded flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-90 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <Sword className="w-5 h-5 text-parchment" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-serif italic text-xl font-bold tracking-tight text-olive truncate">DM Assistant</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <span className={`px-3 mb-2 block text-[10px] uppercase font-bold tracking-widest text-ink-light ${sidebarCollapsed ? 'text-center' : ''}`}>
            Campaign
          </span>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                activeView === item.id 
                  ? 'bg-olive text-white shadow-md' 
                  : 'text-ink-light hover:text-ink hover:bg-page/50'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activeView === item.id ? 'text-white' : item.color}`} />
              {!sidebarCollapsed && (
                <span className={`text-xs font-medium transition-colors ${activeView === item.id ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border-theme space-y-2">
          <button 
            onClick={() => setIsDiceVisible(!isDiceVisible)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isDiceVisible ? 'bg-crimson/10 text-crimson' : 'text-ink-light hover:text-crimson'
            }`}
          >
            <Dice6 className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-xs font-mono uppercase">Quick Roller</span>}
          </button>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-light hover:text-olive transition-all"
          >
            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            {!sidebarCollapsed && <span className="text-xs font-mono uppercase">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-grid-pattern overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border-theme bg-parchment flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-1.5 rounded-full bg-crimson animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-light truncate max-w-[200px]">Session Active // {campaign?.name || 'Untitled'}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-ink-light uppercase bg-page px-4 py-1.5 rounded-full border border-border-theme">
              <span className="truncate max-w-[150px]">Goal: <span className="text-olive font-bold">{campaign?.nextSession || 'None'}</span></span>
              <span className="w-1 h-1 rounded-full bg-border-theme" />
              <span>Party Members: <span className="text-crimson font-bold">{campaign?.party?.length || 0}</span></span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-ink-light hover:text-olive hover:bg-page transition-all border border-border-theme bg-parchment"
                title="Toggle Dark Mode"
              >
                {campaign?.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setActiveView('settings')}
                className={`p-2 rounded-full transition-all ${activeView === 'settings' ? 'bg-olive text-white shadow-sm' : 'text-ink-light hover:text-olive hover:bg-page bg-parchment border border-border-theme'}`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              {activeView === 'dashboard' && <Dashboard />}
              {activeView === 'combat' && <CombatTracker />}
              {activeView === 'library' && <Library />}
              {activeView === 'npcs' && <NPCDirectory />}
              {activeView === 'notes' && <Notes />}
              {activeView === 'map' && <MapTool />}
              {activeView === 'music' && <MusicLibrary />}
              {activeView === 'settings' && <CampaignSettings />}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {isDiceVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                className="absolute bottom-8 right-8 z-50 w-72"
              >
                <DiceRoller />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(61, 53, 47, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(61, 53, 47, 0.4);
        }
        .bg-grid-pattern {
          background-image: radial-gradient(#D8D2C5 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
}
