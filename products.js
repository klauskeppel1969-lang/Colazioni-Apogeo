// ============================================================
// ============================================================
//
//          INSERIRE QUI GLI ARTICOLI STANDARD DELL'HOTEL
//
//          Ogni articolo deve avere:
//          - id: identificativo unico (senza spazi, minuscolo)
//          - name: nome visualizzato
//          - category: categoria di appartenenza
//
//          Le varianti vanno inserite come articoli separati!
//
// ============================================================
// ============================================================

const STANDARD_PRODUCTS = [
  // ========================================
  // CORNETTI
  // ========================================
  {
    id: "cornetto-vuoto",
    name: "Cornetto Vuoto",
    category: "Cornetti"
  },
  {
    id: "cornetto-cioccolato",
    name: "Cornetto Cioccolato",
    category: "Cornetti"
  },
  {
    id: "cornetto-crema",
    name: "Cornetto Crema",
    category: "Cornetti"
  },
  {
    id: "cornetto-albicocca",
    name: "Cornetto Albicocca",
    category: "Cornetti"
  },
  {
    id: "cornetto-ciliegia",
    name: "Cornetto Ciliegia",
    category: "Cornetti"
  },
  {
    id: "cornetto-miele",
    name: "Cornetto Miele",
    category: "Cornetti"
  },
  {
    id: "cornetto-integrale",
    name: "Cornetto Integrale",
    category: "Cornetti"
  },
  {
    id: "cornetto-vegano",
    name: "Cornetto Vegano",
    category: "Cornetti"
  },

  // ========================================
  // BEVANDE
  // ========================================
  {
    id: "latte-intero",
    name: "Latte Intero",
    category: "Bevande"
  },
  {
    id: "latte-parzialmente-scremato",
    name: "Latte Parz. Scremato",
    category: "Bevande"
  },
  {
    id: "latte-senza-lattosio",
    name: "Latte Senza Lattosio",
    category: "Bevande"
  },
  {
    id: "latte-soia",
    name: "Latte di Soia",
    category: "Bevande"
  },
  {
    id: "latte-avena",
    name: "Latte di Avena",
    category: "Bevande"
  },
  {
    id: "latte-mandorla",
    name: "Latte di Mandorla",
    category: "Bevande"
  },
  {
    id: "succo-arancia",
    name: "Succo Arancia",
    category: "Bevande"
  },
  {
    id: "succo-pesca",
    name: "Succo Pesca",
    category: "Bevande"
  },
  {
    id: "succo-pera",
    name: "Succo Pera",
    category: "Bevande"
  },
  {
    id: "succo-ace",
    name: "Succo ACE",
    category: "Bevande"
  },

  // ========================================
  // YOGURT
  // ========================================
  {
    id: "yogurt-bianco",
    name: "Yogurt Bianco",
    category: "Yogurt"
  },
  {
    id: "yogurt-fragola",
    name: "Yogurt Fragola",
    category: "Yogurt"
  },
  {
    id: "yogurt-pesca",
    name: "Yogurt Pesca",
    category: "Yogurt"
  },
  {
    id: "yogurt-frutti-bosco",
    name: "Yogurt Frutti di Bosco",
    category: "Yogurt"
  },
  {
    id: "yogurt-greco",
    name: "Yogurt Greco",
    category: "Yogurt"
  },
  {
    id: "yogurt-senza-lattosio",
    name: "Yogurt Senza Lattosio",
    category: "Yogurt"
  },

  // ========================================
  // SALUMI
  // ========================================
  {
    id: "prosciutto-cotto",
    name: "Prosciutto Cotto",
    category: "Salumi"
  },
  {
    id: "prosciutto-crudo",
    name: "Prosciutto Crudo",
    category: "Salumi"
  },
  {
    id: "speck",
    name: "Speck",
    category: "Salumi"
  },
  {
    id: "salame",
    name: "Salame",
    category: "Salumi"
  },
  {
    id: "mortadella",
    name: "Mortadella",
    category: "Salumi"
  },
  {
    id: "bresaola",
    name: "Bresaola",
    category: "Salumi"
  },

  // ========================================
  // FORMAGGI
  // ========================================
  {
    id: "mozzarella",
    name: "Mozzarella",
    category: "Formaggi"
  },
  {
    id: "formaggio-fette",
    name: "Formaggio a Fette",
    category: "Formaggi"
  },
  {
    id: "formaggio-spalmabile",
    name: "Formaggio Spalmabile",
    category: "Formaggi"
  },
  {
    id: "grana-padano",
    name: "Grana Padano",
    category: "Formaggi"
  },
  {
    id: "ricotta",
    name: "Ricotta",
    category: "Formaggi"
  },
  {
    id: "stracchino",
    name: "Stracchino",
    category: "Formaggi"
  },

  // ========================================
  // FRIGO (altri prodotti freschi)
  // ========================================
  {
    id: "burro",
    name: "Burro",
    category: "Frigo"
  },
  {
    id: "uova",
    name: "Uova",
    category: "Frigo"
  },
  {
    id: "panna-fresca",
    name: "Panna Fresca",
    category: "Frigo"
  },
  {
    id: "frutta-fresca",
    name: "Frutta Fresca",
    category: "Frigo"
  },
  {
    id: "macedonia",
    name: "Macedonia",
    category: "Frigo"
  },
  {
    id: "marmellata-albicocca",
    name: "Marmellata Albicocca",
    category: "Frigo"
  },
  {
    id: "marmellata-fragola",
    name: "Marmellata Fragola",
    category: "Frigo"
  },
  {
    id: "miele",
    name: "Miele",
    category: "Frigo"
  },
  {
    id: "nutella",
    name: "Nutella",
    category: "Frigo"
  },

  // ========================================
  // MONOUSO
  // ========================================
  {
    id: "tovaglioli",
    name: "Tovaglioli",
    category: "Monouso"
  },
  {
    id: "bicchieri-plastica",
    name: "Bicchieri Plastica",
    category: "Monouso"
  },
  {
    id: "bicchieri-carta",
    name: "Bicchieri Carta",
    category: "Monouso"
  },
  {
    id: "piatti-carta",
    name: "Piatti Carta",
    category: "Monouso"
  },
  {
    id: "posate-monouso",
    name: "Posate Monouso",
    category: "Monouso"
  },
  {
    id: "cannucce",
    name: "Cannucce",
    category: "Monouso"
  },
  {
    id: "pellicola",
    name: "Pellicola",
    category: "Monouso"
  },
  {
    id: "alluminio",
    name: "Alluminio",
    category: "Monouso"
  }
];

// ============================================================
// CATEGORIE DISPONIBILI (ordine di visualizzazione)
// ============================================================
const CATEGORIES_ORDER = [
  "Cornetti",
  "Bevande",
  "Yogurt",
  "Salumi",
  "Formaggi",
  "Frigo",
  "Monouso",
  "Extra"
];

// Esporta per uso in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STANDARD_PRODUCTS, CATEGORIES_ORDER };
}
