// La casa del sito, pezzo per pezzo, in metri. Una casa alpina contemporanea:
// piano terra in pannelli XLAM, piano primo a telaio, tetto a due falde a 30° con il pacchetto completo,
// facciata in doghe di larice al piano primo, intonaco al piano terra, pergola sul lato.
// Ogni pezzo sa in che fase si monta e in che ordine: la scena lo fa "arrivare" quando la pagina ci arriva.

export type Materiale = 'legno' | 'xlam' | 'cls' | 'membrana' | 'isolante' | 'metallo' | 'intonaco' | 'vetro' | 'acciaio';
export type Fase =
  | 'fondazione'
  | 'pareti'
  | 'solaio'
  | 'telaio'
  | 'travi'
  | 'perlinato'
  | 'freno'
  | 'isolante'
  | 'telo'
  | 'listelli'
  | 'manto'
  | 'intonaco'
  | 'doghe'
  | 'vetri'
  | 'decking'
  | 'pergola';
// Strati del tetto, dal basso verso l'alto: nella vista esplosa si separano lungo la normale della falda
export const STRATI = ['travi', 'perlinato', 'freno', 'isolante', 'telo', 'listelli', 'manto'] as const;
export type Strato = (typeof STRATI)[number];

export interface Pezzo {
  mat: Materiale;
  fase: Fase;
  dim: [number, number, number];
  pos: [number, number, number];
  rotX?: number;
  ordine: number;
  strato?: Strato;
  normale?: [number, number, number];
}

interface Apertura {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

const pezzi: Pezzo[] = [];
const aggiungi = (p: Pezzo) => pezzi.push(p);

// ── Parete piena con aperture: rettangoli che coprono la parete tolte le aperture ──
interface Parete {
  asse: 'x' | 'z';
  inizio: number; // x0 o z0
  lunghezza: number;
  centro: number; // z (pareti lungo x) o x (pareti lungo z)
  fuori: 1 | -1; // verso l'esterno
  y0: number;
  altezza: number;
  aperture: Apertura[];
}

function rettangoli(p: Parete) {
  const tagli = [...new Set([0, p.lunghezza, ...p.aperture.flatMap((a) => [a.u0, a.u1])])].sort((a, b) => a - b);
  const fasce: { a: number; b: number; pieni: [number, number][] }[] = [];
  for (let i = 0; i < tagli.length - 1; i++) {
    const a = tagli[i]!;
    const b = tagli[i + 1]!;
    const buchi = p.aperture.filter((o) => o.u0 < b - 1e-6 && o.u1 > a + 1e-6).sort((x, y) => x.v0 - y.v0);
    const pieni: [number, number][] = [];
    let v = 0;
    for (const o of buchi) {
      if (o.v0 > v + 1e-6) pieni.push([v, o.v0]);
      v = Math.max(v, o.v1);
    }
    if (v < p.altezza - 1e-6) pieni.push([v, p.altezza]);
    const prec = fasce.at(-1);
    // Fasce vicine con gli stessi pieni diventano un unico pannello
    if (prec && JSON.stringify(prec.pieni) === JSON.stringify(pieni)) prec.b = b;
    else fasce.push({ a, b, pieni });
  }
  return fasce.flatMap((f) => f.pieni.map(([v0, v1]) => ({ u0: f.a, u1: f.b, v0, v1 })));
}

function scatola(p: Parete, u0: number, u1: number, v0: number, v1: number, spessore: number, scarto: number) {
  const du = u1 - u0;
  const dv = v1 - v0;
  const um = p.inizio + (u0 + u1) / 2;
  const y = p.y0 + (v0 + v1) / 2;
  const c = p.centro + p.fuori * scarto;
  return p.asse === 'x'
    ? { dim: [du, dv, spessore] as [number, number, number], pos: [um, y, c] as [number, number, number] }
    : { dim: [spessore, dv, du] as [number, number, number], pos: [c, y, um] as [number, number, number] };
}

// ── Geometria generale ──
const TAN = Math.tan(Math.PI / 6);
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);
const Y_SOLETTA = 0.3;
const Y_SOLAIO = 3.2; // fine pareti piano terra
const Y_PRIMO = 3.36; // sopra il solaio
const Y_GRONDA = 6.06; // fine pareti piano primo
const Y_APPOGGIO = 6.18; // sopra i dormienti
const MURO_Z = 3.92;
const sottoFalda = (z: number) => Y_APPOGGIO + (MURO_Z - Math.abs(z)) * TAN;
const SPORTO_GRONDA = 0.7;
const L_FALDA = (4 + SPORTO_GRONDA) / COS;
const X_TETTO = 6.1; // sporto laterale oltre le pareti (5.2)

