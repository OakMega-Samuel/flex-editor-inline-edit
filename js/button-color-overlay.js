// ============ INLINE COLOR OVERLAY ============
// Reuses #colorPopover (same DOM as right-side flow) but opens it modelessly
// anchored to a focused inline element — currently a .bubble-button or the
// promo banner. While open, .app gets `bco-active` so the bubble's
// hover-revealed affordances stay pinned (cursor moving onto the popover
// doesn't collapse the layout).
//
// When opened for a .bubble-button, the popover also shows the button's
// action + value fields (mirrored from the right-side card) so the entire
// per-button edit can happen inside the preview.

let bcoState = { kind: null, btnId: null, anchorEl: null };

function _bcoShowModeless(anchorEl, title, bg, fg, onChange) {
  $('#app').classList.add('bco-active');
  openComboPopover(anchorEl, title, bg, fg, onChange);
  $('#backdrop').classList.remove('open');
  document.removeEventListener('mousedown', bcoOutsideMouseDown, true);
  document.addEventListener('mousedown', bcoOutsideMouseDown, true);
  document.removeEventListener('keydown', bcoKeyDown, true);
  document.addEventListener('keydown', bcoKeyDown, true);
}

function _bcoPlaceholderFor(action) {
  return action === 'uri' ? 'https://...' : '使用者點擊後傳送的文字';
}
function _bcoMaxLenFor(action) {
  return action === 'uri' ? 2048 : 40;
}

function _bcoMountButtonFields(btn) {
  const fields = $('#popoverButtonFields');
  const actionSel = $('#popoverActionSelect');
  const valueInp = $('#popoverValueInput');
  fields.hidden = false;
  actionSel.value = btn.action;
  valueInp.value = btn.value;
  valueInp.placeholder = _bcoPlaceholderFor(btn.action);
  valueInp.maxLength = _bcoMaxLenFor(btn.action);

  actionSel.onchange = () => {
    btn.action = actionSel.value;
    valueInp.placeholder = _bcoPlaceholderFor(btn.action);
    valueInp.maxLength = _bcoMaxLenFor(btn.action);
    if (btn.action === 'message' && btn.value.length > 40) {
      btn.value = btn.value.slice(0, 40);
      valueInp.value = btn.value;
    }
    syncRightSideFromBtn(btn);
  };
  valueInp.oninput = () => {
    btn.value = valueInp.value;
    syncRightSideFromBtn(btn);
  };
}

function _bcoUnmountButtonFields() {
  const fields = $('#popoverButtonFields');
  fields.hidden = true;
  $('#popoverActionSelect').onchange = null;
  $('#popoverValueInput').oninput = null;
}

function openButtonColorOverlay(btn, anchorEl) {
  bcoState.kind = 'button';
  bcoState.btnId = btn.id;
  bcoState.anchorEl = anchorEl;
  // Mount BEFORE showing so the popover measures its full height for
  // viewport-flip positioning.
  _bcoMountButtonFields(btn);
  _bcoShowModeless(anchorEl, '按鈕設定', btn.bg, btn.fg, (bg, fg) => {
    btn.bg = bg;
    btn.fg = fg;
    if (anchorEl && anchorEl.isConnected) {
      anchorEl.style.background = bg;
      anchorEl.style.color = fg;
    }
    // v1 right-pane button items still expose a small combo swatch.
    document.querySelectorAll(
      `.button-item[data-id="${btn.id}"] .btn-combo-swatch`
    ).forEach(sw => styleComboSwatch(sw, bg, fg));
    // v2 right-pane button accordions render an inline combo picker — sync
    // its swatches/inputs if the body has been opened at least once.
    document.querySelectorAll(
      `.btn-acc-item[data-id="${btn.id}"] .acc-body`
    ).forEach(body => { if (body._syncInline) body._syncInline(); });
  });
}

function openPromoColorOverlay(anchorEl) {
  const c = cur();
  if (!c) return;
  const card = anchorEl.closest('.msg-card');
  const promo = c.promo;
  bcoState.kind = 'promo';
  bcoState.btnId = null;
  bcoState.anchorEl = anchorEl;
  _bcoUnmountButtonFields();
  _bcoShowModeless(anchorEl, '標語配色', promo.bg, promo.fg, (bg, fg) => {
    promo.bg = bg;
    promo.fg = fg;
    const banner = card && card.querySelector('.promo-banner');
    if (banner) {
      banner.style.background = bg;
      banner.style.color = fg;
    }
    const sw = card && card.querySelector('.promo-swatch');
    if (sw) styleComboSwatch(sw, bg, fg);
    if (typeof updateAccTagsV2 === 'function') updateAccTagsV2();
  });
}

function closeButtonColorOverlay() {
  if (!bcoState.anchorEl) return;
  closePopover();
  $('#app').classList.remove('bco-active');
  _bcoUnmountButtonFields();
  bcoState.kind = null;
  bcoState.btnId = null;
  bcoState.anchorEl = null;
  document.removeEventListener('mousedown', bcoOutsideMouseDown, true);
  document.removeEventListener('keydown', bcoKeyDown, true);
}

function closeButtonColorOverlayFor(btnId) {
  if (bcoState.kind === 'button' && bcoState.btnId === btnId) closeButtonColorOverlay();
}

// Right side ⇄ overlay sync helpers — both directions write to btn first
// (single source of truth), then mirror DOM in the *other* surface.

function syncRightSideFromBtn(btn) {
  document.querySelectorAll(
    `.button-item[data-id="${btn.id}"], .btn-acc-item[data-id="${btn.id}"]`
  ).forEach(item => {
    const sel = item.querySelector('.btn-action-select');
    const valInp = item.querySelector('.btn-value-input');
    if (sel && sel.value !== btn.action) sel.value = btn.action;
    if (valInp) {
      if (valInp.value !== btn.value) valInp.value = btn.value;
      valInp.placeholder = _bcoPlaceholderFor(btn.action);
      valInp.maxLength = _bcoMaxLenFor(btn.action);
    }
    // v2 accordion subtitle, if present
    const sub = item.querySelector('.btn-sub');
    if (sub) {
      const v = btn.value || '—';
      const lbl = btn.action === 'uri' ? '開啟連結' : '傳送文字';
      sub.textContent = `${lbl}：${v}`;
    }
  });
}

function syncOverlayFromBtn(btn) {
  if (bcoState.kind !== 'button' || bcoState.btnId !== btn.id) return;
  const actionSel = $('#popoverActionSelect');
  const valueInp = $('#popoverValueInput');
  if (actionSel && actionSel.value !== btn.action) actionSel.value = btn.action;
  if (valueInp) {
    if (valueInp.value !== btn.value) valueInp.value = btn.value;
    valueInp.placeholder = _bcoPlaceholderFor(btn.action);
    valueInp.maxLength = _bcoMaxLenFor(btn.action);
  }
}

function bcoOutsideMouseDown(e) {
  const popover = $('#colorPopover');
  if (popover.contains(e.target)) return;
  if (bcoState.anchorEl && bcoState.anchorEl.contains(e.target)) return;
  closeButtonColorOverlay();
}

function bcoKeyDown(e) {
  if (e.key === 'Escape') closeButtonColorOverlay();
}
