// ======================================
// COLAZIONI HOTEL - LOGICA PRINCIPALE
// app.js
// ======================================

// ── Stato ────────────────────────────────────────────────────────────────

const state = {
  items:        {},           // id → { id, name, category, qty, selected, note, isExtra }
  filter:       'all',        // 'all' | 'selected'
  expandedCats: new Set(),
  useFirebase:  false,
  unsubscribe:  null,
};

// ── EMOJI ─────────────────────────────────────────────────────────────────

const CAT_EMOJI = {
  "Cornetti":     "🥐",
  "Dolci":        "🍰",
  "Cereali":      "🌾",
  "Marmellate":   "🍓",
  "Dolcificanti": "🍯",
  "Yogurt":       "🥛",
  "Infusi":       "🫖",
  "Bevande":      "🧃",
  "Latticini":    "🧀",
  "Senza Glutine":"🌿",
  "Monouso":      "🥤",
  "Varie":        "🔧",
  "Extra":        "⭐",
};

const ITEM_EMOJI = {
  "yogurt-frutta-plateau":       "🍓",
  "yogurt-bianco-plateau":       "🤍",
  "zucchero-bianco-monodose":    "🍬",
  "zucchero-canna-monodose":     "🟤",
  "zucchero-dietetico-monodose": "💊",
  "miele-monodose":              "🍯",
  "crema-nocciola-monodose":     "🌰",
  "the-twinings-earl-grey":      "🫖",
  "the-twinings-english":        "🫖",
  "the-twinings-verde":          "🍵",
  "ciobar-cioccolato":           "🍫",
  "camomilla-filtri":            "🌼",
  "tisane-assortite":            "🌿",
  "marm-hero-ciliegia":          "🍒",
  "marm-hero-frutti-bosco":      "🫐",
  "marm-hero-albicocca":         "🍑",
  "marm-hero-fragola":           "🍓",
  "cornetto-midi-ciliegia":      "🍒",
  "cornetto-midi-albicocca":     "🍑",
  "cornetto-midi-cioccolato":    "🍫",
  "plumcake-mister-day":         "🍞",
  "crostatina-lago-cioccolato":  "🍫",
  "crostatina-lago-albicocca":   "🍑",
  "fette-biscottate-mb":         "🍞",
  "biscotti-oswego":             "🍪",
  "biscotti-gran-turchese":      "🍪",
  "ciambellone-galgani":         "🎂",
  "crostata-galgani-bosco":      "🫐",
  "riso-soffiato-cioccolato":    "🍫",
  "muesli-cerealitalia":         "🌾",
  "concentrato-marr-arancia":    "🍊",
  "concentrato-marr-ananas":     "🍍",
  "latte-senza-lattosio":        "🥛",
  "latte-soia-hopla":            "🌱",
  "latte-riso":                  "🌾",
  "latte-mandorla":              "🌰",
  "burro-monodose":              "🧈",
  "prosciutto-cotto":            "🥩",
  "panfette-nutrifree-sg":       "🌿",
  "crostatina-schar-albicocca":  "🍑",
  "crostatina-schar-cioccolato": "🍫",
  "bicchieri-colazione":         "🥤",
  "tovaglioli-colazione":        "🗂️",
  "sale-addolcitore":            "🧂",
};

function getItemEmoji(item) {
  return ITEM_EMOJI[item.id] || CAT_EMOJI[item.category] || "▪";
}

// ── Firebase ──────────────────────────────────────────────────────────────

function initFirebase() {
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    const db = firebase.firestore();
    state.unsubscribe = db
      .collection(FIRESTORE_COLLECTION)
      .doc(FIRESTORE_DOC_CURRENT)
      .onSnapshot(
        doc => {
          setSyncStatus('ok', '● sync');
          if (doc.exists) mergeFirebaseData(doc.data());
          renderAll();
        },
        () => setSyncStatus('error', '✕ offline')
      );
    state.useFirebase = true;
    setSyncStatus('ok', '● connesso');
  } catch (e) {
    setSyncStatus('local', '◌ locale');
  }
}

