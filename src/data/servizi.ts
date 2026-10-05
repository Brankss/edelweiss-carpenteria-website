import type { ImageMetadata } from 'astro';
import { foto } from '@/lib/foto';

export interface Faq {
  d: string;
  r: string;
}
export interface Servizio {
  slug: string;
  nome: string; // nome breve, per elenchi e menu
  riga: string; // una riga per l'elenco in home
  titoloSeo: string;
  descrizione: string;
  h1: string;
  intro: string;
  copertina: ImageMetadata;
  altCopertina: string;
  sezioni: { titolo: string; testo: string[] }[];
  striscia: { foto: ImageMetadata; alt: string }[];
  categorie: string[];
  faq: Faq[];
}

export const servizi: Servizio[] = [
  {
    slug: 'tetti-in-legno',
    nome: 'Tetti in legno',
    riga: 'Nuovi tetti e rifacimenti, con abbaini, isolamento e ventilazione.',
    titoloSeo: 'Tetti in legno a Trento: nuovi tetti e rifacimenti',
    descrizione:
      'Progettiamo e costruiamo tetti in legno in provincia di Trento: nuove coperture, rifacimenti, abbaini, isolamento e ventilazione. Sopralluogo e preventivo gratuiti.',
    h1: 'Tetti in legno',
    intro:
      'Nuovi tetti e rifacimenti in tutta la provincia di Trento. Disegniamo la struttura nel nostro ufficio tecnico, la prepariamo su misura e la montiamo con la nostra squadra.',
    copertina: foto('quattro-falde-abbaini', 1),
    altCopertina: 'Struttura in legno di un tetto a quattro falde con abbaini, prima del tavolato',
    sezioni: [
      {
        titolo: 'Nuovi tetti',
        testo: [
          'Per una casa nuova o per sostituire una copertura in laterocemento. Il legno pesa molto meno di un solaio gettato in opera, si monta a secco e lascia la casa coperta in tempi brevi.',
          'Travi, puntoni e travetti sono dimensionati per la luce da coprire e per il carico neve della quota a cui si trova la casa.',
        ],
      },
      {
        titolo: 'Rifacimento del tetto',
        testo: [
          "Quando il tetto lascia passare l'acqua, è freddo d'inverno o caldo d'estate. Smontiamo il vecchio manto, verifichiamo le travi e rifacciamo il pacchetto: isolamento, ventilazione e impermeabilizzazione.",
          'Le travi sane si tengono, quelle ammalorate si sostituiscono. Ve lo diciamo al sopralluogo, prima del preventivo.',
        ],
      },
      {
        titolo: 'Abbaini e sottotetti',
        testo: [
          'Un abbaino porta luce e altezza nel sottotetto e lo rende abitabile. A Folgaria li abbiamo assemblati a terra e portati in quota con la gru: meno giorni con il tetto aperto.',
        ],
      },
      {
        titolo: 'Isolamento e ventilazione',
        testo: [
          "Usiamo isolanti densi, in fibra di legno o lana di roccia da almeno 140 kg/m³: oltre al freddo fermano anche il caldo d'estate. Sul tetto evitiamo isolanti leggeri come il polistirene.",
          "Sopra l'isolante lasciamo sempre una camera d'aria ventilata, che tiene asciutto il pacchetto.",
        ],
      },
    ],
    striscia: [
      { foto: foto('folgaria', 2), alt: 'Abbaino in legno sollevato dalla gru sopra le case di Folgaria' },
      { foto: foto('quattro-falde', 1), alt: 'Soffitto in legno a vista sotto un tetto a quattro falde' },
      { foto: foto('barbaniga', 2), alt: 'Sporto del tetto con travi nuove su un edificio in pietra a Barbaniga' },
    ],
    categorie: ['tetti'],
    faq: [
      {
        d: 'Quanto costa un tetto in legno?',
        r: 'Dipende soprattutto da superficie, forma del tetto (due o quattro falde, abbaini), spessore dell’isolamento, tipo di manto e accessibilità del cantiere. Per questo il preventivo lo facciamo dopo il sopralluogo: è gratuito e vi lascia un prezzo chiaro, voce per voce.',
      },
      {
        d: 'Conviene un tetto ventilato?',
        r: 'In montagna quasi sempre. La camera d’aria sotto il manto porta via il caldo d’estate e l’umidità d’inverno, e riduce il ghiaccio sulle gronde.',
      },
      {
        d: 'Serve un permesso per rifare il tetto?',
        r: 'Dipende dal comune e dal tipo di intervento: rifare un tetto con la stessa forma è diverso da cambiarne altezza o pendenza. Ve lo diciamo al sopralluogo e, se serve, lavoriamo insieme al vostro tecnico.',
      },
      {
        d: 'Quanto dura un tetto in legno?',
        r: 'Un tetto in legno ben progettato e protetto dall’acqua dura decenni, come dimostrano i tetti delle case di montagna. Contano soprattutto la ventilazione, la qualità del manto e la manutenzione delle lattonerie.',
      },
    ],
  },
  {
    slug: 'case-in-legno',
    nome: 'Case in legno',
    riga: 'Case in XLAM e a telaio, dal grezzo alla struttura completa.',
    titoloSeo: 'Case in legno in Trentino: XLAM e telaio',
    descrizione:
      'Costruiamo case in legno in XLAM e a telaio: pareti, solai e tetto. In Trentino e, per le strutture al grezzo, in tutto il Nord Italia. Preventivo gratuito.',
    h1: 'Case in legno',
    intro:
      'Case in XLAM e a telaio, dalla struttura al tetto. In Trentino seguiamo tutto il lavoro in legno; nel resto del Nord Italia montiamo strutture al grezzo per imprese e privati.',
    copertina: foto('case-xlam', 1),
    altCopertina: 'Pareti in pannelli XLAM con aperture ad arco, montate al grezzo',
    sezioni: [
      {
        titolo: 'XLAM',
        testo: [
          'Pannelli massicci di tavole incrociate e incollate. Arrivano in cantiere già tagliati, con le aperture per porte e finestre: la struttura si alza in tempi brevi ed è molto rigida, adatta anche a edifici su più piani.',
        ],
      },
      {
        titolo: 'Telaio',
        testo: [
          "Montanti e traversi in legno, chiusi da pannelli e riempiti di isolante. È leggero, flessibile nel progetto e permette pareti molto isolate con spessori contenuti.",
        ],
      },
      {
        titolo: 'Al grezzo o completa',
        testo: [
          "Possiamo fermarci alla struttura, cioè pareti, solai e copertura, oppure seguire anche isolamento, facciate e tetto finito. Decidete voi fin dove arrivare: il preventivo lo dice chiaramente.",
        ],
      },
      {
        titolo: 'Bioedilizia',
        testo: ['Su richiesta: pareti in legno senza colla, isolanti in canapa e sughero, finiture in argilla.'],
      },
    ],
    striscia: [
      { foto: foto('case-xlam', 3), alt: 'Casa in legno a due piani con il ponteggio, prima delle finiture' },
      { foto: foto('case-xlam', 6), alt: 'Travi del tetto di una casa in legno viste dall’interno' },
      { foto: foto('case-xlam', 2), alt: 'Pannelli in legno di un solaio al tramonto' },
    ],
    categorie: ['case', 'sopraelevazioni'],
    faq: [
      {
        d: 'Una casa in legno resiste ai terremoti?',
        r: 'Il legno è leggero ed elastico: con collegamenti in acciaio ben progettati dissipa l’energia del sisma. Il progetto SOFIE del CNR-IVALSA lo ha mostrato con un edificio in XLAM di sette piani provato su tavola vibrante.',
      },
      {
        d: 'E con il fuoco?',
        r: 'Il legno massiccio brucia lentamente dall’esterno: lo strato carbonizzato protegge il cuore della trave, che continua a portare. Una struttura in legno ben dimensionata cede in modo graduale, non all’improvviso.',
      },
      {
        d: 'Quanto tempo serve per costruirla?',
        r: 'La struttura arriva in cantiere già preparata, quindi si monta molto più in fretta di una in muratura. I tempi esatti dipendono dal progetto e li trovate scritti nel preventivo.',
      },
    ],
  },
  {
    slug: 'sopraelevazioni-in-legno',
    nome: 'Sopraelevazioni',
    riga: 'Un piano in più sulla casa che avete già, leggero e antisismico.',
    titoloSeo: 'Sopraelevazioni in legno a Trento',
    descrizione:
      'Un piano in più sulla vostra casa con una sopraelevazione in legno: leggera, antisismica e veloce da montare. XLAM e telaio, in provincia di Trento.',
    h1: 'Sopraelevazioni in legno',
    intro:
      'Un piano in più sulla casa che avete già. Il legno pesa poco: carica meno l’edificio esistente e si monta in fretta, così la casa resta scoperta per meno tempo.',
    copertina: foto('sopraelevazione-cadore', 1),
    altCopertina: 'Solaio in XLAM di una sopraelevazione in Cadore, con le Dolomiti sullo sfondo',
    sezioni: [
      {
        titolo: 'Perché in legno',
        testo: [
          'Un piano in muratura aggiunge molto peso e spesso obbliga a rinforzare tutto l’edificio. Una struttura in legno pesa una frazione, e in molti casi semplifica l’adeguamento sismico.',
        ],
      },
      {
        titolo: 'Come lavoriamo',
        testo: [
          'Il vostro tecnico verifica l’edificio esistente; noi disegniamo la struttura in legno in 3D e prepariamo pareti, solaio e tetto. In cantiere il montaggio con la gru è rapido e la casa torna coperta in poco tempo.',
        ],
      },
      {
        titolo: 'XLAM o telaio',
        testo: [
          'Per le sopraelevazioni usiamo entrambi i sistemi. Scegliamo insieme in base al progetto, agli spessori e ai tempi: trovate le differenze nella pagina sulle case in legno.',
        ],
      },
    ],
    striscia: [
      { foto: foto('sopraelevazione-trento', 1), alt: 'Trave sollevata dalla gru sopra la città di Trento' },
      { foto: foto('sopraelevazione-cadore', 3), alt: 'Carpentiere al lavoro sulla struttura del tetto in Cadore' },
      { foto: foto('sopraelevazione-trento', 16), alt: 'Casa a Trento con il nuovo piano in legno finito' },
    ],
    categorie: ['sopraelevazioni'],
    faq: [
      {
        d: 'Si può sopraelevare una casa in muratura?',
        r: 'Spesso sì, ma lo stabilisce la verifica strutturale dell’edificio esistente, fatta da un ingegnere. Il legno, essendo leggero, è la soluzione che più spesso la supera.',
      },
      {
        d: 'Serve un permesso?',
        r: 'Sì: una sopraelevazione aumenta il volume e richiede un titolo edilizio e il deposito del progetto strutturale. Il percorso lo segue il vostro progettista, con cui lavoriamo sui dettagli della struttura in legno.',
      },
      {
        d: 'Si può restare in casa durante i lavori?',
        r: 'Dipende dal cantiere. Con il legno la fase in cui la casa è scoperta è breve, e spesso i piani di sotto restano abitabili.',
      },
    ],
  },
  {
    slug: 'facciate-in-legno',
    nome: 'Facciate in legno',
    riga: 'Rivestimenti in larice e abete, in stile montano o contemporaneo.',
    titoloSeo: 'Facciate e rivestimenti in legno a Trento',
    descrizione:
      'Facciate ventilate e rivestimenti in legno di larice e abete, in stile montano o contemporaneo. Progetto e posa in provincia di Trento.',
    h1: 'Facciate in legno',
    intro:
      'Rivestimenti in larice e abete, in stile montano o contemporaneo. Li montiamo sempre ventilati: il legno resta asciutto e invecchia in modo uniforme.',
    copertina: foto('facciata-contemporanea', 1),
    altCopertina: 'Casa con il piano superiore rivestito in legno scuro, in stile contemporaneo',
    sezioni: [
      {
        titolo: 'Facciata ventilata',
        testo: [
          'Sulla parete fissiamo un telo protettivo e una serie di listelli; il rivestimento si monta sopra. Nella camera d’aria che resta dietro le tavole l’aria circola e porta via l’umidità.',
        ],
      },
      {
        titolo: 'Stile montano',
        testo: [
          'Tavole verticali, balconi in legno e sporti del tetto profondi, come nella tradizione alpina. Funziona su case nuove e su case da rinnovare.',
        ],
      },
      {
        titolo: 'Stile contemporaneo',
        testo: [
          'Doghe sottili, superfici continue, legno scuro o naturale e lattonerie in metallo. Il legno diventa il materiale principale della facciata, non una decorazione.',
        ],
      },
      {
        titolo: 'Il larice che diventa grigio',
        testo: [
          'Il larice lasciato al naturale col tempo prende un colore grigio argento. Se preferite mantenere il colore originale si può trattare con oli o vernici, da ripassare ogni qualche anno.',
        ],
      },
    ],
    striscia: [
      { foto: foto('facciata-montana', 1), alt: 'Casa con facciata in legno e balconi in stile montano, Dolomiti sullo sfondo' },
      { foto: foto('facciata-contemporanea', 2), alt: 'Dettaglio di rivestimento in larice con lattoneria in metallo' },
      { foto: foto('facciata-montana', 3), alt: 'Casa di montagna con il timpano rivestito in legno' },
    ],
    categorie: ['facciate'],
    faq: [
      {
        d: 'Che legno usate?',
        r: 'Soprattutto larice, che resiste bene all’esterno, e abete per le parti protette. Scegliamo insieme sezione delle tavole, posa (verticale, orizzontale, a listoni distanziati) e finitura.',
      },
      {
        d: 'Si può rivestire una casa esistente?',
        r: 'Sì. Fissiamo una sottostruttura di listelli sulla parete esistente, spesso aggiungendo isolamento: si migliora l’aspetto e anche il comfort della casa.',
      },
    ],
  },
  {
    slug: 'tettoie-e-carport',
    nome: 'Tettoie e su misura',
    riga: 'Tettoie, carport, pergole, verande, soppalchi e decking.',
    titoloSeo: 'Tettoie, carport e lavori in legno su misura a Trento',
    descrizione:
      'Tettoie, carport, pergole, verande, soppalchi e pavimenti esterni in legno su misura, in provincia di Trento. Progetto, preventivo e posa.',
    h1: 'Tettoie, carport e lavori su misura',
    intro:
      'I lavori più piccoli li seguiamo con la stessa cura dei tetti: tettoie, carport, pergole, verande, soppalchi e pavimenti esterni in larice.',
    copertina: foto('tettoia-lavis', 1),
    altCopertina: 'Tettoia in legno sull’ingresso di una casa a Lavis',
    sezioni: [
      {
        titolo: 'Tettoie e carport',
        testo: [
          'Sull’ingresso, sopra l’auto o lungo un lato della casa. Le disegniamo coordinate con il tetto esistente: stesse pendenze, stesso manto, legno trattato per stare all’esterno.',
        ],
      },
      {
        titolo: 'Pergole e verande',
        testo: [
          'Strutture leggere per vivere fuori più a lungo, con tende scorrevoli o coperture fisse. Una veranda chiusa diventa una stanza in più.',
        ],
      },
      {
        titolo: 'Soppalchi e interni',
        testo: ['Travi e tavolato per ricavare un piano in più dentro un volume alto, soffitti e rivestimenti in legno.'],
      },
      {
        titolo: 'Decking in larice',
        testo: ['Pavimenti esterni su supporti regolabili: le tavole restano sollevate, ventilate e facili da sistemare.'],
      },
    ],
    striscia: [
      { foto: foto('veranda-legno-scuro', 1), alt: 'Interno di una veranda con travi scure e soffitto in perline bianche' },
      { foto: foto('pergola-tenda', 1), alt: 'Pergola in legno con tenda su un terrazzo' },
      { foto: foto('decking-larice', 1), alt: 'Pavimento esterno in larice su un balcone' },
    ],
    categorie: ['su-misura'],
    faq: [
      {
        d: 'Serve un permesso per una tettoia o un carport?',
        r: 'Dipende da dimensioni, posizione e regolamento del vostro comune. Ve lo indichiamo al sopralluogo.',
      },
      {
        d: 'Fate anche lavori piccoli?',
        r: 'Sì, anche una pensilina sopra la porta di casa. Il sopralluogo e il preventivo restano gratuiti.',
      },
    ],
  },
];

export const servizioPer = (slug: string) => {
  const s = servizi.find((x) => x.slug === slug);
  if (!s) throw new Error(`Servizio ${slug} non trovato`);
  return s;
};
