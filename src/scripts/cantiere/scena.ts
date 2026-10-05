// Scena 3D del cantiere (Three.js). Disegna solo quando qualcosa cambia.
// Ogni pezzo ha due vite: la "linea di progetto" (spigoli color cuoio, come nel modello dell'ufficio tecnico)
// e il pezzo vero, che scende dall'alto come portato dalla gru e si materializza nel suo posto.
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  Color,
  DirectionalLight,
  Fog,
  GridHelper,
  HemisphereLight,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  Mesh,
  DoubleSide,
  Matrix4,
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
import { ANCORE, PEZZI, STRATI, type Fase, type Materiale, type Pezzo } from './modello';

// ── Tempi di montaggio: in quale capitolo e in quale tratto del capitolo arriva ogni fase ──
export type Capitolo = 'progetto' | 'struttura' | 'piano' | 'tetto' | 'facciata' | 'misura' | 'esploso' | 'lavori' | 'metodo' | 'fine';
export const CAPITOLI: Capitolo[] = ['progetto', 'struttura', 'piano', 'tetto', 'facciata', 'misura', 'esploso', 'lavori', 'metodo', 'fine'];
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

// ── Inquadrature per capitolo (posizione, punto guardato) ──
type Vista = { pos: [number, number, number]; mira: [number, number, number] };
const VISTE: Record<Capitolo, Vista> = {
  progetto: { pos: [22, 13, 25], mira: [1.2, 3.6, 0] },
  struttura: { pos: [21, 9.5, 24], mira: [0.8, 2.2, 0] },
  piano: { pos: [-22, 11, 21], mira: [0.5, 3.6, 0] },
  tetto: { pos: [-18, 19, 18], mira: [0.5, 5.6, 0] },
  facciata: { pos: [18, 7, 24], mira: [0.5, 4.2, 0] },
  misura: { pos: [26, 7, 12], mira: [4.5, 2.8, 0] },
  esploso: { pos: [-27, 13, 25], mira: [0, 7.2, 0] },
  lavori: { pos: [-24, 13, 24], mira: [0, 3.5, 0] },
  metodo: { pos: [-12, 8, 29], mira: [0.5, 4, 0] },
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
};

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
  ancore: () => Record<keyof typeof ANCORE, { x: number; y: number; visibile: boolean }>;
  strato: (indice: number) => void;
  ridimensiona: () => void;
  centra: (si: boolean) => void;
  vista: (v: Vista | null) => void;
  distruggi: () => void;
  rendi: () => void;
}

