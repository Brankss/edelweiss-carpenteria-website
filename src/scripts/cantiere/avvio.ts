// Collega la scena 3D alla pagina: ogni sezione con data-capitolo dice alla scena quanto è avanzata.
import type { gsap as G } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { creaCantiere, type Capitolo } from './scena';

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
  const ETICHETTE: Partial<Record<Capitolo, [string, number][]>> = {
    struttura: [['xlam', 0.55]],
    piano: [['solaio', 0.25], ['telaio', 0.7]],
    tetto: [['colmo', 0.25], ['manto', 0.92]],
    facciata: [['doghe', 0.7]],
    misura: [['pergola', 0.85]],
  };

  const avanzamento: Partial<Record<Capitolo, number>> = {};
  const sezioni = [...document.querySelectorAll<HTMLElement>('[data-capitolo]')];
  const voceStrati = [...document.querySelectorAll<HTMLElement>('[data-strato-voce]')];

  const aggiorna = (capitolo: Capitolo, p: number) => {
    avanzamento[capitolo] = p;
    cantiere.aggiorna({ [capitolo]: p });
    const nuove = new Set<string>();
    for (const [c, lista] of Object.entries(ETICHETTE) as [Capitolo, [string, number][]][]) {
      const v = avanzamento[c] ?? 0;
      for (const [nome, soglia] of lista) if (v > soglia && v < 0.995) nuove.add(nome);
    }
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

  // Solo per generare le immagini statiche (scripts di render): ?render espone la scena
  if (new URLSearchParams(location.search).has('render')) (window as unknown as { __cantiere: typeof cantiere }).__cantiere = cantiere;

  new ResizeObserver(() => cantiere.ridimensiona()).observe(tela);
  document.addEventListener('visibilitychange', () => !document.hidden && cantiere.rendi());
  // La scena è pronta: dissolve dall'immagine statica alla tela viva
  requestAnimationFrame(() => requestAnimationFrame(() => contenitore.classList.add('cantiere--pronto')));
}
