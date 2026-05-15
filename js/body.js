// ============ BODY (carousel) ============
function renderBody() {
  const body = $c('.bubble-body');
  if (!body) return;
  const c = cur();
  if (!c) return;
  body.innerHTML = '';

  const msg = activeMessage();
  const isV2 = !!(msg && msg.type === 'carousel-v2');
  const isRightPaneOnly = !!(msg && isRightPaneOnlyType(msg.type));

  // v3/v4 bubble body is display-only: editing happens entirely on the right.
  // Render only non-empty fields as plain divs (no contentEditable, no delete,
  // no add trigger). The empty body shows nothing at all.
  if (isRightPaneOnly) {
    const visible = ['title', 'desc', 'price'].filter(f => c[f] !== null && c[f] !== '');
    if (visible.length === 0) {
      body.classList.add('empty');
      body.classList.remove('has-content');
      return;
    }
    body.classList.remove('empty');
    body.classList.add('has-content');
    visible.forEach(field => {
      const meta = FIELD_META[field];
      const div = document.createElement('div');
      div.className = meta.cls;
      div.dataset.field = field;
      div.style.color = c.cardText;
      div.textContent = c[field];
      body.appendChild(div);
    });
    return;
  }

  // v2 always renders all 3 slots so the bubble preview reads as a real card
  // even when no fields exist yet. Null fields show a ghost placeholder that
  // on click materializes the field (state: null → '') and focuses it — same
  // semantics as the legacy 新增{標題|說明|價格} flow, just no menu hop.
  //
  // Mixed mode (some filled, some null): the ghosts collapse out of the
  // preview unless the bubble is hovered, so a finished card reads cleanly.
  // The all-null initial state always shows all three (no v2-mixed class).
  if (isV2) {
    const fields = ['title', 'desc', 'price'];
    const filledCount = fields.filter(f => c[f] !== null).length;
    const isMixed = filledCount > 0 && filledCount < fields.length;
    body.classList.remove('empty');
    body.classList.add('has-content');
    body.classList.toggle('v2-mixed', isMixed);
    fields.forEach(field => {
      if (c[field] === null) {
        body.appendChild(buildGhostBodyField(field));
      } else {
        body.appendChild(buildEditableBodyField(field));
      }
    });
    return;
  }

  if (!hasAnyBody()) {
    body.classList.add('empty');
    body.classList.remove('has-content');
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'body-add-trigger';
    trigger.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> 新增文字`;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openBodyAddMenu(trigger);
    });
    body.appendChild(trigger);
    return;
  }

  body.classList.remove('empty');
  body.classList.add('has-content');

  ['title', 'desc', 'price'].forEach(field => {
    if (c[field] === null) return;
    body.appendChild(buildEditableBodyField(field));
  });

  const missing = ['title', 'desc', 'price'].filter(f => c[f] === null);
  if (missing.length > 0) {
    const inline = document.createElement('button');
    inline.type = 'button';
    inline.className = 'body-inline-add';
    inline.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> 新增文字`;
    inline.addEventListener('click', (e) => {
      e.stopPropagation();
      openBodyAddMenu(inline);
    });
    body.appendChild(inline);
  }
}

function buildEditableBodyField(field) {
  const meta = FIELD_META[field];
  const wrap = document.createElement('div');
  wrap.className = 'body-field';
  wrap.dataset.field = field;

  const ed = document.createElement('div');
  ed.className = meta.cls + (cur()[field] === '' ? ' is-empty' : '');
  ed.contentEditable = 'true';
  ed.dataset.field = field;
  ed.dataset.placeholder = meta.placeholder;
  ed.style.color = cur().cardText;
  ed.textContent = cur()[field];

  ed.addEventListener('focus', () => ed.classList.remove('is-empty'));

  ed.addEventListener('input', () => {
    if (ed.textContent.length > meta.max) {
      ed.textContent = ed.textContent.slice(0, meta.max);
      const sel = window.getSelection();
      const r = document.createRange();
      r.selectNodeContents(ed);
      r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
      showHint(`已達 ${meta.max} 字上限`);
    }
    cur()[field] = ed.textContent;
    if (typeof syncV3TextFromBubble === 'function') syncV3TextFromBubble(field);
    if (typeof updateV4TextPane === 'function') updateV4TextPane();
    scheduleAlign();
  });

  ed.addEventListener('blur', () => {
    if (!cur()[field]) ed.classList.add('is-empty');
  });

  ed.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const remain = meta.max - ed.textContent.length;
    document.execCommand('insertText', false, text.slice(0, Math.max(0, remain)));
  });

  wrap.appendChild(ed);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'field-delete';
  del.title = `移除${meta.label}`;
  del.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  del.addEventListener('mousedown', (e) => e.preventDefault());
  del.addEventListener('click', (e) => {
    e.stopPropagation();
    cur()[field] = null;
    renderBody();
    updateEditorBlocks();
    updateGuideMode();
    scheduleAlign();
  });
  wrap.appendChild(del);

  return wrap;
}

// v2-only: ghost row for a still-null field. Visually mirrors the live editable
// (same styled placeholder via ::before) but is non-editable; the entire wrap
// is a click target that runs addBodyField — same data flow as the legacy
// add-button click. Children opt out of pointer events so the click always
// lands on the wrap regardless of where the cursor is inside.
function buildGhostBodyField(field) {
  const meta = FIELD_META[field];
  const wrap = document.createElement('div');
  wrap.className = 'body-field body-field-ghost';
  wrap.dataset.field = field;

  const ghost = document.createElement('div');
  ghost.className = meta.cls + ' is-empty';
  ghost.dataset.field = field;
  ghost.dataset.placeholder = meta.placeholder;
  ghost.style.color = cur().cardText;
  wrap.appendChild(ghost);

  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    addBodyField(field);
  });
  return wrap;
}

function addBodyField(field) {
  const c = cur();
  if (!c || c[field] !== null) return;
  c[field] = '';
  renderBody();
  updateEditorBlocks();
  updateGuideMode();
  scheduleAlign();
  requestAnimationFrame(() => {
    const ed = $c(`.bubble-body [contenteditable][data-field="${field}"]`);
    if (ed) ed.focus();
  });
}

function openBodyAddMenu(anchor) {
  const menu = $('#bodyAddMenu');
  const c = cur();
  if (!c) return;
  menu.querySelectorAll('.menu-item').forEach(mi => {
    const f = mi.dataset.add;
    mi.classList.toggle('disabled', c[f] !== null);
  });
  positionMenu(menu, anchor);
  setTimeout(() => {
    document.addEventListener('mousedown', closeBodyAddMenuHandler, { once: true });
  }, 0);
}
function closeBodyAddMenuHandler(e) {
  if (e.target.closest('#bodyAddMenu')) {
    document.addEventListener('mousedown', closeBodyAddMenuHandler, { once: true });
    return;
  }
  $('#bodyAddMenu').classList.remove('open');
}

$('#bodyAddMenu').addEventListener('click', (e) => {
  const item = e.target.closest('.menu-item');
  if (!item || item.classList.contains('disabled')) return;
  const c = cur();
  if (!c) return;
  const f = item.dataset.add;
  c[f] = '';
  $('#bodyAddMenu').classList.remove('open');
  renderBody();
  updateEditorBlocks();
  updateGuideMode();
  scheduleAlign();
  requestAnimationFrame(() => {
    const ed = $c(`.bubble-body [contenteditable][data-field="${f}"]`);
    if (ed) ed.focus();
  });
});