// ── Fondazione ──
aggiungi({ mat: 'cls', fase: 'fondazione', dim: [10.8, Y_SOLETTA, 8.4], pos: [0, Y_SOLETTA / 2, 0], ordine: 0 });

// ── Piano terra in XLAM ──
const pareteTerra: Parete[] = [
  {
    asse: 'x', inizio: -5.2, lunghezza: 10.4, centro: 3.94, fuori: 1, y0: Y_SOLETTA, altezza: 2.9,
    aperture: [ { u0: 1.2, u1: 4.4, v0: 0, v1: 2.5 }, { u0: 6.6, u1: 7.8, v0: 0, v1: 2.3 }, { u0: 8.6, u1: 9.6, v0: 0.9, v1: 2.3 } ],
  },
  {
    asse: 'z', inizio: -3.88, lunghezza: 7.76, centro: 5.14, fuori: 1, y0: Y_SOLETTA, altezza: 2.9,
    aperture: [{ u0: 2.6, u1: 5.0, v0: 0, v1: 2.5 }],
  },
  {
    asse: 'x', inizio: -5.2, lunghezza: 10.4, centro: -3.94, fuori: -1, y0: Y_SOLETTA, altezza: 2.9,
    aperture: [ { u0: 1.5, u1: 2.9, v0: 0.9, v1: 2.3 }, { u0: 5.0, u1: 6.6, v0: 0.9, v1: 2.3 }, { u0: 7.8, u1: 9.0, v0: 0.9, v1: 2.3 } ],
  },
  {
    asse: 'z', inizio: -3.88, lunghezza: 7.76, centro: -5.14, fuori: -1, y0: Y_SOLETTA, altezza: 2.9,
    aperture: [{ u0: 3.0, u1: 4.4, v0: 0.9, v1: 2.3 }],
  },
];
pareteTerra.forEach((p, i) => {
  // Ogni parete è un pannello che arriva intero: stessi tempi per tutti i suoi pezzi
  for (const r of rettangoli(p)) aggiungi({ mat: 'xlam', fase: 'pareti', ...scatola(p, r.u0, r.u1, r.v0, r.v1, 0.12, 0), ordine: i });
  for (const a of p.aperture)
    aggiungi({ mat: 'vetro', fase: 'vetri', ...scatola(p, a.u0 + 0.04, a.u1 - 0.04, a.v0 + 0.04, a.v1 - 0.04, 0.03, 0), ordine: i });
  // Intonaco esterno (cappotto) del piano terra
  for (const r of rettangoli(p)) aggiungi({ mat: 'intonaco', fase: 'intonaco', ...scatola(p, r.u0, r.u1, r.v0, r.v1, 0.05, 0.085), ordine: i });
});

// ── Solaio in XLAM, quattro pannelli ──
for (let k = 0; k < 4; k++)
  aggiungi({ mat: 'xlam', fase: 'solaio', dim: [2.6, 0.16, 8.0], pos: [-5.2 + 1.3 + k * 2.6, Y_SOLAIO + 0.08, 0], ordine: k });

