/**
 * Argon Hybrid Model Orchestration Layer (TypeScript / React / Node)
 * High-performance, zero-latency model router for Dota 2 Assistant.
 *
 * Routing Policy:
 * - Default Free Model: Gemini 3.8 Flash (gemini-3.8-flash)
 *   Handles file parsing, repository mapping, shell monitoring, local terminal execution,
 *   and routine draft analysis / tactical Q&A.
 * - High-Horizon Model: gemini-4-argon
 *   Routed ONLY when a prompt explicitly invokes high-horizon engineering tasks
 *   or contains the string token "[Argon]" or "argon:".
 */

export interface ModelTierConfig {
  id: string;
  name: string;
  tier: 'free' | 'advanced';
  capabilities: string[];
}

export interface ArgonRouteResult {
  selectedModel: string;
  modelName: string;
  tier: 'free' | 'advanced';
  routeReason: string;
  requiresApiKey: boolean;
  apiKeyEnvVar: string;
  matchedToken?: string;
  isHighHorizon: boolean;
  latencyMs?: number;
}

export interface RouterConfig {
  skillName: string;
  version: string;
  active: boolean;
  argonPriority: boolean;
  apiKeyEnvVar: string;
  defaultModel: ModelTierConfig;
  argonModel: ModelTierConfig;
  explicitTokens: string[];
  highHorizonKeywords: string[];
  defaultFreeTasks: string[];
}

export const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  skillName: 'argon_router',
  version: '2.1.0-priority',
  active: true,
  argonPriority: true,
  apiKeyEnvVar: 'GOOGLE_STUDIO_API_KEY',
  defaultModel: {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tier: 'free',
    capabilities: [
      'file_parsing',
      'repository_mapping',
      'shell_monitoring',
      'terminal_execution',
      'draft_analysis',
      'routine_qa'
    ]
  },
  argonModel: {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    tier: 'advanced',
    capabilities: [
      'high_horizon_engineering',
      'architectural_synthesis',
      'multi_system_migration',
      'formal_verification',
      'deep_cross_codebase_reasoning'
    ]
  },
  explicitTokens: [
    '[Argon]',
    'argon:'
  ],
  highHorizonKeywords: [
    'high-horizon',
    'high horizon',
    'architectural refactor',
    'architecture redesign',
    'end-to-end migration',
    'multi-system migration',
    'deep cross-codebase reasoning',
    'cross-repository reasoning',
    'formal verification',
    'multi-turn verification',
    'complex system redesign',
    'autonomous multi-component engineering'
  ],
  defaultFreeTasks: [
    'file parsing',
    'repository mapping',
    'shell monitoring',
    'terminal execution',
    'local execution',
    'routine advice'
  ]
};

export class ArgonRouter {
  private static config: RouterConfig = DEFAULT_ROUTER_CONFIG;

  /**
   * Fast token matcher compiled regexes for microsecond dispatching
   */
  private static readonly ARGON_BRACKET_REGEX = /\[Argon\]/i;
  private static readonly ARGON_PREFIX_REGEX = /\bargon\s*:/i;
  private static readonly HIGH_HORIZON_REGEX = new RegExp(
    DEFAULT_ROUTER_CONFIG.highHorizonKeywords.map(k => k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')).join('|'),
    'i'
  );

  /**
   * Resolves the active API Key in React/Browser or Node environment
   */
  public static resolveApiKey(): string {
    // 1. Browser localStorage override (UI setting in Dota 2 Assistant)
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('dota_gemini_api_key');
      if (stored && stored.trim()) return stored.trim();
    }

    // 2. Vite client-side environment variable
    try {
      const metaEnv = (import.meta as any)?.env;
      if (metaEnv?.VITE_GEMINI_API_KEY && metaEnv.VITE_GEMINI_API_KEY.trim()) {
        return metaEnv.VITE_GEMINI_API_KEY.trim();
      }
      if (metaEnv?.GOOGLE_STUDIO_API_KEY && metaEnv.GOOGLE_STUDIO_API_KEY.trim()) {
        return metaEnv.GOOGLE_STUDIO_API_KEY.trim();
      }
    } catch {
      // Ignore if import.meta is not available
    }

    // 3. Node.js process.env fallback (safe for browser environments)
    const nodeEnv = (globalThis as any)?.process?.env;
    if (nodeEnv) {
      const sysKey = nodeEnv.GOOGLE_STUDIO_API_KEY || nodeEnv.GOOGLE_API_KEY || nodeEnv.VITE_GEMINI_API_KEY;
      if (sysKey && typeof sysKey === 'string' && sysKey.trim()) return sysKey.trim();
    }

    return '';
  }

