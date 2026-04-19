import { useState, useEffect } from 'react';
import { Music, Plus, Trash2, Play, Pause, Youtube, ExternalLink, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MusicTrack } from '../types';
import { storage } from '../lib/storage';
import { campaignService } from '../services/campaignService';

export default function MusicLibrary() {
  const [campaign, setCampaign] = useState(() => campaignService.get());
  const [tracks, setTracks] = useState<MusicTrack[]>(() => campaign.music || []);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  useEffect(() => {
    campaignService.update({ music: tracks });
  }, [tracks]);

  const addTrack = () => {
    if (!newTitle || !newUrl) return;
    
    // Extract video ID for embed
    let videoId = '';
    try {
      const url = new URL(newUrl);
      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      } else {
        videoId = url.searchParams.get('v') || '';
      }
    } catch (e) {
      // Fallback regex
      const match = newUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
      videoId = match ? match[1] : '';
    }

    if (!videoId) {
      console.warn('Invalid YouTube URL');
      return;
    }

    const newTrack: MusicTrack = {
      id: crypto.randomUUID(),
      title: newTitle,
      youtubeUrl: videoId
    };

    setTracks([...tracks, newTrack]);
    setNewTitle('');
    setNewUrl('');
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
    if (activeTrackId === id) setActiveTrackId(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="border-b border-border-theme pb-6">
        <h1 className="text-2xl font-serif italic text-olive flex items-center gap-3">
          <Music className="text-olive" />
          Music for Atmosphere
        </h1>
        <p className="text-[10px] font-mono uppercase text-ink-light mt-1 ml-9 tracking-widest">Atmospheric Soundscapes & War Drums</p>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Track List */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="bg-parchment border border-border-theme rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-[10px] font-mono uppercase font-bold text-ink-light tracking-wider border-b border-border-theme pb-2">Add New Composition</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="text"
                placeholder="Track Title (e.g. Boss Battle)"
                className="bg-page border border-border-theme rounded-lg px-4 py-2 text-xs outline-none focus:border-olive/50 font-serif italic"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="YouTube URL"
                  className="flex-1 bg-page border border-border-theme rounded-lg px-4 py-2 text-xs outline-none focus:border-olive/50 font-mono"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTrack()}
                />
                <button 
                  onClick={addTrack}
                  className="bg-olive text-white px-4 py-2 rounded-lg hover:bg-olive/90 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            <AnimatePresence mode="popLayout">
              {tracks.map(track => (
                <motion.div 
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all shadow-sm ${activeTrackId === track.id ? 'bg-olive text-white border-olive scale-[1.01]' : 'bg-parchment border-border-theme hover:border-olive/30'}`}
                >
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setActiveTrackId(track.id)}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTrackId === track.id ? 'bg-white/20' : 'bg-page text-olive'}`}>
                      {activeTrackId === track.id ? <Volume2 className="animate-pulse" /> : <Play className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold font-serif ${activeTrackId === track.id ? 'text-white' : 'text-ink'}`}>{track.title}</p>
                      <p className={`text-[9px] font-mono uppercase opacity-60 ${activeTrackId === track.id ? 'text-white' : 'text-ink-light'}`}>YouTube Source</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => window.open(`https://youtube.com/watch?v=${track.youtubeUrl}`, '_blank')}
                      className={`p-2 rounded-lg transition-colors ${activeTrackId === track.id ? 'hover:bg-white/20 text-white' : 'text-ink-light hover:text-olive'}`}
                      title="View on YouTube"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeTrack(track.id)}
                      className={`p-2 rounded-lg transition-colors ${activeTrackId === track.id ? 'hover:bg-white/20 text-white' : 'text-ink-light hover:text-crimson'}`}
                      title="Remove Track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {tracks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-30 italic">
                <Music className="w-12 h-12 mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest text-center">The choir is silent.<br/>Add some resonances to begin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Player Window */}
        <div className="lg:w-96 flex flex-col gap-6">
          <div className="bg-ink border border-border-theme rounded-2xl overflow-hidden aspect-video relative shadow-2xl group">
            {activeTrackId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${tracks.find(t => t.id === activeTrackId)?.youtubeUrl}?autoplay=1`}
                title="YouTube music player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-parchment/10 space-y-4">
                <Youtube className="w-24 h-24" />
                <p className="font-mono text-xs uppercase tracking-[0.4em]">No source selected</p>
              </div>
            )}
          </div>

          <div className="bg-parchment border border-border-theme rounded-2xl p-6 shadow-inner flex-1">
            <h4 className="text-[10px] font-mono uppercase font-bold text-ink-light tracking-wider border-b border-border-theme pb-2 mb-4 text-center">Master of Music</h4>
            <div className="space-y-4 text-center">
               <p className="text-xs text-ink-light italic">"A good DM doesn't just describe the shadow, they let the players hear the whispers within it."</p>
               <div className="flex justify-center flex-wrap gap-2 pt-4 border-t border-border-theme">
                  {['Battle', 'Ambience', 'Tavern', 'Dungeon'].map(tag => (
                    <span key={tag} className="text-[8px] font-mono uppercase px-2 py-1 bg-page border border-border-theme rounded text-ink-light">#{tag}</span>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
