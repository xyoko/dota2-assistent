import { getHeroOfficialAnimationUrl, getHeroProxyAnimationUrl, getHeroValveSlug } from '../../../entities/hero/bi/heroVisuals';
import { HeroData } from '../../../entities/hero/bi/types';

const STORAGE_PREFIX = 'aegisforge_anim_';

// In-memory active object URLs to revoke when freeing resources
const activeObjectUrls = new Map<string, string>();
let currentAbortController: AbortController | null = null;

export interface HeroAnimationFetchResult {
  url: string;
  isBlob: boolean;
  slug: string;
}

/**
 * Hero Animation Service
 * Fetches official Valve animated renders using native fetch with stream progress tracking,
 * caches in localStorage & memory, and purges from localStorage when leaving the Home section
 * to remain strictly resource-friendly.
 */
export const HeroAnimationService = {
  /**
   * Fetches official Valve hero WebM animation with native fetch
   */
  async fetchHeroAnimation(
    hero: HeroData,
    onProgress?: (percent: number) => void
  ): Promise<HeroAnimationFetchResult> {
    // 1. Cancel previous pending fetch if any
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    const directUrl = getHeroOfficialAnimationUrl(hero);
    const proxyUrl = getHeroProxyAnimationUrl(hero);
    const slug = getHeroValveSlug(hero);
    const storageKey = `${STORAGE_PREFIX}${slug}`;

    // 2. Check localStorage for cached animation metadata
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && activeObjectUrls.has(slug)) {
        onProgress?.(100);
        return {
          url: activeObjectUrls.get(slug)!,
          isBlob: true,
          slug
        };
      }
    } catch (e) {
      console.warn('[HeroAnimationService] localStorage read error:', e);
    }

    // 3. Try fetching video data as Blob via fetch (trying proxy first for localhost, then direct)
    const targetUrl = import.meta.env.DEV ? proxyUrl : directUrl;

    try {
      onProgress?.(10);
      const response = await fetch(targetUrl, {
        signal: currentAbortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;
      let blob: Blob;

      if (response.body && total > 0) {
        const reader = response.body.getReader();
        const chunks: BlobPart[] = [];

        let isReading = true;
        while (isReading) {
          const { done, value } = await reader.read();
          if (done) {
            isReading = false;
            break;
          }
          if (value) {
            chunks.push(value);
            loaded += value.length;
            const percent = Math.min(99, Math.round((loaded * 100) / total));
            onProgress?.(percent);
          }
        }

        blob = new Blob(chunks, { type: response.headers.get('content-type') || 'video/webm' });
      } else {
        blob = await response.blob();
      }

      const objectUrl = URL.createObjectURL(blob);

      // Clean up previous blob URL for this slug if any
      if (activeObjectUrls.has(slug)) {
        URL.revokeObjectURL(activeObjectUrls.get(slug)!);
      }
      activeObjectUrls.set(slug, objectUrl);

      // Store in localStorage as requested
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          slug,
          heroId: hero.id,
          heroName: hero.name,
          timestamp: Date.now(),
          size: blob.size,
          type: blob.type
        }));
      } catch (quotaError) {
        console.warn('[HeroAnimationService] localStorage quota exceeded; keeping in memory:', quotaError);
      }

      onProgress?.(100);
      return {
        url: objectUrl,
        isBlob: true,
        slug
      };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      console.warn('[HeroAnimationService] Fetch blob fallback to direct URL:', err);

      // Fallback: Return direct Valve CDN URL for native video element streaming
      onProgress?.(100);
      return {
        url: directUrl,
        isBlob: false,
        slug
      };
    }
  },

  /**
   * Resource Friendly Cleanup:
   * Clears all hero animation data from localStorage and revokes all blob ObjectURLs
   * when navigating away from the Home section.
   */
  clearHeroAnimationStorage(): void {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }

    // Revoke all active blob URLs to free browser GPU & RAM buffers
    activeObjectUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('[HeroAnimationService] Error revoking blob URL:', e);
      }
    });
    activeObjectUrls.clear();

    // Remove all cached animation keys from localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('[HeroAnimationService] Error clearing localStorage:', e);
    }
  }
};