// ── Piano primo a telaio: correnti, montanti, architravi, davanzali ──
const paretePrimo: Parete[] = [
  {
    asse: 'x', inizio: -5.2, lunghezza: 10.4, centro: 3.92, fuori: 1, y0: Y_PRIMO, altezza: 2.7,
    aperture: [ { u0: 1.6, u1: 3.6, v0: 0.7, v1: 2.3 }, { u0: 6.0, u1: 8.8, v0: 0.05, v1: 2.3 } ],
  },
  {
    asse: 'z', inizio: -3.84, lunghezza: 7.68, centro: 5.12, fuori: 1, y0: Y_PRIMO, altezza: 2.7,
    aperture: [{ u0: 3.2, u1: 4.6, v0: 0.9, v1: 2.2 }],
  },
  {
    asse: 'x', inizio: -5.2, lunghezza: 10.4, centro: -3.92, fuori: -1, y0: Y_PRIMO, altezza: 2.7,
    aperture: [ { u0: 2.0, u1: 3.4, v0: 0.9, v1: 2.2 }, { u0: 7.0, u1: 8.4, v0: 0.9, v1: 2.2 } ],
  },
  {
    asse: 'z', inizio: -3.84, lunghezza: 7.68, centro: -5.12, fuori: -1, y0: Y_PRIMO, altezza: 2.7,
    aperture: [{ u0: 3.2, u1: 4.6, v0: 0.9, v1: 2.2 }],
  },
];
const T_TELAIO = 0.16;
paretePrimo.forEach((p, i) => {
  const base = i * 10;
  const pz = (u0: number, u1: number, v0: number, v1: number, ordine: number) =>
    aggiungi({ mat: 'legno', fase: 'telaio', ...scatola(p, u0, u1, v0, v1, T_TELAIO, 0), ordine });
  pz(0, p.lunghezza, 0, 0.08, base); // corrente inferiore
  const montanti = new Set<number>();
  for (let u = 0.03; u < p.lunghezza - 0.03; u += 0.625) montanti.add(Math.round(u * 1000) / 1000);
  montanti.add(p.lunghezza - 0.03);
  for (const a of p.aperture) {
    montanti.add(a.u0 - 0.03);
    montanti.add(a.u1 + 0.03);
  }
  for (const u of [...montanti].sort((a, b) => a - b)) {
    const dentro = p.aperture.find((a) => u > a.u0 && u < a.u1);
    const ord = base + 1 + (u / p.lunghezza) * 6;
    if (!dentro) pz(u - 0.03, u + 0.03, 0.08, p.altezza - 0.08, ord);
    else {
      if (dentro.v0 > 0.12) pz(u - 0.03, u + 0.03, 0.08, dentro.v0 - 0.06, ord);
      if (dentro.v1 + 0.2 < p.altezza - 0.1) pz(u - 0.03, u + 0.03, dentro.v1 + 0.2, p.altezza - 0.08, ord);
    }
  }
  for (const a of p.aperture) {
    pz(a.u0 - 0.06, a.u1 + 0.06, a.v1, a.v1 + 0.2, base + 7); // architrave
    if (a.v0 > 0.12) pz(a.u0, a.u1, a.v0 - 0.06, a.v0, base + 7); // davanzale
    aggiungi({ mat: 'vetro', fase: 'vetri', ...scatola(p, a.u0 + 0.04, a.u1 - 0.04, a.v0 + 0.04, a.v1 - 0.04, 0.03, 0), ordine: 10 + i });
  }
  pz(0, p.lunghezza, p.altezza - 0.08, p.altezza, base + 8); // corrente superiore

  // Timpani: sulle pareti laterali i montanti salgono fino alla falda
  if (p.asse === 'z') {
    for (let u = 0.03; u < p.lunghezza; u += 0.625) {
      const z = p.inizio + u;
      const h = sottoFalda(z) - (Y_GRONDA + 0.02);
      if (h > 0.15) aggiungi({ mat: 'legno', fase: 'telaio', ...scatola({ ...p, y0: Y_GRONDA }, u - 0.03, u + 0.03, 0, h, T_TELAIO, 0), ordine: base + 9 });
    }
  }

  // Facciata: doghe verticali in larice, distanziate, con le aperture lasciate libere
  const passo = 0.13;
  for (let u = 0.06; u < p.lunghezza - 0.04; u += passo) {
    const z = p.asse === 'z' ? p.inizio + u : 0;
    const cima = p.asse === 'z' ? sottoFalda(z) - Y_PRIMO - 0.04 : p.altezza + 0.08;
    const a = p.aperture.find((o) => u + 0.05 > o.u0 && u - 0.05 < o.u1);
    const tratti: [number, number][] = a ? ([[0, a.v0 - 0.02], [a.v1 + 0.02, cima]] as [number, number][]).filter(([x, y]) => y - x > 0.06) : [[0, cima]];
    for (const [v0, v1] of tratti)
      aggiungi({ mat: 'legno', fase: 'doghe', ...scatola(p, u - 0.05, u + 0.05, v0, v1, 0.025, T_TELAIO / 2 + 0.05), ordine: i * 100 + u * 8 });
  }
});

