// ======================================
// INSERIRE QUI GLI ARTICOLI STANDARD
// ======================================
// Questo file è l'UNICO da modificare per aggiungere/rimuovere/modificare
// gli articoli standard della colazione.
//
// Struttura di ogni articolo:
//   id:       stringa unica senza spazi (usare trattini)
//   name:     nome visualizzato in lista
//   category: nome categoria (deve corrispondere esattamente per il raggruppamento)
//
// Le VARIANTI vanno inserite come articoli separati (non come sottovoci).
// ======================================

const STANDARD_PRODUCTS = [

  // --- YOGURT ---
  { id: "yogurt-frutta-plateau",        name: "Yogurt Frutta – Plateau",                  category: "Yogurt" },
  { id: "yogurt-bianco-plateau",        name: "Yogurt Bianco – Plateau",                  category: "Yogurt" },

  // --- DOLCIFICANTI ---
  { id: "zucchero-bianco-monodose",     name: "Zucchero Bianco Monodose – Scatola",       category: "Dolcificanti" },
  { id: "zucchero-canna-monodose",      name: "Zucchero Canna Monodose – Scatola",        category: "Dolcificanti" },
  { id: "zucchero-dietetico-monodose",  name: "Zucchero Dietetico Monodose – Scatola",    category: "Dolcificanti" },
  { id: "miele-monodose",               name: "Miele Monodose – Scatola",                  category: "Dolcificanti" },
  { id: "crema-nocciola-monodose",      name: "Crema Nocciola Monodose (surr. Nutella)",  category: "Dolcificanti" },

  // --- MARMELLATE ---
  { id: "marm-hero-ciliegia",           name: "Marmellata Hero Ciliegia Monodose",        category: "Marmellate" },
  { id: "marm-hero-frutti-bosco",       name: "Marmellata Hero Frutti di Bosco Monodose", category: "Marmellate" },
  { id: "marm-hero-albicocca",          name: "Marmellata Hero Albicocca Monodose",       category: "Marmellate" },
  { id: "marm-hero-fragola",            name: "Marmellata Hero Fragola Monodose",         category: "Marmellate" },

  // --- INFUSI / BEVANDE CALDE ---
  { id: "the-twinings-earl-grey",       name: "Twinings Earl Grey",                       category: "Infusi" },
  { id: "the-twinings-english",         name: "Twinings English Breakfast",               category: "Infusi" },
  { id: "the-twinings-verde",           name: "Twinings Verde",                           category: "Infusi" },
  { id: "ciobar-cioccolato",            name: "Preparato Ciobar Cioccolato",              category: "Infusi" },
  { id: "camomilla-filtri",             name: "Camomilla Filtri",                         category: "Infusi" },
  { id: "tisane-assortite",             name: "Tisane Assortite",                         category: "Infusi" },

  // --- CORNETTI ---
  { id: "cornetto-midi-ciliegia",       name: "Cornetti Midi Ciliegia",                   category: "Cornetti" },
  { id: "cornetto-midi-albicocca",      name: "Cornetti Midi Albicocca",                  category: "Cornetti" },
  { id: "cornetto-midi-cioccolato",     name: "Cornetti Midi Cioccolato",                 category: "Cornetti" },

  // --- DOLCI / COLAZIONE ---
  { id: "plumcake-mister-day",          name: "Plum Cake Mister Day",                     category: "Dolci" },
  { id: "crostatina-lago-cioccolato",   name: "Crostatine Lago Cioccolato",               category: "Dolci" },
  { id: "crostatina-lago-albicocca",    name: "Crostatine Lago Albicocca",                category: "Dolci" },
  { id: "fette-biscottate-mb",          name: "Fette Biscottate Mulino Bianco",           category: "Dolci" },
  { id: "biscotti-oswego",              name: "Biscotti Monodose Oswego",                 category: "Dolci" },
  { id: "biscotti-gran-turchese",       name: "Biscotti Monodose Gran Turchese",          category: "Dolci" },
  { id: "ciambellone-galgani",          name: "Ciambellone Galgani Variegato Cioccolato", category: "Dolci" },
  { id: "crostata-galgani-bosco",       name: "Crostate Galgani Frutti Bosco Rotonde",    category: "Dolci" },

  // --- CEREALI ---
  { id: "riso-soffiato-cioccolato",     name: "Riso Soffiato Cioccolato",                category: "Cereali" },
  { id: "muesli-cerealitalia",          name: "Muesli Mix Cerealitalia",                  category: "Cereali" },

  // --- BEVANDE / CONCENTRATI ---
  { id: "concentrato-marr-arancia",     name: "Concentrato Marr Arancia",                category: "Bevande" },
  { id: "concentrato-marr-ananas",      name: "Concentrato Marr Ananas",                 category: "Bevande" },

  // --- LATTICINI ---
  { id: "latte-senza-lattosio",         name: "Latte Senza Lattosio Tre Valli",           category: "Latticini" },
  { id: "latte-soia-hopla",             name: "Latte di Soia Hoplà",                     category: "Latticini" },
  { id: "latte-riso",                   name: "Latte di Riso",                            category: "Latticini" },
  { id: "latte-mandorla",               name: "Latte di Mandorla",                        category: "Latticini" },
  { id: "burro-monodose",               name: "Burro Monodose",                           category: "Latticini" },
  { id: "prosciutto-cotto",             name: "Prosciutto Cotto",                         category: "Latticini" },

  // --- SENZA GLUTINE ---
  { id: "panfette-nutrifree-sg",        name: "Panfette Nutrifree Senza Glutine",         category: "Senza Glutine" },
  { id: "crostatina-schar-albicocca",   name: "Crostatine Schar SG Albicocca",           category: "Senza Glutine" },
  { id: "crostatina-schar-cioccolato",  name: "Crostatine Schar SG Cioccolato",          category: "Senza Glutine" },

  // --- MONOUSO ---
  { id: "bicchieri-colazione",          name: "Bicchieri Colazioni",                      category: "Monouso" },
  { id: "tovaglioli-colazione",         name: "Tovaglioli Colazioni",                     category: "Monouso" },

  // --- VARIE ---
  { id: "sale-addolcitore",             name: "Sale per Addolcitore",                     category: "Varie" },

];

// ======================================
// FINE LISTA ARTICOLI STANDARD
// ======================================

// Ordine di visualizzazione delle categorie
const CATEGORY_ORDER = [
  "Cornetti",
  "Dolci",
  "Cereali",
  "Marmellate",
  "Dolcificanti",
  "Yogurt",
  "Infusi",
  "Bevande",
  "Latticini",
  "Senza Glutine",
  "Monouso",
  "Varie",
  "Extra"
];
