// Picture-in-Picture Manager for Document Picture-in-Picture API
export class PipManager {
  private static pipWindow: Window | null = null;
  private static onPipCloseCallback: (() => void) | null = null;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  }

  public static async openDocumentPip(
    containerElement: HTMLElement,
    onClose?: () => void
  ): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      // Close existing if open
      if (this.pipWindow) {
        this.pipWindow.close();
      }

      this.onPipCloseCallback = onClose || null;

      // Request window
      const pip = await (window as any).documentPictureInPicture.requestWindow({
        width: 360,
        height: 520,
        disallowReturnToOpener: false
      });

      this.pipWindow = pip;

      // Copy all active document stylesheets & fonts into PiP window
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pip.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media.mediaText || 'all';
          if (styleSheet.href) link.href = styleSheet.href;
          pip.document.head.appendChild(link);
        }
      });

      // Link fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@400;600;700&display=swap';
      pip.document.head.appendChild(fontLink);

      // Title & Body
      pip.document.title = 'AegisForge PiP Overlay';
      pip.document.body.className = 'bg-[#0a0d14] text-slate-100 m-0 p-0 overflow-hidden select-none';

      // Move or append container
      pip.document.body.appendChild(containerElement);

      // Listen for Alt+P shortcut inside PiP window to close
      pip.document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.altKey && (e.key === 'p' || e.key === 'P' || e.code === 'KeyP')) {
          e.preventDefault();
          this.closeDocumentPip();
        }
      });

      pip.addEventListener('pagehide', () => {
        this.pipWindow = null;
        if (this.onPipCloseCallback) {
          this.onPipCloseCallback();
        }
      });

      return true;
    } catch (err) {
      console.warn('Document PiP request failed:', err);
      return false;
    }
  }

  public static closeDocumentPip() {
    if (this.pipWindow) {
      this.pipWindow.close();
      this.pipWindow = null;
    }
  }
}
