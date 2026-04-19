
import { useState, useEffect } from 'react';
import { Search, Book, Wand2, ShieldOff, Info, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dndApi } from '../services/dndApi';
import { Spell, Monster } from '../types';

export default function Library() {
  const [activeTab, setActiveTab] = useState<'spells' | 'monsters' | 'rules'>('spells');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (activeTab === 'spells') {
          const data = await dndApi.getSpells(search);
          setResults(data);
        } else if (activeTab === 'monsters') {
          const data = await dndApi.getMonsters(search);
          setResults(data);
        } else if (activeTab === 'rules') {
          const data = await dndApi.getRuleSections();
          setResults(data.results.filter((r: any) => r.name.toLowerCase().includes(search.toLowerCase())));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  const fetchDetails = async (index: string) => {
    setLoading(true);
    try {
      if (activeTab === 'spells') {
        const details = await dndApi.getSpellDetails(index);
        setSelectedItem({ type: 'spell', ...details });
      } else if (activeTab === 'monsters') {
        const details = await dndApi.getMonsterDetails(index);
        setSelectedItem({ type: 'monster', ...details });
      } else if (activeTab === 'rules') {
        const details = await dndApi.getRuleSectionDetails(index);
        setSelectedItem({ type: 'rule', ...details });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-olive flex items-center gap-3">
            <Book className="text-olive" />
            Arcane Archive
          </h1>
          <p className="text-[10px] font-mono uppercase text-ink-light mt-1 ml-9">
            Search spells, monsters, and game rules
          </p>
        </div>

        <div className="flex bg-page p-1 rounded-lg border border-border-theme">
          {(['spells', 'monsters', 'rules'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearch(''); setSelectedItem(null); }}
              className={`px-4 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-olive text-white shadow-sm' 
                  : 'text-ink-light hover:text-ink hover:bg-white/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Search & List */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-parchment border border-border-theme rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-olive/50 transition-colors shadow-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar border border-border-theme rounded-lg bg-parchment shadow-sm">
            {loading && !selectedItem && (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-olive" />
              </div>
            )}
            <div className="divide-y divide-border-theme">
              {results.map(item => (
                <button
                  key={item.index}
                  onClick={() => fetchDetails(item.index)}
                  className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between group ${
                    selectedItem?.index === item.index ? 'bg-olive/5 border-l-4 border-olive' : 'hover:bg-page'
                  }`}
                >
                  <span className={`text-sm tracking-tight font-medium ${selectedItem?.index === item.index ? 'text-olive' : 'text-ink-light group-hover:text-ink'}`}>{item.name}</span>
                  <ArrowUpRight className={`w-3.5 h-3.5 transition-colors ${selectedItem?.index === item.index ? 'text-olive' : 'text-border-theme group-hover:text-olive'}`} />
                </button>
              ))}
              {!loading && results.length === 0 && (
                <div className="p-8 text-center text-ink-light text-[10px] font-mono uppercase opacity-50 italic">
                  No records found in the archive
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details View */}
        <div className="lg:col-span-8 bg-parchment border border-border-theme rounded-xl overflow-y-auto custom-scrollbar p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {!selectedItem ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-ink-light space-y-4 opacity-30"
              >
                <Info className="w-12 h-12" />
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] italic">Consult the archives for wisdom</p>
              </motion.div>
            ) : selectedItem.type === 'spell' ? (
              <SpellDetails spell={selectedItem} />
            ) : selectedItem.type === 'monster' ? (
              <MonsterDetails monster={selectedItem} />
            ) : (
              <RuleDetails rule={selectedItem} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SpellDetails({ spell }: { spell: any }) {
  if (!spell) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="border-b border-border-theme pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="w-4 h-4 text-olive" />
          <span className="text-[10px] font-mono uppercase text-olive font-bold tracking-tighter">Level {spell.level ?? 0} {spell.school?.name ?? 'Unknown School'}</span>
        </div>
        <h2 className="text-4xl font-serif italic text-ink font-bold">{spell.name ?? 'Unknown Spell'}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Casting Time', value: spell.casting_time ?? 'N/A' },
          { label: 'Range', value: spell.range ?? 'N/A' },
          { label: 'Components', value: Array.isArray(spell.components) ? spell.components.join(', ') : 'None' },
          { label: 'Duration', value: spell.duration ?? 'N/A' },
        ].map(meta => (
          <div key={meta.label} className="bg-page p-3 rounded-lg border border-border-theme shadow-sm">
            <span className="block text-[10px] font-mono uppercase text-ink-light mb-1 font-bold">{meta.label}</span>
            <span className="text-xs text-ink italic">{meta.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {Array.isArray(spell.desc) ? spell.desc.map((d: string, i: number) => (
          <p key={i} className="text-sm text-ink-light leading-relaxed italic">{d}</p>
        )) : <p className="text-sm text-ink-light italic">No description available.</p>}
      </div>

      {Array.isArray(spell.higher_level) && spell.higher_level.length > 0 && (
        <div className="p-5 bg-olive/5 border border-olive/20 rounded-xl">
          <h4 className="text-[10px] font-mono uppercase text-olive font-bold mb-2 tracking-widest">At Higher Levels</h4>
          <p className="text-xs text-ink-light italic leading-relaxed">{spell.higher_level.join(' ')}</p>
        </div>
      )}
    </motion.div>
  );
}

function MonsterDetails({ monster }: { monster: any }) {
  const getStatMod = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod;
  };

  const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];
  const safeObject = (obj: any) => (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {};

  if (!monster) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="border-b border-crimson/20 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldOff className="w-4 h-4 text-crimson" />
          <span className="text-[10px] font-mono uppercase text-crimson font-bold tracking-tighter">
            CR {monster.challenge_rating ?? '?'} ({monster.xp ?? 0} XP) • {monster.size ?? ''} {monster.type ?? ''} {monster.subtype && `(${monster.subtype})`}
          </span>
        </div>
        <div className="flex justify-between items-end">
          <h2 className="text-4xl font-serif italic text-ink font-bold">{monster.name}</h2>
          <span className="text-[10px] font-mono text-ink-light uppercase pb-1">{monster.alignment ?? 'Unspecified'}</span>
        </div>
      </div>

      {/* Stats Table */}
      <div className="grid grid-cols-6 gap-2">
        {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((stat) => {
          const val = monster[stat] ?? 10;
          return (
            <div key={stat} className="bg-page p-2 rounded-lg text-center border border-border-theme shadow-sm">
              <span className="block text-[10px] font-mono text-ink-light font-bold mb-1 uppercase">{stat.substring(0, 3)}</span>
              <span className="text-lg font-serif font-bold text-ink">{val}</span>
              <span className={`block text-[10px] font-bold ${val >= 10 ? 'text-olive' : 'text-crimson'}`}>{getStatMod(val)}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-page p-3 rounded-lg border border-border-theme shadow-sm border-t-2 border-t-olive">
          <span className="block text-[10px] font-mono uppercase text-ink-light mb-1 font-bold">Armor Class</span>
          <span className="text-xs text-ink-light italic font-medium">
            {typeof monster.armor_class === 'number' 
              ? `${monster.armor_class}`
              : safeArray(monster.armor_class).map((ac: any) => {
                  if (typeof ac === 'number') return ac;
                  return `${ac.value ?? '?'} (${ac.type ?? 'natural'})`;
                }).join(', ') || 'None reported'
            }
          </span>
        </div>
        <div className="bg-page p-3 rounded-lg border border-border-theme shadow-sm border-t-2 border-t-crimson">
          <span className="block text-[10px] font-mono uppercase text-ink-light mb-1 font-bold">Hit Points</span>
          <span className="text-sm text-ink-light italic font-medium">{monster.hit_points ?? 0} ({monster.hit_dice ?? 'N/A'})</span>
        </div>
        <div className="bg-page p-3 rounded-lg border border-border-theme shadow-sm border-t-2 border-t-olive text-xs">
          <span className="block text-[10px] font-mono uppercase text-ink-light mb-1 font-bold">Speed</span>
          <span className="text-ink-light italic font-medium">
            {Object.entries(safeObject(monster.speed)).map(([k,v]) => `${k}: ${v}`).join(', ') || 'None'}
          </span>
        </div>
      </div>

      {/* Defensive/Utility Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
        <div className="space-y-4">
          <section>
            <h4 className="text-[10px] font-mono uppercase text-ink-light font-bold mb-2 border-b border-border-theme pb-1">Saving Throws</h4>
            <div className="flex flex-wrap gap-2">
              {safeArray(monster.proficiencies).filter((p: any) => p.proficiency?.name?.startsWith('Saving Throw:')).map((p: any) => (
                <span key={p.proficiency.name} className="px-2 py-0.5 bg-page rounded border border-border-theme text-ink-light">
                  {p.proficiency.name.replace('Saving Throw: ', '')} +{p.value}
                </span>
              ))}
              {safeArray(monster.proficiencies).filter((p: any) => p.proficiency?.name?.startsWith('Saving Throw:')).length === 0 && <span className="opacity-40 italic">None reported</span>}
            </div>
          </section>
          
          <section>
            <h4 className="text-[10px] font-mono uppercase text-ink-light font-bold mb-2 border-b border-border-theme pb-1">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {safeArray(monster.proficiencies).filter((p: any) => p.proficiency?.name?.startsWith('Skill:')).map((p: any) => (
                <span key={p.proficiency.name} className="px-2 py-0.5 bg-olive/5 rounded border border-olive/10 text-olive">
                  {p.proficiency.name.replace('Skill: ', '')} +{p.value}
                </span>
              ))}
              {safeArray(monster.proficiencies).filter((p: any) => p.proficiency?.name?.startsWith('Skill:')).length === 0 && <span className="opacity-40 italic">None reported</span>}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-mono uppercase text-ink-light font-bold mb-2 border-b border-border-theme pb-1">Senses & Languages</h4>
            <p className="text-ink-light italic">
              <span className="font-bold">Senses:</span> {Object.entries(safeObject(monster.senses)).map(([k,v]) => `${k.replace('_', ' ')} ${v}`).join(', ') || 'Normal'}
            </p>
            <p className="text-ink-light italic">
              <span className="font-bold">Languages:</span> {monster.languages || 'None'}
            </p>
          </section>
        </div>

        <div className="space-y-4">
          <section>
            <h4 className="text-[10px] font-mono uppercase text-crimson font-bold mb-2 border-b border-crimson/10 pb-1">Resistances & Immunities</h4>
            {safeArray(monster.damage_vulnerabilities).length > 0 && <p className="mb-1"><span className="text-crimson font-bold">Vulnerable:</span> {monster.damage_vulnerabilities.join(', ')}</p>}
            {safeArray(monster.damage_resistances).length > 0 && <p className="mb-1"><span className="text-olive font-bold">Resistant:</span> {monster.damage_resistances.join(', ')}</p>}
            {safeArray(monster.damage_immunities).length > 0 && <p className="mb-1"><span className="text-olive font-bold">Immune:</span> {monster.damage_immunities.join(', ')}</p>}
            {safeArray(monster.condition_immunities).length > 0 && <p><span className="text-olive font-bold">Condition Immune:</span> {monster.condition_immunities.map((c: any) => c.name).join(', ')}</p>}
            {[...safeArray(monster.damage_vulnerabilities), ...safeArray(monster.damage_resistances), ...safeArray(monster.damage_immunities), ...safeArray(monster.condition_immunities)].length === 0 && <span className="opacity-40 italic">None reported</span>}
          </section>
        </div>
      </div>

      <div className="space-y-6">
        {safeArray(monster.special_abilities).length > 0 && (
          <section>
            <h3 className="text-[10px] font-mono uppercase text-ink-light font-bold mb-3 border-b border-border-theme pb-2 tracking-widest">Traits</h3>
            <div className="space-y-4">
              {safeArray(monster.special_abilities).map((a: any, i: number) => (
                <div key={`${a.name}-${i}`} className="text-sm text-ink-light leading-relaxed">
                  <span className="font-bold text-ink underline decoration-olive/30 underline-offset-4">{a.name}.</span> <span className="italic">{a.desc}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-[10px] font-mono uppercase text-ink-light font-bold mb-3 border-b border-border-theme pb-2 tracking-widest">Actions</h3>
          <div className="space-y-4">
            {safeArray(monster.actions).map((a: any, i: number) => (
              <div key={`${a.name}-${i}`} className="text-sm text-ink-light leading-relaxed">
                <span className="font-bold text-ink underline decoration-crimson/30 underline-offset-4">{a.name}.</span> <span className="italic">{a.desc}</span>
              </div>
            ))}
            {safeArray(monster.actions).length === 0 && <p className="text-xs italic opacity-40">No specific actions listed</p>}
          </div>
        </section>

        {safeArray(monster.reactions).length > 0 && (
          <section>
            <h3 className="text-[10px] font-mono uppercase text-olive font-bold mb-3 border-b border-olive/10 pb-2 tracking-widest">Reactions</h3>
            <div className="space-y-4">
              {safeArray(monster.reactions).map((a: any, i: number) => (
                <div key={`${a.name}-${i}`} className="text-sm text-ink-light leading-relaxed">
                  <span className="font-bold text-ink underline decoration-olive/30 underline-offset-4">{a.name}.</span> <span className="italic">{a.desc}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {safeArray(monster.legendary_actions).length > 0 && (
          <section>
            <h3 className="text-[10px] font-mono uppercase text-crimson font-bold mb-3 border-b border-crimson/10 pb-2 tracking-widest">Legendary Actions</h3>
            <div className="space-y-4">
              {safeArray(monster.legendary_actions).map((a: any, i: number) => (
                <div key={`${a.name}-${i}`} className="text-sm text-ink-light leading-relaxed">
                  <span className="font-bold text-ink underline decoration-crimson/30 underline-offset-4">{a.name}.</span> <span className="italic">{a.desc}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

function RuleDetails({ rule }: { rule: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="border-b border-border-theme pb-4">
        <span className="text-[10px] font-mono uppercase text-ink-light font-bold tracking-widest">Ancient Wisdom</span>
        <h2 className="text-4xl font-serif italic text-ink font-bold">{rule.name}</h2>
      </div>

      <div className="prose prose-sm max-w-none text-ink-light italic leading-relaxed">
        <p className="whitespace-pre-wrap">{rule.desc}</p>
      </div>
    </motion.div>
  );
}
