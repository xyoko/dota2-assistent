import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { PositionNumber, HeroPositionSelection } from '../../../entities/hero/bi/types';
import { getHeroPositions, POSITION_NAMES, DEFAULT_POSITION } from '../../../entities/hero/bi/heroPositions';

export interface HeroPositionSelectorProps {
  heroId: string;
  selectedPosition: HeroPositionSelection;
  onChange: (position: HeroPositionSelection) => void;
  className?: string;
}

export const HeroPositionSelector: React.FC<HeroPositionSelectorProps> = ({
  heroId,
  selectedPosition,
  onChange,
  className = '',
}) => {
  const positions = getHeroPositions(heroId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === DEFAULT_POSITION) {
      onChange(DEFAULT_POSITION);
    } else {
      const num = Number(val) as PositionNumber;
      if (!isNaN(num) && (num >= 1 && num <= 5)) {
        onChange(num);
      } else {
        onChange(DEFAULT_POSITION);
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center min-w-[170px] ${className}`}>
      <select
        value={selectedPosition}
        onChange={handleChange}
        aria-label="Select hero position"
        className="appearance-none w-full min-h-[44px] pl-3 pr-8 py-2 bg-hud-surface text-hud-cyan font-mono text-xs tracking-wider border border-white/[0.14] rounded-lg focus-hud transition-colors cursor-pointer hover:border-hud-cyan/50 hover:bg-hud-panel"
      >
        <option value={DEFAULT_POSITION} className="bg-hud-bg text-hud-text">
          Default (Generic)
        </option>
        {positions.map((pos) => (
          <option key={pos} value={pos} className="bg-hud-bg text-hud-text">
            Pos {pos} ({POSITION_NAMES[pos]})
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-hud-muted pointer-events-none stroke-[1.5]"
        aria-hidden="true"
      />
    </div>
  );
};
