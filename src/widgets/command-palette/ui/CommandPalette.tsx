import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HEROES_DATA } from '../../../entities/hero/bi/heroes';
import { HeroData } from '../../../entities/hero/bi/types';
import { ActiveTab } from '../../navbar';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import {
  Search,
  Compass,
  Crown,
  BrainCircuit,
  Swords,
  Flame,
  TrendingUp,
  FlaskConical,
  Target,
  Volume2,
  PictureInPicture,
  ArrowRight,
  Command,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectHero: (hero: HeroData) => void;
  onOpenPip: () => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Modules' | 'Heroes' | 'Actions';
  icon: React.ReactNode;
  badge?: string;
  onSelect: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectHero,
  onOpenPip
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          setQuery('');
          setSelectedIndex(0);
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [
      // Modules
      {
        id: 'mod-home',
        title: 'Command Center',
        subtitle: 'Tactical dashboard & Orbital Hero Vault',
        category: 'Modules',
        badge: 'Main',
        icon: <Compass className="w-4 h-4 text-amber-400" />,
        onSelect: () => onNavigateTab('home')
      },
      {
        id: 'mod-heroes',
        title: 'Hero Arsenal',
        subtitle: '124+ heroes, situational builds & ability trees',
        category: 'Modules',
        badge: 'Arsenal',
        icon: <Crown className="w-4 h-4 text-amber-300" />,
        onSelect: () => onNavigateTab('heroes')
      },
      {
        id: 'mod-predictive',
        title: 'Predictive Oracle 5v5',
        subtitle: 'Neural draft counter recommendations & win rates',
        category: 'Modules',
        badge: 'AI Oracle',
        icon: <BrainCircuit className="w-4 h-4 text-purple-400" />,
        onSelect: () => onNavigateTab('predictive')
      },
      {
        id: 'mod-draft',
        title: 'Draft Studio',
        subtitle: 'Live pick/ban counter draft matrix',
        category: 'Modules',
        icon: <Swords className="w-4 h-4 text-red-400" />,
        onSelect: () => onNavigateTab('draft')
      },
      {
        id: 'mod-arena',
        title: '1v1 Matchup Arena',
        subtitle: 'Head-to-head combat and kill threat simulation',
        category: 'Modules',
        icon: <Flame className="w-4 h-4 text-orange-400" />,
        onSelect: () => onNavigateTab('arena')
      },
      {
        id: 'mod-sandbox',
        title: 'Build Sandbox',
        subtitle: 'Item simulator, DPS testing & stat calculator',
        category: 'Modules',
        icon: <FlaskConical className="w-4 h-4 text-cyan-400" />,
        onSelect: () => onNavigateTab('sandbox')
      },
      {
        id: 'mod-counters',
        title: 'Threat Counters',
        subtitle: 'Find direct item & ability counters',
        category: 'Modules',
        icon: <Target className="w-4 h-4 text-red-400" />,
        onSelect: () => onNavigateTab('counters')
      },
      {
        id: 'mod-meta',
        title: 'Meta Tier List',
        subtitle: 'Patch 7.37d high MMR winrate rankings',
        category: 'Modules',
        icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
        onSelect: () => onNavigateTab('meta')
      },
      // Quick Actions
      {
        id: 'act-pip',
        title: 'Open Picture-in-Picture Mini HUD',
        subtitle: 'Always-on-top tactical overlay for real-time play',
        category: 'Actions',
        badge: 'Alt+P',
        icon: <PictureInPicture className="w-4 h-4 text-amber-300" />,
        onSelect: () => onOpenPip()
      },
      {
        id: 'act-sound',
        title: 'Toggle Sound Effects',
        subtitle: 'Dota 2 tactical audio feedback cues',
        category: 'Actions',
        icon: <Volume2 className="w-4 h-4 text-slate-300" />,
        onSelect: () => {
          SoundEngine.toggleSound();
          SoundEngine.playPick();
        }
      }
    ];

    // Filter heroes if query exists or list top signature heroes
    if (query.trim().length > 0) {
      const q = query.toLowerCase().trim();
      const heroMatches = HEROES_DATA.filter(
        h => h.name.toLowerCase().includes(q) || h.aliases.some(a => a.toLowerCase().includes(q))
      ).slice(0, 8);

      heroMatches.forEach(h => {
        list.push({
          id: `hero-${h.id}`,
          title: h.name,
          subtitle: `${h.roles.join(', ')} • ${h.winRate}% Win Rate`,
          category: 'Heroes',
          badge: h.attribute.toUpperCase(),
          icon: (
            <img
              src={h.avatarUrl}
              alt={h.name}
              className="w-5 h-5 rounded-md object-cover border border-amber-500/40"
            />
          ),
          onSelect: () => {
            onSelectHero(h);
            onNavigateTab('heroes');
          }
        });
      });
    }

    return list.filter(item => {
      if (!query.trim()) return true;
      const q = query.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [query, onNavigateTab, onSelectHero, onOpenPip]);

  // Handle arrow keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, items.length));
      SoundEngine.playHover();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + items.length) % Math.max(1, items.length));
      SoundEngine.playHover();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = items[selectedIndex];
      if (selected) {
        SoundEngine.playPick();
        selected.onSelect();
        onClose();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-28 px-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-slate-950/95 border border-white/[0.09] shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[75vh] animate-slideUp text-slate-100"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-slate-900/60">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tactical modules, 124+ heroes, or actions..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400 font-bold">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0"
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching modules, heroes, or commands found.
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    SoundEngine.playPick();
                    item.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-75 select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border border-amber-500/35 text-white shadow-sm'
                      : 'hover:bg-slate-900/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors flex-shrink-0 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/40'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs tracking-tight text-white truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-amber-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-sans">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 border-t border-white/[0.07] bg-slate-900/70 flex items-center justify-between text-[11px] text-slate-500 font-sans">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-slate-800 font-mono text-[9px] text-slate-300">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-slate-800 font-mono text-[9px] text-slate-300">
                ↵
              </kbd>{' '}
              Select
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
            <Command className="w-3 h-3 text-amber-400" />
            <span>AegisForge Tactical Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CommandPalette;
