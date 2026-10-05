// Versioni ingrandite delle foto usate a tutto schermo (hero e sezione servizi).
// Solo interpolazione lanczos + leggera nitidezza: nessun dettaglio inventato.
// Uso: node scripts/ingrandisci-hero.mjs
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('src/assets/foto');
const foto = [
  ['case-xlam', 1],
  ['case-xlam', 10],
  ['sopraelevazione-trento', 1],
  ['facciata-contemporanea', 1],
  ['veranda-legno-scuro', 1],
];

const crediti = await fs.readFile('docs/crediti-immagini.md', 'utf8');
const righe = [];
for (const [cartella, n] of foto) {
  const nome = `${cartella}-${String(n).padStart(2, '0')}`;
  const out = `${nome}-hero.jpg`;
  await sharp(path.join(ROOT, cartella, `${nome}.jpg`))
    .resize({ width: 1920, kernel: 'lanczos3' })
    .sharpen({ sigma: 0.6 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(ROOT, cartella, out));
  const riga = `| foto/${cartella}/${out} | stessa fonte di foto/${cartella}/${nome}.jpg (ingrandita a 1920 px) |`;
  if (!crediti.includes(riga)) righe.push(riga);
}
if (righe.length) await fs.appendFile('docs/crediti-immagini.md', righe.join('\n') + '\n');
console.log(`Fatto: ${foto.length} foto`);