export function creaCantiere(tela: HTMLCanvasElement, opzioni: { leggero: boolean; ogniFrame?: () => void }): Cantiere {
  const { leggero } = opzioni;
  const dpr = Math.min(window.devicePixelRatio || 1, leggero ? 1.5 : 2);
  const renderer = new WebGLRenderer({ canvas: tela, antialias: dpr < 2, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const sfondo = new Color('#0d0d0b');
  const scena = new Scene();
  scena.background = sfondo;
  const nebbia = new Fog(sfondo, 28, 70);
  scena.fog = nebbia;

  const camera = new PerspectiveCamera(30, 1, 0.5, 200);

  // Luci: cielo freddo dall'alto, sole basso e caldo che proietta le ombre
  const cielo = new HemisphereLight('#c7d3e0', '#241d14', 1.1);
  scena.add(cielo);
  const sole = new DirectionalLight('#ffdcae', 2.6);
  sole.position.set(-9, 15, 11);
  sole.castShadow = true;
  sole.shadow.mapSize.set(leggero ? 1024 : 2048, leggero ? 1024 : 2048);
  Object.assign(sole.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 50 });
  sole.shadow.bias = -0.0004;
  sole.shadow.normalBias = 0.02;
  scena.add(sole, sole.target);

  // Terreno: solo ombre, più una griglia da tavolo da disegno che sfuma nella nebbia
  const terreno = new PlaneGeometry(120, 120);
  terreno.rotateX(-Math.PI / 2);
  const piano = new Mesh(terreno, new ShadowMaterial({ opacity: 0.5 }));
  piano.receiveShadow = true;
  scena.add(piano);
  const griglia = new GridHelper(80, 80, '#3a3833', '#24231f');
  (griglia.material as Material).transparent = true;
  (griglia.material as Material).opacity = 0.7;
  griglia.position.y = 0.002;
  scena.add(griglia);

  // ── Istanze ──
  const uSera = { value: 0 };
  const uProgetto = { value: 1 };
  const perMateriale = new Map<Materiale, Pezzo[]>();
  for (const p of PEZZI) perMateriale.set(p.mat, [...(perMateriale.get(p.mat) ?? []), p]);

  // Ordine normalizzato dentro ogni fase
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
      const v = 0.94 + ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 0.12;
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

  // Linee di progetto: tutti i pezzi nella posizione finale
  const geoProgetto = new BoxGeometry(1, 1, 1);
  const statoProgetto = new InstancedBufferAttribute(new Float32Array(istanze.length), 1);
  geoProgetto.setAttribute('aStato', statoProgetto);
  const progetto = new InstancedMesh(geoProgetto, materialeProgetto(uProgetto), istanze.length);
  progetto.frustumCulled = false;
  const DETTAGLI: Fase[] = ['doghe', 'manto', 'listelli', 'perlinato', 'isolante', 'freno', 'telo', 'decking', 'intonaco', 'vetri'];
  const zero = new Matrix4().makeScale(0, 0, 0);
  istanze.forEach((s, i) => progetto.setMatrixAt(i, DETTAGLI.includes(s.pezzo.fase) ? zero : s.finale));
  progetto.renderOrder = 2;
  scena.add(progetto);

  // ── Stato animato ──
  const obiettivo: Record<Capitolo, number> = Object.fromEntries(CAPITOLI.map((c) => [c, 0])) as Record<Capitolo, number>;
  const attuale = { ...obiettivo };
  let stratoAttivo = -1;
  let evidenza = 0;
  const pos = new Vector3();
  const quat = new Quaternion();
  const scala = new Vector3();
  const spostamento = new Vector3();
  const m4 = new Matrix4();
  const giroQ = new Quaternion();
  const asseY = new Vector3(0, 1, 0);

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
    if (vistaFissa) {
      camPos.set(...vistaFissa.pos);
      camMira.set(...vistaFissa.mira);
    }
    // Respiro lento finché si è nella hero
    const respiro = (1 - clamp01(attuale.struttura * 3)) * 0.06;
    if (respiro > 0) {
      const ang = Math.sin(tempo * 0.00012) * respiro * 6;
      camPos.sub(camMira).applyAxisAngle(asseY, ang).add(camMira);
    }
    // Schermi verticali: più lontani, la casa resta intera
    if (verticale) camPos.sub(camMira).multiplyScalar(1.95).add(camMira);
    camera.position.copy(camPos);
    camera.lookAt(camMira);
    // La nebbia segue la distanza: la casa resta nitida, la griglia sfuma all'orizzonte
    const distanza = camPos.distanceTo(camMira);
    nebbia.near = distanza * 0.95;
    nebbia.far = distanza * 2.4;
  }

  function applica() {
    const esplodi = (() => {
      const p = attuale.esploso;
      if (p <= 0) return 0;
      if (p < 0.22) return ease(p / 0.22);
      if (p < 0.86) return 1;
      return 1 - ease(clamp01((p - 0.86) / 0.14));
    })();
    const sporchi = new Set<InstancedMesh>();
    istanze.forEach((s, i) => {
      const p = attuale[s.capitolo];
      const t = clamp01((p - s.inizio) / Math.max(0.0001, s.fine - s.inizio));
      const stato = t;
      statoProgetto.setX(i, stato);
      const attrStato = s.mesh.geometry.getAttribute('aStato') as InstancedBufferAttribute;
      const attrEv = s.mesh.geometry.getAttribute('aEvidenza') as InstancedBufferAttribute;
      attrStato.setX(s.indice, Math.min(1, t * 2.2));
      attrEv.setX(s.indice, s.strato >= 0 && s.strato === stratoAttivo ? evidenza : 0);
      if (t <= 0) m4.makeScale(0, 0, 0);
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
      }
      s.mesh.setMatrixAt(s.indice, m4);
      sporchi.add(s.mesh);
    });
    for (const m of sporchi) {
      m.instanceMatrix.needsUpdate = true;
      (m.geometry.getAttribute('aStato') as InstancedBufferAttribute).needsUpdate = true;
      (m.geometry.getAttribute('aEvidenza') as InstancedBufferAttribute).needsUpdate = true;
    }
    statoProgetto.needsUpdate = true;
    // Linee di progetto più presenti all'inizio, poi lasciano il posto al legno
    uProgetto.value = 1 - clamp01(attuale.fine * 1.2) * 0.6;
    // Sera in fondo alla pagina: sole più basso e caldo, finestre accese
    const sera = ease(clamp01(attuale.fine * 1.3));
    uSera.value = sera;
    // Tramonto: sole basso in controluce, cielo freddo
    sole.intensity = MathUtils.lerp(2.6, 1.7, sera);
    sole.color.set('#ffdcae').lerp(colore.set('#ff8648'), sera);
    sole.position.set(MathUtils.lerp(-9, -16, sera), MathUtils.lerp(15, 5, sera), MathUtils.lerp(11, -4, sera));
    cielo.intensity = MathUtils.lerp(1.1, 0.7, sera);
    cielo.color.set('#c7d3e0').lerp(colore.set('#7d8fae'), sera);
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
    const evidenzaObiettivo = stratoAttivo >= 0 ? 1 : 0;
    if (Math.abs(evidenzaObiettivo - evidenza) > 0.002) {
      evidenza += (evidenzaObiettivo - evidenza) * k;
      mosso = true;
    }
    const inHero = attuale.struttura < 0.34;
    if (mosso || inMovimento || inHero) {
      applica();
      inquadra(tempo);
      renderer.render(scena, camera);
      opzioni.ogniFrame?.();
      inMovimento = false;
    }
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
    // Il modello si sposta dove non c'è il testo: a destra su desktop, in alto su mobile
    if (centrato) camera.clearViewOffset();
    else if (verticale) camera.setViewOffset(w, h, 0, h * 0.17, w, h);
    else camera.setViewOffset(w, h, -w * 0.21, h * 0.03, w, h);
    camera.updateProjectionMatrix();
    inMovimento = true;
  }

  ridimensiona();
  applica();
  inquadra(0);
  requestAnimationFrame(ciclo);

  const proiezione = new Vector3();
  return {
    aggiorna(avanzamenti) {
      Object.assign(obiettivo, avanzamenti);
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
      ridimensiona();
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
