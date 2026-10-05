// Collega la scena 3D alla pagina: ogni sezione con data-capitolo dice alla scena quanto è avanzata.
import type { gsap as G } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { creaCantiere, type Banda, type Capitolo } from './scena';

function webglDisponibile() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2'));
  } catch {
    return false;
  }
}

export function avvia(contenitore: HTMLElement, _gsap: typeof G) {
  const tela = contenitore.querySelector<HTMLCanvasElement>('[data-tela]');
  if (!tela || !webglDisponibile()) return;

  const leggero = matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
  const etichette = [...contenitore.querySelectorAll<HTMLElement>('[data-etichetta]')];
  let attiveEtichette = new Set<string>();

  const cantiere = creaCantiere(tela, {
    leggero,
    ogniFrame() {
      if (!etichette.length) return;
      const punti = cantiere.ancore();
      for (const el of etichette) {
        const nome = el.dataset.etichetta as keyof typeof punti;
        const p = punti[nome];
        const visibile = attiveEtichette.has(nome) && p?.visibile;
        el.toggleAttribute('data-visibile', Boolean(visibile));
        if (p) {
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
          // Vicino al bordo destro l'etichetta si apre verso sinistra
          el.toggleAttribute('data-sinistra', p.x > tela.clientWidth * 0.6);
        }
      }
    },
  });

  // Etichette tecniche: compaiono quando il pezzo a cui si riferiscono è montato e il capitolo è in corso
  // [nome, da, a]: visibili mentre l'avanzamento del capitolo è tra "da" e "a"
  const ETICHETTE: Partial<Record<Capitolo, [string, number, number][]>> = {
    progetto: [['quotaL', -1, 0.45], ['quotaP', -1, 0.45], ['falda', -1, 0.45]],
    struttura: [['xlam', 0.55, 0.995]],
    piano: [['solaio', 0.25, 0.995], ['telaio', 0.7, 0.995]],
    tetto: [['colmo', 0.25, 0.995], ['manto', 0.92, 0.995]],
    facciata: [['doghe', 0.7, 0.995]],
    misura: [['pergola', 0.85, 0.995]],
  };

  const avanzamento: Partial<Record<Capitolo, number>> = {};
  const sezioni = [...document.querySelectorAll<HTMLElement>('[data-capitolo]')];
  const voceStrati = [...document.querySelectorAll<HTMLElement>('[data-strato-voce]')];

  const aggiorna = (capitolo: Capitolo, p: number) => {
    avanzamento[capitolo] = p;
    cantiere.aggiorna({ [capitolo]: p });
    const nuove = new Set<string>();
    for (const [c, lista] of Object.entries(ETICHETTE) as [Capitolo, [string, number, number][]][]) {
      const v = avanzamento[c] ?? 0;
      for (const [nome, da, a] of lista) if (v > da && v < a) nuove.add(nome);
    }
    // Le quote della prima schermata spariscono appena inizia il cantiere
    if ((avanzamento.struttura ?? 0) > 0.02) ['quotaL', 'quotaP', 'falda'].forEach((n) => nuove.delete(n));
    attiveEtichette = nuove;
  };

  // Strato del tetto attivo: quello la cui scheda attraversa il centro dello schermo
  const visibili = new Set<HTMLElement>();
  const osservaStrati = new IntersectionObserver(
    (voci) => {
      for (const v of voci) v.isIntersecting ? visibili.add(v.target as HTMLElement) : visibili.delete(v.target as HTMLElement);
      const attiva = [...visibili][0];
      voceStrati.forEach((v) => v.toggleAttribute('data-attiva', v === attiva));
      cantiere.strato(attiva ? Number(attiva.dataset.stratoVoce) : -1);
    },
    { rootMargin: '-42% 0px -42% 0px' },
  );
  voceStrati.forEach((v) => osservaStrati.observe(v));

  for (const el of sezioni) {
    const capitolo = el.dataset.capitolo as Capitolo;
    const hero = capitolo === 'progetto';
    const fine = capitolo === 'fine';
    ScrollTrigger.create({
      trigger: el,
      start: hero ? 'top top' : fine ? 'top bottom' : 'top 80%',
      end: hero ? 'bottom top' : fine ? 'bottom bottom' : 'bottom 45%',
      onUpdate: (st) => {
        aggiorna(capitolo, st.progress);
        el.style.setProperty('--a', st.progress.toFixed(4));
      },
      onRefresh: (st) => {
        aggiorna(capitolo, st.progress);
        el.style.setProperty('--a', st.progress.toFixed(4));
      },
    });
  }

  // Blocchi di solo testo sopra il modello: sfumano entrando e uscendo come i capitoli
  for (const el of document.querySelectorAll<HTMLElement>('[data-dissolvi]')) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      end: 'bottom 45%',
      onUpdate: (st) => el.style.setProperty('--a', st.progress.toFixed(4)),
      onRefresh: (st) => el.style.setProperty('--a', st.progress.toFixed(4)),
    });
  }

  // Fasce di colore (pietra, tavola tecnica): quanto schermo coprono. La scena adatta nebbia, griglia e casa,
  // e la velatura scura dietro il testo si spegne
  const presenze: Partial<Record<Banda, number>> = {};
  for (const el of document.querySelectorAll<HTMLElement>('[data-banda]')) {
    const nome = el.dataset.banda as Banda;
    if (nome !== 'chiara' && nome !== 'tavola') continue;
    const misura = () => {
      const r = el.getBoundingClientRect();
      const vh = innerHeight;
      const copertura = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh;
      const presenza = Math.min(1, Math.max(0, (copertura - 0.3) / 0.45));
      presenze[nome] = presenza;
      cantiere.banda(nome, presenza);
      contenitore.style.setProperty('--velo', String(1 - Math.max(presenze.chiara ?? 0, presenze.tavola ?? 0)));
    };
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: misura, onRefresh: misura, onLeave: misura, onLeaveBack: misura });
  }

  // Solo per generare le immagini statiche (scripts di render): ?render espone la scena
  if (new URLSearchParams(location.search).has('render')) (window as unknown as { __cantiere: typeof cantiere }).__cantiere = cantiere;

  new ResizeObserver(() => cantiere.ridimensiona()).observe(tela);
  document.addEventListener('visibilitychange', () => !document.hidden && cantiere.rendi());
  // La scena è pronta: dissolve dall'immagine statica alla tela viva
  requestAnimationFrame(() => requestAnimationFrame(() => contenitore.classList.add('cantiere--pronto')));
}
