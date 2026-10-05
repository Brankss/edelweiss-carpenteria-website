// Scelta sui cookie salvata nel browser (localStorage, strumento tecnico: non richiede consenso).
// Dopo 6 mesi la scelta scade e il banner ricompare, come indicato dal Garante.
const CHIAVE = 'edw-consenso';
const VERSIONE = 1;
const DURATA = 1000 * 60 * 60 * 24 * 180;

export interface Consenso {
  mappe: boolean;
}

export function leggiConsenso(): Consenso | null {
  try {
    const grezzo = localStorage.getItem(CHIAVE);
    if (!grezzo) return null;
    const dato = JSON.parse(grezzo) as { v: number; mappe: boolean; data: number };
    if (dato.v !== VERSIONE || Date.now() - dato.data > DURATA) return null;
    return { mappe: Boolean(dato.mappe) };
  } catch {
    return null;
  }
}

export function salvaConsenso(c: Consenso) {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify({ v: VERSIONE, mappe: c.mappe, data: Date.now() }));
  } catch {
    // Archiviazione non disponibile (navigazione privata): la scelta vale solo per questa pagina
  }
  document.dispatchEvent(new CustomEvent<Consenso>('edw:consenso', { detail: c }));
}
