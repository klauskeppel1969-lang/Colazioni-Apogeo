// ======================================
// COLAZIONI HOTEL - LOGICA PRINCIPALE
// app.js
// ======================================
// Dipende da: products.js, firebase-config.js (caricati prima in index.html)
// ======================================

// ── Stato applicazione ────────────────────────────────────────────────────

const state = {
  // Mappa id → { id, name, category, qty, selected, note, isExtra }
  items: {},
  // Filtro corrente: 'all' | 'selected' | categoria
  filter: 'all',
  // Categorie espanse (set di nomi)
  expandedCats: new Set(),
  // Firebase disponibile
  useFirebase: false,
  // Listener Firestore
  unsubscribe: null,
};

// ── Inizializzazione Firebase ─────────────────────────────────────────────

function initFirebase() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    const db = firebase.firestore();

    // Avvia listener realtime
    state.unsubscribe = db
      .collection(FIRESTORE_COLLECTION)
      .doc(FIRESTORE_DOC_CURRENT)
      .onSnapshot(
        doc => {
          setSyncStatus('ok', '● sync');
          if (doc.exists) {
            mergeFirebaseData(doc.data());
          }
          renderAll();
        },
        err => {
          console.warn('Firestore error:', err);
          setSyncStatus('error', '✕ offline');
        }
      );

    state.useFirebase = true;
    setSyncStatus('ok', '● connesso');
  } catch (e) {
    console.warn('Firebase non disponibile:', e.message);
    setSyncStatus('local', '◌ locale');
  }
}

function getDb() {
  return firebase.firestore();
}

// ── Funzioni Firestore ────────────────────────────────────────────────────

