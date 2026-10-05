// Lighthouse mobile su una lista di pagine della build locale (npm run preview su :4322).
// Uso: node scripts/lighthouse.mjs [base] [percorsi...]   → stampa punteggi e salva lo screenshot a pagina intera
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const base = process.argv[2] || 'http://localhost:4322';
const percorsi = process.argv.slice(3).length ? process.argv.slice(3) : ['/'];
const out = path.join(os.tmpdir(), 'lh-edelweiss');
fs.mkdirSync(out, { recursive: true });

for (const p of percorsi) {
  const nome = p.replace(/\W+/g, '_') || 'home';
  const json = path.join(out, `${nome}.json`);
  execFileSync(
    'npx',
    ['-y', 'lighthouse@latest', base + p, '--form-factor=mobile', '--chrome-flags=--headless=new', '--output=json', `--output-path=${json}`, '--quiet', '--only-categories=performance,accessibility,best-practices,seo'],
    { stdio: 'ignore', shell: true },
  );
  const r = JSON.parse(fs.readFileSync(json, 'utf8'));
  const c = r.categories;
  const a = r.audits;
  const punteggi = Object.values(c).map((x) => `${x.title.split(' ')[0]} ${Math.round(x.score * 100)}`).join(' | ');
  const metriche = ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'total-byte-weight'].map((k) => a[k].displayValue).join(' · ');
  console.log(`${p}\n  ${punteggi}\n  ${metriche}`);
  const falliti = Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'manual' && x.scoreDisplayMode !== 'notApplicable');
  for (const f of falliti.slice(0, 8)) console.log(`  ! ${f.title}${f.displayValue ? ' — ' + f.displayValue : ''}`);
  const shot = r.fullPageScreenshot?.screenshot?.data ?? a['full-page-screenshot']?.details?.screenshot?.data;
  if (shot) fs.writeFileSync(path.join(out, `${nome}.jpg`), Buffer.from(shot.split(',')[1], 'base64'));
}
console.log(`report e screenshot in ${out}`);
