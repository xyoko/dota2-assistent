/**
 * Gemini AI Tactical Oracle Service
 * Powered by Google AI Studio Gemini API
 * Optimized for the most accessible, cheapest, and fastest Free Tier AI: Gemini Flash-Lite
 */

import { ArgonRouter } from './argonRouter';

export interface GeminiDraftAnalysisPrompt {
  allies: { name: string; role: string }[];
  opponents: { name: string; role: string }[];
  bans?: string[];
  focusRole?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  tier: string;
  cost: string;
  rpm: number;
}

const DEFAULT_API_KEY = '';

export class GeminiService {
  /**
   * Primary Free Model: Google AI Studio Gemini Flash-Lite
   * The most accessible, cheapest ($0.00 free tier), ultra-low latency model
   */
  public static readonly FREE_MODEL_ID = 'gemini-flash-lite-latest';
  public static readonly FREE_MODEL_NAME = 'Gemini Flash-Lite';

  public static getActiveModelInfo(): ModelInfo {
    return {
      id: this.FREE_MODEL_ID,
      name: this.FREE_MODEL_NAME,
      tier: 'Google AI Studio Free Tier',
      cost: '100% Free ($0.00)',
      rpm: 15
    };
  }

  public static getApiKey(): string {
    const key = ArgonRouter.resolveApiKey();
    if (key) return key;
    return DEFAULT_API_KEY;
  }

  public static isKeyConfigured(): boolean {
    return Boolean(this.getApiKey());
  }

  public static getKeyConfigStatus(): { configured: boolean; isCustom: boolean; source: string; maskedKey?: string } {
    const custom = typeof window !== 'undefined' ? window.localStorage.getItem('dota_gemini_api_key') : null;
    const key = this.getApiKey();

    if (custom && custom.trim()) {
      const trimmed = custom.trim();
      const masked = trimmed.length > 8 ? `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}` : '••••••••';
      return { configured: true, isCustom: true, source: 'Custom API Key (Local Storage)', maskedKey: masked };
    }

    if (key && key.trim()) {
      const masked = key.length > 8 ? `${key.slice(0, 4)}••••${key.slice(-4)}` : '••••••••';
      return { configured: true, isCustom: false, source: 'Environment / Workspace Key', maskedKey: masked };
    }

    return { configured: false, isCustom: false, source: 'None (Offline Heuristics Active)' };
  }

  public static setCustomApiKey(key: string): void {
    if (typeof window !== 'undefined') {
      if (key && key.trim()) {
        localStorage.setItem('dota_gemini_api_key', key.trim());
      } else {
        localStorage.removeItem('dota_gemini_api_key');
      }
    }
  }

