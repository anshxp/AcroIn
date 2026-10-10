import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const excludedDirectories = new Set([
  '.git',
  'node_modules',
  'coverage',
  'dist',
  'build',
  'uploads',
  '.venv',
  'venv',
]);
const sourceExtensions = new Set(['.js', '.cjs', '.mjs']);
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) walk(join(directory, entry.name));
      continue;
    }

    if (!entry.isFile()) continue;
    const extension = entry.name.slice(entry.name.lastIndexOf('.'));
    if (sourceExtensions.has(extension)) files.push(join(directory, entry.name));
  }
}

walk(root);
files.sort();

if (files.length === 0) {
  console.error('No JavaScript source files found to syntax-check.');
  process.exit(1);
}

let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed = true;
    console.error(`\nSyntax check failed: ${relative(root, file)}`);
    if (result.stdout) process.stderr.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }
}

if (failed) process.exit(1);
console.log(`JavaScript syntax check passed for ${files.length} files.`);
