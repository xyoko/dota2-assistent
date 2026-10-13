import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HeroData } from '../bi/types';
import { HeroCard } from './HeroCard';

interface VirtualizedHeroGridProps {
  heroes: HeroData[];
  favoritesSet: Set<string>;
  onToggleFavorite: (heroId: string) => void;
  onSelectHero: (hero: HeroData) => void;
  onOpenPip?: (hero: HeroData) => void;
}

const GAP = 16; // 16px gap (gap-4)
const OVERSCAN_ROWS = 2; // Buffer rows rendered above and below viewport

/**
 * Responsive column count calculator matching Tailwind breakpoints:
 * mobile: 1-2 | sm: 2 | md: 3 | lg/xl: 4 | 2xl: 5
 */
function getResponsiveColumns(width: number): number {
  if (width >= 1536) return 5;
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  if (width >= 540) return 2;
  return 1;
}

export const VirtualizedHeroGrid: React.FC<VirtualizedHeroGridProps> = React.memo(({
  heroes,
  favoritesSet,
  onToggleFavorite,
  onSelectHero,
  onOpenPip
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(() => (typeof window !== 'undefined' ? window.innerHeight : 900));

  // Measure container width responsively with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Window scroll & resize listeners throttled via RAF
  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setScrollTop(window.scrollY);
      });
    };

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Initial sync
    setScrollTop(window.scrollY);
    setViewportHeight(window.innerHeight);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const columnCount = useMemo(() => getResponsiveColumns(containerWidth), [containerWidth]);

  // Compute row dimensions: 16:10 aspect ratio
  const { cardHeight, rowHeight } = useMemo(() => {
    const totalGaps = (columnCount - 1) * GAP;
    const cardWidth = Math.max(160, (containerWidth - totalGaps) / columnCount);
    const height = cardWidth * (10 / 16);
    return {
      cardHeight: height,
      rowHeight: height + GAP
    };
  }, [containerWidth, columnCount]);

  // Group heroes into grid rows
  const rows = useMemo(() => {
    const result: HeroData[][] = [];
    for (let i = 0; i < heroes.length; i += columnCount) {
      result.push(heroes.slice(i, i + columnCount));
    }
    return result;
  }, [heroes, columnCount]);

  const totalRows = rows.length;

  // Calculate visible row slice
  const { startRow, endRow, paddingTop, paddingBottom } = useMemo(() => {
    if (totalRows === 0 || !containerRef.current) {
      return { startRow: 0, endRow: totalRows, paddingTop: 0, paddingBottom: 0 };
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerTop = containerRect.top + window.scrollY;

    // Relative scroll offset within the hero grid
    const relativeScroll = Math.max(0, scrollTop - containerTop);

    const calculatedStart = Math.max(0, Math.floor(relativeScroll / rowHeight) - OVERSCAN_ROWS);
    const calculatedEnd = Math.min(
      totalRows,
      Math.ceil((relativeScroll + viewportHeight) / rowHeight) + OVERSCAN_ROWS
    );

    const padTop = calculatedStart * rowHeight;
    const padBottom = Math.max(0, (totalRows - calculatedEnd) * rowHeight);

    return {
      startRow: calculatedStart,
      endRow: calculatedEnd,
      paddingTop: padTop,
      paddingBottom: padBottom
    };
  }, [totalRows, scrollTop, rowHeight, viewportHeight]);

  const visibleRows = useMemo(() => {
    return rows.slice(startRow, endRow);
  }, [rows, startRow, endRow]);

  const gridColsClass = useMemo(() => {
    switch (columnCount) {
      case 5:
        return 'grid-cols-5';
      case 4:
        return 'grid-cols-4';
      case 3:
        return 'grid-cols-3';
      case 2:
        return 'grid-cols-2';
      default:
        return 'grid-cols-1';
    }
  }, [columnCount]);

  return (
    <div
      ref={containerRef}
      style={{
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        contain: 'layout'
      }}
      className="w-full flex flex-col gap-4"
    >
      {visibleRows.map((row, rowIndex) => {
        const absoluteRowIndex = startRow + rowIndex;
        return (
          <div
            key={`row-${absoluteRowIndex}`}
            style={{ height: `${cardHeight}px` }}
            className={`grid ${gridColsClass} gap-4 w-full`}
          >
            {row.map((hero, colIndex) => {
              const globalIndex = absoluteRowIndex * columnCount + colIndex;
              return (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  priority={globalIndex < 10}
                  isFavorite={favoritesSet.has(hero.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectHero={onSelectHero}
                  onOpenPip={onOpenPip}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
});
