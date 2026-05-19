// ======================================
// CONFIGURAZIONE FIREBASE
// ======================================
// Sostituire i valori con quelli del proprio progetto Firebase.
// Trovare questi valori in:
//   Firebase Console → Impostazioni progetto → Le tue app → Web
//
// ATTENZIONE: per deploy pubblico usare Firebase Security Rules appropriate.
// ======================================

const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// Nome della collezione principale su Firestore
const FIRESTORE_COLLECTION = "ordine_colazione";

// Nome documento stato corrente
const FIRESTORE_DOC_CURRENT = "ordine_corrente";

// Nome collezione storico ordini
const FIRESTORE_COLLECTION_STORICO = "storico_ordini";
