import { globSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import esbuild from 'esbuild';

const testFiles = globSync('tests/**/*.test.{ts,tsx,js,mjs}');

if (testFiles.length === 0) {
  console.log('No test files found in tests/');
  process.exit(0);
}

rmSync('.test-dist', { recursive: true, force: true });


try {
  await esbuild.build({
    entryPoints: testFiles,
    outdir: '.test-dist',
    outbase: '.',
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    sourcemap: 'inline',
    jsx: 'automatic',
  });
} catch (error) {
  console.error('Failed to compile test files:', error);
  process.exit(1);
}

const compiledTestFiles = globSync('.test-dist/**/*.test.{js,mjs}');

const child = spawn(process.execPath, ['--test', ...compiledTestFiles], {
  stdio: 'inherit',
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
