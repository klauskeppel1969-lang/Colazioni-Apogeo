// ======================================
// CONTATTI DESTINATARI ORDINE
// ======================================
// Modificare SOLO questo file per aggiungere, rimuovere
// o aggiornare i destinatari dell'ordine.
//
// Ogni contatto può avere:
//   name    : nome visualizzato nell'app (obbligatorio)
//   email   : indirizzo email (opzionale — omettere se non necessario)
//   whatsapp: numero internazionale SENZA + e SENZA spazi (opzionale)
//             es. Italia +39 333 1234567 → "393331234567"
//
// Se un campo manca, il pulsante corrispondente non viene mostrato.
// ======================================

const CONTACTS = [

  {
    name:      "Fornitore Pasticceria",
    email:     "pasticceria@esempio.it",
    whatsapp:  "393331234567",   // +39 333 123 4567
  },

  {
    name:      "Fornitore Bevande",
    email:     "bevande@esempio.it",
    whatsapp:  "393339876543",
  },

  {
    name:      "Responsabile Acquisti",
    email:     "acquisti@hotelapogeo.it",
    // nessun WhatsApp per questo contatto
  },

  {
    name:      "Cucina (solo WhatsApp)",
    whatsapp:  "393331112222",
    // nessuna email per questo contatto
  },

];

// ======================================
// FINE CONTATTI
// ======================================