// ── Tetto ──
// Dormienti sulle pareti di gronda e trave di colmo
for (const z of [MURO_Z, -MURO_Z]) aggiungi({ mat: 'legno', fase: 'travi', dim: [10.4, 0.12, 0.16], pos: [0, Y_APPOGGIO - 0.06, z], ordine: 0, strato: 'travi', normale: [0, 1, 0] });
aggiungi({ mat: 'legno', fase: 'travi', dim: [X_TETTO * 2, 0.28, 0.16], pos: [0, sottoFalda(0) - 0.14, 0], ordine: 1, strato: 'travi', normale: [0, 1, 0] });

// Un pezzo sulla falda: s lungo la falda dal colmo, d = distanza del centro dalla linea d'intradosso
function falda(lato: 1 | -1, s: number, x: number, lx: number, ls: number, spessore: number, d: number) {
  const z = lato * s * COS;
  const y = sottoFalda(z);
  const n: [number, number, number] = [0, COS, lato * SIN];
  return {
    dim: [lx, spessore, ls] as [number, number, number],
    pos: [x, y + n[1] * d, z + n[2] * d] as [number, number, number],
    rotX: (lato * Math.PI) / 6,
    normale: n,
  };
}
for (const lato of [1, -1] as const) {
  const sc = L_FALDA / 2;
  // Puntoni ogni 80 cm
  for (let x = -6.0, k = 0; x <= 6.001; x += 0.8, k++)
    aggiungi({ mat: 'legno', fase: 'travi', ...falda(lato, sc, x, 0.1, L_FALDA, 0.2, 0.1), ordine: 2 + k, strato: 'travi' });
  // Perlinato: nove fasce dal colmo alla gronda
  for (let k = 0; k < 9; k++) {
    const ls = L_FALDA / 9;
    aggiungi({ mat: 'legno', fase: 'perlinato', ...falda(lato, (k + 0.5) * ls, 0, X_TETTO * 2, ls - 0.01, 0.025, 0.2125), ordine: 8 - k, strato: 'perlinato' });
  }
  aggiungi({ mat: 'membrana', fase: 'freno', ...falda(lato, sc, 0, X_TETTO * 2, L_FALDA, 0.01, 0.23), ordine: 0, strato: 'freno' });
  for (let k = 0; k < 5; k++) {
    const ls = L_FALDA / 5;
    aggiungi({ mat: 'isolante', fase: 'isolante', ...falda(lato, (k + 0.5) * ls, 0, X_TETTO * 2, ls - 0.02, 0.16, 0.315), ordine: 4 - k, strato: 'isolante' });
  }
  aggiungi({ mat: 'membrana', fase: 'telo', ...falda(lato, sc, 0, X_TETTO * 2, L_FALDA, 0.01, 0.4), ordine: 0, strato: 'telo' });
  for (let x = -6.0, k = 0; x <= 6.001; x += 0.6, k++)
    aggiungi({ mat: 'legno', fase: 'listelli', ...falda(lato, sc, x, 0.06, L_FALDA, 0.05, 0.43), ordine: k, strato: 'listelli' });
  // Manto in lamiera aggraffata: pannelli da 50 cm e nervature
  for (let x = -X_TETTO + 0.25, k = 0; x < X_TETTO; x += 0.5, k++) {
    aggiungi({ mat: 'metallo', fase: 'manto', ...falda(lato, sc + 0.04, x, 0.49, L_FALDA + 0.08, 0.012, 0.462), ordine: k, strato: 'manto' });
    aggiungi({ mat: 'metallo', fase: 'manto', ...falda(lato, sc + 0.04, x + 0.25, 0.025, L_FALDA + 0.08, 0.04, 0.485), ordine: k + 0.5, strato: 'manto' });
  }
}
aggiungi({ mat: 'metallo', fase: 'manto', dim: [X_TETTO * 2 + 0.1, 0.06, 0.3], pos: [0, sottoFalda(0) + 0.52, 0], ordine: 30, strato: 'manto', normale: [0, 1, 0] });

