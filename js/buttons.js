// ============ FOOTER (BUTTONS) — carousel ============
function renderButtonsFull() {
  const footer = $c('.bubble-footer');
  const list = $c('.button-list');
  const c = cur();
  if (!footer || !list || !c) return;

  footer.innerHTML = '';
  footer.className = 'bubble-footer ' + (c.buttons.length === 0 ? 'no-buttons' : '');

  c.buttons.forEach((btn) => {
    const el = createBubbleButton(btn);
    footer.appendChild(el);
  });

  appendAddWrap(footer);

  list.innerHTML = '';
  c.buttons.forEach((btn, idx) => {
    list.appendChild(createButtonItem(btn, idx));
  });
}

function appendAddWrap(footer) {
  const c = cur();
  if (!c || c.buttons.length >= 10) return;
  // v3/v4 bubble preview is display-only — adding buttons happens via the
  // right-pane "+ 新增動作按鈕" trigger.
  const msg = activeMessage();
  if (msg && isRightPaneOnlyType(msg.type)) return;
  const wrap = document.createElement('div');
  wrap.className = 'btn-add-wrap ' + (c.buttons.length === 0 ? 'no-buttons' : 'has-buttons');
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn-add';
  addBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> 新增按鈕`;
  addBtn.addEventListener('click', addNewButton);
  wrap.appendChild(addBtn);
  footer.appendChild(wrap);
}

// `onCreated(btn, leftEl, accItem)` overrides the default post-add focus.
// When omitted, the new bubble-button on the left receives focus — which
// also opens the inline button popover via its focus handler. v2's right-side
// "+ 新增按鈕" passes a callback to keep the editing flow on the right pane.
function addNewButton(onCreated) {
  const c = cur();
  if (!c) return;
  const nb = makeBtn();
  c.buttons.push(nb);

  const footer = $c('.bubble-footer');

  const oldAddWrap = footer.querySelector('.btn-add-wrap');
  if (oldAddWrap) oldAddWrap.remove();

  footer.className = 'bubble-footer ' + (c.buttons.length === 0 ? 'no-buttons' : '');

  const newEl = createBubbleButton(nb);
  footer.appendChild(newEl);
  appendAddWrap(footer);

  const msg = activeMessage();
  let accItem = null;
  if (msg && msg.type === 'carousel-v4') {
    const accList = $c('.btn-acc-list');
    if (accList) {
      accItem = createBtnAccItemV4(nb);
      accList.appendChild(accItem);
    }
  } else if (msg && (msg.type === 'carousel-v2' || msg.type === 'carousel-v3')) {
    const accList = $c('.btn-acc-list');
    if (accList) {
      accItem = createBtnAccItem(nb);
      accList.appendChild(accItem);
    }
  } else {
    const list = $c('.button-list');
    if (list) list.appendChild(createButtonItem(nb, c.buttons.length - 1));
  }

  updateEditorBlocks();
  updateGuideMode();
  scheduleAlign();

  if (typeof onCreated === 'function') {
    onCreated(nb, newEl, accItem);
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        focusBubbleButton(newEl);
      }, 0);
    });
  });
}

function focusBubbleButton(el) {
  if (!el || !el.isConnected) return;
  const textEl = el.querySelector('.bubble-button-text');
  if (!textEl) return;
  textEl.focus();
  if (document.activeElement !== textEl) {
    requestAnimationFrame(() => textEl.focus());
  }
  try {
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(textEl);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
  } catch (e) {}
}

function deleteButton(id) {
  const c = cur();
  if (!c) return;
  closeButtonColorOverlayFor(id);
  c.buttons = c.buttons.filter(b => b.id !== id);

  const footer = $c('.bubble-footer');

  const leftEl = footer.querySelector(`.bubble-button[data-id="${id}"]`);
  if (leftEl) leftEl.remove();

  // v1 right-side card
  const list = $c('.button-list');
  if (list) {
    const rightEl = list.querySelector(`.button-item[data-id="${id}"]`);
    if (rightEl) rightEl.remove();
    list.querySelectorAll('.button-item').forEach((it, idx) => {
      const indexLabel = it.querySelector('.btn-index');
      if (indexLabel) indexLabel.textContent = idx + 1;
    });
  }

  // v2 accordion list
  const accList = $c('.btn-acc-list');
  if (accList) {
    const accEl = accList.querySelector(`.btn-acc-item[data-id="${id}"]`);
    if (accEl) accEl.remove();
  }

  if (c.buttons.length === 0) {
    footer.className = 'bubble-footer no-buttons';
    const oldAddWrap = footer.querySelector('.btn-add-wrap');
    if (oldAddWrap) oldAddWrap.remove();
    appendAddWrap(footer);
  } else if (c.buttons.length === 9) {
    if (!footer.querySelector('.btn-add-wrap')) {
      appendAddWrap(footer);
    }
  }

  updateEditorBlocks();
  updateGuideMode();
  scheduleAlign();
}

function createBubbleButton(btn) {
  const msg = activeMessage();
  const isRightPaneOnly = !!(msg && isRightPaneOnlyType(msg.type));

  const el = document.createElement('div');
  el.className = 'bubble-button' + (btn.text ? '' : ' empty-text');
  el.style.background = btn.bg;
  el.style.color = btn.fg;
  el.dataset.id = btn.id;
  el.draggable = !isRightPaneOnly;

  const textEl = document.createElement('div');
  textEl.className = 'bubble-button-text';
  if (!isRightPaneOnly) textEl.contentEditable = 'true';
  textEl.spellcheck = false;
  textEl.textContent = btn.text;
  el.appendChild(textEl);

  // v3/v4: bubble buttons are display-only. Skip the drag handle, trash icon,
  // contentEditable focus + popover, and all interaction handlers.
  if (isRightPaneOnly) return el;

  const handle = document.createElement('div');
  handle.className = 'drag-handle';
  handle.innerHTML = `<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="8" cy="2" r="1.2"/><circle cx="2" cy="7" r="1.2"/><circle cx="8" cy="7" r="1.2"/><circle cx="2" cy="12" r="1.2"/><circle cx="8" cy="12" r="1.2"/></svg>`;
  el.appendChild(handle);

  const trash = document.createElement('button');
  trash.type = 'button';
  trash.className = 'btn-delete';
  trash.title = '刪除';
  trash.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;
  trash.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); });
  trash.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteButton(btn.id);
  });
  el.appendChild(trash);

  el.addEventListener('mousedown', (e) => {
    if (e.target === textEl || textEl.contains(e.target)) return;
    if (e.target === handle || handle.contains(e.target)) return;
    if (e.target === trash || trash.contains(e.target)) return;
    e.preventDefault();
    focusBubbleButton(el);
  });

  textEl.addEventListener('focus', () => {
    el.classList.remove('empty-text');
    openButtonColorOverlay(btn, el);
  });

  textEl.addEventListener('input', () => {
    let plain = textEl.textContent;
    if (plain.length > 40) {
      plain = plain.slice(0, 40);
      textEl.textContent = plain;
      const sel = window.getSelection();
      const r = document.createRange();
      r.selectNodeContents(textEl);
      r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
      showHint('按鈕文字最多 40 字');
    }
    btn.text = plain;
    syncButtonItemPreview(btn);
  });

  textEl.addEventListener('blur', () => {
    const plain = textEl.textContent;
    btn.text = plain;
    if (!plain) el.classList.add('empty-text');
    else el.classList.remove('empty-text');
    syncButtonItemPreview(btn);
  });

  textEl.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const remain = 40 - textEl.textContent.length;
    document.execCommand('insertText', false, text.slice(0, Math.max(0, remain)));
  });

  el.addEventListener('dragstart', (e) => {
    closeButtonColorOverlay();
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', btn.id);
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    $$c('.bubble-button').forEach(b => b.classList.remove('drag-over-top', 'drag-over-bot'));
  });
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    const r = el.getBoundingClientRect();
    const before = e.clientY < r.top + r.height / 2;
    el.classList.toggle('drag-over-top', before);
    el.classList.toggle('drag-over-bot', !before);
  });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over-top', 'drag-over-bot'));
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    const c = cur();
    if (!c) return;
    const fromId = e.dataTransfer.getData('text/plain');
    if (fromId === btn.id) return;
    const r = el.getBoundingClientRect();
    const before = e.clientY < r.top + r.height / 2;
    const fromIdx = c.buttons.findIndex(b => b.id === fromId);
    if (fromIdx < 0) return;
    const [moved] = c.buttons.splice(fromIdx, 1);
    let toIdx = c.buttons.findIndex(b => b.id === btn.id);
    if (toIdx < 0) toIdx = c.buttons.length;
    const insertAt = before ? toIdx : toIdx + 1;
    c.buttons.splice(insertAt, 0, moved);
    const msg = activeMessage();
    if (msg && msg.type === 'carousel-v4') {
      renderButtonsV4Full();
    } else if (msg && (msg.type === 'carousel-v2' || msg.type === 'carousel-v3')) {
      renderButtonsV2Full();
    } else {
      renderButtonsFull();
    }
    scheduleAlign();
  });

  return el;
}

function createButtonItem(btn, idx) {
  const item = document.createElement('div');
  item.className = 'button-item';
  item.dataset.id = btn.id;
  const previewIsEmpty = !btn.text;
  item.innerHTML = `
    <div class="btn-card-header">
      <div class="btn-card-title">
        <span class="btn-index">${idx + 1}.</span>
        <span class="btn-text-preview${previewIsEmpty ? ' is-empty' : ''}">${escapeHtml(btn.text || '輸入按鈕文字')}</span>
      </div>
      <div class="combo-swatch combo-swatch-sm btn-combo-swatch" title="按鈕配色">A</div>
    </div>
    <div class="btn-card-body">
      <select class="select-input btn-action-select">
        <option value="message" ${btn.action === 'message' ? 'selected' : ''}>文字</option>
        <option value="uri" ${btn.action === 'uri' ? 'selected' : ''}>連結</option>
      </select>
      <input type="text" class="text-input btn-value-input"
             placeholder="${btn.action === 'uri' ? 'https://...' : '使用者點擊後傳送的文字'}"
             value="${escapeHtml(btn.value)}"
             maxlength="${btn.action === 'uri' ? 2048 : 40}">
    </div>
  `;

  const sel = item.querySelector('.btn-action-select');
  const valInp = item.querySelector('.btn-value-input');
  const swatch = item.querySelector('.btn-combo-swatch');
  styleComboSwatch(swatch, btn.bg, btn.fg);

  sel.addEventListener('change', () => {
    btn.action = sel.value;
    valInp.placeholder = btn.action === 'uri' ? 'https://...' : '使用者點擊後傳送的文字';
    valInp.maxLength = btn.action === 'uri' ? 2048 : 40;
    if (btn.action === 'message' && btn.value.length > 40) {
      btn.value = btn.value.slice(0, 40);
      valInp.value = btn.value;
    }
    syncOverlayFromBtn(btn);
  });
  valInp.addEventListener('input', () => {
    btn.value = valInp.value;
    syncOverlayFromBtn(btn);
  });

  swatch.addEventListener('click', () => {
    openComboPopover(swatch, '按鈕配色', btn.bg, btn.fg, (bg, fg) => {
      btn.bg = bg;
      btn.fg = fg;
      styleComboSwatch(swatch, bg, fg);
      const card = swatch.closest('.msg-card');
      const bub = card && card.querySelector(`.bubble-footer .bubble-button[data-id="${btn.id}"]`);
      if (bub) {
        bub.style.background = bg;
        bub.style.color = fg;
      }
    });
  });

  return item;
}

function syncButtonItemPreview(btn) {
  // Update both v1 (.button-item) and v2 (.btn-acc-item) right-side previews.
  // Button IDs are global across cards. Empty-state placeholder differs between
  // v1 (the title slot reads "輸入按鈕文字") and v2 (the subtitle slot reads
  // the design's "{按鈕文字}" templated placeholder).
  const setPreview = (preview) => {
    const isV2 = !!preview.closest('.btn-acc-item');
    if (btn.text) {
      preview.textContent = btn.text;
      preview.classList.remove('is-empty');
    } else {
      preview.textContent = isV2 ? '{按鈕文字}' : '輸入按鈕文字';
      preview.classList.add('is-empty');
    }
  };

  document.querySelectorAll(
    `.button-item[data-id="${btn.id}"] .btn-text-preview, .btn-acc-item[data-id="${btn.id}"] .btn-text-preview`
  ).forEach(setPreview);

  // v2 accordion: also keep the editable text input + counter in sync (skip
  // input value writes when the input is focused, to avoid clobbering caret).
  document.querySelectorAll(`.btn-acc-item[data-id="${btn.id}"]`).forEach(item => {
    const inp = item.querySelector('.acc-btn-text');
    if (inp && document.activeElement !== inp && inp.value !== btn.text) {
      inp.value = btn.text;
    }
    const cnt = item.querySelector('.acc-count');
    if (cnt) cnt.textContent = String((btn.text || '').length);
  });
}
