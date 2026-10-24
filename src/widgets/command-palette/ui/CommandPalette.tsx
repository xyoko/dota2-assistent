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
  const containerRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
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

  // Focus input on open, trap focus, restore focus on close & lock background scroll
  useEffect(() => {
    if (isOpen) {
      const previouslyFocusedElement = document.activeElement as HTMLElement | null;
      setTimeout(() => inputRef.current?.focus(), 40);
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && containerRef.current) {
          const focusables = containerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          const focusableArr = Array.from(focusables).filter(el => el.offsetParent !== null);
          if (focusableArr.length === 0) return;
          const first = focusableArr[0];
          const last = focusableArr[focusableArr.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first || !containerRef.current.contains(document.activeElement)) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last || !containerRef.current.contains(document.activeElement)) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };
      window.addEventListener('keydown', handleTab);

      return () => {
        window.removeEventListener('keydown', handleTab);
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        previouslyFocusedElement?.focus();
      };
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
        badge: 'MAIN',
        icon: <Compass className="w-4 h-4 text-hud-cyan" />,
        onSelect: () => onNavigateTab('home')
      },
      {
        id: 'mod-heroes',
        title: 'Hero Arsenal',
        subtitle: '124+ heroes, situational builds & ability trees',
        category: 'Modules',
        badge: 'ARSENAL',
        icon: <Crown className="w-4 h-4 text-hud-gold" />,
        onSelect: () => onNavigateTab('heroes')
      },
      {
        id: 'mod-predictive',
        title: 'Predictive Oracle 5v5',
        subtitle: 'Deterministic draft counter recommendations & win rates',
        category: 'Modules',
        badge: 'DRAFT MATRIX',
        icon: <BrainCircuit className="w-4 h-4 text-hud-cyan" />,
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
        icon: <Flame className="w-4 h-4 text-hud-gold" />,
        onSelect: () => onNavigateTab('arena')
      },
      {
        id: 'mod-sandbox',
        title: 'Build Sandbox',
        subtitle: 'Item simulator, DPS testing & stat calculator',
        category: 'Modules',
        icon: <FlaskConical className="w-4 h-4 text-emerald-400" />,
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
        badge: 'ALT+P',
        icon: <PictureInPicture className="w-4 h-4 text-hud-cyan" />,
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
              loading="lazy"
              decoding="async"
              className="w-5 h-5 rounded-md object-cover border border-white/[0.1]"
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-28 px-4 bg-black/85 animate-fadeIn overscroll-contain"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="w-full max-w-2xl rounded-xl bg-hud-panel border border-white/[0.12] shadow-hud-lg overflow-hidden flex flex-col max-h-[75vh] animate-slideUp text-slate-100 overscroll-contain"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-hud-surface">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tactical modules, 124+ heroes, or actions..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-hud-bg border border-white/[0.08] text-[10px] font-mono text-slate-400 font-bold">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0"
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              NO MATCHING MODULES, HEROES, OR COMMANDS FOUND.
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer transition-colors select-none min-h-[44px] ${
                    isSelected
                      ? 'bg-hud-surface border border-hud-cyan/40 text-slate-100 shadow-hud-sm'
                      : 'hover:bg-white/[0.03] border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-hud-cyan/15 border-hud-cyan/40 text-hud-cyan'
                          : 'bg-hud-surface border-white/[0.08] text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-xs tracking-tight text-slate-100 truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-hud-bg border border-white/[0.08] text-hud-cyan uppercase">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-sans">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline uppercase">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-hud-cyan" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-hud-surface flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-hud-bg border border-white/[0.08] font-mono text-[9px] text-slate-300">
                ↑↓
              </kbd>
              NAVIGATE
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-hud-bg border border-white/[0.08] font-mono text-[9px] text-slate-300">
                ↵
              </kbd>
              SELECT
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
            <Command className="w-3 h-3 text-hud-cyan" />
            <span>SPOTLIGHT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
