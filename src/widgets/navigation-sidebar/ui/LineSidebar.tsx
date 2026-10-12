'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import './LineSidebar.css';

export type FalloffCurve = 'linear' | 'smooth' | 'sharp';

const FALLOFF_CURVES: Record<FalloffCurve, (p: number) => number> = {
  linear: (p: number) => p,
  smooth: (p: number) => p * p * (3 - 2 * p),
  sharp: (p: number) => p * p * p
};

export interface LineSidebarItem {
  label: string;
  id?: string;
  icon?: React.ReactNode;
  badge?: string;
  description?: string;
}

export interface LineSidebarProps {
  items: Array<LineSidebarItem | string>;
  accentColor?: string;
  textColor?: string;
  markerColor?: string;
  showIndex?: boolean;
  proximityRadius?: number;
  maxShift?: number;
  falloff?: FalloffCurve;
  markerLength?: number;
  markerGap?: number;
  itemGap?: number;
  fontSize?: number;
  smoothing?: number;
  defaultActive?: number | null;
  activeIndex?: number | null;
  isHovered?: boolean;
  onItemClick?: (index: number, label: string) => void;
  className?: string;
}

export const LineSidebar: React.FC<LineSidebarProps> = ({
  items,
  accentColor = '#C084FC',
  textColor = '#94a3b8',
  markerColor = '#64748b',
  showIndex = true,
  proximityRadius = 85,
  maxShift = 24,
  falloff = 'smooth',
  markerLength = 36,
  markerGap = 8,
  itemGap = 16,
  fontSize = 0.95,
  smoothing = 90,
  defaultActive = null,
  activeIndex: controlledActiveIndex,
  isHovered = false,
  onItemClick,
  className = ''
}) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const targetsRef = useRef<number[]>([]);
  const currentRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const [internalActiveIndex, setInternalActiveIndex] = useState<number | null>(
    controlledActiveIndex !== undefined ? controlledActiveIndex : defaultActive
  );

  const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex;
  const activeRef = useRef<number | null>(activeIndex);
  const smoothingRef = useRef<number>(smoothing);

  activeRef.current = activeIndex;
  smoothingRef.current = smoothing;

  // Frame-rate independent exponential smoothing rAF loop
  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const tau = Math.max(smoothingRef.current, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    let moving = false;
    const itemsEl = itemRefs.current;
    for (let i = 0; i < itemsEl.length; i++) {
      const el = itemsEl[i];
      if (!el) continue;
      const target = Math.max(targetsRef.current[i] || 0, activeRef.current === i ? 1 : 0);
      const cur = currentRef.current[i] || 0;
      const next = cur + (target - cur) * k;
      const settled = Math.abs(target - next) < 0.0015;
      const value = settled ? target : next;
      currentRef.current[i] = value;
      el.style.setProperty('--effect', value.toFixed(4));
      if (!settled) moving = true;
    }

    rafRef.current = moving ? requestAnimationFrame(runFrame) : null;
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLUListElement>) => {
      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const pointerY = e.clientY - rect.top;
      const ease = FALLOFF_CURVES[falloff] ?? FALLOFF_CURVES.linear;
      const itemsEl = itemRefs.current;
      for (let i = 0; i < itemsEl.length; i++) {
        const el = itemsEl[i];
        if (!el) continue;
        const center = el.offsetTop + el.offsetHeight / 2;
        const distance = Math.abs(pointerY - center);
        targetsRef.current[i] = ease(Math.max(0, 1 - distance / proximityRadius));
      }
      startLoop();
    },
    [falloff, proximityRadius, startLoop]
  );

  const handlePointerLeave = useCallback(() => {
    targetsRef.current = targetsRef.current.map(() => 0);
    startLoop();
  }, [startLoop]);

  const handleClick = useCallback(
    (index: number, label: string) => {
      setInternalActiveIndex(index);
      onItemClick?.(index, label);
    },
    [onItemClick]
  );

  useEffect(() => {
    startLoop();
  }, [activeIndex, isHovered, startLoop]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    },
    []
  );

  return (
    <nav
      className={`line-sidebar ${
        isHovered ? 'line-sidebar--hovered' : 'line-sidebar--resting'
      }${className ? ` ${className}` : ''}`}
      style={{
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--marker-color': markerColor,
        '--marker-length': `${markerLength}px`,
        '--marker-gap': `${markerGap}px`,
        '--max-shift': `${maxShift}px`,
        '--item-gap': `${itemGap}px`,
        '--font-size': `${fontSize}rem`,
        '--smoothing': `${smoothing}ms`
      } as React.CSSProperties}
    >
      <ul
        ref={listRef}
        className="line-sidebar__list"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {items.map((rawItem, index) => {
          const item: LineSidebarItem =
            typeof rawItem === 'string' ? { label: rawItem } : rawItem;
          const isActive = activeIndex === index;

          return (
            <li
              key={`${item.label}-${index}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="line-sidebar__item"
              aria-current={isActive ? 'true' : undefined}
              onClick={() => handleClick(index, item.label)}
              title={item.description || item.label}
            >
              {/* Official Dota Icon replaces the old line */}
              <span className="line-sidebar__dota-icon" aria-hidden="true">
                {item.icon}
              </span>

              {/* Label & Details */}
              <span className="line-sidebar__label">
                {showIndex && (
                  <span className="line-sidebar__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}
                <span className="line-sidebar__text">{item.label}</span>
                {item.badge && (
                  <span className="line-sidebar__badge">{item.badge}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default LineSidebar;
