// Dati dell'azienda: un solo posto da aggiornare. P.IVA verificata su VIES il 5/10/2026.
// Anteprima finché il cliente non approva: noindex + form senza invio. Al lancio: PUBLIC_ANTEPRIMA=false (e togliere X-Robots-Tag da vercel.json)
export const ANTEPRIMA = import.meta.env.PUBLIC_ANTEPRIMA !== 'false';

export const azienda = {
  nome: 'Edelweiss Carpenteria',
  ragioneSociale: 'Edelweiss Carpenteria S.a.s. di Di Bello Luca',
  piva: '02459830226',
  rea: null as string | null, // da chiedere al cliente
  pec: null as string | null, // da chiedere al cliente
  indirizzo: {
    via: 'Via Masetti 39',
    frazione: 'Cognola',
    cap: '38121',
    citta: 'Trento',
    provincia: 'TN',
  },
  telefono: '+39 349 864 8360',
  telefonoLink: 'tel:+393498648360',
  whatsapp: 'https://wa.me/393498648360?text=' + encodeURIComponent('Buongiorno, vorrei informazioni per un lavoro in legno.'),
  email: 'edelcarpenteria@gmail.com',
  mappa: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Edelweiss Carpenteria, Via Masetti 39, 38121 Trento'),
  orari: [
    { giorni: 'Lunedì – venerdì', ore: '8:00 – 12:00 e 13:30 – 18:00' },
    { giorni: 'Sabato e domenica', ore: 'Chiuso' },
  ],
  social: {
    facebook: 'https://www.facebook.com/edelweisscarpenteria/',
    instagram: 'https://www.instagram.com/edelweisscarpenteriatrento/',
  },
};

export const navigazione = [
  { href: '/tetti-in-legno/', label: 'Tetti' },
  { href: '/case-in-legno/', label: 'Case' },
  { href: '/sopraelevazioni-in-legno/', label: 'Sopraelevazioni' },
  { href: '/facciate-in-legno/', label: 'Facciate' },
  { href: '/realizzazioni/', label: 'Realizzazioni' },
  { href: '/chi-siamo/', label: 'Chi siamo' },
  { href: '/contatti/', label: 'Contatti' },
];

// Quote ISTAT del centro abitato (m s.l.m.)
export const quote: Record<string, number> = {
  Trento: 194,
  Civezzano: 469,
  Folgaria: 1166,
  Brentonico: 692,
  Lavis: 232,
};