function getDb() { return firebase.firestore(); }

async function saveToFirestore() {
  if (!state.useFirebase) return;
  try {
    const payload = {};
    Object.values(state.items).forEach(item => { payload[item.id] = item; });
    await getDb()
      .collection(FIRESTORE_COLLECTION)
      .doc(FIRESTORE_DOC_CURRENT)
      .set({ items: payload, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    setSyncStatus('ok', '● salvato');
  } catch (e) {
    setSyncStatus('error', '✕ errore');
  }
}

function mergeFirebaseData(data) {
  const fbItems = data.items || {};
  Object.values(fbItems).forEach(fbItem => {
    if (state.items[fbItem.id]) {
      state.items[fbItem.id].qty      = fbItem.qty      || 0;
      state.items[fbItem.id].selected = fbItem.selected || false;
      state.items[fbItem.id].note     = fbItem.note     || '';
    } else if (fbItem.isExtra) {
      state.items[fbItem.id] = { ...fbItem, isExtra: true };
    }
  });
  Object.values(state.items).forEach(item => {
    if (item.isExtra && !fbItems[item.id]) delete state.items[item.id];
  });
}

// ── Prodotti standard ─────────────────────────────────────────────────────

function initStandardProducts() {
  STANDARD_PRODUCTS.forEach(p => {
    state.items[p.id] = { id: p.id, name: p.name, category: p.category, qty: 0, selected: false, note: '', isExtra: false };
  });
  getCategories().forEach(c => state.expandedCats.add(c));
}

// ── Categorie ─────────────────────────────────────────────────────────────

function getCategories() {
  const cats = [...new Set(Object.values(state.items).map(i => i.category))];
  return cats.sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a), ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1; if (ib === -1) return -1;
    return ia - ib;
  });
}

function getItemsByCategory(cat) {
  return Object.values(state.items)
    .filter(i => i.category === cat)
    .sort((a, b) => { if (a.isExtra !== b.isExtra) return a.isExtra ? 1 : -1; return a.name.localeCompare(b.name); });
}

function getVisibleItems(cat) {
  const items = getItemsByCategory(cat);
  if (state.filter === 'selected') return items.filter(i => i.selected);
  return items;
}

function countSelected()            { return Object.values(state.items).filter(i => i.selected).length; }
function countSelectedInCat(cat)    { return Object.values(state.items).filter(i => i.category === cat && i.selected).length; }

// ── Azioni articolo ───────────────────────────────────────────────────────

function toggleSelected(id) {
  const item = state.items[id]; if (!item) return;
  item.selected = !item.selected;
  if (item.selected && item.qty === 0) item.qty = 1;
  renderAll(); debouncedSave();
}

function changeQty(id, delta) {
  const item = state.items[id]; if (!item) return;
  item.qty = Math.max(0, (item.qty || 0) + delta);
  item.selected = item.qty > 0;
  renderAll(); debouncedSave();
}

function setNote(id, note) {
  const item = state.items[id]; if (!item) return;
  item.note = note.trim();
  renderAll(); debouncedSave();
}

function deleteExtra(id) {
  if (!state.items[id]?.isExtra) return;
  delete state.items[id]; renderAll(); debouncedSave();
}

// ── Debounce ──────────────────────────────────────────────────────────────

let saveTimeout = null;
function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveToFirestore(), 800);
}

// ── STORICO: salva su localStorage + Firestore ────────────────────────────

const LS_KEY = 'colazioni_storico';

function getStorico() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

