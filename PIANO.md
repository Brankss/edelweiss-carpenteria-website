# Piano — Sito Edelweiss Carpenteria

_Redatto il 5 ottobre 2026. Versioni e prezzi verificati in questa data._

## 1. Contesto

- **Cliente:** Edelweiss Carpenteria S.a.s. di Di Bello Luca, Via Masetti 39, Cognola (Trento). P.IVA 02459830226, verificata su VIES.
- **Cosa fanno:** carpenteria del legno. Tetti in legno, case e sopraelevazioni in XLAM e a telaio, facciate e rivestimenti, tettoie, carport e lavori su misura, bioedilizia. Sono circa 6 persone. Hanno un ufficio tecnico interno che modella in 3D con SEMA. Fanno anche strutture al grezzo in tutto il Nord Italia (Verona, Parma, Mestre…).
- **Titolare:** Luca Di Bello. Geometra, diplomato alla HTL di Rankweil (Vorarlberg, la culla dell'architettura contemporanea in legno), con certificazione Certis di carpentiere specializzato.
- **Come nasce il progetto:** è una proposta non richiesta. Il titolare ha detto al telefono che ha già qualcuno che gli gestisce il sito, e la risposta è stata "faccio di meglio". Il sito deve quindi battere quello attuale in modo misurabile e visibile al primo colpo, soprattutto da smartphone.
- **Situazione attuale:** due siti fatti con MotoCMS, fermi al copyright 2021.

  | | edelcarpenteria.com | tettiinlegnotrento.it |
  |---|---|---|
  | Lighthouse mobile, performance | 41 | 55 |
  | LCP (contenuto principale visibile) | 8,5 s | 8,3 s |
  | Peso pagina | 1,5 MB | 1,8 MB |
  | Problemi | 6 H1 nella stessa pagina, banner cookie che copre metà schermo, logo che occupa metà del primo schermo | **P.IVA nel footer non valida su VIES (02366030225)** |

  I due domini si fanno concorrenza sulle stesse ricerche.
- **Obiettivo:** un sito da "10k". Deve trasmettere esclusività e montagna moderna, essere d'impatto ma non banale, senza funzioni pesanti o poco intuitive. Deve essere ottimizzato al massimo per mobile, velocissimo, completo di tutti gli adempimenti legali, con la SEO fatta bene in uno o al massimo due passaggi.

## 2. Decisioni già prese

| Tema | Decisione |
|---|---|
| Skill di design | **Rifatto da zero il 5/10/2026 (v2)** con UI UX Pro Max (design system di partenza), taste skill `design-taste-frontend` (controllo anti-slop), find-skills (installate `gsap-scrolltrigger` di GreenSock e `web-design-guidelines` di Vercel) e 21st.dev via MCP: due componenti presi come idea e riscritti senza React, vedi §3 |
| Ricerca | Ricerca web, lettura delle pagine e browser integrato, a costo zero. Firecrawl (1.000 crediti al mese gratis) solo se serve scansionare interi siti |
| Framework | **Astro 7.3** con output statico e zero JavaScript di default. Nessun framework UI, CSS scritto a mano con token di design |
| Animazioni | **Three.js 0.186** per il cantiere 3D e **GSAP 3.15 + ScrollTrigger** per collegarlo allo scroll, solo in home e caricati alla prima interazione. **Lenis 1.3** per lo scorrimento fluido con la rotella; su touch resta quello nativo. Il resto è in CSS: reveal con `animation-timeline: view()` e transizioni di pagina con `@view-transition`. Tutto si disattiva con "riduci movimento" |
| Hosting | **Vercel** (`@astrojs/vercel@11`), con deploy automatico da GitHub. ⚠️ Il piano Hobby è solo per uso personale e non commerciale: per la demo va bene, **per la messa online serve il piano Pro** (a pagamento) sull'account di chi gestisce il sito. Le immagini vengono ottimizzate da Astro durante la build, non dal servizio immagini di Vercel, così non si consumano i suoi limiti |
| Repository | GitHub privato sull'account `Brankss`, `gh` già autenticato |
| Cookie | **Banner conforme alle Linee guida del Garante (10/6/2021)**: Accetta e Rifiuta con lo stesso peso, la X vale come rifiuto, preferenze riapribili dal footer, scelta valida 6 mesi. Serve perché la **mappa di Google** nella pagina Contatti si carica solo con il consenso. Per il resto il sito usa solo strumenti tecnici: font sul nostro server, social solo come link, antispam con campo nascosto |
| Lingua | **Solo italiano**, con struttura pronta per aggiungere tedesco o inglese (cartelle e testi separati, `lang` e `hreflang` già previsti) |
| Foto | **Le loro**, scaricate dai due siti e ridimensionate. Dove mancano, solo immagini che **non possono essere scambiate per lavori loro**: paesaggi del Trentino (Brenta, Bondone, Paganella) da Unsplash, macro di legno e materiali per le sezioni tecniche, eventualmente generate con l'AI. Mai in una galleria di progetti e mai con didascalie che le attribuiscono a un cantiere. Ogni immagine è tracciata in `docs/crediti-immagini.md` con la sua fonte |
| Prima del pitch | **Tutto il sito pubblico quasi completo, senza backend.** Il form è costruito e valida i campi; nell'anteprima mostra la conferma con la nota "invio attivo alla messa online" |

## 3. Direzione visiva (v3, 5 ottobre 2026)

**Perché la v2 sembrava low quality:**
- le foto di cantiere (circa 1050 px, cieli saturi, ponteggi) erano usate a tutto schermo e sgranate;
- l'effetto a doghe su foto così sembrava un caricamento rotto;
- il lusso era affidato al nero e al vuoto, non a un contenuto proprio.

La v3 tiene palette e tipografia della v2 e cambia il protagonista.

### Il cantiere 3D (home)
Un modello 3D di una casa in legno, generato in codice con Three.js 0.186 (`src/scripts/cantiere/`), resta fisso dietro tutta la home e si costruisce mentre si scorre:
- **Progetto:** prima si vede in linee di progetto, color cuoio, come nel modello dell'ufficio tecnico.
- **Montaggio:** poi i pezzi scendono come portati dalla gru e si materializzano, nell'ordine:
  - fondazione e pareti XLAM (Case in legno);
  - solaio e piano a telaio (Sopraelevazioni);
  - travi, perlinato, freno, isolante, telo, listelli e manto (Tetti);
  - intonaco, doghe in larice e vetri (Facciate);
  - pavimento esterno e pergola (Su misura).
- **Tetto esploso:** dopo il montaggio il tetto si apre nei sette strati di "Com'è fatto un nostro tetto".
- **Casa finita:** in fondo alla pagina la casa è finita, al tramonto, con le finestre accese.

**Pezzi veri:** pareti XLAM con le aperture, montanti ogni 62,5 cm, puntoni ogni 80 cm a 30°, pacchetto del tetto con spessori realistici. Etichette tecniche (Pannelli XLAM, Trave di colmo, …) seguono i pezzi sullo schermo. Una nota dichiara che è un **modello illustrativo**, non un loro cantiere.

**Prestazioni:**
- Three.js (138 KB compressi) e GSAP si caricano solo alla prima interazione. Fino ad allora si vede un'immagine statica identica, ricavata dalla stessa scena (`src/assets/render/`).
- La scena disegna solo quando qualcosa cambia. Su mobile pixel ratio e ombre sono ridotti.
- Con "riduci movimento" o senza WebGL si vede l'immagine della casa finita.

**Le foto vere** restano dove sono una prova: realizzazioni, pagine servizio, chi siamo. Non sono mai più larghe della loro risoluzione e hanno una correzione colore unica (CSS).

### Palette e tipografia (dalla v2)
Tema scuro "nero e cuoio": fondo `#0D0D0B`, testo `#EDEAE3` (16:1), secondario `#A8A49B` (7,8:1), accento `#D1AC82` (9,2:1). Angoli vivi. Geist per i testi, Geist Mono per le note tecniche (etichette, link dei capitoli, briciole).

### Verifica fatta (5/10/2026, build di produzione)
- **Lighthouse mobile:** home **98** (LCP 2,4 s, TBT 0, 208 KB al caricamento), pagine interne **93-100**, accessibilità **100** e best practice **100** ovunque. La SEO risulta 66-69 solo per il `noindex` dell'anteprima.
- **Mobile:** le 31 pagine non hanno scorrimento orizzontale. Ho controllato la coreografia completa a 390 e 1440 px, poi menu, banner cookie, galleria, modulo e "riduci movimento".

## 4. Mappa del sito

| URL | Contenuto |
|---|---|
| `/` | Home: apertura del tetto · cosa costruiamo (elenco a righe: su desktop passando sul nome cambia l'unica foto, su mobile elenco con foto) · realizzazioni in carosello orizzontale con scroll-snap · com'è fatto un nostro tetto · metodo I–IV · chi siamo · mappa · richiesta di sopralluogo |
| `/tetti-in-legno/` | Pagina principale della SEO: tetti nuovi, rifacimento, tetti con abbaini, isolamento e risanamento, FAQ |
| `/case-in-legno/` | XLAM e telaio, strutture al grezzo, bioedilizia |
| `/sopraelevazioni-in-legno/` | Ricerca molto mirata in città (Trento), vantaggi di leggerezza e antisismica |
| `/facciate-in-legno/` | Rivestimenti, larice, ventilazione |
| `/tettoie-e-carport/` | Più pergole, decking, soppalchi e lavori su misura |
| `/realizzazioni/` e `/realizzazioni/[slug]/` | Raccolta di contenuti (Astro content collections). Per ogni progetto: luogo, quota, tipo di lavoro, anno, materiali, galleria. Circa 20 progetti già esistenti |
| `/chi-siamo/` | Luca, il Vorarlberg, la squadra con nomi e mestieri, abilitazioni |
| `/contatti/` | Form, orari (lun–ven 8–12 / 13:30–18), mappa statica, WhatsApp |
| `/privacy/`, `/cookie/`, `/termini/`, `/note-legali/` | Pagine legali (i termini d'uso sono nuovi nella v2) |
| `/grazie/`, `404` | Pagine di servizio |

**Niente pagine fotocopia per ogni comune** (Google le considera "doorway" e le penalizza). La rilevanza locale arriva dalle pagine dei singoli progetti.

## 5. Mobile prima di tutto

- **Barra fissa in basso:** Chiama (`tel:`) e Richiedi un sopralluogo. Si nasconde quando sullo schermo c'è già un invito (hero, modulo, footer) e mentre è aperto il banner dei cookie.
- **Leggibilità e tocco:** aree toccabili ≥48 px, testo ≥16 px nei campi (così iOS non ingrandisce la pagina), margini laterali di 20 px.
- **Form corto con le tastiere giuste:** nome, telefono (tastiera numerica), comune del cantiere, tipo di lavoro (scelta a pulsanti), messaggio.
- **Gallerie:** `<dialog>` nativo con scorrimento a scatto, si sfoglia col dito, zero librerie.
- **Test:** schermi da 360, 390 e 430 px. Safari su iOS e Chrome su Android, sia simulati sia su dispositivi veri.

## 6. Prestazioni (budget obbligatori)

| Metrica | Obiettivo |
|---|---|
| Lighthouse mobile | ≥95 in performance, 100 in accessibilità, best practice e SEO |
| LCP / CLS / INP | <2,0 s / <0,05 / <150 ms |
| JavaScript per pagina | ≤20 KB compresso all'avvio (circa 8 KB nella v2). In home GSAP + ScrollTrigger (44 KB) si caricano dopo, alla prima interazione |
| Peso della home su mobile | ≤600 KB (foto principale in AVIF ≈120 KB) |
| Font | 1 file woff2 precaricato |

Come ci arriviamo:
- immagini con `astro:assets` `<Picture>`, in AVIF/WebP con `srcset`;
- un colore di sfondo come segnaposto mentre le foto caricano;
- caricamento ritardato (lazy) per tutto ciò che non è nel primo schermo;
- transizioni tra pagine native in CSS (`@view-transition`).

## 7. SEO in due passaggi

**Primo passaggio, prima di scrivere i testi**
- Ricerca delle parole chiave: tetti in legno Trento, rifacimento tetto Trento, sopraelevazione in legno, case in legno Trentino, facciate in legno, tettoia in legno, più le varianti con i nomi dei comuni.
- Analisi delle lacune rispetto a 7 concorrenti: Holler/tettiecaseinlegnotrento.it, Isoltetto, De Paoli, Arte Tetto Gentilini, Moser Walter, Ecolegno, Girardi.
- URL, titoli e meta description per ogni pagina, una sola H1, link interni.
- Dati strutturati JSON-LD:
  - `["RoofingContractor","GeneralContractor"]` con indirizzo, orari, zona servita e collegamenti ai social;
  - `Service` per ogni servizio;
  - `BreadcrumbList`;
  - `FAQPage`.
- Sitemap, robots.txt, llms.txt, immagini per la condivisione social (Open Graph).
- **Unificazione dei due domini:** scelta del dominio principale in base a posizionamento e link in entrata, con una mappa dei redirect 301 pagina per pagina dai vecchi URL di entrambi i siti.

**Secondo passaggio, prima del lancio**
- Lighthouse su tutte le pagine.
- Validazione con Rich Results Test e Schema Validator.
- Controllo link rotti, attributi alt, canonical, redirect.

**Fuori dal sito**
- Google Business Profile: categorie, servizi, foto, QR code per chiedere recensioni.
- Search Console e Bing Webmaster Tools con la sitemap.

## 8. Adempimenti legali

- **Footer:** ragione sociale, sede, P.IVA corretta, **REA e PEC (da chiedere al cliente)**. Il capitale sociale non serve, perché una S.a.s. è una società di persone.
- **Privacy policy (GDPR art. 13):** dati del form, fornitore di hosting, servizio di invio email, mappa di Google solo con consenso.
- **Cookie policy:** tabella con gli strumenti usati (scelta sui cookie in localStorage, mappa di Google solo con consenso) e banner conforme al Garante.
- **Termini d'uso:** nuova pagina `/termini/` (informazioni non vincolanti, richieste che non creano contratti, proprietà di testi e foto, foro del consumatore).
- **Note legali.**
- **Nel form:** link all'informativa. La casella di consenso non è obbligatoria, perché la base giuridica è la richiesta di un preventivo.
- **Accessibilità:** WCAG 2.2 AA come buona pratica (le microimprese sono escluse dall'European Accessibility Act). Link per saltare al contenuto, focus visibile, rispetto di "riduci movimento", testi alternativi per le immagini.
- I testi legali li preparo io come bozza. **Prima del lancio vanno rivisti** da un consulente o generati con un servizio tipo iubenda.

## 9. Architettura tecnica

```
src/
  content/realizzazioni/*.md     # schema zod: luogo, quota, tipo, anno, materiali, foto
  components/                    # Header, BottomBar, GableHero, RoofSection, ProjectRail, Process, TrentinoMap, ContactForm, Footer
  layouts/Base.astro             # SEO, JSON-LD, font, view transitions
  pages/…                        # vedi §4
  styles/tokens.css              # palette, scala tipografica, spaziature
  assets/foto/                   # foto loro (originali) + foto d'atmosfera, con fonte
src/pages/api/sopralluogo.ts     # FASE 3: funzione Vercel + email con Resend → edelcarpenteria@gmail.com
public/  robots.txt, llms.txt, favicon/logo SVG
docs/    seo.md, redirect.csv, crediti-immagini.md
```

- **Pacchetti:** `astro@7.3.x`, `@astrojs/vercel@11`, `@astrojs/sitemap@3.7`, CLI `vercel@62`. Mona Sans tramite il provider Fontsource dell'API Fonts di Astro.
- **Rendering:** fino al pitch il sito è al 100% statico. Nella fase 3 si aggiunge solo l'endpoint del form, che gira sul server; tutto il resto resta prerenderizzato.
- **Anteprima:** gli URL di anteprima Vercel hanno `X-Robots-Tag: noindex` più `noindex` nel layout finché non c'è il dominio definitivo.
- **Foto a bassa risoluzione:** se quelle dei loro siti sono piccole, un leggero ingrandimento AI è accettabile (non cambia il contenuto). Ricostruire o inventare dettagli no.
- **CI con GitHub Actions:** build, Lighthouse CI con i budget di §6 (se il budget non è rispettato la build fallisce), controllo dei link.
- **Logo:** ridisegno vettoriale pulito della stella alpina esistente, semplificata perché si legga anche a 24 px, più la scritta in Mona Sans.

## 10. Fasi

| Fase | Contenuto | Risultato |
|---|---|---|
| **0. Setup** | `git init`, repository GitHub privato, scaffold Astro, token, font, CI, collegamento a Vercel per l'anteprima | Repository e URL di anteprima |
| **1. Ricerca + primo passaggio SEO** | Parole chiave, concorrenti, mappa del sito definitiva, brief di ogni pagina, testi in italiano, mappa dei redirect. Raccolta delle foto dai due siti | `docs/seo.md`, testi, foto |
| **2. Design system + home** | Token, logo, componenti chiave (capanna che si apre, disegno del tetto, barra mobile), home completa. Revisione con screenshot a 390 e 1440 px | Home approvata da voi |
| **3. Tutto il frontend pubblico** | Tutte le pagine di §4, tutte le realizzazioni, bozze delle pagine legali, form senza invio, 404. Anteprima `noindex` | **Link da mostrare a Luca** |
| **3b. Report per Luca** | Pagina condivisibile: confronto Lighthouse prima/dopo, P.IVA errata, SEO divisa su due domini, screenshot mobile a confronto | Artifact da inviare |
| **4. Backend** (dopo il sì) | Endpoint del form + Resend, Vercel Web Analytics, piano Pro, foto e dati definitivi del cliente | Sito pronto |
| **5. QA + secondo passaggio SEO** | Vedi §11 | Lista di controllo superata |
| **6. Lancio** | Dominio su Vercel, redirect 301 dai due domini, Search Console, Google Business Profile, controllo dei 404 per 4 settimane | Sito online |

**Costi ricorrenti per il cliente:** il piano Pro di Vercel più il dominio; Resend nel piano gratuito. Il prezzo esatto del Pro va controllato alla firma.

**Account:** Vercel e Resend li create voi (io non creo account). Il login della CLI si fa con `npx vercel login`. In alternativa potete collegare il connettore Vercel su claude.ai.

## 11. Verifica

- `npm run build` senza errori, `npm run preview`.
- Browser integrato a 360, 390, 430 e 1440 px. Screenshot e autocritica secondo frontend-design ("togli un accessorio").
- Lighthouse mobile in locale e in CI su ogni pagina, rispettando i budget di §6.
- Controllo di accessibilità con axe: zero violazioni. Navigazione completa da tastiera, "riduci movimento" attivo.
- Rich Results Test sui dati strutturati, `sitemap.xml` raggiungibile, redirect testati con `curl -I`.
- Form: invio reale, risposta di Turnstile, email ricevuta, gestione degli errori.
- Lista di controllo legale di §8 completa.

## 12. Da decidere / da chiedere al cliente

- **Decisioni prese il 5/10/2026:**
  - foto loro più immagini d'atmosfera che non ingannano;
  - frontend pubblico quasi completo prima del pitch, senza backend;
  - solo italiano, con struttura pronta per altre lingue;
  - hosting su Vercel.
- **Da chiedere al cliente dopo il sì:**
  - numero REA e PEC;
  - logo vettoriale originale;
  - foto ad alta risoluzione;
  - per ogni progetto: anno, materiali, misure;
  - foto della squadra;
  - accesso al registrar dei domini e a Google Business Profile;
  - email a cui ricevere le richieste.
- **Consiglio:** un servizio fotografico di mezza giornata con drone (laboratorio, squadra, travi, tetti al tramonto quando le montagne si tingono di rosa). È la singola cosa che aumenta di più la qualità percepita del sito.
- **Mai usare immagini generate dall'AI spacciandole per lavori loro.**
