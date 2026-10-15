/**
 * Gemini AI Tactical Oracle Service
 * Powered by Google AI Studio Gemini API
 */

import { ArgonRouter } from './argonRouter';

export interface GeminiDraftAnalysisPrompt {
  allies: { name: string; role: string }[];
  opponents: { name: string; role: string }[];
  bans?: string[];
  focusRole?: string;
}

const DEFAULT_API_KEY = '';

export class GeminiService {
  private static getApiKey(): string {
    const key = ArgonRouter.resolveApiKey();
    if (key) return key;
    return DEFAULT_API_KEY;
  }

  public static isKeyConfigured(): boolean {
    return Boolean(this.getApiKey());
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
   * Calls the Gemini API with dynamic model routing via ArgonRouter
   */
  public static async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API Key is not configured.');
    }

    // Dynamic model routing based on delegation criteria
    const route = ArgonRouter.evaluateRoute(prompt);
    const models = route.selectedModel === 'gemini-4-argon'
      ? ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-flash-latest']
      : ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
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
   * Tests API key connectivity
   */
  public static async testConnection(): Promise<{ success: boolean; model?: string; error?: string }> {
    try {
      await this.generateText(
        'Verify connection. Reply with only: READY',
        'You are a Dota 2 AI Assistant connectivity verifier.'
      );
      return { success: true, model: 'gemini-flash-latest' };
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  }

  /**
   * Generates a pro-tier Grandmaster draft breakdown
   */
  public static async analyzeDraftWithAI(draft: GeminiDraftAnalysisPrompt): Promise<string> {
    const allyList = draft.allies.map(a => `${a.name} (${a.role})`).join(', ') || 'None selected';
    const enemyList = draft.opponents.map(o => `${o.name} (${o.role})`).join(', ') || 'None selected';
    const banList = draft.bans && draft.bans.length > 0 ? draft.bans.join(', ') : 'None';

    const prompt = `
DOTA 2 5v5 DRAFT ANALYSIS REQUEST (Patch 7.37d):
Allies: ${allyList}
Opponents: ${enemyList}
Bans: ${banList}
${draft.focusRole ? `Focus Recommendation Role: ${draft.focusRole}` : ''}

Provide a concise, high-impact tactical analysis with the following sections in clean Markdown:
1. **Matchup Overview & Win Conditions**: Who has the tempo, timing spikes, and objective edge?
2. **Key Threats & Counters**: What enemy abilities or items must our team respect or itemize against?
3. **Laning & Power Spike Plan**: Lane matchup dynamics (Pos 1 vs Pos 3, Mid tempo, Support rotations).
4. **Optimal Itemization & Tactical Adjustments**: Critical active items (BKB, Vessel, Silver Edge, Pipe, Nullifier).
Keep the tone sharp, analytical, and professional, like an elite Dota 2 coach (Immortal / TI coach).
`;

    const systemInstruction = 
      'You are the AegisForge AI Grandmaster Oracle, a top-ranked competitive Dota 2 analyst with comprehensive understanding of Patch 7.37d meta dynamics, hero facet interactions, item timings, and drafting strategies. Provide concise, tactical, high-value advice.';

    return this.generateText(prompt, systemInstruction);
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
}