  /**
   * Calls the Gemini API using the most accessible, cheapest/free-tier model cascade
   */
  public static async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      if (ArgonRouter.getConfig().zeroSetupAvailable) {
        return this.generateZeroSetupResponse(prompt);
      }
      throw new Error('Gemini API Key is not configured. Configure a free Google AI Studio key to use live AI.');
    }

    // Dynamic model routing:
    // For standard AI draft advice and tactical queries: use cheapest and most accessible free tier
    const isExplicitArgon = prompt.includes('[Argon]') || prompt.toLowerCase().startsWith('argon:');
    const models = isExplicitArgon
      ? ['gemini-4-argon', 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite']
      : ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const body: Record<string, any> = {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        };

        if (systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const timeoutSignal = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
          ? AbortSignal.timeout(15000)
          : undefined;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(body),
          signal: timeoutSignal
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
          throw new Error(errMsg);
        }

        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return candidateText.trim();
        }
      } catch (err: any) {
        lastError = err;
        // Continue to fallback model if 404, 503, 429, or quota exceeded
        if (
          err.message?.includes('not found') ||
          err.message?.includes('high demand') ||
          err.message?.includes('503') ||
          err.message?.includes('429') ||
          err.message?.includes('quota') ||
          err.message?.includes('RESOURCE_EXHAUSTED')
        ) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('Failed to generate response from Gemini API.');
  }

  /**
   * Tests API key connectivity using the cheapest free model
   */
  public static async testConnection(): Promise<{ success: boolean; model?: string; error?: string }> {
    try {
      await this.generateText(
        'Verify connection. Reply with only: READY',
        'You are a Dota 2 AI Assistant connectivity verifier.'
      );
      return { success: true, model: this.FREE_MODEL_ID };
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  }

  /**
   * Generates a pro-tier Grandmaster draft breakdown with Gemini Flash-Lite
   * Falls back gracefully to heuristic draft breakdown if API key is not present
   */
  public static async analyzeDraftWithAI(draft: GeminiDraftAnalysisPrompt): Promise<string> {
    const allyList = draft.allies.map(a => `${a.name} (${a.role})`).join(', ') || 'None selected';
    const enemyList = draft.opponents.map(o => `${o.name} (${o.role})`).join(', ') || 'None selected';
    const banList = draft.bans && draft.bans.length > 0 ? draft.bans.join(', ') : 'None';

    const prompt = `
DOTA 2 5v5 ESPORTS TELEMETRY (Patch 7.37d):
Allies: ${allyList}
Opponents: ${enemyList}
Bans: ${banList}
${draft.focusRole ? `Focus Role: ${draft.focusRole}` : ''}

Generate an elite Immortal / TI Coach tactical blueprint. STICK TO STRICT ACTIONABLE BULLETS. NO GENERIC INTRODUCTIONS OR FILLER TEXT ("slop").
Format strictly using:

### ⚔️ Primary Nemesis & Win Probability
- **Enemy Target Priority**: [Primary enemy hero to isolate & exact reason]
- **Tempo Advantage**: [Who dictates the early (0-10m) vs late game (25m+)]
- **Draft Win Condition**: [Exact 1-sentence victory execution protocol]

### 🛡️ Critical Counter-Itemization Blueprint
- **Core Essentials**: [BKB timing, Silver Edge, Nullifier or MKB priorities]
- **Support Utility**: [Force Staff, Lotus Orb, Spirit Vessel or Glimmer Cape requirements]

### ⏱️ Strategic Execution Roadmap
- **0:00 - 10:00 (Laning)**: [Lane matchups & rune/lotus pool control]
- **10:00 - 20:00 (Midgame)**: [Smoke gank trigger & Tormentor (20m) positioning]
- **20:00+ (Objective Siege)**: [Roshan pit control & High-ground breach discipline]
`;

    const systemInstruction = 
      'You are the AegisForge Esports AI Grandmaster, an Immortal / TI coach for Dota 2 Patch 7.37d. You deliver hyper-dense, direct, bulleted esports directives. Never use conversational filler, generic fluff, or speculative disclaimers.';

    try {
      return await this.generateText(prompt, systemInstruction);
    } catch (err: any) {
      // If no API key or network failure, provide deterministic tactical fallback
      if (!this.isKeyConfigured() || err.message?.includes('API Key is not configured')) {
        return this.generateDeterministicDraftAdvice(draft);
      }
      throw err;
    }
  }

  /**
   * Generates hero coaching tips
   */
  public static async getHeroCoachTips(heroName: string, query: string): Promise<string> {
    const prompt = `
Hero: ${heroName}
Question: ${query}

Provide a direct, high-level tactical coaching answer for Dota 2 Patch 7.37d. Include situational item recommendations, ability skill orders, and positioning advice where relevant.
`;

    const systemInstruction = 
      'You are AegisForge AI Coach, an elite Dota 2 mentor. Give direct, actionable tactical advice.';

    return this.generateText(prompt, systemInstruction);
  }

  /**
   * Instant deterministic tactical fallback when API key is not present or offline
   */
  public static generateDeterministicDraftAdvice(draft: GeminiDraftAnalysisPrompt): string {
    const allyCount = draft.allies.length;
    const enemyCount = draft.opponents.length;

    const allyNames = draft.allies.map(a => `${a.name} (${a.role})`).join(', ') || 'Roster in progress';
    const enemyNames = draft.opponents.map(o => `${o.name} (${o.role})`).join(', ') || 'Roster in progress';

    return `### ⚔️ Primary Nemesis & Win Probability
- **Allied Lineup (${allyCount}/5)**: ${allyNames}
- **Opponent Threats (${enemyCount}/5)**: ${enemyNames}
- **Primary Execution Protocol**: Secure vision dominance over enemy jungle camps. Force early tier-1 safe lane tower to unlock enemy tormentor quadrant before minute 16.

### 🛡️ Critical Counter-Itemization Blueprint
- **Black King Bar (BKB)**: First major timing requirement for core heroes against chain-disable rotations.
- **Spirit Vessel**: Essential against high-sustain healing cores and frontline strength tanks.
- **Nullifier & Silver Edge**: Required to strip enemy defensive saves (Ghost Scepter/Eul's/Glimmer) and disable high-impact passives.
- **Lotus Orb / Force Staff**: Immediate support investment to break enemy jump initiations.

### ⏱️ Strategic Execution Roadmap
- **0:00 - 10:00 (Laning Phase)**: Prioritize 3-minute and 6-minute lotus harvests. Mid must contest power runes at 6:00 and 8:00 with support rotation.
- **10:00 - 20:00 (Mid-Game Transitions)**: Farm adjacent to team; do not show alone on enemy map. Take 20-minute Tormentor immediately upon spawn.
- **20:00+ (High-Ground Sieging)**: Secure Aegis of the Immortal before committing to tier-3 tower breach. Maintain buyback reserves before entering enemy base.
`;
  }

  /**
   * Generates Zero-Setup response when running without an API key
   */
  public static generateZeroSetupResponse(prompt: string): string {
    const isHeroCoach = prompt.includes('Hero:') && prompt.includes('Question:');
    if (isHeroCoach) {
      const heroMatch = prompt.match(/Hero:\s*([^\n]+)/i);
      const questionMatch = prompt.match(/Question:\s*([^\n]+)/i);
      const hero = heroMatch ? heroMatch[1].trim() : 'Selected Hero';
      const question = questionMatch ? questionMatch[1].trim() : 'Tactical analysis';

      return `### ⚡ Zero-Setup Tactical Advisor: ${hero}
- **Tactical Inquiry**: "${question}"
- **Immortal Meta Guideline (Patch 7.37d)**: Focus on hero power spikes at level 6 and primary item completion (BKB / Blink / Manta).
- **Positioning Protocol**: Maintain triangle camp control; rotate to active teamfights only when key ultimates are off cooldown.
- **Counter-Itemization**: Prioritize dispel items (BKB/Eul's/Lotus) against chain silences and hexes.
*(Zero-Setup Native Analysis Active • Live cloud streaming available with optional API key)*`;
    }

    return `### ⚔️ Zero-Setup Tactical Advisor (Patch 7.37d)
- **Status**: Native Zero-Setup Telemetry Active
- **Strategic Imperative**: Prioritize 6-minute power rune control and 20-minute Tormentor positioning.
- **Team Fight Protocol**: Identify primary enemy initiator before committing tier-2 and tier-3 high-ground pushes.
- **Itemization Anchor**: Core heroes must finish BKB before committing to Roshan pit breach.
*(Zero-Setup Native Analysis Active • Live cloud streaming available with optional API key)*`;
  }
}
