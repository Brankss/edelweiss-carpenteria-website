# SEO — primo passaggio (5 ottobre 2026)

## Cosa cercano le persone
I suggerimenti di Google (autocomplete IT) mostrano due tipi di ricerca:

- **Locali, con poche varianti:** "tetti in legno trento", "carpenteria legno trento", "case in legno trento", "xlam trento", "costruttori case in legno trentino". Il mercato è piccolo: le pagine devono essere chiare sul luogo, senza fare pagine fotocopia per ogni comune.
- **Informative, con molte varianti:**
  - "costo tetto in legno al mq", "quanto costa rifare il tetto";
  - "tetto ventilato stratigrafia", "isolamento tetto legno";
  - "sopraelevazione in legno su muratura / costi / normativa / adeguamento sismico";
  - "facciata ventilata in legno".

  A queste rispondono le FAQ e la sezione "Com'è fatto un nostro tetto", che è la stratigrafia del tetto ventilato.

## Mappa parole chiave → pagine
| Pagina | Parola chiave principale | Secondarie |
|---|---|---|
| `/` | carpenteria in legno Trento | tetti e case in legno Trentino |
| `/tetti-in-legno/` | tetti in legno Trento | rifacimento tetto, tetto ventilato, abbaini, isolamento tetto legno, costo tetto in legno |
| `/case-in-legno/` | case in legno Trentino | XLAM, telaio, casa al grezzo, bioedilizia |
| `/sopraelevazioni-in-legno/` | sopraelevazione in legno Trento | su muratura, permessi, adeguamento sismico |
| `/facciate-in-legno/` | facciate in legno | facciata ventilata, rivestimento in larice |
| `/tettoie-e-carport/` | tettoia in legno Trento | carport, pergola, veranda, soppalco, decking in larice |
| `/perche-il-legno/` | vantaggi case in legno | terremoto, fuoco, comfort |
| `/realizzazioni/*` | nome del lavoro + comune | (rilevanza locale: Folgaria, Civezzano, Brentonico, Lavis, Trento) |

## Già fatto nel codice
- Un solo H1 per pagina; titoli e descrizioni unici.
- URL canonico su `https://www.edelcarpenteria.com`.
- Dati strutturati JSON-LD:
  - `GeneralContractor` + `RoofingContractor` con P.IVA, indirizzo e orari;
  - `Service` e `FAQPage` sulle pagine dei servizi;
  - `BreadcrumbList`.
- `sitemap-index.xml` (pagine di servizio escluse dalla sitemap: 404), `robots.txt`, `llms.txt`.
- Immagine Open Graph 1200×630 generata per ogni pagina.
- Testi alternativi descrittivi delle immagini; dati EXIF/GPS rimossi dalle foto.
- Lighthouse mobile senza noindex: home 99/100/100/100, altre pagine 98–100.

## Dominio: consiglio
Tenere **edelcarpenteria.com** come dominio unico: è il marchio, coincide con l'email e ha più storia. **tettiinlegnotrento.it** va reindirizzato con redirect 301 pagina per pagina, così si sommano i segnali dei due siti invece di farli competere.

Da verificare con Search Console dopo l'accesso: quale dei due domini ha più clic e link in entrata. Se fosse molto più forte tettiinlegnotrento.it, se ne riparla.

## Mappa dei redirect 301 (da configurare in Vercel al lancio)
| Vecchio URL | Nuovo URL |
|---|---|
| edelcarpenteria.com/ | / |
| /chi-siamo/ | /chi-siamo/ |
| /tetti-in-legno/ | /tetti-in-legno/ |
| /facciate-in-legno/ | /facciate-in-legno/ |
| /case-al-grezzo-avanzato/ | /case-in-legno/ |
| /sopraelevazioni/ | /sopraelevazioni-in-legno/ |
| /realizzazioni/ | /realizzazioni/ |
| /perche-in-legno/ | /perche-il-legno/ |
| /contatti/ | /contatti/ |
| /informativa-modulo-contatto/ | /privacy/ |
| /informazioni-legali/ | /note-legali/ |
| /privacy-policy-e-cookie-policy/ | /privacy/ |
| tettiinlegnotrento.it/ | https://www.edelcarpenteria.com/tetti-in-legno/ |
| tettiinlegnotrento.it/informativa-sulla-privacy/ | https://www.edelcarpenteria.com/privacy/ |
| tettiinlegnotrento.it/cookie-policy/ | https://www.edelcarpenteria.com/cookie/ |
| tettiinlegnotrento.it/informazioni-legali/ | https://www.edelcarpenteria.com/note-legali/ |
| tettiinlegnotrento.it/* (tutto il resto) | https://www.edelcarpenteria.com/tetti-in-legno/ |

## Secondo passaggio, prima del lancio
- [ ] `PUBLIC_ANTEPRIMA=false` e rimuovere `X-Robots-Tag` da `vercel.json`.
- [ ] Rich Results Test e Schema Validator su home, un servizio e una realizzazione.
- [ ] Controllo dei link rotti e dei redirect con `curl -I`.
- [ ] Search Console e Bing Webmaster Tools: verifica del dominio e invio della sitemap.
- [ ] Google Business Profile:
  - categorie "Carpenteria" e "Impresa di coperture";
  - servizi, foto dei lavori, orari;
  - link al sito;
  - QR code per chiedere recensioni ai clienti.
- [ ] Monitorare i 404 per 4 settimane dopo il cambio di dominio.

## Da chiedere al cliente
- Anno e dettagli (misure, materiali) di ogni realizzazione, per arricchire le pagine.
- Il luogo dei lavori senza comune: tetti a quattro falde, facciate, pergola, veranda.
- Numero REA e PEC.
- Numeri aggiornati: sul vecchio sito risultano 220 progetti e 178 clienti.
