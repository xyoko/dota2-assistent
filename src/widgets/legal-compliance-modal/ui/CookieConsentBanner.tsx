import React, { useState, useEffect } from 'react';
import { Cookie, Settings, X, Check } from 'lucide-react';
import { Button } from '../../../shared/ui/primitives/button';

interface CookieConsentBannerProps {
  onOpenLegalTab?: (tab: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenLegalTab
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('aegis_cookie_consent');
      if (!consent) {
        // Show after brief delay
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('aegis_cookie_consent', JSON.stringify({
        essential: true,
        analytics: false, // 0 trackers used anyway
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('aegis_cookie_consent', JSON.stringify({
        essential: true,
        analytics: false,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem('aegis_cookie_consent', JSON.stringify({
        essential: true,
        analytics: analyticsEnabled,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      role="region" 
      aria-label="Cookie and Privacy Consent Banner"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-xl z-50 animate-fadeIn"
    >
      <div className="rounded-2xl border border-white/[0.12] p-5 shadow-2xl text-slate-200 bg-hud-surface space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hud-cyan/15 border border-hud-cyan/40 flex items-center justify-center text-hud-cyan">
              <Cookie className="w-4 h-4 text-hud-cyan" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <span>Cookie Consent & Local Data Governance</span>
              </h4>
              <p className="text-[11px] text-slate-400 font-sans">
                GDPR & ePrivacy Directive Compliant — Zero Third-Party Trackers
              </p>
            </div>
          </div>

          <button
            onClick={handleEssentialOnly}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors btn-fade"
            title="Dismiss with Essential Only"
            aria-label="Close cookie consent banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <p className="text-xs text-slate-300/90 leading-relaxed font-sans">
          AegisForge uses strictly essential local browser storage to remember your custom hero drafts, audio toggles, and tactical notes. We do <strong className="text-hud-cyan font-semibold">not</strong> deploy tracking cookies, advertising SDKs, or invasive telemetry scripts.
        </p>

        {showPreferences && (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">Strictly Essential Storage</span>
                <p className="text-[11px] text-slate-400">Required for draft state, favorites, and volume preference.</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-hud-surface border border-hud-cyan/40 text-hud-cyan">
                Always Active
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <div>
                <span className="font-semibold text-slate-200">Third-Party Analytics</span>
                <p className="text-[11px] text-slate-400">Zero trackers present in our audited codebase.</p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-hud-cyan focus:ring-hud-cyan"
                />
                <span className="text-[11px] text-slate-400 font-mono">0 SDKs</span>
              </label>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="text-[11px] text-hud-cyan hover:text-sky-300 underline underline-offset-4 flex items-center gap-1 btn-fade"
            >
              <Settings className="w-3 h-3" />
              <span>{showPreferences ? 'Hide Preferences' : 'Customize Preferences'}</span>
            </button>
            <span className="text-slate-600">•</span>
            {onOpenLegalTab && (
              <button
                onClick={() => onOpenLegalTab('cookies')}
                className="text-[11px] text-slate-400 hover:text-slate-300 underline underline-offset-4 btn-fade"
              >
                Cookie Policy
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleEssentialOnly}
              variant="outline"
              size="sm"
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white btn-fade"
            >
              Essential Only
            </Button>
            
            {showPreferences ? (
              <Button
                onClick={handleSavePreferences}
                variant="gradient"
                size="sm"
                className="text-xs btn-fade"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Save Preferences
              </Button>
            ) : (
              <Button
                onClick={handleAcceptAll}
                variant="gradient"
                size="sm"
                className="text-xs btn-fade"
              >
                Accept All
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
