// Scena 3D del cantiere (Three.js). Disegna solo quando qualcosa cambia.
// Ogni pezzo ha due vite: la "linea di progetto" (spigoli, come nel modello dell'ufficio tecnico)
// e il pezzo vero, che la gru porta dall'alto e che si materializza nel suo posto.
// Intorno alla casa: la gru a torre che lavora, le Dolomiti all'orizzonte (rosa al tramonto),
// il sole che gira durante il cantiere e le quote del disegno nella prima schermata.
// La tela è trasparente: sotto ci sono le fasce di colore delle sezioni (scuro, pietra, tavola tecnica, sera).
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  GridHelper,
  Group,
  HemisphereLight,
  InstancedBufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
} from 'three';
import { ANCORE, PEZZI, QUOTE, STRATI, type Fase, type Materiale, type Pezzo } from './modello';

// ── Tempi di montaggio: in quale capitolo e in quale tratto del capitolo arriva ogni fase ──
export type Capitolo = 'progetto' | 'struttura' | 'piano' | 'tetto' | 'facciata' | 'misura' | 'esploso' | 'lavori' | 'metodo' | 'fine';
export const CAPITOLI: Capitolo[] = ['progetto', 'struttura', 'piano', 'tetto', 'facciata', 'misura', 'esploso', 'lavori', 'metodo', 'fine'];
export type Banda = 'chiara' | 'tavola';
const TEMPI: Record<Fase, [Capitolo, number, number]> = {
  fondazione: ['struttura', 0.0, 0.22],
  pareti: ['struttura', 0.15, 0.9],
  solaio: ['piano', 0.0, 0.35],
  telaio: ['piano', 0.3, 0.95],
  travi: ['tetto', 0.0, 0.3],
  perlinato: ['tetto', 0.26, 0.44],
  freno: ['tetto', 0.42, 0.5],
  isolante: ['tetto', 0.48, 0.64],
  telo: ['tetto', 0.62, 0.7],
  listelli: ['tetto', 0.68, 0.82],
  manto: ['tetto', 0.8, 0.98],
  intonaco: ['facciata', 0.0, 0.35],
  doghe: ['facciata', 0.2, 0.92],
  vetri: ['facciata', 0.8, 1.0],
  decking: ['misura', 0.0, 0.45],
  pergola: ['misura', 0.35, 1.0],
};

// ── Inquadrature per capitolo ──
// scala: distanza rispetto alla vista base (più grande = casa più piccola)
// scarto: spostamento dell'inquadratura in frazioni dello schermo (x negativo = casa verso destra, y positivo = casa verso l'alto)
export type Vista = {
  pos: [number, number, number];
  mira: [number, number, number];
  scala?: number;
  scalaAlta?: number;
  scarto?: [number, number];
  scartoAlto?: [number, number];
};
const SCARTO: [number, number] = [-0.21, 0.03];
const SCARTO_ALTO: [number, number] = [0, 0.17];
const VISTE: Record<Capitolo, Vista> = {
  progetto: { pos: [22, 13, 25], mira: [1.2, 3.6, 0] },
  struttura: { pos: [21, 9.5, 24], mira: [0.8, 2.2, 0] },
  piano: { pos: [-22, 11, 21], mira: [0.5, 3.6, 0] },
  tetto: { pos: [-18, 19, 18], mira: [0.5, 5.6, 0] },
  facciata: { pos: [18, 7, 24], mira: [0.5, 4.2, 0] },
  misura: { pos: [26, 7, 12], mira: [4.5, 2.8, 0] },
  esploso: { pos: [-27, 13, 25], mira: [0, 7.2, 0] },
  // Sulla fascia chiara la casa diventa un plastico piccolo a destra, le foto stanno a sinistra
  lavori: { pos: [-24, 15, 24], mira: [0.5, 3.8, 0], scala: 1.85, scartoAlto: [-0.22, 0.34], scalaAlta: 1.35, scarto: [-0.35, 0.02] },
  // Sulla tavola tecnica torna disegno, a destra del testo
  metodo: { pos: [-14, 9, 28], mira: [0.5, 4, 0], scala: 1.45, scarto: [-0.3, 0.04], scartoAlto: [0, 0.3], scalaAlta: 1.2 },
  fine: { pos: [23, 5, 26], mira: [0.8, 4.2, 0] },
};

