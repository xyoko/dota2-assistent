import { useState, useCallback, useRef, useEffect } from 'react';
import { HeroData } from '../../../entities/hero/bi/types';
import { HEROES_DATA } from '../../../entities/hero/bi/heroes';
import { PipManager } from '../bi/pipManager';

/**
 * Hook for managing Document Picture-in-Picture & Floating in-app Mini HUD overlay
 */
export function usePipHud(selectedHero: HeroData | null) {
  const [pipHero, setPipHero] = useState<HeroData>(() => HEROES_DATA[0]);
  const [isPipOpen, setIsPipOpen] = useState<boolean>(false);
  const [isNativePipActive, setIsNativePipActive] = useState<boolean>(false);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);

  const selectedHeroRef = useRef(selectedHero);
  useEffect(() => {
    selectedHeroRef.current = selectedHero;
  }, [selectedHero]);

  const handleOpenPip = useCallback(async (targetHero?: HeroData) => {
    const heroToUse = targetHero || selectedHeroRef.current || HEROES_DATA[0];
    setPipHero(heroToUse);

    if (PipManager.isSupported()) {
      const containerDiv = document.createElement('div');
      containerDiv.style.width = '100%';
      containerDiv.style.height = '100%';

      const success = await PipManager.openDocumentPip(containerDiv, () => {
        setIsNativePipActive(false);
        setIsPipOpen(false);
        setPipContainer(null);
      });

      if (success) {
        setPipContainer(containerDiv);
        setIsNativePipActive(true);
        setIsPipOpen(true);
        return;
      }
    }

    // Fallback: Floating overlay inside the main web page
    setIsNativePipActive(false);
    setIsPipOpen(true);
  }, []);

  const handleClosePip = useCallback(() => {
    if (isNativePipActive) {
      PipManager.closeDocumentPip();
    }
    setIsNativePipActive(false);
    setIsPipOpen(false);
    setPipContainer(null);
  }, [isNativePipActive]);

  // Global Keyboard Shortcut: Alt+P (or Option+P) to toggle Picture-in-Picture Mini HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'p' || e.key === 'P' || e.code === 'KeyP')) {
        e.preventDefault();
        if (isPipOpen || isNativePipActive) {
          handleClosePip();
        } else {
          handleOpenPip();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPipOpen, isNativePipActive, handleClosePip, handleOpenPip]);

  return {
    pipHero,
    isPipOpen,
    isNativePipActive,
    pipContainer,
    handleOpenPip,
    handleClosePip
  };
}