// ── Terrazza e pergola sul lato est ──
for (let z = -2.55, k = 0; z <= 2.56; z += 0.14, k++)
  aggiungi({ mat: 'legno', fase: 'decking', dim: [3.8, 0.03, 0.12], pos: [7.1, Y_SOLETTA - 0.015, z], ordine: k });
for (const z of [-2.4, 2.4]) {
  aggiungi({ mat: 'legno', fase: 'pergola', dim: [0.14, 2.7, 0.14], pos: [8.8, Y_SOLETTA + 1.35, z], ordine: 0 });
  aggiungi({ mat: 'legno', fase: 'pergola', dim: [3.8, 0.24, 0.12], pos: [7.1, 3.12, z], ordine: 1 });
}
aggiungi({ mat: 'legno', fase: 'pergola', dim: [0.12, 0.24, 5.2], pos: [8.8, 3.12, 0], ordine: 2 });
for (let z = -2.2, k = 0; z <= 2.21; z += 0.55, k++)
  aggiungi({ mat: 'legno', fase: 'pergola', dim: [3.9, 0.14, 0.06], pos: [7.15, 3.31, z], ordine: 3 + k * 0.3 });

export const PEZZI = pezzi;

// Punti a cui agganciare le etichette nella pagina
export const ANCORE = {
  xlam: [-5.14, 2.4, 1.2],
  solaio: [-2.6, 3.3, 3.6],
  telaio: [5.12, 5.2, -2.0],
  colmo: [-5.5, sottoFalda(0) + 0.1, 0],
  manto: [-3, sottoFalda(2.2) + 0.6, 2.2],
  doghe: [-3.6, 4.8, 4.1],
  pergola: [8.8, 3.2, 2.4],
  quotaL: [2.4, 0.05, 5.6],
  quotaP: [-6.8, 0.05, 0],
  falda: [-2.6, sottoFalda(2.0) + 0.9, 2.0],
} as const;

// Quote del disegno (linee a terra, come in una tavola): misure vere del modello
export const QUOTE: [number, number, number][][] = [
  // larghezza 10,40 m davanti alla casa
  [[-5.2, 0.02, 5.6], [5.2, 0.02, 5.6]],
  [[-5.2, 0.02, 4.25], [-5.2, 0.02, 5.9]],
  [[5.2, 0.02, 4.25], [5.2, 0.02, 5.9]],
  [[-5.4, 0.02, 5.8], [-5.0, 0.02, 5.4]],
  [[5.0, 0.02, 5.8], [5.4, 0.02, 5.4]],
  // profondità 8,00 m sul lato ovest
  [[-6.8, 0.02, -4], [-6.8, 0.02, 4]],
  [[-5.45, 0.02, -4], [-7.1, 0.02, -4]],
  [[-5.45, 0.02, 4], [-7.1, 0.02, 4]],
  [[-7.0, 0.02, -4.2], [-6.6, 0.02, -3.8]],
  [[-7.0, 0.02, 3.8], [-6.6, 0.02, 4.2]],
];
