// Imports the client's own photos (downloaded from their two current sites) into src/assets/foto.
// Re-encodes them, strips EXIF (GPS of clients' homes) and records the source of every file.
// Usage: node scripts/import-foto.mjs <cartella-raw-con-uniq.json>
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const RAW = process.argv[2];
if (!RAW) throw new Error('Passa la cartella con uniq.json');
const uniq = JSON.parse(await fs.readFile(path.join(RAW, 'uniq.json'), 'utf8'));
const byId = new Map(uniq.map((r) => [r.id, r]));

// slug -> ids, la prima è la copertina
const selezione = {
  folgaria: [24, 25, 20, 21, 22, 16, 13, 14, 15, 17, 18, 19, 23, 12, 11, 26],
  barbaniga: [312, 306, 300, 305, 307, 308, 303, 302, 309, 310, 311, 313, 301, 304],
  'quattro-falde-abbaini': [296, 292, 295, 298, 290, 291, 293, 294, 297, 285, 286, 287, 288, 289, 299],
  'quattro-falde': [352, 351, 347, 348, 349, 350, 353, 354, 355, 356],
  'sopraelevazione-trento': [249, 341, 339, 340, 342, 343, 344, 244, 245, 246, 247, 248, 250, 251, 252, 345, 346, 253],
  'sopraelevazione-cadore': [266, 265, 259, 262, 263, 264, 254, 255, 256, 257, 258, 260, 261, 267, 268],
  'facciata-montana': [208, 207, 220, 209, 210, 206, 211, 212, 213, 214, 215, 216, 217, 218, 219],
  'facciata-contemporanea': [234, 222, 227, 226, 231, 233, 221, 223, 224, 225, 228, 229, 230, 232, 235],
  'chalet-brentonico': [327, 325, 326],
  'tettoia-lavis': [317, 315, 314, 316],
  'pergola-tenda': [282, 280, 281, 283],
  'soppalco-civezzano': [239, 240, 241, 242, 243],
  'veranda-legno-scuro': [319, 322, 318, 320, 321, 323, 324],
  'decking-larice': [30, 27, 28, 29, 31, 32],
  'sottotetto-rivestito': [200, 203, 202, 205, 204, 199, 197, 194],
  'case-xlam': [122, 81, 93, 94, 83, 89, 100, 104, 74, 123, 119, 136, 145, 159, 4, 5],
  squadra: [271, 236, 237, 272, 275, 276, 277, 279, 273],
  generiche: [35, 34, 40],
};

const OUT = path.resolve('src/assets/foto');
const crediti = ['# Crediti immagini', '', 'Tutte le foto sono di Edelweiss Carpenteria, prese dai loro siti attuali (edelcarpenteria.com, tettiinlegnotrento.it) per l\'anteprima privata. EXIF rimossi.', '', '| File | Fonte |', '|---|---|'];

for (const [slug, ids] of Object.entries(selezione)) {
  const dir = path.join(OUT, slug);
  await fs.mkdir(dir, { recursive: true });
  for (const [i, id] of ids.entries()) {
    const r = byId.get(id);
    if (!r) throw new Error(`id ${id} mancante`);
    const name = `${slug}-${String(i + 1).padStart(2, '0')}.jpg`;
    await sharp(path.join(RAW, r.file)).rotate().jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(dir, name));
    crediti.push(`| foto/${slug}/${name} | ${r.url} |`);
  }
}

// Copertina della home: la stessa foto di Folgaria ingrandita (solo interpolazione, nessun contenuto aggiunto)
const hero = byId.get(24);
await sharp(path.join(RAW, hero.file))
  .rotate()
  .resize({ width: 1680, kernel: 'lanczos3' })
  .sharpen({ sigma: 0.6 })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path.join(OUT, 'folgaria', 'folgaria-hero.jpg'));
crediti.push(`| foto/folgaria/folgaria-hero.jpg | ${hero.url} (ingrandita a 1680 px) |`);

await fs.writeFile('docs/crediti-immagini.md', crediti.join('\n') + '\n');
console.log('ok');
