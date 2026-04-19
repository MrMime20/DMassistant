
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Plus, Trash2, Save, Tag, Clock, Search, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CampaignNote } from '../types';
import { storage } from '../lib/storage';
import { campaignService } from '../services/campaignService';

export default function Notes() {
  const [campaign, setCampaign] = useState(() => campaignService.get());
  const [notes, setNotes] = useState<CampaignNote[]>(() => campaign.notes || []);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [search, setSearch] = useState('');
  const imageUrlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    campaignService.update({ notes });
    window.dispatchEvent(new Event('campaign-updated'));
  }, [notes]);

  useEffect(() => {
    const handleUpdate = () => {
      const updated = campaignService.get();
      setCampaign(updated);
      if (JSON.stringify(updated.notes) !== JSON.stringify(notes)) {
        setNotes(updated.notes || []);
      }
    };
    window.addEventListener('campaign-updated', handleUpdate);
    return () => window.removeEventListener('campaign-updated', handleUpdate);
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = () => {
    const newNote: CampaignNote = {
      id: crypto.randomUUID(),
      title: 'New Session Log',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: []
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (updates: Partial<CampaignNote>) => {
    setNotes(prev => {
      const next = prev.map(n => n.id === activeNoteId ? { ...n, ...updates, updatedAt: Date.now() } : n);
      storage.set('campaign_notes', next);
      return next;
    });
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(notes.find(n => n.id !== id)?.id || null);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-theme pb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-olive flex items-center gap-3">
            <FileText className="text-olive" />
            Campaign Notes
          </h1>
          <p className="text-[10px] font-mono uppercase text-ink-light mt-1 ml-9">
            Record session events and campaign secrets
          </p>
        </div>
        <button 
          onClick={createNote}
          className="bg-olive text-white px-6 py-2 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-olive/90 transition-all shadow-md"
        >
          Draft Entry
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* List Side */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chronicles..."
              className="w-full bg-parchment border border-border-theme rounded-lg pl-10 pr-4 py-2.5 text-xs outline-none focus:border-olive/50 shadow-sm transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar border border-border-theme rounded-lg bg-parchment shadow-sm">
            <div className="divide-y divide-border-theme">
              {filteredNotes.map(n => (
                <button
                  key={n.id}
                  onClick={() => setActiveNoteId(n.id)}
                  className={`w-full text-left p-4 transition-all relative group flex flex-col gap-1 ${
                    activeNoteId === n.id 
                      ? 'bg-olive/5 border-l-4 border-olive' 
                      : 'hover:bg-page'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold tracking-tight ${activeNoteId === n.id ? 'text-olive' : 'text-ink'}`}>{n.title}</span>
                    <span className="text-[9px] font-mono text-ink-light uppercase whitespace-nowrap opacity-70">
                      {new Date(n.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-ink-light italic line-clamp-1 opacity-70 leading-normal">
                    {n.content || 'Draft content...'}
                  </p>
                </button>
              ))}
              {filteredNotes.length === 0 && (
                <div className="p-8 text-center text-ink-light text-[10px] font-mono uppercase opacity-50 italic">
                  No records in the chronicle
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor Side */}
        <div className="lg:col-span-8 bg-parchment border border-border-theme rounded-xl overflow-y-auto custom-scrollbar p-10 shadow-sm flex flex-col">
          <AnimatePresence mode="wait">
            {activeNote ? (
              <motion.div
                key={activeNote.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-6"
              >
                <div className="flex items-center justify-between border-b border-border-theme pb-4">
                  <input
                    type="text"
                    value={activeNote.title ?? ''}
                    onChange={e => updateNote({ title: e.target.value })}
                    className="bg-transparent text-3xl font-serif italic text-ink font-bold outline-none flex-1 focus:text-olive placeholder:opacity-20"
                    placeholder="Title of Chronicled Event..."
                  />
                  <button 
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-2 text-ink-light hover:text-crimson transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                  <textarea
                    value={activeNote.content ?? ''}
                    onChange={e => updateNote({ content: e.target.value })}
                    placeholder="The mist began to thicken as the party approached the ancient gates..."
                    className="flex-1 w-full bg-transparent text-ink-light text-base italic leading-relaxed outline-none resize-none custom-scrollbar placeholder:opacity-20"
                  />

                  {/* Image Attachments */}
                  <div className="mt-8 border-t border-border-theme pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-mono uppercase text-olive font-bold tracking-widest">Visual Evidence & Reference</h4>
                    </div>
                    
                    <div className="flex gap-2 mb-6">
                      <input 
                        ref={imageUrlRef}
                        type="text"
                        placeholder="Paste Reference Image URL here..."
                        className="flex-1 bg-parchment border border-border-theme rounded px-3 py-2 text-[10px] outline-none focus:border-olive/50 font-mono shadow-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const url = e.currentTarget.value;
                            if (url) {
                              updateNote({ images: [...(activeNote.images || []), url] });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          const url = imageUrlRef.current?.value;
                          if (url) {
                            updateNote({ images: [...(activeNote.images || []), url] });
                            if (imageUrlRef.current) imageUrlRef.current.value = '';
                          }
                        }}
                        className="bg-olive text-white p-2 rounded shadow-sm hover:bg-olive/90 transition-colors"
                        title="Add Image"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[8px] text-ink-light opacity-60 mt-[-1rem] mb-6">Paste URL and click the glyph or press Enter</p>

                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar min-h-[140px]">
                      {activeNote.images?.map((img, i) => (
                        <div key={i} className="relative group shrink-0">
                          <img 
                            src={img} 
                            className="h-32 w-auto max-w-[200px] object-contain rounded-lg border border-border-theme shadow-lg bg-white" 
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            onClick={() => updateNote({ images: activeNote.images?.filter((_, idx) => idx !== i) })}
                            className="absolute -top-2 -right-2 bg-crimson text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(!activeNote.images || activeNote.images.length === 0) && (
                        <div className="flex-1 border-2 border-dashed border-border-theme rounded-xl flex flex-col items-center justify-center py-10 bg-black/5 opacity-30">
                          <ImageIcon className="w-6 h-6 mb-2" />
                          <p className="font-mono text-[9px] uppercase tracking-widest">No visual artifacts categorized</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-theme flex items-center justify-between text-[10px] font-mono uppercase text-ink-light opacity-50 italic">
                  <span>Last revised: {new Date(activeNote.updatedAt).toLocaleString()}</span>
                  <span>Session Archive // System Storage</span>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-ink-light space-y-4 opacity-30">
                <FileText className="w-16 h-16" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] italic">Keep track of your notes</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