// Salva l'intero stato su Firestore (document unico)
async function saveToFirestore() {
  if (!state.useFirebase) return;
  try {
    const payload = {};
    Object.values(state.items).forEach(item => {
      payload[item.id] = {
        id:         item.id,
        name:       item.name,
        category:   item.category,
        qty:        item.qty,
        selected:   item.selected,
        note:       item.note,
        isExtra:    item.isExtra || false,
      };
    });
    await getDb()
      .collection(FIRESTORE_COLLECTION)
      .doc(FIRESTORE_DOC_CURRENT)
      .set({ items: payload, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    setSyncStatus('ok', '● salvato');
  } catch (e) {
    console.error('Errore salvataggio Firestore:', e);
    setSyncStatus('error', '✕ errore salvataggio');
  }
}

// Unisce i dati Firebase nello stato locale
// (gli articoli standard esistono sempre; vengono aggiornati i campi operativi)
function mergeFirebaseData(data) {
  const fbItems = data.items || {};

  // Aggiorna articoli esistenti
  Object.values(fbItems).forEach(fbItem => {
    if (state.items[fbItem.id]) {
      // Articolo standard: aggiorna solo campi operativi
      state.items[fbItem.id].qty      = fbItem.qty      || 0;
      state.items[fbItem.id].selected = fbItem.selected || false;
      state.items[fbItem.id].note     = fbItem.note     || '';
    } else if (fbItem.isExtra) {
      // Articolo extra: aggiunge o aggiorna
      state.items[fbItem.id] = {
        id:       fbItem.id,
        name:     fbItem.name,
        category: fbItem.category || 'Extra',
        qty:      fbItem.qty      || 0,
        selected: fbItem.selected || false,
        note:     fbItem.note     || '',
        isExtra:  true,
      };
    }
  });

  // Rimuovi extra non più presenti su Firebase
  Object.values(state.items).forEach(item => {
    if (item.isExtra && !fbItems[item.id]) {
      delete state.items[item.id];
    }
  });
}

// ── Inizializzazione articoli standard ───────────────────────────────────

function initStandardProducts() {
  STANDARD_PRODUCTS.forEach(p => {
    state.items[p.id] = {
      id:       p.id,
      name:     p.name,
      category: p.category,
      qty:      0,
      selected: false,
      note:     '',
      isExtra:  false,
    };
  });

  // Espandi tutte le categorie per default
  getCategories().forEach(c => state.expandedCats.add(c));
}

// ── Helpers categorie ─────────────────────────────────────────────────────

function getCategories() {
  const cats = [...new Set(Object.values(state.items).map(i => i.category))];
  // Ordina secondo CATEGORY_ORDER
  return cats.sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function getItemsByCategory(category) {
  return Object.values(state.items)
    .filter(i => i.category === category)
    .sort((a, b) => {
      // Extra in fondo all'interno della categoria
      if (a.isExtra !== b.isExtra) return a.isExtra ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
}

function getVisibleItems(category) {
  const items = getItemsByCategory(category);
  if (state.filter === 'all') return items;
  if (state.filter === 'selected') return items.filter(i => i.selected);
  return items;
}

function countSelected() {
  return Object.values(state.items).filter(i => i.selected).length;
}

function countSelectedInCategory(cat) {
  return Object.values(state.items).filter(i => i.category === cat && i.selected).length;
}

// ── Azioni articolo ───────────────────────────────────────────────────────

function toggleSelected(id) {
  const item = state.items[id];
  if (!item) return;
  item.selected = !item.selected;
  // Auto-qty: se selezionato e qty era 0, metti 1
  if (item.selected && item.qty === 0) item.qty = 1;
  renderAll();
  debouncedSave();
}

function changeQty(id, delta) {
  const item = state.items[id];
  if (!item) return;
  item.qty = Math.max(0, (item.qty || 0) + delta);
  // Auto-seleziona se qty > 0
  if (item.qty > 0) item.selected = true;
  if (item.qty === 0) item.selected = false;
  renderAll();
  debouncedSave();
}

function setNote(id, note) {
  const item = state.items[id];
  if (!item) return;
  item.note = note.trim();
  renderAll();
  debouncedSave();
}

function deleteExtra(id) {
  if (!state.items[id] || !state.items[id].isExtra) return;
  delete state.items[id];
  renderAll();
  debouncedSave();
}

// ── Debounce salvataggio ──────────────────────────────────────────────────

let saveTimeout = null;
function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveToFirestore(), 800);
}

// ── Salvataggio storico ───────────────────────────────────────────────────

async function saveToHistory() {
  if (!state.useFirebase) {
    alert('Storico disponibile solo con Firebase configurato.');
    return;
  }
  const selectedItems = Object.values(state.items).filter(i => i.selected);
  if (selectedItems.length === 0) {
    alert('Nessun articolo selezionato da salvare.');
    return;
  }
  try {
    const payload = {
      savedAt: firebase.firestore.FieldValue.serverTimestamp(),
      items: selectedItems.map(i => ({
        id: i.id, name: i.name, category: i.category,
        qty: i.qty, note: i.note, isExtra: i.isExtra || false,
      })),
    };
    await getDb().collection(FIRESTORE_COLLECTION_STORICO).add(payload);
    setSyncStatus('ok', '● storico salvato');
    setTimeout(() => setSyncStatus('ok', '● sync'), 2000);
  } catch (e) {
    console.error('Errore salvataggio storico:', e);
  }
}

// ── Rendering principale ──────────────────────────────────────────────────

function renderAll() {
  renderBadge();
  renderList();
}

function renderBadge() {
  document.getElementById('badge-count').textContent = countSelected();
}

function renderList() {
  const container = document.getElementById('products-list');
  const cats = getCategories();
  container.innerHTML = '';

  // Filtra per categoria se necessario
  const catsToShow = state.filter === 'selected'
    ? cats.filter(c => countSelectedInCategory(c) > 0)
    : cats;

  if (catsToShow.length === 0) {
    container.innerHTML = '<div class="empty-msg">Nessun articolo selezionato.</div>';
    return;
  }

  catsToShow.forEach(cat => {
    const items = getVisibleItems(cat);
    if (items.length === 0 && state.filter !== 'all') return;

    const expanded = state.expandedCats.has(cat);
    const selCount = countSelectedInCategory(cat);

    // Header categoria
    const header = document.createElement('div');
    header.className = `cat-header${expanded ? '' : ' collapsed'}`;
    header.dataset.cat = cat;
    header.innerHTML = `
      <span class="cat-arrow">▼</span>
      <span class="cat-name">${cat}</span>
      <span class="cat-count">${selCount > 0 ? `<span class="sel-count">${selCount}</span>/` : ''}${items.length}</span>
    `;
    header.addEventListener('click', () => toggleCategory(cat));
    container.appendChild(header);

    // Body categoria
    const body = document.createElement('div');
    body.className = `cat-body${expanded ? '' : ' collapsed'}`;
    body.dataset.catBody = cat;

    items.forEach(item => {
      body.appendChild(renderRow(item));
    });

    container.appendChild(body);
  });
}

function renderRow(item) {
  const row = document.createElement('div');
  row.className = `product-row${item.selected ? ' selected' : ''}${item.isExtra ? ' extra' : ''}`;
  row.dataset.id = item.id;

  const hasNote = item.note && item.note.length > 0;

  row.innerHTML = `
    <div class="row-check" data-action="toggle" data-id="${item.id}">
      <div class="check-icon">✓</div>
    </div>
    <div class="row-name" data-action="toggle" data-id="${item.id}">
      <span class="name-text">${escHtml(item.name)}${item.isExtra ? ' <span class="badge-extra">EXTRA</span>' : ''}</span>
      ${hasNote ? `<span class="note-text">📝 ${escHtml(item.note)}</span>` : ''}
    </div>
    <div class="row-qty">
      <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
      <span class="qty-val">${item.qty}</span>
      <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
    </div>
    <div class="row-actions">
      <button class="btn-note${hasNote ? ' has-note' : ''}" data-action="note" data-id="${item.id}" title="Note">📝</button>
      ${item.isExtra ? `<button class="btn-del-extra" data-action="del-extra" data-id="${item.id}" title="Elimina">✕</button>` : ''}
    </div>
  `;

  return row;
}

// ── Delegazione eventi lista ──────────────────────────────────────────────

document.getElementById('products-list').addEventListener('click', e => {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;
  const id     = target.dataset.id;

  switch (action) {
    case 'toggle':    toggleSelected(id); break;
    case 'plus':      changeQty(id, +1); break;
    case 'minus':     changeQty(id, -1); break;
    case 'note':      openNoteModal(id); break;
    case 'del-extra': confirmDeleteExtra(id); break;
  }
});

// ── Categorie expand/collapse ─────────────────────────────────────────────

function toggleCategory(cat) {
  if (state.expandedCats.has(cat)) {
    state.expandedCats.delete(cat);
  } else {
    state.expandedCats.add(cat);
  }
  renderList();
}

// ── Filtri ────────────────────────────────────────────────────────────────

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderList();
  });
});

