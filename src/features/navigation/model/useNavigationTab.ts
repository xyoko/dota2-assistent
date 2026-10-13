import { useState, useCallback, useEffect } from 'react';
import { ActiveTab } from '../../../widgets/navbar';

const VALID_TABS: ActiveTab[] = [
  'home',
  'heroes',
  'predictive',
  'draft',
  'arena',
  'sandbox',
  'interactions',
  'counters',
  'meta',
  'patches',
  'notes'
];

function getInitialTab(): ActiveTab {
  try {
    const hash = window.location.hash.replace('#', '') as ActiveTab;
    if (VALID_TABS.includes(hash)) {
      return hash;
    }
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ActiveTab;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      return tabParam;
    }
  } catch {}
  return 'home';
}

/**
 * Hook for managing active app navigation tab with hash and history synchronization
 */
export function useNavigationTab() {
  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialTab);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTabState(tab);
    try {
      window.location.hash = tab;
    } catch {}
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ActiveTab;
      if (VALID_TABS.includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return { activeTab, setActiveTab };
}
