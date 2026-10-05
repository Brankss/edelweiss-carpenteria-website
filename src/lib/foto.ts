import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { quote } from '@/data/sito';

const tutte = import.meta.glob<{ default: ImageMetadata }>('/src/assets/foto/*/*.jpg', { eager: true });

/** Foto di una cartella in ordine (la -01 è la copertina). Esclude le versioni ingrandite "-hero". */
export function fotoDi(cartella: string): ImageMetadata[] {
  return Object.entries(tutte)
    .filter(([p]) => p.startsWith(`/src/assets/foto/${cartella}/`) && !p.endsWith('-hero.jpg'))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, m]) => m.default);
}

export function foto(cartella: string, n: number): ImageMetadata {
  const lista = fotoDi(cartella);
  const f = lista[n - 1];
  if (!f) throw new Error(`Foto ${cartella} n.${n} mancante`);
  return f;
}

export type Realizzazione = CollectionEntry<'realizzazioni'>;

export const etichetteCategoria: Record<Realizzazione['data']['categoria'], string> = {
  tetti: 'Tetti',
  case: 'Case',
  sopraelevazioni: 'Sopraelevazioni',
  facciate: 'Facciate',
  'su-misura': 'Su misura',
};

/** "Folgaria, 1166 m" oppure il luogo libero, oppure null */
export function luogoDi(r: Realizzazione): string | null {
  const { comune, luogo } = r.data;
  if (comune && quote[comune]) return `${comune}, ${quote[comune]} m`;
  return luogo ?? comune ?? null;
}

export async function realizzazioni(): Promise<Realizzazione[]> {
  return (await getCollection('realizzazioni')).sort((a, b) => a.data.ordine - b.data.ordine);
}
