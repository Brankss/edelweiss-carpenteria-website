# Edelweiss Carpenteria — sito web

Sito statico in Astro 7 per Edelweiss Carpenteria (Trento). Il piano completo è in [PIANO.md](PIANO.md), la SEO in [docs/seo.md](docs/seo.md).

## Comandi
| Comando | Cosa fa |
|---|---|
| `npm run dev` | Server di sviluppo su http://localhost:4321 |
| `npm run build` | Build statica in `dist/` |
| `npm run preview` | Serve la build |
| `npm run check` | Controllo dei tipi |
| `node scripts/lighthouse.mjs http://localhost:4322 / /tetti-in-legno/` | Lighthouse mobile sulle pagine indicate |

## Dove sono le cose
- `src/data/sito.ts`: dati dell'azienda (P.IVA, telefono, orari) e flag `ANTEPRIMA`.
- `src/data/servizi.ts`: testi delle cinque pagine di servizio.
- `src/content/realizzazioni/*.md`: un file per ogni lavoro; le foto stanno in `src/assets/foto/<cartella>/`.
- `src/components/Apertura.astro`: la capanna che si apre scorrendo (solo CSS).
- `src/components/Stratigrafia.astro`: il disegno degli strati del tetto (solo CSS).
- `scripts/import-foto.mjs`: importa le foto dai vecchi siti, rimuove gli EXIF e scrive `docs/crediti-immagini.md`.

## Anteprima e lancio
Finché `PUBLIC_ANTEPRIMA` non vale `false`, il sito è `noindex` e il form non invia nulla. Al lancio:
1. impostare `PUBLIC_ANTEPRIMA=false` su Vercel;
2. togliere `X-Robots-Tag` da `vercel.json`;
3. aggiungere l'endpoint del form (fase 4 del piano);
4. configurare i redirect elencati in `docs/seo.md`.
