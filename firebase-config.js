// INSERIRE CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX",
  storageBucket: "XXX",
  messagingSenderId: "XXX",
  appId: "XXX"
};

// inizializzazione (compat semplice)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