// ── Modal Note ────────────────────────────────────────────────────────────

function openNoteModal(id) {
  const item = state.items[id];
  if (!item) return;
  document.getElementById('note-modal-title').textContent = item.name;
  document.getElementById('note-input').value = item.note || '';
  document.getElementById('note-modal').classList.remove('hidden');
  document.getElementById('note-modal').dataset.id = id;
  setTimeout(() => document.getElementById('note-input').focus(), 50);
}

document.getElementById('note-modal-ok').addEventListener('click', () => {
  const id   = document.getElementById('note-modal').dataset.id;
  const note = document.getElementById('note-input').value;
  setNote(id, note);
  document.getElementById('note-modal').classList.add('hidden');
});

document.getElementById('note-modal-cancel').addEventListener('click', () => {
  document.getElementById('note-modal').classList.add('hidden');
});

// ── Modal Aggiungi Extra ──────────────────────────────────────────────────

document.getElementById('btn-add-extra').addEventListener('click', () => {
  document.getElementById('extra-name').value   = '';
  document.getElementById('extra-cat').value    = 'Extra';
  document.getElementById('extra-qty').value    = '1';
  document.getElementById('extra-note').value   = '';
  document.getElementById('extra-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('extra-name').focus(), 50);
});

document.getElementById('extra-modal-ok').addEventListener('click', () => {
  const name = document.getElementById('extra-name').value.trim();
  if (!name) { alert('Inserire il nome articolo.'); return; }

  const cat  = document.getElementById('extra-cat').value.trim() || 'Extra';
  const qty  = parseInt(document.getElementById('extra-qty').value) || 1;
  const note = document.getElementById('extra-note').value.trim();

  const id = 'extra-' + Date.now();
  state.items[id] = {
    id, name, category: cat,
    qty, selected: true,
    note, isExtra: true,
  };

  // Espandi la categoria
  state.expandedCats.add(cat);

  document.getElementById('extra-modal').classList.add('hidden');
  renderAll();
  debouncedSave();
});

document.getElementById('extra-modal-cancel').addEventListener('click', () => {
  document.getElementById('extra-modal').classList.add('hidden');
});

// ── Conferma elimina extra ─────────────────────────────────────────────────

function confirmDeleteExtra(id) {
  const item = state.items[id];
  if (!item) return;
  document.getElementById('del-modal-name').textContent = item.name;
  document.getElementById('del-modal').classList.remove('hidden');
  document.getElementById('del-modal').dataset.id = id;
}

document.getElementById('del-modal-ok').addEventListener('click', () => {
  const id = document.getElementById('del-modal').dataset.id;
  deleteExtra(id);
  document.getElementById('del-modal').classList.add('hidden');
});

document.getElementById('del-modal-cancel').addEventListener('click', () => {
  document.getElementById('del-modal').classList.add('hidden');
});

// ── Reset ─────────────────────────────────────────────────────────────────

document.getElementById('btn-reset').addEventListener('click', () => {
  document.getElementById('reset-modal').classList.remove('hidden');
});

document.getElementById('reset-modal-ok').addEventListener('click', () => {
  // Azzera stato operativo
  Object.values(state.items).forEach(item => {
    item.qty = 0;
    item.selected = false;
    item.note = '';
  });
  // Rimuovi extra
  Object.keys(state.items).forEach(id => {
    if (state.items[id].isExtra) delete state.items[id];
  });
  document.getElementById('reset-modal').classList.add('hidden');
  renderAll();
  debouncedSave();
});

document.getElementById('reset-modal-cancel').addEventListener('click', () => {
  document.getElementById('reset-modal').classList.add('hidden');
});

// ── Salva storico ─────────────────────────────────────────────────────────

document.getElementById('btn-save').addEventListener('click', () => {
  saveToHistory();
});

// ── Stampa ────────────────────────────────────────────────────────────────

document.getElementById('btn-print').addEventListener('click', () => {
  buildPrintView();
  window.print();
});

function buildPrintView() {
  const now = new Date().toLocaleDateString('it-IT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const selectedItems = Object.values(state.items).filter(i => i.selected);
  const cats = [...new Set(selectedItems.map(i => i.category))].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  let html = `
    <div id="print-header" style="display:block">
      <h2 style="font-size:14pt;margin-bottom:4px">ORDINE COLAZIONE — Hotel Apogeo</h2>
      <p style="font-size:10pt;color:#666;margin-bottom:12px">${now}</p>
    </div>
    <table class="print-table">
      <thead>
        <tr>
          <th style="width:40%">Articolo</th>
          <th style="width:12%">Qtà</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
  `;

  cats.forEach(cat => {
    const items = selectedItems
      .filter(i => i.category === cat)
      .sort((a, b) => a.name.localeCompare(b.name));

    html += `<tr class="print-cat-header"><td colspan="3">${cat}</td></tr>`;
    items.forEach(item => {
      html += `
        <tr>
          <td>${escHtml(item.name)}${item.isExtra ? ' <span class="print-extra-badge">[EXTRA]</span>' : ''}</td>
          <td><strong>${item.qty}</strong></td>
          <td class="print-note">${escHtml(item.note || '')}</td>
        </tr>
      `;
    });
  });

  html += `</tbody></table>
    <p style="font-size:8pt;color:#999;margin-top:16px">
      Totale articoli: ${selectedItems.length} | Generato da Ordine Colazioni WebApp
    </p>`;

  // Inietta nel div nascosto usato solo per print
  let printDiv = document.getElementById('print-content');
  if (!printDiv) {
    printDiv = document.createElement('div');
    printDiv.id = 'print-content';
    document.body.appendChild(printDiv);
  }
  printDiv.innerHTML = html;
}

// ── Sync status ───────────────────────────────────────────────────────────

function setSyncStatus(cls, text) {
  const el = document.getElementById('sync-status');
  el.className = `sync-status ${cls}`;
  el.textContent = text;
}

// ── Utils ─────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Service Worker ────────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}

// ── Bootstrap ─────────────────────────────────────────────────────────────

initStandardProducts();
initFirebase();
renderAll();
