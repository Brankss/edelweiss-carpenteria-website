// Scorrimento fluido (Lenis, solo rotella del mouse: su touch resta quello nativo) e caricamento di GSAP
// solo nelle pagine che hanno sezioni animate ([data-gsap]). Con "riduci movimento" non parte nulla.
import Lenis from 'lenis';

const riduci = matchMedia('(prefers-reduced-motion: reduce)').matches;
const radice = document.documentElement;

let lenis: Lenis | null = null;
if (!riduci) {
  lenis = new Lenis({ lerp: 0.12, anchors: { offset: -88 }, autoRaf: false });
  const ciclo = (t: number) => {
    lenis?.raf(t);
    requestAnimationFrame(ciclo);
  };
  requestAnimationFrame(ciclo);
}

// Menu e finestre modali bloccano lo scorrimento della pagina sotto
document.addEventListener('edw:blocca', () => {
  lenis?.stop();
  radice.classList.add('bloccato');
});
document.addEventListener('edw:sblocca', () => {
  lenis?.start();
  radice.classList.remove('bloccato');
});

const sezioni = [...document.querySelectorAll<HTMLElement>('[data-gsap]')];
async function avviaAnimazioni() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  // Su iOS la barra degli indirizzi cambia l'altezza della finestra: non ricalcolare a ogni scorrimento
  ScrollTrigger.config({ ignoreMobileResize: true });
  lenis?.on('scroll', ScrollTrigger.update);

  const moduli: Record<string, () => Promise<{ avvia: (el: HTMLElement, g: typeof gsap) => void }>> = {
    cantiere: () => import('./cantiere/avvio'),
  };
  // In ordine di pagina, dall'alto verso il basso, come chiede ScrollTrigger per i pin
  for (const el of sezioni) {
    const carica = moduli[el.dataset.gsap ?? ''];
    if (carica) (await carica()).avvia(el, gsap);
  }
  // Quando arrivano font e immagini le misure cambiano
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
// GSAP parte alla prima interazione o quando il browser è libero dopo il caricamento:
// così non rallenta la comparsa della foto della hero. Chi inizia subito a scorrere non nota differenze.
if (!riduci && sezioni.length) {
  let avviato = false;
  const eventi = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
  const avvia = () => {
    if (avviato) return;
    avviato = true;
    eventi.forEach((e) => removeEventListener(e, avvia));
    avviaAnimazioni();
  };
  // Solo all'interazione: fino ad allora si vede l'immagine statica, identica al modello in linee di progetto.
  // Così il caricamento della pagina resta leggero anche su telefoni lenti.
  eventi.forEach((e) => addEventListener(e, avvia, { passive: true, once: true }));
  // Se la pagina si apre già scorsa (link a un'ancora, ritorno indietro) il cantiere serve subito
  if (scrollY > 40) avvia();
}