const COLORI: Record<Materiale, string> = {
  legno: '#c99a62',
  xlam: '#dcbd8e',
  cls: '#6e6b65',
  membrana: '#3e4448',
  isolante: '#a9844f',
  metallo: '#4b4e53',
  intonaco: '#e4dccd',
  vetro: '#1c2328',
  acciaio: '#a8864a',
};
const FINITURE: Record<Materiale, { roughness: number; metalness: number }> = {
  legno: { roughness: 0.78, metalness: 0 },
  xlam: { roughness: 0.82, metalness: 0 },
  cls: { roughness: 0.95, metalness: 0 },
  membrana: { roughness: 0.6, metalness: 0 },
  isolante: { roughness: 1, metalness: 0 },
  metallo: { roughness: 0.5, metalness: 0.2 },
  intonaco: { roughness: 0.92, metalness: 0 },
  vetro: { roughness: 0.15, metalness: 0.3 },
  acciaio: { roughness: 0.55, metalness: 0.25 },
};
const FONDI = { scuro: new Color('#0d0d0b'), chiara: new Color('#dedcd6'), tavola: new Color('#13212d') };

// GLSL condiviso: spigoli a spessore costante sullo schermo (derivate delle UV) e rumore per la dissolvenza
const GLSL_SPIGOLO = /* glsl */ `
  float spigolo(vec2 uv, float px) {
    vec2 g = fwidth(uv) * px;
    vec2 a = smoothstep(vec2(0.0), g, uv) * smoothstep(vec2(0.0), g, 1.0 - uv);
    return 1.0 - min(a.x, a.y);
  }
  float caso(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }
`;