function saveOrderToHistory() {
  const selectedItems = Object.values(state.items).filter(i => i.selected && i.qty > 0);
  if (selectedItems.length === 0) { alert('Nessun articolo selezionato con quantità > 0.'); return; }

  const entry = {
    id:      Date.now(),
    savedAt: new Date().toISOString(),
    items:   selectedItems.map(i => ({ id: i.id, name: i.name, category: i.category, qty: i.qty, note: i.note, isExtra: i.isExtra || false })),
  };

  // Salva su localStorage
  const storico = getStorico();
  storico.unshift(entry);
  if (storico.length > 60) storico.length = 60; // max 60 ordini
  localStorage.setItem(LS_KEY, JSON.stringify(storico));

  // Salva su Firestore se disponibile
  if (state.useFirebase) {
    getDb().collection(FIRESTORE_COLLECTION_STORICO).add({
      savedAt: firebase.firestore.FieldValue.serverTimestamp(),
      items:   entry.items,
    }).catch(() => {});
  }

  setSyncStatus('ok', '● salvato');
  setTimeout(() => setSyncStatus('ok', state.useFirebase ? '● sync' : '◌ locale'), 1500);
  alert(`✓ Ordine salvato nello storico (${selectedItems.length} articoli).`);
}

// ── RENDERING PRINCIPALE ──────────────────────────────────────────────────

function renderAll() { renderBadge(); renderList(); }

function renderBadge() {
  document.getElementById('badge-count').textContent = countSelected();
}

function renderList() {
  const container = document.getElementById('products-list');
  const cats = getCategories();
  container.innerHTML = '';

  const catsToShow = state.filter === 'selected'
    ? cats.filter(c => countSelectedInCat(c) > 0)
    : cats;

  if (catsToShow.length === 0) {
    container.innerHTML = '<div class="empty-msg">Nessun articolo selezionato.</div>';
    return;
  }

  catsToShow.forEach(cat => {
    const items    = getVisibleItems(cat);
    const expanded = state.expandedCats.has(cat);
    const selCount = countSelectedInCat(cat);
    const allItems = getItemsByCategory(cat);

    // Header categoria
    const header = document.createElement('div');
    header.className = `cat-header${expanded ? '' : ' collapsed'}`;
    header.dataset.cat = cat;
    header.innerHTML = `
      <span class="cat-arrow">▼</span>
      <span class="cat-emoji">${CAT_EMOJI[cat] || '📦'}</span>
      <span class="cat-name">${cat}</span>
      <span class="cat-count">${selCount > 0 ? `<span class="sel-count">${selCount}</span>/` : ''}${allItems.length}</span>
    `;
    header.addEventListener('click', () => toggleCategory(cat));
    container.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = `cat-body${expanded ? '' : ' collapsed'}`;
    (state.filter === 'all' ? allItems : items).forEach(item => body.appendChild(renderRow(item)));
    container.appendChild(body);
  });
}

function renderRow(item) {
  const row = document.createElement('div');
  row.className = `product-row${item.selected ? ' selected' : ''}${item.isExtra ? ' extra' : ''}`;
  row.dataset.id = item.id;
  const hasNote = !!(item.note && item.note.length);

  row.innerHTML = `
    <div class="row-check" data-action="toggle" data-id="${item.id}">
      <div class="check-icon">✓</div>
    </div>
    <span class="row-emoji">${getItemEmoji(item)}</span>
    <div class="row-name" data-action="toggle" data-id="${item.id}">
      <span class="name-text">${escHtml(item.name)}${item.isExtra ? ' <span class="badge-extra">EXTRA</span>' : ''}</span>
      ${hasNote ? `<span class="note-text">📝 ${escHtml(item.note)}</span>` : ''}
    </div>
    <div class="row-qty">
      <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
      <span class="qty-val">${item.qty}</span>
      <button class="qty-btn" data-action="plus"  data-id="${item.id}">+</button>
    </div>
    <div class="row-actions">
      <button class="btn-note${hasNote ? ' has-note' : ''}" data-action="note" data-id="${item.id}" title="Note">📝</button>
      ${item.isExtra ? `<button class="btn-del-extra" data-action="del-extra" data-id="${item.id}" title="Elimina">✕</button>` : ''}
    </div>
  `;
  return row;
}

