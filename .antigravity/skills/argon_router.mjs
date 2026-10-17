#!/usr/bin/env node
/**
 * Argon Hybrid Model Orchestration Layer (Node.js ESM)
 * Ultra-fast native JavaScript/TypeScript delegation router for Dota 2 Assistant.
 *
 * Routing Policy:
 * - Default Free Model: Gemini 3.8 Flash (gemini-3.8-flash)
 *   Handles file parsing, repository mapping, shell monitoring, local terminal execution,
 *   and routine draft analysis.
 * - High-Horizon Model: gemini-4-argon
 *   Routed ONLY when a prompt explicitly invokes high-horizon engineering tasks
 *   or contains the string token "[Argon]" or "argon:".
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, 'argon_config.json');

const DEFAULT_CONFIG = {
  skill_name: 'argon_router',
  version: '2.0.0-node',
  active: true,
  api_key_env_var: 'GOOGLE_STUDIO_API_KEY',
  models: {
    default: {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      tier: 'free',
      capabilities: [
        'file_parsing',
        'repository_mapping',
        'shell_monitoring',
        'terminal_execution',
        'routine_code_edits',
        'draft_analysis'
      ]
    },
    high_horizon: {
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
    }
  },
  routing_criteria: {
    explicit_tokens: [
      '[Argon]',
      'argon:'
    ],
    high_horizon_keywords: [
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
    default_free_tasks: [
      'file parsing',
      'parse file',
      'repository mapping',
      'repo mapping',
      'shell monitoring',
      'monitor shell',
      'terminal execution',
      'run command',
      'run shell'
    ]
  }
};

export function loadOrInitConfig(configPath = CONFIG_PATH) {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    process.stderr.write(`Warning: Failed to load ${configPath}: ${err.message}. Using defaults.\n`);
  }
  saveConfig(DEFAULT_CONFIG, configPath);
  return DEFAULT_CONFIG;
}

export function saveConfig(config, targetPath = CONFIG_PATH) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2), 'utf-8');
  return targetPath;
}

export class ArgonRouter {
  constructor(configPath = CONFIG_PATH) {
    this.configPath = configPath;
    this.config = loadOrInitConfig(configPath);
    this.apiKeyEnvVar = this.config.api_key_env_var || 'GOOGLE_STUDIO_API_KEY';
    this.defaultModelId = this.config.models.default.id;
    this.argonModelId = this.config.models.high_horizon.id;
    this.explicitTokens = this.config.routing_criteria.explicit_tokens;
    this.highHorizonKeywords = this.config.routing_criteria.high_horizon_keywords;

    this.bracketRegex = /\[Argon\]/i;
    this.prefixRegex = /\bargon\s*:/i;
    this.highHorizonRegex = new RegExp(
      this.highHorizonKeywords.map(k => k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')).join('|'),
      'i'
    );
  }

  getApiKey() {
    return process.env[this.apiKeyEnvVar] || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY || null;
  }

  isApiKeyConfigured() {
    const key = this.getApiKey();
    return Boolean(key && key.trim());
  }

  evaluateRouting(prompt, taskHint = '') {
    const start = performance.now();
    const promptText = prompt || '';
    const combinedText = `${promptText} ${taskHint}`;

    // 1. Check explicit string tokens: "[Argon]" and "argon:"
    if (this.bracketRegex.test(promptText)) {
      return {
        selected_model: this.argonModelId,
        model_name: this.config.models.high_horizon.name,
        tier: 'advanced',
        route_reason: "Explicit token match detected: '[Argon]'",
        requires_api_key: true,
        api_key_configured: this.isApiKeyConfigured(),
        api_key_env_var: this.apiKeyEnvVar,
        latency_ms: +(performance.now() - start).toFixed(4)
      };
    }

    if (this.prefixRegex.test(promptText)) {
      return {
        selected_model: this.argonModelId,
        model_name: this.config.models.high_horizon.name,
        tier: 'advanced',
        route_reason: "Explicit prefix token match detected: 'argon:'",
        requires_api_key: true,
        api_key_configured: this.isApiKeyConfigured(),
        api_key_env_var: this.apiKeyEnvVar,
        latency_ms: +(performance.now() - start).toFixed(4)
      };
    }

    // 2. Check for explicit invocation of high-horizon engineering tasks
    const match = combinedText.match(this.highHorizonRegex);
    if (match) {
      return {
        selected_model: this.argonModelId,
        model_name: this.config.models.high_horizon.name,
        tier: 'advanced',
        route_reason: `High-horizon engineering task detected: '${match[0]}'`,
        requires_api_key: true,
        api_key_configured: this.isApiKeyConfigured(),
        api_key_env_var: this.apiKeyEnvVar,
        latency_ms: +(performance.now() - start).toFixed(4)
      };
    }

    // 3. Argon Priority Evaluation
    const freeTierRegex = /\b(file parsing|parse|ast|repository mapping|repository map|repo map|shell monitoring|monitor.*shell|monitor background|terminal execution|terminal|execute.*terminal)\b/i;
    const isFreeLocalUtility = freeTierRegex.test(combinedText);

    if (this.config.argon_priority && !isFreeLocalUtility) {
      return {
        selected_model: this.argonModelId,
        model_name: this.config.models.high_horizon.name,
        tier: 'advanced',
        route_reason: 'Global Argon Priority active: conversational reasoning / project analysis routed to gemini-4-argon',
        requires_api_key: !this.config.zero_setup_available,
        zero_setup_available: Boolean(this.config.zero_setup_available),
        api_key_configured: this.isApiKeyConfigured(),
        api_key_env_var: this.apiKeyEnvVar,
        latency_ms: +(performance.now() - start).toFixed(4)
      };
    }

    // 4. Default fallback: Gemini 3.8 Flash (free tier)
    // Used for file parsing, repository mapping, shell monitoring, local terminal execution
    return {
      selected_model: this.defaultModelId,
      model_name: this.config.models.default.name,
      tier: 'free',
      route_reason: isFreeLocalUtility
        ? 'Delegation criteria: local utility task routed to free tier (Gemini 3.8 Flash)'
        : 'Delegation criteria default: standard task / local operation (Gemini 3.8 Flash)',
      requires_api_key: false,
      api_key_configured: this.isApiKeyConfigured(),
      api_key_env_var: this.apiKeyEnvVar,
      latency_ms: +(performance.now() - start).toFixed(4)
    };
  }

  runValidationSuite() {
    console.log('='.repeat(65));
    console.log(' ARGON HYBRID MODEL ORCHESTRATION LAYER (NODE.JS) - VALIDATION');
    console.log('='.repeat(65));
    console.log(`[*] Engine:              V8 / Node.js ${process.version} (Zero-latency runtime)`);
    console.log(`[*] Configuration Path:  ${this.configPath}`);
    console.log(`[*] Priority Mode:       ${this.config.argon_priority ? 'ACTIVE (Argon priority on every conversation & project)' : 'STANDARD'}`);
    console.log(`[*] Default Free Model:  ${this.defaultModelId} (${this.config.models.default.name})`);
    console.log(`[*] Argon Routing Model: ${this.argonModelId} (${this.config.models.high_horizon.name})`);
    console.log(`[*] API Key Env Var:     ${this.apiKeyEnvVar}`);
    console.log(`[*] API Key Status:      ${this.isApiKeyConfigured() ? 'CONFIGURED' : 'NOT SET'}`);
    console.log(`[*] Zero-Setup Mode:     ${this.config.zero_setup_available ? 'ACTIVE (Ready without manual API setup)' : 'API Key Required'}`);
    console.log('-'.repeat(65));

    const testCases = [
      {
        name: 'File parsing task',
        prompt: 'Parse the AST of src/index.ts and extract all exported function signatures.',
        expected_model: this.defaultModelId
      },
      {
        name: 'Repository mapping task',
        prompt: 'Walk the directory tree and generate a repository map of all TypeScript modules.',
        expected_model: this.defaultModelId
      },
      {
        name: 'Shell monitoring task',
        prompt: 'Monitor background process logs and notify when build completes.',
        expected_model: this.defaultModelId
      },
      {
        name: 'Local terminal execution task',
        prompt: "Execute 'npm run typecheck' in terminal and check exit status.",
        expected_model: this.defaultModelId
      },
      {
        name: this.config.argon_priority ? 'Conversational query (Argon Priority)' : 'Routine query (Standard Mode)',
        prompt: 'What are good item timings for Pos 1 Juggernaut against Axe?',
        expected_model: this.config.argon_priority ? this.argonModelId : this.defaultModelId
      },
      {
        name: "Explicit token '[Argon]'",
        prompt: 'Please synthesize advanced drafting permutations [Argon]',
        expected_model: this.argonModelId
      },
      {
        name: "Explicit prefix 'argon:'",
        prompt: 'argon: redesign predictive draft Monte Carlo simulation engine',
        expected_model: this.argonModelId
      },
      {
        name: 'High-horizon task (architectural refactor)',
        prompt: 'Perform an architectural refactor across the distributed persistence layer.',
        expected_model: this.argonModelId
      },
      {
        name: 'High-horizon task (end-to-end migration)',
        prompt: 'Lead the end-to-end migration of state management to zustand microstores.',
        expected_model: this.argonModelId
      },
      {
        name: 'High-horizon task (formal verification)',
        prompt: 'Run formal verification on the winrate matrix mathematical proofs.',
        expected_model: this.argonModelId
      },
      {
        name: 'Explicit high-horizon engineering invocation',
        prompt: 'Handle high-horizon engineering tasks for our distributed prediction engine.',
        expected_model: this.argonModelId
      }
    ];

    let passed = 0;
    const total = testCases.length;

    testCases.forEach((tc, idx) => {
      const res = this.evaluateRouting(tc.prompt);
      const isMatch = res.selected_model === tc.expected_model;
      if (isMatch) passed++;
      const status = isMatch ? 'PASS' : 'FAIL';
      console.log(`[${status}] Test ${String(idx + 1).padStart(2, '0')}: ${tc.name}`);
      console.log(`       Prompt:   "${tc.prompt.slice(0, 52)}..."`);
      console.log(`       Routed:   ${res.selected_model} (${res.route_reason}) [${res.latency_ms}ms]`);
      if (!isMatch) {
        console.log(`       Expected: ${tc.expected_model}`);
      }
      console.log();
    });

    console.log('-'.repeat(65));
    console.log(`Validation Summary: ${passed}/${total} tests passed.`);
    if (passed === total) {
      console.log('[SUCCESS] Argon hybrid orchestration layer is ACTIVE and VERIFIED (TypeScript/Node).');
      return true;
    }
    console.error('[FAILURE] Some tests failed.');
    return false;
  }
}

// CLI handler
function runCli() {
  const args = process.argv.slice(2);
  const router = new ArgonRouter();

  if (args.includes('--save-config')) {
    saveConfig(router.config, router.configPath);
    console.log(`Configuration saved to: ${router.configPath}`);
    process.exit(0);
  }

  if (args.includes('--priority')) {
    const priorityIndex = args.indexOf('--priority');
    const val = args[priorityIndex + 1];
    if (val === 'off' || val === 'false') {
      router.config.argon_priority = false;
    } else {
      router.config.argon_priority = true;
    }
    saveConfig(router.config, router.configPath);
    console.log(`Argon priority is now: ${router.config.argon_priority ? 'ON (Active for all conversations & projects)' : 'OFF'}`);
    process.exit(0);
  }

  const routeArgIndex = args.indexOf('--route');
  if (routeArgIndex !== -1 && args[routeArgIndex + 1]) {
    const result = router.evaluateRouting(args[routeArgIndex + 1]);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  if (args.includes('--check')) {
    console.log(JSON.stringify({
      status: router.config.active ? 'active' : 'inactive',
      skill: router.config.skill_name,
      runtime: `Node.js ${process.version}`,
      argon_priority: Boolean(router.config.argon_priority),
      priority_model: router.argonModelId,
      api_key_env_var: router.apiKeyEnvVar,
      api_key_configured: router.isApiKeyConfigured(),
      zero_setup_available: Boolean(router.config.zero_setup_available),
      default_model: router.defaultModelId,
      high_horizon_model: router.argonModelId,
      config_path: router.configPath
    }, null, 2));
    process.exit(0);
  }

  // Default action: --validate
  const success = router.runValidationSuite();
  process.exit(success ? 0 : 1);
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli();
}