function materialeSolido(mat: Materiale, uSera: { value: number }) {
  const m = new MeshStandardMaterial({ color: '#ffffff', ...FINITURE[mat] });
  m.onBeforeCompile = (s) => {
    s.uniforms.uSera = uSera;
    s.uniforms.uVetro = { value: mat === 'vetro' ? 1 : 0 };
    s.vertexShader = s.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute float aStato;
        attribute float aEvidenza;
        varying float vStato;
        varying float vEvidenza;
        varying vec2 vUvB;
        varying vec3 vPosM;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vStato = aStato;
        vEvidenza = aEvidenza;
        vUvB = uv;
        vPosM = (instanceMatrix * vec4(position, 1.0)).xyz;`,
      );
    s.fragmentShader = s.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uSera;
        uniform float uVetro;
        varying float vStato;
        varying float vEvidenza;
        varying vec2 vUvB;
        varying vec3 vPosM;
        ${GLSL_SPIGOLO}`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
        float rumore = caso(floor(vPosM * 9.0));
        if (rumore > vStato) discard;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float bordo = spigolo(vUvB, 1.15);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.42, bordo * 0.85);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float fronte = smoothstep(vStato - 0.12, vStato, rumore) * step(vStato, 0.999);
        totalEmissiveRadiance += vec3(0.82, 0.62, 0.4) * fronte * 0.45;
        totalEmissiveRadiance += vec3(0.82, 0.6, 0.38) * vEvidenza * 0.35;
        float luceStanza = (0.32 + 0.16 * caso(floor(vPosM * 0.7))) * (0.7 + 0.6 * (1.0 - vUvB.y));
        totalEmissiveRadiance += vec3(1.0, 0.52, 0.2) * uVetro * uSera * luceStanza;`,
      );
  };
  return m;
}

function materialeProgetto(uProgetto: { value: number }) {
  const m = new MeshBasicMaterial({ color: '#d1ac82', transparent: true, depthWrite: false, side: DoubleSide });
  m.onBeforeCompile = (s) => {
    s.uniforms.uProgetto = uProgetto;
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>\nattribute float aStato;\nvarying float vStato;\nvarying vec2 vUvB;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\nvStato = aStato;\nvUvB = uv;`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float uProgetto;\nvarying float vStato;\nvarying vec2 vUvB;\n${GLSL_SPIGOLO}`)
      .replace(
        '#include <opaque_fragment>',
        `float linea = spigolo(vUvB, 1.0);
        float a = linea * uProgetto * (1.0 - smoothstep(0.35, 0.9, vStato)) * 0.62;
        if (a < 0.01) discard;
        gl_FragColor = vec4(outgoingLight, a);`,
      );
  };
  return m;
}

// Le Dolomiti: un anello di creste e torri lontane. Al tramonto le cime si accendono di rosa (enrosadira).
function creaMontagne(uRosa: { value: number }, uOpacita: { value: number }) {
  let seme = 7;
  const caso = () => ((seme = (seme * 16807) % 2147483647) - 1) / 2147483646;
  const N = 260;
  const R = 175;
  const altezze: number[] = [];
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    altezze.push(5 + 4 * (0.5 + 0.5 * Math.sin(a * 3 + 0.7)) + 3 * (0.5 + 0.5 * Math.sin(a * 11 + 2)) + caso() * 1.5);
  }
  // Torri strette e verticali, come i gruppi dolomitici
  for (let k = 0; k < 34; k++) {
    const c = Math.floor(caso() * N);
    const h = 5 + caso() * 9;
    const larghezza = 1 + Math.floor(caso() * 3);
    for (let d = -larghezza; d <= larghezza; d++) {
      const i = (c + d + N) % N;
      altezze[i] = Math.max(altezze[i]!, altezze[i]! + h * (1 - Math.abs(d) / (larghezza + 1)));
    }
  }
  altezze[N] = altezze[0]!;
  const pos = new Float32Array((N + 1) * 2 * 3);
  const alt = new Float32Array((N + 1) * 2);
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const x = Math.cos(a) * R;
    const z = Math.sin(a) * R;
    pos.set([x, -3, z, x, altezze[i]!, z], i * 6);
    alt.set([0, 1], i * 2);
  }
  const indici: number[] = [];
  for (let i = 0; i < N; i++) {
    const b = i * 2;
    indici.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3));
  geo.setAttribute('aAlt', new BufferAttribute(alt, 1));
  geo.setIndex(indici);
  const m = new MeshBasicMaterial({ transparent: true, depthWrite: false, fog: false, side: DoubleSide, toneMapped: false });
  m.onBeforeCompile = (s) => {
    s.uniforms.uRosa = uRosa;
    s.uniforms.uOpacita = uOpacita;
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>\nattribute float aAlt;\nvarying float vAlt;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\nvAlt = aAlt;`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float uRosa;\nuniform float uOpacita;\nvarying float vAlt;`)
      .replace(
        '#include <opaque_fragment>',
        `vec3 roccia = mix(vec3(0.045, 0.05, 0.06), vec3(0.1, 0.11, 0.13), vAlt);
        vec3 rosa = vec3(0.78, 0.44, 0.38) * uRosa * pow(vAlt, 2.2);
        gl_FragColor = vec4(roccia + rosa, uOpacita * smoothstep(0.05, 0.6, vAlt));`,
      );
  };
  const mesh = new Mesh(geo, m);
  mesh.renderOrder = -1;
  return mesh;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

interface Istanza {
  pezzo: Pezzo;
  mesh: InstancedMesh;
  indice: number;
  finale: Matrix4;
  inizio: number;
  fine: number;
  capitolo: Capitolo;
  caduta: number;
  giro: number;
  strato: number; // indice dello strato del tetto, -1 se non è nel tetto
}

export interface Cantiere {
  aggiorna: (avanzamenti: Partial<Record<Capitolo, number>>) => void;
  banda: (nome: Banda, presenza: number) => void;
  ancore: () => Record<keyof typeof ANCORE, { x: number; y: number; visibile: boolean }>;
  strato: (indice: number) => void;
  ridimensiona: () => void;
  centra: (si: boolean) => void;
  vista: (v: Vista | null) => void;
  distruggi: () => void;
  rendi: () => void;
}

// Un elemento della gru: un'asta tra due punti, o un blocco
const ASSE_Y = new Vector3(0, 1, 0);
function asta(a: [number, number, number], b: [number, number, number], s: number) {
  const va = new Vector3(...a);
  const vb = new Vector3(...b);
  const d = vb.clone().sub(va);
  const q = new Quaternion().setFromUnitVectors(ASSE_Y, d.clone().normalize());
  return new Matrix4().compose(va.add(vb).multiplyScalar(0.5), q, new Vector3(s, d.length(), s));
}
function blocco(c: [number, number, number], d: [number, number, number]) {
  return new Matrix4().compose(new Vector3(...c), new Quaternion(), new Vector3(...d));
}

export function creaCantiere(tela: HTMLCanvasElement, opzioni: { leggero: boolean; ogniFrame?: () => void }): Cantiere {
  const { leggero } = opzioni;
  const dpr = Math.min(window.devicePixelRatio || 1, leggero ? 1.5 : 2);
  const renderer = new WebGLRenderer({ canvas: tela, antialias: dpr < 2, powerPreference: 'high-performance', alpha: true, premultipliedAlpha: true });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scena = new Scene();
  const nebbia = new Fog(FONDI.scuro.clone(), 28, 70);
  scena.fog = nebbia;

  const camera = new PerspectiveCamera(30, 1, 0.5, 420);

  // Luci: cielo freddo dall'alto, sole caldo che proietta le ombre e gira durante la giornata di cantiere
  const cielo = new HemisphereLight('#c7d3e0', '#241d14', 1.1);
  scena.add(cielo);
  const sole = new DirectionalLight('#ffdcae', 2.6);
  sole.position.set(-9, 15, 11);
  sole.castShadow = true;
  sole.shadow.mapSize.set(leggero ? 1024 : 2048, leggero ? 1024 : 2048);
  Object.assign(sole.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
  sole.shadow.bias = -0.0004;
  sole.shadow.normalBias = 0.02;
  scena.add(sole, sole.target);

  // Terreno: solo ombre, più due griglie (scura sul fondo scuro e sulla pietra, azzurra sulla tavola tecnica)
  const terreno = new PlaneGeometry(140, 140);
  terreno.rotateX(-Math.PI / 2);
  const ombre = new ShadowMaterial({ opacity: 0.5 });
  const piano = new Mesh(terreno, ombre);
  piano.receiveShadow = true;
  scena.add(piano);
  const griglia = new GridHelper(80, 80, '#3a3833', '#24231f');
  const grigliaTavola = new GridHelper(80, 80, '#8aa2b6', '#47607a');
  for (const g of [griglia, grigliaTavola]) {
    (g.material as Material).transparent = true;
    g.position.y = 0.002;
    scena.add(g);
  }

  // Montagne
  const uRosa = { value: 0 };
  const uMontagne = { value: 1 };
  scena.add(creaMontagne(uRosa, uMontagne));

  // Quote del disegno nella prima schermata
  const geoQuote = new BufferGeometry().setFromPoints(QUOTE.flat().map((p) => new Vector3(...p)));
  const matQuote = new LineBasicMaterial({ color: '#d1ac82', transparent: true, opacity: 0.8, depthWrite: false });
  scena.add(new LineSegments(geoQuote, matQuote));

  // ── Istanze della casa ──
  const uSera = { value: 0 };
  const uProgetto = { value: 1 };
  const perMateriale = new Map<Materiale, Pezzo[]>();
  for (const p of PEZZI) perMateriale.set(p.mat, [...(perMateriale.get(p.mat) ?? []), p]);

  const ordini = new Map<Fase, number[]>();
  for (const p of PEZZI) ordini.set(p.fase, [...(ordini.get(p.fase) ?? []), p.ordine]);
  const posizioneInFase = (p: Pezzo) => {
    const valori = [...new Set(ordini.get(p.fase))].sort((a, b) => a - b);
    return valori.length > 1 ? valori.indexOf(p.ordine) / (valori.length - 1) : 0;
  };

  const istanze: Istanza[] = [];
  const mesh: InstancedMesh[] = [];
  const tmp = new Object3D();
  const colore = new Color();

  // InstancedMesh con gli attributi dello shader dei pezzi (la gru li usa fissi: sempre "posata")
  function meshIstanze(mat: Materiale, matrici: Matrix4[]) {
    const geo = new BoxGeometry(1, 1, 1);
    geo.setAttribute('aStato', new InstancedBufferAttribute(new Float32Array(matrici.length).fill(1), 1));
    geo.setAttribute('aEvidenza', new InstancedBufferAttribute(new Float32Array(matrici.length), 1));
    const m = new InstancedMesh(geo, materialeSolido(mat, uSera), matrici.length);
    matrici.forEach((mx, i) => {
      m.setMatrixAt(i, mx);
      m.setColorAt(i, colore.set(COLORI[mat]));
    });
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    mesh.push(m);
    return m;
  }

  for (const [mat, lista] of perMateriale) {
    const geo = new BoxGeometry(1, 1, 1);
    geo.setAttribute('aStato', new InstancedBufferAttribute(new Float32Array(lista.length), 1));
    geo.setAttribute('aEvidenza', new InstancedBufferAttribute(new Float32Array(lista.length), 1));
    const m = new InstancedMesh(geo, materialeSolido(mat, uSera), lista.length);
    m.castShadow = mat !== 'vetro';
    m.receiveShadow = true;
    m.frustumCulled = false;
    lista.forEach((p, i) => {
      tmp.position.set(...p.pos);
      tmp.rotation.set(p.rotX ?? 0, 0, 0);
      tmp.scale.set(...p.dim);
      tmp.updateMatrix();
      const [capitolo, a, b] = TEMPI[p.fase];
      const t = posizioneInFase(p);
      const durata = Math.min(0.35, (b - a) * 0.55);
      const inizio = a + t * (b - a - durata);
      // Leggere variazioni di tono tra un pezzo e l'altro, come nel legno vero
      const v = 0.94 + ((((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1) * 0.12;
      colore.set(COLORI[mat]).multiplyScalar(v);
      m.setColorAt(i, colore);
      istanze.push({
        pezzo: p,
        mesh: m,
        indice: i,
        finale: tmp.matrix.clone(),
        inizio,
        fine: inizio + durata,
        capitolo,
        caduta: p.fase === 'fondazione' || p.fase === 'decking' ? 0 : 2.6 + (i % 5) * 0.35,
        giro: p.fase === 'pareti' || p.fase === 'solaio' ? ((i % 3) - 1) * 0.12 : 0,
        strato: p.strato ? STRATI.indexOf(p.strato) : -1,
      });
      m.setMatrixAt(i, new Matrix4().makeScale(0, 0, 0));
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    scena.add(m);
    mesh.push(m);
  }

  // Linee di progetto: i pezzi strutturali nella posizione finale
  const geoProgetto = new BoxGeometry(1, 1, 1);
  const statoProgetto = new InstancedBufferAttribute(new Float32Array(istanze.length), 1);
  geoProgetto.setAttribute('aStato', statoProgetto);
  const matProgetto = materialeProgetto(uProgetto);
  const progetto = new InstancedMesh(geoProgetto, matProgetto, istanze.length);
  progetto.frustumCulled = false;
  const DETTAGLI: Fase[] = ['doghe', 'manto', 'listelli', 'perlinato', 'isolante', 'freno', 'telo', 'decking', 'intonaco', 'vetri'];
  const zero = new Matrix4().makeScale(0, 0, 0);
  istanze.forEach((s, i) => progetto.setMatrixAt(i, DETTAGLI.includes(s.pezzo.fase) ? zero : s.finale));
  progetto.renderOrder = 2;
  scena.add(progetto);

  // ── Gru a torre, dietro la casa: da quasi tutte le inquadrature resta sullo sfondo, oltre il tetto ──
  const H_GRU = 17;
  const L_BRACCIO = 22;
  const gru = new Group();
  gru.position.set(1.5, 0, -13);
  const w = 0.8;
  const torre: Matrix4[] = [];
  for (const [x, z] of [[-w, -w], [w, -w], [w, w], [-w, w]] as const) torre.push(asta([x, 0, z], [x, H_GRU, z], 0.11));
  const passoTorre = H_GRU / 9;
  for (let k = 0; k < 9; k++) {
    const y0 = k * passoTorre;
    const y1 = y0 + passoTorre;
    torre.push(asta([-w, y1, -w], [w, y1, -w], 0.08), asta([-w, y1, w], [w, y1, w], 0.08), asta([-w, y1, -w], [-w, y1, w], 0.08), asta([w, y1, -w], [w, y1, w], 0.08));
    const s = k % 2 ? 1 : -1;
    torre.push(
      asta([-w * s, y0, -w], [w * s, y1, -w], 0.06),
      asta([w * s, y0, w], [-w * s, y1, w], 0.06),
      asta([-w, y0, -w * s], [-w, y1, w * s], 0.06),
      asta([w, y0, w * s], [w, y1, -w * s], 0.06),
    );
  }
  torre.push(blocco([0, 0.4, 0], [3.4, 0.8, 3.4]));
  gru.add(meshIstanze('acciaio', torre));

  const testa = new Group();
  testa.position.y = H_GRU;
  gru.add(testa);
  const yt = (x: number) => 1.1 - (0.85 * x) / L_BRACCIO;
  const braccio: Matrix4[] = [
    asta([0, 0, -0.45], [L_BRACCIO, 0, -0.45], 0.12),
    asta([0, 0, 0.45], [L_BRACCIO, 0, 0.45], 0.12),
    asta([0, yt(0), 0], [L_BRACCIO, yt(L_BRACCIO), 0], 0.12),
    asta([0, 0, -0.45], [-8, 0, -0.45], 0.12),
    asta([0, 0, 0.45], [-8, 0, 0.45], 0.12),
    asta([0, 0, -0.45], [0, 4.5, 0], 0.12),
    asta([0, 0, 0.45], [0, 4.5, 0], 0.12),
    asta([0, 4.5, 0], [15, yt(15), 0], 0.045),
    asta([0, 4.5, 0], [-7.6, 0, 0], 0.045),
    blocco([0.9, -0.9, 1.15], [1.3, 1.5, 1.2]),
  ];
  for (let x = 0; x < L_BRACCIO; x += 1.5) {
    const x1 = x + 1.5;
    braccio.push(asta([x, 0, -0.45], [x1, yt(x1), 0], 0.05), asta([x, 0, 0.45], [x1, yt(x1), 0], 0.05), asta([x1, 0, -0.45], [x1, 0, 0.45], 0.05));
  }
  for (let x = -2; x >= -8; x -= 2) braccio.push(asta([x, 0, -0.45], [x, 0, 0.45], 0.06));
  testa.add(meshIstanze('acciaio', braccio));
  testa.add(meshIstanze('cls', [blocco([-7, -0.9, 0], [1.4, 1.8, 1.4])]));
  const carrello = meshIstanze('acciaio', [blocco([10, -0.2, 0], [0.9, 0.3, 1.0])]);
  const fune = meshIstanze('membrana', [blocco([10, -3, 0], [0.03, 5, 0.03])]);
  const gancio = meshIstanze('membrana', [blocco([10, -6, 0], [0.35, 0.5, 0.35])]);
  testa.add(carrello, fune, gancio);
  scena.add(gru);

  // Gru: dove sta andando (angolo, raggio, altezza del gancio) e dove si trova ora
  const gruObiettivo = { angolo: 0.6, raggio: 14, gancio: 12 };
  const gruOra = { ...gruObiettivo };

  // ── Stato animato ──
  const obiettivo: Record<Capitolo, number> = Object.fromEntries(CAPITOLI.map((c) => [c, 0])) as Record<Capitolo, number>;
  const attuale = { ...obiettivo };
  const bandeObiettivo: Record<Banda, number> = { chiara: 0, tavola: 0 };
  const bande = { ...bandeObiettivo };
  let stratoAttivo = -1;
  let evidenza = 0;
  const pos = new Vector3();
  const quat = new Quaternion();
  const scala = new Vector3();
  const spostamento = new Vector3();
  const m4 = new Matrix4();
  const giroQ = new Quaternion();
  const asseY = new Vector3(0, 1, 0);
  const soleBase = new Vector3(-9, 15, 11);
  const soleSera = new Vector3(-16, 5, -4);
  const vSole = new Vector3();

  const camPos = new Vector3();
  const camMira = new Vector3();
  const vA = new Vector3();
  const vB = new Vector3();
  let larghezza = 1;
  let altezza = 1;
  let verticale = false;
  let centrato = false;
  let vistaFissa: Vista | null = null;

  function inquadra(tempo: number) {
    // Capitolo attivo: l'ultimo iniziato. La vista passa dalla precedente a quella del capitolo attivo.
    let k = 0;
    for (let i = 0; i < CAPITOLI.length; i++) if (attuale[CAPITOLI[i]!] > 0.001) k = i;
    const da = VISTE[CAPITOLI[Math.max(0, k - 1)]!];
    const a = VISTE[CAPITOLI[k]!];
    const t = k === 0 ? 0 : ease(clamp01(attuale[CAPITOLI[k]!] * 1.6));
    camPos.copy(vA.set(...da.pos)).lerp(vB.set(...a.pos), t);
    camMira.copy(vA.set(...da.mira)).lerp(vB.set(...a.mira), t);
    const scalaDi = (v: Vista) => (verticale ? (v.scalaAlta ?? v.scala ?? 1) : (v.scala ?? 1));
    const scartoDi = (v: Vista) => (verticale ? (v.scartoAlto ?? SCARTO_ALTO) : (v.scarto ?? SCARTO));
    let distanza = MathUtils.lerp(scalaDi(da), scalaDi(a), t);
    const [sx0, sy0] = scartoDi(da);
    const [sx1, sy1] = scartoDi(a);
    let sx = MathUtils.lerp(sx0, sx1, t);
    let sy = MathUtils.lerp(sy0, sy1, t);
    if (vistaFissa) {
      camPos.set(...vistaFissa.pos);
      camMira.set(...vistaFissa.mira);
      distanza = 1;
    }
    // Respiro lento finché si è nella hero
    const respiro = (1 - clamp01(attuale.struttura * 3)) * 0.06;
    if (respiro > 0) {
      const ang = Math.sin(tempo * 0.00012) * respiro * 6;
      camPos.sub(camMira).applyAxisAngle(asseY, ang).add(camMira);
    }
    // Schermi verticali: più lontani, la casa resta intera
    camPos.sub(camMira).multiplyScalar(distanza * (verticale ? 1.95 : 1)).add(camMira);
    camera.position.copy(camPos);
    camera.lookAt(camMira);
    if (centrato || vistaFissa) {
      sx = 0;
      sy = 0;
    }
    camera.setViewOffset(larghezza, altezza, sx * larghezza, sy * altezza, larghezza, altezza);
    camera.updateProjectionMatrix();
    // La nebbia segue la distanza: la casa resta nitida, la griglia sfuma all'orizzonte nel colore del fondo
    const d = camPos.distanceTo(camMira);
    nebbia.near = d * 0.95;
    nebbia.far = d * 2.4;
  }

  function applica() {
    const esplodi = (() => {
      const p = attuale.esploso;
      if (p <= 0) return 0;
      if (p < 0.22) return ease(p / 0.22);
      if (p < 0.86) return 1;
      return 1 - ease(clamp01((p - 0.86) / 0.14));
    })();
    // Sulla tavola tecnica la casa torna disegno: il legno si dissolve, restano le linee
    const linee = ease(bande.tavola);
    const sporchi = new Set<InstancedMesh>();
    let migliore = -1;
    let migliorScarto = 1;
    istanze.forEach((s, i) => {
      const p = attuale[s.capitolo];
      const t = clamp01((p - s.inizio) / Math.max(0.0001, s.fine - s.inizio));
      const visibile = t * (1 - linee);
      statoProgetto.setX(i, visibile);
      const attrStato = s.mesh.geometry.getAttribute('aStato') as InstancedBufferAttribute;
      const attrEv = s.mesh.geometry.getAttribute('aEvidenza') as InstancedBufferAttribute;
      const stato = Math.min(1, t * 2.2) * (1 - linee);
      attrStato.setX(s.indice, stato);
      attrEv.setX(s.indice, s.strato >= 0 && s.strato === stratoAttivo ? evidenza : 0);
      if (t <= 0 || stato <= 0.02) m4.makeScale(0, 0, 0);
      else {
        s.finale.decompose(pos, quat, scala);
        const e = ease(t);
        pos.y += s.caduta * (1 - e);
        if (s.giro) quat.premultiply(giroQ.setFromAxisAngle(asseY, s.giro * (1 - e)));
        if (s.strato >= 0 && esplodi > 0 && s.pezzo.normale) {
          spostamento.set(...s.pezzo.normale).multiplyScalar((s.strato + 0.3) * 0.4 * esplodi);
          pos.add(spostamento);
        }
        m4.compose(pos, quat, scala);
        // La gru segue il pezzo che sta calando (quello a metà discesa)
        if (s.caduta > 0 && t < 1) {
          const scarto = Math.abs(t - 0.5);
          if (scarto < migliorScarto) {
            migliorScarto = scarto;
            migliore = i;
            gruObiettivo.gancio = pos.y + s.pezzo.dim[1] / 2 + 0.6;
            const dx = pos.x - gru.position.x;
            const dz = pos.z - gru.position.z;
            gruObiettivo.angolo = Math.atan2(-dz, dx);
            gruObiettivo.raggio = MathUtils.clamp(Math.hypot(dx, dz), 3, L_BRACCIO - 1);
          }
        }
      }
      s.mesh.setMatrixAt(s.indice, m4);
      sporchi.add(s.mesh);
    });
    if (migliore < 0) gruObiettivo.gancio = H_GRU - 4;
    for (const m of sporchi) {
      m.instanceMatrix.needsUpdate = true;
      (m.geometry.getAttribute('aStato') as InstancedBufferAttribute).needsUpdate = true;
      (m.geometry.getAttribute('aEvidenza') as InstancedBufferAttribute).needsUpdate = true;
    }
    statoProgetto.needsUpdate = true;

    // Linee di progetto: piene nella hero e sulla tavola tecnica, bianche sulla tavola
    uProgetto.value = Math.max(1 - clamp01(attuale.fine * 1.2) * 0.6, linee);
    matProgetto.color.set('#d1ac82').lerp(colore.set('#eaf0f4'), linee);
    // Quote: solo nella prima schermata
    matQuote.opacity = 0.8 * (1 - clamp01(attuale.progetto * 1.6)) * (1 - clamp01(attuale.struttura * 4));

    // La gru si alza con le pareti e si smonta quando il tetto si apre
    const presenzaGru = ease(clamp01(attuale.struttura * 7)) * (1 - ease(clamp01(attuale.esploso * 5))) * (1 - linee);
    gru.visible = presenzaGru > 0.002;
    gru.scale.set(1, Math.max(0.002, presenzaGru), 1);

    // Il sole gira durante la giornata di cantiere, poi tramonta in fondo alla pagina
    const giornata = (attuale.struttura + attuale.piano + attuale.tetto + attuale.facciata + attuale.misura) / 5;
    const sera = ease(clamp01(attuale.fine * 1.3));
    uSera.value = sera;
    uRosa.value = sera;
    vSole.copy(soleBase).applyAxisAngle(asseY, MathUtils.lerp(-0.5, 0.6, giornata));
    sole.position.copy(vSole).lerp(soleSera, sera);
    sole.intensity = MathUtils.lerp(2.6, 1.7, sera);
    sole.color.set('#ffdcae').lerp(colore.set('#ff8648'), sera);
    cielo.intensity = MathUtils.lerp(1.1, 0.7, sera);
    cielo.color.set('#c7d3e0').lerp(colore.set('#7d8fae'), sera);

    // Fondo della sezione sotto la tela: nebbia, griglie, ombre e montagne si adattano
    nebbia.color.copy(FONDI.scuro).lerp(FONDI.chiara, bande.chiara).lerp(FONDI.tavola, bande.tavola);
    // Griglie: ognuna compare solo quando la sua fascia domina lo schermo (nei passaggi restano tenui)
    const scuro = (1 - bande.chiara) * (1 - bande.tavola);
    (griglia.material as Material).opacity = 0.7 * scuro * scuro + 0.32 * bande.chiara ** 3;
    (grigliaTavola.material as Material).opacity = 0.55 * bande.tavola ** 3;
    ombre.opacity = 0.5 * (1 - 0.35 * bande.chiara);
    uMontagne.value = (1 - bande.chiara) * (1 - bande.tavola);
  }

  function muoviGru(k: number) {
    let mosso = false;
    let d = gruObiettivo.angolo - gruOra.angolo;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    if (Math.abs(d) > 0.002) {
      gruOra.angolo += d * k * 0.6;
      mosso = true;
    }
    for (const c of ['raggio', 'gancio'] as const) {
      const v = gruObiettivo[c] - gruOra[c];
      if (Math.abs(v) > 0.01) {
        gruOra[c] += v * k * 0.8;
        mosso = true;
      }
    }
    testa.rotation.y = gruOra.angolo;
    const r = gruOra.raggio;
    const yGancio = gruOra.gancio - H_GRU;
    carrello.setMatrixAt(0, blocco([r, -0.2, 0], [0.9, 0.3, 1.0]));
    fune.setMatrixAt(0, blocco([r, (-0.35 + yGancio + 0.25) / 2, 0], [0.03, Math.max(0.1, -0.35 - yGancio - 0.25), 0.03]));
    gancio.setMatrixAt(0, blocco([r, yGancio, 0], [0.35, 0.5, 0.35]));
    for (const m of [carrello, fune, gancio]) m.instanceMatrix.needsUpdate = true;
    return mosso;
  }

  let ultimo = 0;
  let attivo = true;
  let inMovimento = true;
  function ciclo(tempo: number) {
    if (!attivo) return;
    const dt = Math.min(64, tempo - (ultimo || tempo));
    ultimo = tempo;
    const k = 1 - Math.exp(-dt * 0.0075);
    let mosso = false;
    for (const c of CAPITOLI) {
      const d = obiettivo[c] - attuale[c];
      if (Math.abs(d) > 0.0004) {
        attuale[c] += d * k;
        mosso = true;
      } else attuale[c] = obiettivo[c];
    }
    for (const b of ['chiara', 'tavola'] as const) {
      const d = bandeObiettivo[b] - bande[b];
      if (Math.abs(d) > 0.001) {
        bande[b] += d * k;
        mosso = true;
      } else bande[b] = bandeObiettivo[b];
    }
    const evidenzaObiettivo = stratoAttivo >= 0 ? 1 : 0;
    if (Math.abs(evidenzaObiettivo - evidenza) > 0.002) {
      evidenza += (evidenzaObiettivo - evidenza) * k;
      mosso = true;
    }
    const inHero = attuale.struttura < 0.34;
    const cambiato = mosso || inMovimento || inHero;
    if (cambiato) applica();
    // La gru finisce il suo movimento anche quando la pagina è ferma
    const gruMossa = gru.visible && muoviGru(k);
    if (cambiato || gruMossa) {
      inquadra(tempo);
      renderer.render(scena, camera);
      opzioni.ogniFrame?.();
    }
    inMovimento = false;
    requestAnimationFrame(ciclo);
  }

  function ridimensiona() {
    const w = tela.clientWidth;
    const h = tela.clientHeight;
    if (!w || !h) return;
    larghezza = w;
    altezza = h;
    verticale = h > w * 1.1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    inMovimento = true;
  }

  ridimensiona();
  applica();
  muoviGru(1);
  inquadra(0);
  requestAnimationFrame(ciclo);

  const proiezione = new Vector3();
  return {
    aggiorna(avanzamenti) {
      Object.assign(obiettivo, avanzamenti);
    },
    banda(nome, presenza) {
      bandeObiettivo[nome] = presenza;
    },
    strato(i) {
      stratoAttivo = i;
    },
    ancore() {
      const out = {} as Record<keyof typeof ANCORE, { x: number; y: number; visibile: boolean }>;
      for (const [nome, p] of Object.entries(ANCORE) as [keyof typeof ANCORE, readonly number[]][]) {
        proiezione.set(p[0]!, p[1]!, p[2]!).project(camera);
        out[nome] = { x: (proiezione.x * 0.5 + 0.5) * larghezza, y: (-proiezione.y * 0.5 + 0.5) * altezza, visibile: proiezione.z < 1 };
      }
      return out;
    },
    ridimensiona,
    vista(v) {
      vistaFissa = v;
      inMovimento = true;
    },
    centra(si) {
      centrato = si;
      inMovimento = true;
    },
    rendi() {
      inMovimento = true;
    },
    distruggi() {
      attivo = false;
      renderer.dispose();
      for (const m of mesh) m.geometry.dispose();
    },
  };
}