  /**
   * Evaluates prompt routing in < 0.1ms with zero dependencies
   */
  public static evaluateRoute(prompt: string, taskHint?: string): ArgonRouteResult {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const promptText = prompt || '';
    const combinedText = taskHint ? `${promptText} ${taskHint}` : promptText;

    // 1. Check explicit tokens: "[Argon]" or "argon:"
    if (this.ARGON_BRACKET_REGEX.test(promptText)) {
      return {
        selectedModel: this.config.argonModel.id,
        modelName: this.config.argonModel.name,
        tier: 'advanced',
        routeReason: "Explicit token match detected: '[Argon]'",
        requiresApiKey: true,
        apiKeyEnvVar: this.config.apiKeyEnvVar,
        matchedToken: '[Argon]',
        isHighHorizon: true,
        latencyMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime) * 1000) / 1000
      };
    }

    if (this.ARGON_PREFIX_REGEX.test(promptText)) {
      return {
        selectedModel: this.config.argonModel.id,
        modelName: this.config.argonModel.name,
        tier: 'advanced',
        routeReason: "Explicit prefix token match detected: 'argon:'",
        requiresApiKey: true,
        apiKeyEnvVar: this.config.apiKeyEnvVar,
        matchedToken: 'argon:',
        isHighHorizon: true,
        latencyMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime) * 1000) / 1000
      };
    }

    // 2. Check for explicit invocation of high-horizon engineering tasks
    const highHorizonMatch = combinedText.match(this.HIGH_HORIZON_REGEX);
    if (highHorizonMatch) {
      return {
        selectedModel: this.config.argonModel.id,
        modelName: this.config.argonModel.name,
        tier: 'advanced',
        routeReason: `High-horizon engineering task detected: '${highHorizonMatch[0]}'`,
        requiresApiKey: true,
        apiKeyEnvVar: this.config.apiKeyEnvVar,
        isHighHorizon: true,
        latencyMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime) * 1000) / 1000
      };
    }

    // 3. Argon Priority Evaluation
    // When argonPriority is active, prioritize gemini-4-argon across conversations and projects,
    // preserving Gemini 3.8 Flash strictly for local utilities (file parsing, repo mapping, terminal execution, shell monitoring).
    const freeTierRegex = /\b(file parsing|parse|ast|repository mapping|repository map|repo map|shell monitoring|monitor.*shell|monitor background|terminal execution|terminal|execute.*terminal)\b/i;
    const isFreeLocalUtility = freeTierRegex.test(combinedText);

    if (this.config.argonPriority && !isFreeLocalUtility) {
      return {
        selectedModel: this.config.argonModel.id,
        modelName: this.config.argonModel.name,
        tier: 'advanced',
        routeReason: 'Global Argon Priority active: conversational reasoning / project analysis routed to gemini-4-argon',
        requiresApiKey: true,
        apiKeyEnvVar: this.config.apiKeyEnvVar,
        isHighHorizon: true,
        latencyMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime) * 1000) / 1000
      };
    }

    // 4. Default fallback: Gemini 3.8 Flash (free tier)
    // Used for file parsing, repository mapping, shell monitoring, local terminal execution
    return {
      selectedModel: this.config.defaultModel.id,
      modelName: this.config.defaultModel.name,
      tier: 'free',
      routeReason: isFreeLocalUtility 
        ? 'Delegation criteria: local utility task routed to free tier (Gemini 3.8 Flash)'
        : 'Delegation criteria default: standard task / local operation (Gemini 3.8 Flash)',
      requiresApiKey: false,
      apiKeyEnvVar: this.config.apiKeyEnvVar,
      isHighHorizon: false,
      latencyMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime) * 1000) / 1000
    };
  }

  /**
   * Set Argon priority mode globally for the project
   */
  public static setArgonPriority(enabled: boolean): void {
    this.config.argonPriority = enabled;
  }

  /**
   * Check if Argon is currently set on priority
   */
  public static isArgonPriority(): boolean {
    return Boolean(this.config.argonPriority);
  }

  /**
   * Returns current configuration
   */
  public static getConfig(): RouterConfig {
    return this.config;
  }
}