// Delegazione eventi lista
document.getElementById('products-list').addEventListener('click', e => {
  const t = e.target.closest('[data-action]'); if (!t) return;
  const { action, id } = t.dataset;
  if (action === 'toggle')    toggleSelected(id);
  if (action === 'plus')      changeQty(id, +1);
  if (action === 'minus')     changeQty(id, -1);
  if (action === 'note')      openNoteModal(id);
  if (action === 'del-extra') confirmDeleteExtra(id);
});

function toggleCategory(cat) {
  if (state.expandedCats.has(cat)) state.expandedCats.delete(cat);
  else state.expandedCats.add(cat);
  renderList();
}

// Filtri
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderList();
  });
});

// ── MODAL NOTE ────────────────────────────────────────────────────────────

function openNoteModal(id) {
  const item = state.items[id]; if (!item) return;
  document.getElementById('note-modal-title').textContent = item.name;
  document.getElementById('note-input').value = item.note || '';
  document.getElementById('note-modal').classList.remove('hidden');
  document.getElementById('note-modal').dataset.id = id;
  setTimeout(() => document.getElementById('note-input').focus(), 50);
}
document.getElementById('note-modal-ok').addEventListener('click', () => {
  const id = document.getElementById('note-modal').dataset.id;
  setNote(id, document.getElementById('note-input').value);
  document.getElementById('note-modal').classList.add('hidden');
});
document.getElementById('note-modal-cancel').addEventListener('click', () =>
  document.getElementById('note-modal').classList.add('hidden'));

// ── MODAL EXTRA ───────────────────────────────────────────────────────────

