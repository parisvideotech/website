#!/usr/bin/env node
//
// Validation MDX
// ============================================================================
// Compile tous les fichiers .mdx de src/content/meetups/ via @mdx-js/mdx pour
// detecter les erreurs avant le build Astro (et avant le deploiement Netlify).
//
// Usage :
//   npm run check:mdx
//
// Exit code 0 si tous les MDX compilent, 1 sinon (utilisable en CI).
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '@mdx-js/mdx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'meetups');

function listMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => path.join(dir, f))
    .sort();
}

const files = listMdxFiles(CONTENT_DIR);
console.log(`Validation MDX de ${files.length} fichier(s) dans ${path.relative(ROOT, CONTENT_DIR)}...\n`);

let ok = 0;
let fail = 0;
const errors = [];

for (const file of files) {
  const name = path.basename(file);
  const raw = fs.readFileSync(file, 'utf8');
  // Retire le frontmatter pour que la compilation se concentre sur le contenu MDX
  // (@mdx-js/mdx tout seul ne parse pas YAML, contrairement a Astro qui le fait).
  const stripped = raw.replace(/^---[\s\S]*?---\n/, '');

  try {
    await compile(stripped, { jsx: true });
    ok++;
  } catch (err) {
    fail++;
    errors.push({
      file: name,
      message: err.message ? err.message.split('\n')[0] : String(err),
      line: err.place?.start?.line,
      column: err.place?.start?.column,
    });
  }
}

console.log(`✓ OK   : ${ok}`);
console.log(`✗ FAIL : ${fail}`);

if (fail > 0) {
  console.log('\n=== Détail des erreurs ===');
  for (const e of errors) {
    const loc = e.line ? ` (ligne ${e.line}:${e.column ?? '?'})` : '';
    console.log(`\n  ${e.file}${loc}`);
    console.log(`    ${e.message}`);
  }
  console.log(`\n${fail} fichier(s) en erreur. Corriger avant push.`);
  process.exit(1);
}

console.log('\nTous les MDX compilent. ✓');
