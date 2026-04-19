
import { useState, useEffect } from 'react';
import { Dice6, RotateCcw, Plus, Trash2, Shield, Heart, Zap, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DiceRoller() {
  const [history, setHistory] = useState<{ roll: string; result: number; timestamp: number }[]>([]);
  const [customDice, setCustomDice] = useState<string>('');
  
  const [isRolling, setIsRolling] = useState(false);
  
  const rollDice = async (count: number, sides: number, modifier: number = 0) => {
    setIsRolling(true);
    // Mimic quick rolling time
    await new Promise(r => setTimeout(r, 600));
    
    let total = 0;
    const rolls = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      total += roll;
      rolls.push(roll);
    }
    const finalResult = total + modifier;
    const rollString = `${count}d${sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`;
    
    setHistory(prev => [{
      roll: rollString,
      result: finalResult,
      timestamp: Date.now()
    }, ...prev].slice(0, 20));

    setIsRolling(false);
    return finalResult;
  };

  const parseAndRoll = (input: string) => {
    const match = input.match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if (match) {
      const count = parseInt(match[1]) || 1;
      const sides = parseInt(match[2]);
      const modifier = match[3] ? parseInt(match[3]) : 0;
      rollDice(count, sides, modifier);
      setCustomDice('');
    }
  };

  return (
    <div className="w-80 bg-parchment border-2 border-border-theme rounded-2xl shadow-2xl p-6 pointer-events-auto flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border-theme pb-4">
        <h3 className="text-sm font-serif italic font-bold text-olive flex items-center gap-2">
          <Dice6 className={`w-4 h-4 text-crimson ${isRolling ? 'animate-spin' : ''}`} />
          Quick Roller
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setHistory([])}
            className="p-1.5 text-ink-light hover:text-olive transition-colors"
            title="Clear Archives"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[4, 6, 8, 10, 12, 20, 100].map(d => (
          <button
            key={d}
            onClick={() => rollDice(1, d)}
            disabled={isRolling}
            className="flex flex-col items-center justify-center p-2.5 bg-parchment border border-border-theme rounded-xl hover:bg-olive hover:text-white transition-all group shadow-sm disabled:opacity-50"
          >
            <Dice6 className={`w-4 h-4 text-ink-light group-hover:text-white mb-1 ${isRolling ? 'animate-bounce' : ''}`} />
            <span className="text-[10px] font-mono font-bold uppercase">d{d}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={customDice}
          onChange={e => setCustomDice(e.target.value)}
          placeholder="2d20 + 5..."
          className="flex-1 bg-page border border-border-theme rounded-lg pl-3 pr-3 py-2 text-xs text-ink outline-none focus:border-olive/50 shadow-inner font-mono italic"
          onKeyDown={e => e.key === 'Enter' && parseAndRoll(customDice)}
          disabled={isRolling}
        />
        <button
          onClick={() => parseAndRoll(customDice)}
          disabled={isRolling || !customDice}
          className="px-4 py-2 bg-olive text-white rounded-lg text-[10px] font-mono uppercase tracking-widest hover:bg-olive/90 transition-all shadow-sm disabled:opacity-50"
        >
          {isRolling ? '...' : 'Roll'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-ink-light opacity-50 font-bold tracking-widest px-1">
          <span>Roll History</span>
          <span>Result</span>
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
          <AnimatePresence initial={false} mode="popLayout">
            {isRolling && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: [0, -2, 2, -2, 2, 0],
                }}
                transition={{ 
                  x: { repeat: Infinity, duration: 0.1 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 }
                }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex items-center justify-center py-4 bg-olive/5 border border-dashed border-olive/30 rounded-lg"
              >
                <div className="flex gap-1">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.2 }}>🎲</motion.div>
                </div>
              </motion.div>
            )}
            {history.map((h, i) => (
              <motion.div
                key={h.timestamp}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-3 py-2 bg-parchment border border-border-theme rounded-lg text-xs shadow-sm"
              >
                <span className="text-ink-light font-mono italic">{h.roll}</span>
                <span className="text-crimson font-serif font-bold text-xl">{h.result}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {history.length === 0 && !isRolling && (
            <p className="text-[10px] text-ink-light italic text-center py-4 border border-dashed border-border-theme rounded-lg opacity-40">Awaiting the roll...</p>
          )}
        </div>
      </div>
    </div>
  );
}