document.getElementById('btn-add-extra').addEventListener('click', () => {
  ['extra-name','extra-note'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('extra-cat').value = 'Extra';
  document.getElementById('extra-qty').value = '1';
  document.getElementById('extra-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('extra-name').focus(), 50);
});
document.getElementById('extra-modal-ok').addEventListener('click', () => {
  const name = document.getElementById('extra-name').value.trim();
  if (!name) { alert('Inserire il nome articolo.'); return; }
  const cat  = document.getElementById('extra-cat').value || 'Extra';
  const qty  = parseInt(document.getElementById('extra-qty').value) || 1;
  const note = document.getElementById('extra-note').value.trim();
  const id   = 'extra-' + Date.now();
  state.items[id] = { id, name, category: cat, qty, selected: true, note, isExtra: true };
  state.expandedCats.add(cat);
  document.getElementById('extra-modal').classList.add('hidden');
  renderAll(); debouncedSave();
});
document.getElementById('extra-modal-cancel').addEventListener('click', () =>
  document.getElementById('extra-modal').classList.add('hidden'));

// ── MODAL ELIMINA EXTRA ───────────────────────────────────────────────────

function confirmDeleteExtra(id) {
  const item = state.items[id]; if (!item) return;
  document.getElementById('del-modal-name').textContent = item.name;
  document.getElementById('del-modal').classList.remove('hidden');
  document.getElementById('del-modal').dataset.id = id;
}
document.getElementById('del-modal-ok').addEventListener('click', () => {
  deleteExtra(document.getElementById('del-modal').dataset.id);
  document.getElementById('del-modal').classList.add('hidden');
});
document.getElementById('del-modal-cancel').addEventListener('click', () =>
  document.getElementById('del-modal').classList.add('hidden'));

// ── RESET ─────────────────────────────────────────────────────────────────

document.getElementById('btn-reset').addEventListener('click', () =>
  document.getElementById('reset-modal').classList.remove('hidden'));

document.getElementById('reset-modal-ok').addEventListener('click', () => {
  Object.values(state.items).forEach(item => { item.qty = 0; item.selected = false; item.note = ''; });
  Object.keys(state.items).forEach(id => { if (state.items[id].isExtra) delete state.items[id]; });
  document.getElementById('reset-modal').classList.add('hidden');
  renderAll(); debouncedSave();
});
document.getElementById('reset-modal-cancel').addEventListener('click', () =>
  document.getElementById('reset-modal').classList.add('hidden'));

// ── STAMPA: usa #print-area + @media print — funziona su desktop e mobile ─

document.getElementById('btn-print').addEventListener('click', () => {
  const selectedItems = Object.values(state.items)
    .filter(i => i.selected && i.qty > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (selectedItems.length === 0) {
    alert('Nessun articolo da stampare (selezionare almeno un articolo con quantità > 0).');
    return;
  }

  const now = new Date().toLocaleDateString('it-IT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).toUpperCase();

  const totPezzi = selectedItems.reduce((s, i) => s + i.qty, 0);

  // Righe: SOLO articolo + quantità, NESSUNA categoria
  const rows = selectedItems.map(item => {
    const noteHtml = item.note
      ? '<span class="item-note">' + escHtml(item.note) + '</span>'
      : '';
    const extraTag = item.isExtra ? ' <span class="tag-extra">[EXTRA]</span>' : '';
    return '<tr class="item-row">'
      + '<td class="col-qty">' + item.qty + '</td>'
      + '<td class="col-name">'
      +   '<span class="item-name">' + escHtml(item.name) + extraTag + '</span>'
      +   noteHtml
      + '</td>'
      + '</tr>';
  }).join('');

  document.getElementById('print-area').innerHTML =
    '<div class="pr-header">'
    + '<div class="pr-label">HOTEL APOGEO \u2014 ORDINE COLAZIONI</div>'
    + '<div class="pr-date">' + now + '</div>'
    + '<div class="pr-meta">' + selectedItems.length + ' ARTICOLI \u00b7 ' + totPezzi + ' PEZZI TOTALI</div>'
    + '</div>'
    + '<table class="pr-table"><tbody>' + rows + '</tbody></table>'
    + '<div class="pr-foot">Ordine Colazioni WebApp</div>';

  window.print();
});


// ── PANEL ALTRO (storico + stats) ────────────────────────────────────────

document.getElementById('btn-altro').addEventListener('click', () =>
  document.getElementById('altro-panel').classList.remove('hidden'));
document.getElementById('altro-close').addEventListener('click', () =>
  document.getElementById('altro-panel').classList.add('hidden'));

document.getElementById('btn-storico').addEventListener('click', () => {
  document.getElementById('altro-panel').classList.add('hidden');
  document.getElementById('storico-panel').classList.remove('hidden');
  renderStorico();
});
document.getElementById('storico-close').addEventListener('click', () =>
  document.getElementById('storico-panel').classList.add('hidden'));

function renderStorico() {
  const body   = document.getElementById('storico-body');
  const storico = getStorico();

  if (storico.length === 0) {
    body.innerHTML = `<div class="empty-panel">
      Nessun ordine salvato.<br><br>
      Premi <strong style="color:#d4aa5a">STORICO</strong> dopo aver completato un ordine per salvarlo.
    </div>`;
    return;
  }

  body.innerHTML = storico.map((entry, idx) => {
    const d    = new Date(entry.savedAt);
    const data = d.toLocaleDateString('it-IT', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
    const ora  = d.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
    const tot  = entry.items.reduce((s, i) => s + i.qty, 0);
    const cats = [...new Set(entry.items.map(i => i.category))];

    // Raggruppa per categoria per il dettaglio
    let detailHtml = '';
    cats.forEach(cat => {
      const catItems = entry.items.filter(i => i.category === cat);
      detailHtml += `<div class="storico-cat-label">${CAT_EMOJI[cat] || ''} ${cat}</div>`;
      catItems.forEach(i => {
        detailHtml += `<div class="storico-detail-row">
          <span class="d-name">${escHtml(i.name)}</span>
          <span class="d-qty">×${i.qty}</span>
          ${i.note ? `<span class="d-note">${escHtml(i.note)}</span>` : ''}
        </div>`;
      });
    });

    return `<div class="storico-item">
      <div class="storico-item-header" onclick="toggleStoricoDetail(${idx})">
        <div>
          <div class="storico-date">${data} — ${ora}</div>
          <div class="storico-summary">${entry.items.length} articoli · ${tot} pezzi totali · ${cats.join(', ')}</div>
        </div>
        <span class="storico-badge">${entry.items.length}</span>
      </div>
      <div class="storico-detail" id="storico-detail-${idx}">
        ${detailHtml}
        <div style="margin-top:10px;display:flex;gap:8px;">
          <button onclick="ricaricaOrdine(${idx})" style="flex:1;padding:8px;background:#152030;color:#70a8d8;border:1px solid #254060;border-radius:4px;font-size:0.72rem;font-weight:700;cursor:pointer;font-family:monospace;">↩ RICARICA ORDINE</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleStoricoDetail(idx) {
  const el = document.getElementById(`storico-detail-${idx}`);
  if (el) el.classList.toggle('open');
}

function ricaricaOrdine(idx) {
  const storico = getStorico();
  const entry   = storico[idx];
  if (!entry) return;
  if (!confirm(`Ricaricare l'ordine del ${new Date(entry.savedAt).toLocaleDateString('it-IT')}?\nAttenzione: sovrascriverà l'ordine corrente.`)) return;

  // Reset prima
  Object.values(state.items).forEach(item => { item.qty = 0; item.selected = false; item.note = ''; });
  Object.keys(state.items).forEach(id => { if (state.items[id].isExtra) delete state.items[id]; });

  // Ricarica
  entry.items.forEach(ei => {
    if (state.items[ei.id]) {
      state.items[ei.id].qty      = ei.qty;
      state.items[ei.id].selected = true;
      state.items[ei.id].note     = ei.note || '';
    } else if (ei.isExtra) {
      state.items[ei.id] = { ...ei, selected: true };
    }
  });

  document.getElementById('storico-panel').classList.add('hidden');
  renderAll(); debouncedSave();
}

// Salva storico — ora collegato al pulsante STORICO (prima apertura, poi manuale)
// Il salvataggio si fa con bottone nel bottom bar tenuto premuto? No: aggiungiamo un bottone
// nel panel storico o usiamo quello già esistente. Teniamo btn-storico per aprire il panel,
// e aggiungiamo salvataggio diretto tramite doppio tap. Soluzione più semplice: aggiungiamo
// un pulsante "SALVA ORDINE CORRENTE" in cima al panel storico.
document.getElementById('storico-close').insertAdjacentHTML('beforebegin', '');

// Aggiungiamo funzione di salvataggio richiamabile dal panel
function salvaOrdineCorrente() { saveOrderToHistory(); renderStorico(); }

// ── PANEL STATISTICHE ─────────────────────────────────────────────────────

document.getElementById('btn-stats').addEventListener('click', () => {
  document.getElementById('altro-panel').classList.add('hidden');
  document.getElementById('stats-panel').classList.remove('hidden');
  renderStats();
});
document.getElementById('stats-close').addEventListener('click', () =>
  document.getElementById('stats-panel').classList.add('hidden'));

// ── PANEL INVIA ORDINE ────────────────────────────────────────────────────

function buildOrdineTestuale() {
  const sel = Object.values(state.items)
    .filter(i => i.selected && i.qty > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!sel.length) return null;

  const now = new Date().toLocaleDateString('it-IT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const totPezzi = sel.reduce((s, i) => s + i.qty, 0);

  let testo = 'ORDINE COLAZIONI — Hotel Apogeo\n';
  testo += now.toUpperCase() + '\n';
  testo += sel.length + ' articoli  |  ' + totPezzi + ' pezzi totali\n';
  testo += '─'.repeat(36) + '\n\n';

  sel.forEach(item => {
    testo += item.qty + '   ' + item.name.toUpperCase();
    if (item.note) testo += '\n    (' + item.note + ')';
    testo += '\n';
  });

  testo += '\n─'.repeat(36);
  return { testo, now, sel, totPezzi };
}

function renderInviaPanel() {
  const body = document.getElementById('invia-body');
  const ordine = buildOrdineTestuale();

  if (!ordine) {
    body.innerHTML = '<div class="empty-panel">Nessun articolo selezionato con quantità > 0.<br><br>Seleziona prima gli articoli da ordinare.</div>';
    return;
  }

  // Costruisce le card contatto
  let html = '<p style="font-size:0.75rem;color:#a09070;margin-bottom:14px;line-height:1.5;">'
    + 'L'ordine verrà inviato come testo. Per i <strong style="color:#e0b050">PDF</strong>: usa Stampa → Salva come PDF e allega manualmente.'
    + '</p>';

  if (typeof CONTACTS === 'undefined' || !CONTACTS.length) {
    html += '<div class="empty-panel">Nessun contatto configurato.<br>Modifica il file <strong>contacts.js</strong>.</div>';
    body.innerHTML = html;
    return;
  }

  CONTACTS.forEach((c, idx) => {
    html += '<div class="contact-card">';
    html += '<div class="contact-name">' + escHtml(c.name) + '</div>';
    html += '<div class="contact-btns">';
    if (c.email) {
      const subj = encodeURIComponent('Ordine Colazioni Hotel Apogeo — ' + ordine.now);
      const body_enc = encodeURIComponent(ordine.testo);
      html += '<button class="cbtn cbtn-email" onclick="inviaEmail(' + idx + ')">'
        + '<span class="cicon">📧</span> EMAIL</button>';
    }
    if (c.whatsapp) {
      html += '<button class="cbtn cbtn-wa" onclick="inviaWhatsApp(' + idx + ')">'
        + '<span class="cicon">💬</span> WHATSAPP</button>';
    }
    if (!c.email && !c.whatsapp) {
      html += '<span style="font-size:0.7rem;color:#666;">Nessun canale configurato</span>';
    }
    html += '</div></div>';
  });

  body.innerHTML = html;
}

window.inviaEmail = function(idx) {
  const c = CONTACTS[idx]; if (!c || !c.email) return;
  const ordine = buildOrdineTestuale(); if (!ordine) return;
  const subj = encodeURIComponent('Ordine Colazioni Hotel Apogeo — ' + ordine.now);
  const body_enc = encodeURIComponent(ordine.testo);
  window.location.href = 'mailto:' + c.email + '?subject=' + subj + '&body=' + body_enc;
};

window.inviaWhatsApp = function(idx) {
  const c = CONTACTS[idx]; if (!c || !c.whatsapp) return;
  const ordine = buildOrdineTestuale(); if (!ordine) return;
  const txt = encodeURIComponent(ordine.testo);
  window.open('https://wa.me/' + c.whatsapp + '?text=' + txt, '_blank');
};

// Apertura panel INVIA (dal pulsante nell'header)
document.getElementById('btn-invia-hdr').addEventListener('click', () => {
  document.getElementById('invia-panel').classList.remove('hidden');
  renderInviaPanel();
});
document.getElementById('invia-close').addEventListener('click', () =>
  document.getElementById('invia-panel').classList.add('hidden'));

function renderStats() {
  const body   = document.getElementById('stats-body');
  const storico = getStorico();

  if (storico.length === 0) {
    body.innerHTML = `<div class="empty-panel">
      Nessun dato disponibile.<br>Salva almeno un ordine per vedere le statistiche.
    </div>`;
    return;
  }

  // Aggregazione dati
  const itemFreq = {};   // id → { name, category, count, totalQty }
  const catFreq  = {};   // cat → { count, totalQty }
  let totalOrders = storico.length;
  let totalArticoli = 0;
  let totalPezzi    = 0;

  storico.forEach(entry => {
    entry.items.forEach(item => {
      totalArticoli++;
      totalPezzi += item.qty;

      if (!itemFreq[item.id]) itemFreq[item.id] = { name: item.name, category: item.category, count: 0, totalQty: 0 };
      itemFreq[item.id].count++;
      itemFreq[item.id].totalQty += item.qty;

      if (!catFreq[item.category]) catFreq[item.category] = { count: 0, totalQty: 0 };
      catFreq[item.category].count    += item.qty;
      catFreq[item.category].totalQty += item.qty;
    });
  });

  // Top 10 articoli per frequenza
  const topItems = Object.entries(itemFreq)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count || b.totalQty - a.totalQty)
    .slice(0, 10);

  const maxCount = topItems[0]?.count || 1;

  // Top categorie
  const topCats = Object.entries(catFreq)
    .map(([cat, v]) => ({ cat, ...v }))
    .sort((a, b) => b.totalQty - a.totalQty);

  const maxCatQty = topCats[0]?.totalQty || 1;

  // Ordini nel tempo (ultimi 8)
  const recentOrders = storico.slice(0, 8).map(e => ({
    data:  new Date(e.savedAt).toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit' }),
    count: e.items.length,
    pezzi: e.items.reduce((s, i) => s + i.qty, 0),
  })).reverse();

  const maxPezzi = Math.max(...recentOrders.map(o => o.pezzi), 1);

  body.innerHTML = `
    <!-- KPI -->
    <div class="stats-section">
      <h3>📌 Riepilogo generale</h3>
      <div class="stats-grid">
        <div class="stats-kpi"><div class="kpi-val">${totalOrders}</div><div class="kpi-label">Ordini salvati</div></div>
        <div class="stats-kpi"><div class="kpi-val">${Math.round(totalPezzi/totalOrders)}</div><div class="kpi-label">Pezzi medi / ordine</div></div>
        <div class="stats-kpi"><div class="kpi-val">${Math.round(totalArticoli/totalOrders)}</div><div class="kpi-label">Articoli medi / ordine</div></div>
        <div class="stats-kpi"><div class="kpi-val">${totalPezzi}</div><div class="kpi-label">Pezzi totali ordinati</div></div>
      </div>
    </div>

    <!-- Trend ultimi ordini -->
    <div class="stats-section">
      <h3>📈 Trend ultimi ordini (pezzi)</h3>
      ${recentOrders.map(o => `
        <div class="stats-bar-row">
          <span class="stats-bar-label">${o.data}</span>
          <div class="stats-bar-track">
            <div class="stats-bar-fill" style="width:${Math.round(o.pezzi/maxPezzi*100)}%"></div>
          </div>
          <span class="stats-bar-val">${o.pezzi}</span>
        </div>`).join('')}
    </div>

    <!-- Top 10 articoli -->
    <div class="stats-section">
      <h3>🏆 Top 10 articoli più ordinati</h3>
      ${topItems.map((item, i) => `
        <div class="stats-bar-row">
          <span class="stats-bar-label">${i+1}. ${escHtml(item.name)}</span>
          <div class="stats-bar-track">
            <div class="stats-bar-fill" style="width:${Math.round(item.count/maxCount*100)}%"></div>
          </div>
          <span class="stats-bar-val">${item.count}×</span>
        </div>`).join('')}
    </div>

    <!-- Categorie -->
    <div class="stats-section">
      <h3>📦 Pezzi per categoria</h3>
      ${topCats.map(c => `
        <div class="stats-bar-row">
          <span class="stats-bar-label">${CAT_EMOJI[c.cat] || ''} ${c.cat}</span>
          <div class="stats-bar-track">
            <div class="stats-bar-fill cat" style="width:${Math.round(c.totalQty/maxCatQty*100)}%"></div>
          </div>
          <span class="stats-bar-val">${c.totalQty}</span>
        </div>`).join('')}
    </div>
  `;
}

// ── UTILS ─────────────────────────────────────────────────────────────────

function setSyncStatus(cls, text) {
  const el = document.getElementById('sync-status');
  el.className = cls; el.textContent = text;
}

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── SERVICE WORKER ────────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}

// ── BOOTSTRAP ─────────────────────────────────────────────────────────────

initStandardProducts();
initFirebase();
renderAll();

// Esponi globalmente per onclick inline
window.toggleStoricoDetail = toggleStoricoDetail;
window.ricaricaOrdine      = ricaricaOrdine;
window.salvaOrdineCorrente = salvaOrdineCorrente;
