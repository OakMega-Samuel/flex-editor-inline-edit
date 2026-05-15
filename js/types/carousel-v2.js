// ============ TYPE: CAROUSEL V2 (多頁訊息 v2) ============
// Same data shape as `carousel`. Bubble preview is identical. The right pane
// replaces v1's swatch + button-list with accordion-style fields:
//   - 訊息內容設定 section: a single 文字與背景顏色 accordion item whose body
//     hosts the shared inline combo picker (presets + custom hex + swap).
//   - 動作按鈕設定 section: one accordion item per button. Header carries no
//     color preview; the body inlines the same combo picker alongside the
//     text / action / delete fields.
//
// Reuses page tabs, hero, body, bubble-button rendering. Right-side updates
// are handled by hooks in shared modules (updateAccTagsV2, updateEditorBlocksV2,
// syncRightSideFromBtn extensions).

// Per-design (Figma 5383:21513) the v2 button text input shows a X/15 counter.
// The bubble-button on the left preview keeps its 40-char hard cap so existing
// data and v1 behavior are unaffected; this only constrains what's typed into
// the right-pane accordion field.
const BTN_TEXT_MAX_V2 = 15;

const CAROUSEL_V2_TEMPLATE = `
  <div class="tabs-band">
    <div class="tabs-band-l">
      <div class="page-tabs"></div>
    </div>
    <div class="tabs-band-r">
      <label class="alt-label">預覽文字</label>
      <div class="alt-input-wrap">
        <input type="text" class="alt-input" maxlength="400" placeholder="請輸入內容">
        <span class="alt-counter"><span class="alt-count">0</span><span class="sep">/</span><span class="max">400</span></span>
      </div>
    </div>
  </div>

  <div class="content-divider"></div>

  <div class="body-row">
    <div class="preview-pane">
      <div class="bubble">

        <div class="image-section" data-anchor="image">
          <div class="image-add-host empty">
            <button class="image-add-trigger" type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新增圖片
            </button>
          </div>
          <div class="bubble-hero" style="display:none">
            <div class="promo-add-host">
              <button class="promo-add-trigger" type="button">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                新增宣傳標語
              </button>
            </div>
            <div class="promo-banner" style="display:none">
              <span class="promo-text" data-placeholder="輸入宣傳標語"></span>
              <button class="promo-delete" type="button" title="移除標語">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="anim-badge" style="display:none">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              動態
            </div>
            <div class="hero-controls">
              <button class="hero-control-btn replace-btn">替換</button>
              <button class="hero-control-btn toggle-anim-btn">切換動態</button>
              <button class="hero-control-btn danger remove-image-btn">移除</button>
            </div>
          </div>
        </div>

        <div class="body-section" data-anchor="body">
          <div class="bubble-body empty"></div>
        </div>

        <div class="buttons-section" data-anchor="buttons">
          <div class="bubble-footer no-buttons"></div>
        </div>

      </div>
    </div>

    <div class="editor-pane editor-pane-v2">

      <div class="acc-section">
        <div class="acc-section-title">訊息內容設定</div>

        <div class="acc-item" data-acc="cardColors">
          <div class="acc-header">
            <span class="acc-color-preview" aria-hidden="true">
              <span class="acc-color-dot acc-color-dot-bg"></span>
              <span class="acc-color-dot acc-color-dot-fg"></span>
            </span>
            <span class="acc-title">文字與背景顏色</span>
            <svg class="acc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="acc-body"><div class="acc-body-inner"></div></div>
        </div>

        <div class="acc-item" data-acc="promoColors" style="display:none">
          <div class="acc-header">
            <span class="acc-color-preview" aria-hidden="true">
              <span class="acc-color-dot acc-color-dot-promo-bg"></span>
              <span class="acc-color-dot acc-color-dot-promo-fg"></span>
            </span>
            <span class="acc-title">宣傳標語顏色</span>
            <svg class="acc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="acc-body"><div class="acc-body-inner"></div></div>
        </div>
      </div>

      <div class="acc-section">
        <div class="acc-section-title">動作按鈕設定</div>
        <div class="btn-acc-list"></div>
        <button type="button" class="btn-add-v2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新增按鈕
        </button>
      </div>

    </div>
  </div>
`;

// ============ Top-level renderBody for carousel-v2 type ============
function renderCarouselV2Body(msg, body) {
  body.innerHTML = CAROUSEL_V2_TEMPLATE;
  renderCarouselV2Full();
  bindCarouselV2Handlers(body.closest('.msg-card'));
}

// Full re-render of the active v2 carousel (after page add/delete/swap, etc.)
function renderCarouselV2Full() {
  renderPageTabs();
  renderHero();
  renderBody();
  renderButtonsV2Full();

  const car = activeCarousel();
  const altInput = $c('.alt-input');
  const altCount = $c('.alt-count');
  if (altInput && car) altInput.value = car.altText;
  if (altCount && car) altCount.textContent = String(car.altText.length);

  applyCardColors();        // also fires updateAccTagsV2 via hook
  updateEditorBlocksV2();
  updateGuideMode();
  scheduleAlign();
}

// Dispatcher used by pages.js to pick the right full-render based on type.
function renderActiveCarousel() {
  const msg = activeMessage();
  if (msg && msg.type === 'carousel-v2') {
    renderCarouselV2Full();
  } else if (msg && msg.type === 'carousel-v3') {
    renderCarouselV3Full();
  } else if (msg && msg.type === 'carousel-v4') {
    renderCarouselV4Full();
  } else if (msg && msg.type === 'multi-image') {
    renderMultiImageFull();
  } else {
    renderCarouselFull();
  }
}

// ============ Buttons (bubble preview + accordion list) ============
function renderButtonsV2Full() {
  const footer = $c('.bubble-footer');
  const accList = $c('.btn-acc-list');
  const c = cur();
  if (!footer || !accList || !c) return;

  footer.innerHTML = '';
  footer.className = 'bubble-footer ' + (c.buttons.length === 0 ? 'no-buttons' : '');

  c.buttons.forEach((btn) => {
    footer.appendChild(createBubbleButton(btn));
  });
  appendAddWrap(footer);

  accList.innerHTML = '';
  c.buttons.forEach((btn) => {
    accList.appendChild(createBtnAccItem(btn));
  });
}

function createBtnAccItem(btn) {
  const item = document.createElement('div');
  item.className = 'acc-item btn-acc-item';
  item.dataset.id = btn.id;

  const titleEmpty = !btn.text;
  const titleText = btn.text || '{按鈕文字}';
  const subtitle = formatBtnSubtitle(btn);
  const valueMax = btn.action === 'uri' ? 2048 : 40;
  const valuePlaceholder = btn.action === 'uri' ? 'https://...' : '使用者點擊後傳送的文字';
  const curLen = (btn.text || '').length;
  item.innerHTML = `
    <div class="acc-header">
      <div class="acc-title-block">
        <div class="acc-title btn-text-preview${titleEmpty ? ' is-empty' : ''}">${escapeHtml(titleText)}</div>
        <div class="acc-subtitle btn-sub">${escapeHtml(subtitle)}</div>
      </div>
      <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="acc-body">
      <div class="acc-body-inner">
        <div class="acc-field">
          <div class="acc-field-label">按鈕文字</div>
          <div class="acc-text-input-wrap">
            <input type="text" class="acc-btn-text" maxlength="${BTN_TEXT_MAX_V2}" placeholder="請輸入按鈕文字" value="${escapeHtml(btn.text)}">
            <span class="acc-text-counter">
              <span class="acc-count">${curLen}</span><span class="acc-sep">/</span><span class="acc-max">${BTN_TEXT_MAX_V2}</span>
            </span>
          </div>
        </div>
        <div class="acc-action-row">
          <select class="select-input btn-action-select">
            <option value="message" ${btn.action === 'message' ? 'selected' : ''}>文字</option>
            <option value="uri" ${btn.action === 'uri' ? 'selected' : ''}>連結</option>
          </select>
          <input type="text" class="text-input btn-value-input"
                 placeholder="${valuePlaceholder}"
                 value="${escapeHtml(btn.value)}"
                 maxlength="${valueMax}">
        </div>
        <div class="btn-color-host"></div>
      </div>
    </div>
  `;

  // Header click → toggle accordion. Lazily mount the inline combo picker
  // the first time the body opens so we don't render N pickers up-front.
  // Mount BEFORE toggling .open so the height transition has the final
  // content size to interpolate to.
  const header = item.querySelector('.acc-header');
  const body = item.querySelector('.acc-body');
  const colorHost = item.querySelector('.btn-color-host');
  header.addEventListener('click', (e) => {
    if (e.target.closest('input, select, textarea, button')) return;
    const willOpen = !item.classList.contains('open');
    if (willOpen && colorHost && !colorHost.dataset.rendered) {
      const sync = renderInlineComboPicker(
        colorHost,
        () => ({ bg: btn.bg, fg: btn.fg }),
        (bg, fg) => {
          btn.bg = bg;
          btn.fg = fg;
          const card = item.closest('.msg-card');
          const bub = card && card.querySelector(`.bubble-footer .bubble-button[data-id="${btn.id}"]`);
          if (bub) {
            bub.style.background = bg;
            bub.style.color = fg;
          }
          syncOverlayFromBtn(btn);
        }
      );
      body._syncInline = sync;
      colorHost.dataset.rendered = '1';
    } else if (willOpen && body && body._syncInline) {
      body._syncInline();
    }
    item.classList.toggle('open');
  });

  // Button text input — drives btn.text + bubble-button text + header title
  // preview + character counter.
  const textInp = item.querySelector('.acc-btn-text');
  const accCount = item.querySelector('.acc-count');
  textInp.addEventListener('input', () => {
    btn.text = textInp.value;
    syncBubbleButtonText(btn);
    updateBtnAccTitle(item, btn);
    if (accCount) accCount.textContent = String(textInp.value.length);
  });

  // Action / value
  const sel = item.querySelector('.btn-action-select');
  const valInp = item.querySelector('.btn-value-input');
  sel.addEventListener('change', () => {
    btn.action = sel.value;
    valInp.placeholder = btn.action === 'uri' ? 'https://...' : '使用者點擊後傳送的文字';
    valInp.maxLength = btn.action === 'uri' ? 2048 : 40;
    if (btn.action === 'message' && btn.value.length > 40) {
      btn.value = btn.value.slice(0, 40);
      valInp.value = btn.value;
    }
    updateBtnAccSubtitle(item, btn);
    syncOverlayFromBtn(btn);
  });
  valInp.addEventListener('input', () => {
    btn.value = valInp.value;
    updateBtnAccSubtitle(item, btn);
    syncOverlayFromBtn(btn);
  });

  return item;
}

// Header preview placeholder differs by card type: v2 (carousel-v2) shows
// "{按鈕文字}" per Figma; multi-image's accordion item still uses the legacy
// "輸入按鈕文字" string (it isn't covered by this redesign).
function updateBtnAccTitle(item, btn) {
  const preview = item.querySelector('.btn-text-preview');
  if (!preview) return;
  const card = item.closest('.msg-card');
  const useV2Placeholder = !!(card && (card.dataset.type === 'carousel-v2' || card.dataset.type === 'carousel-v3' || card.dataset.type === 'carousel-v4'));
  if (btn.text) {
    preview.textContent = btn.text;
    preview.classList.remove('is-empty');
  } else {
    preview.textContent = useV2Placeholder ? '{按鈕文字}' : '輸入按鈕文字';
    preview.classList.add('is-empty');
  }
  // Keep the v2 counter in sync if the text was changed externally
  // (e.g. typed into the bubble-button on the left preview). multi-image has
  // no counter, so this no-ops there.
  const accCount = item.querySelector('.acc-count');
  if (accCount) accCount.textContent = String((btn.text || '').length);
}

// Subtitle helpers are still used by multi-image.js (the legacy layout that
// keeps action+value as the accordion subtitle). v2 dropped this row; its
// subtitle now mirrors btn.text instead.
function formatBtnSubtitle(btn) {
  const v = btn.value || '—';
  const lbl = btn.action === 'uri' ? '開啟連結' : '傳送文字';
  return `${lbl}：${v}`;
}

function updateBtnAccSubtitle(item, btn) {
  const sub = item.querySelector('.btn-sub');
  if (sub) sub.textContent = formatBtnSubtitle(btn);
}

// When user types in the bubble-button (via createBubbleButton's contentEditable),
// mirror the text into all accordion inputs for this button id.
function syncBubbleButtonText(btn) {
  document.querySelectorAll(`.bubble-button[data-id="${btn.id}"]`).forEach(bub => {
    const tEl = bub.querySelector('.bubble-button-text');
    if (!tEl) return;
    if (document.activeElement === tEl) return;
    if (tEl.textContent !== btn.text) tEl.textContent = btn.text;
    bub.classList.toggle('empty-text', !btn.text);
  });
}

// ============ Editor-pane v2 hooks ============
// Called by shared updateEditorBlocks / applyCardColors / renderPromo.

function updateEditorBlocksV2() {
  document.querySelectorAll('.msg-card[data-type="carousel-v2"]').forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;
    const promoItem = card.querySelector('.acc-item[data-acc="promoColors"]');
    if (promoItem) {
      const visible = page.hasImage && page.promo.active;
      promoItem.style.display = visible ? '' : 'none';
      if (!visible) promoItem.classList.remove('open');
    }
  });
}

// ============ Click-outside to close v2 accordions ============
// Document-level click listener (capture phase, attached once). Whenever any
// v2 acc-item is open, a click that isn't inside that item collapses it.
//
// We listen on `click`, not `mousedown`. Closing on mousedown immediately
// starts a height transition on the previously-open item, so by the time the
// browser resolves the click target at mouseup the layout has already
// shifted — a click aimed at sibling B can land on the gap below it and
// never reach B's click handler. Listening on click (capture) keeps the
// layout still while the target is resolved, then closes the previous item
// just before the new item's own click handler runs.
let _v2OutsideHandlerAttached = false;
function ensureV2OutsideHandler() {
  if (_v2OutsideHandlerAttached) return;
  _v2OutsideHandlerAttached = true;
  document.addEventListener('click', (e) => {
    document
      .querySelectorAll('.msg-card[data-type="carousel-v2"] .acc-item.open')
      .forEach(item => {
        if (item.contains(e.target)) return;
        item.classList.remove('open');
      });
  }, true);
}

function updateAccTagsV2() {
  if (typeof updateV3PromoPane === 'function') updateV3PromoPane();
  if (typeof updateV4PromoPane === 'function') updateV4PromoPane();
  document.querySelectorAll('.msg-card[data-type="carousel-v2"], .msg-card[data-type="multi-image"], .msg-card[data-type="carousel-v3"], .msg-card[data-type="carousel-v4"]').forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;

    // Header dual-color preview on the cardColors accordion.
    const item = card.querySelector('.acc-item[data-acc="cardColors"]');
    if (item) {
      const bgDot = item.querySelector('.acc-color-dot-bg');
      const fgDot = item.querySelector('.acc-color-dot-fg');
      if (bgDot) bgDot.style.background = page.cardBg;
      if (fgDot) fgDot.style.background = page.cardText;
    }

    // Header dual-color preview on the promoColors accordion.
    const promoItem = card.querySelector('.acc-item[data-acc="promoColors"]');
    if (promoItem) {
      const bgDot = promoItem.querySelector('.acc-color-dot-promo-bg');
      const fgDot = promoItem.querySelector('.acc-color-dot-promo-fg');
      if (bgDot) bgDot.style.background = page.promo.bg;
      if (fgDot) fgDot.style.background = page.promo.fg;
    }

    // Sync the inline combo pickers if currently mounted, so swatches and
    // hex inputs reflect the latest colors (e.g. after page switch, or after
    // the left-side popover changes a color).
    if (item && item.classList.contains('open')) {
      const body = item.querySelector('.acc-body');
      if (body && body._syncInline) body._syncInline();
    }
    if (promoItem && promoItem.classList.contains('open')) {
      const body = promoItem.querySelector('.acc-body');
      if (body && body._syncInline) body._syncInline();
    }

    // Sync per-button inline pickers in btn accordion bodies.
    card.querySelectorAll('.btn-acc-item.open .acc-body').forEach(body => {
      if (body._syncInline) body._syncInline();
    });
  });
}

// ============ Per-card event bindings ============
function bindCarouselV2Handlers(card) {
  if (!card) return;
  const q = (s) => card.querySelector(s);
  ensureV2OutsideHandler();

  // ----- Image add / hero controls (mirrored from carousel.js) -----
  // v2 skips the 動態/一般 type menu — uploading is one click; the user can
  // toggle 動態 later via the hero controls. main.js's file-input handler
  // defaults imageType to 'image' when unset.
  const imgAddTrigger = q('.image-add-trigger');
  if (imgAddTrigger) {
    imgAddTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      $('#fileInput').accept = 'image/*';
      $('#fileInput').click();
    });
  }
  const replaceBtn = q('.replace-btn');
  if (replaceBtn) {
    replaceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      $('#fileInput').accept = 'image/*';
      $('#fileInput').click();
    });
  }
  const removeBtn = q('.remove-image-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeButtonColorOverlay();
      const c = cur();
      if (!c) return;
      c.hasImage = false;
      c.imageUrl = '';
      c.imageType = null;
      c.promo.active = false;
      renderHero();
      updateEditorBlocks();
      updateGuideMode();
      scheduleAlign();
    });
  }
  const toggleAnimBtn = q('.toggle-anim-btn');
  if (toggleAnimBtn) {
    toggleAnimBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = cur();
      if (!c) return;
      c.imageType = c.imageType === 'animated' ? 'image' : 'animated';
      renderHero();
    });
  }

  // ----- Promo (banner inside hero) -----
  const PROMO_MAX = 20;
  const promoAddTrigger = q('.promo-add-trigger');
  if (promoAddTrigger) {
    promoAddTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = cur();
      if (!c || !c.hasImage) return;
      c.promo.active = true;
      c.promo.text = '';
      renderPromo();
      updateEditorBlocks();
      requestAnimationFrame(() => focusPromoText(card));
    });
  }
  const promoText = q('.promo-text');
  if (promoText) {
    promoText.addEventListener('focus', () => {
      // Anchor to the hero so the popover lands below the whole image area
      // rather than directly under the small banner (which would visually
      // crowd / cover the banner the user just clicked).
      openPromoColorOverlay(q('.bubble-hero'));
    });
    promoText.addEventListener('input', () => {
      const c = cur();
      if (!c) return;
      let plain = promoText.textContent.replace(/\n/g, '');
      if (plain.length > PROMO_MAX) {
        plain = plain.slice(0, PROMO_MAX);
        promoText.textContent = plain;
        const sel = window.getSelection();
        const r = document.createRange();
        r.selectNodeContents(promoText);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
        showHint(`宣傳標語最多 ${PROMO_MAX} 字`);
      } else if (plain !== promoText.textContent) {
        promoText.textContent = plain;
      }
      c.promo.text = plain;
    });
    promoText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); promoText.blur(); }
    });
    promoText.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\n/g, '');
      const remain = PROMO_MAX - promoText.textContent.length;
      document.execCommand('insertText', false, text.slice(0, Math.max(0, remain)));
    });
  }
  const promoDelete = q('.promo-delete');
  if (promoDelete) {
    promoDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      closeButtonColorOverlay();
      const c = cur();
      if (!c) return;
      c.promo.active = false;
      c.promo.text = '';
      renderPromo();
      updateEditorBlocks();
    });
  }

  // ----- Card / promo color accordions (訊息內容設定 section) -----
  // Both accordions share the same shape: lazy-mount the inline combo picker
  // on first open, sync existing picker on re-open. Toggling one closes the
  // other within the section.
  const wireColorAcc = (selector, getColors, setColors) => {
    const item = q(selector);
    if (!item) return;
    const header = item.querySelector('.acc-header');
    const body = item.querySelector('.acc-body');
    const inner = item.querySelector('.acc-body-inner');
    header.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      if (willOpen && inner && !inner.dataset.rendered) {
        const sync = renderInlineComboPicker(inner, getColors, setColors);
        body._syncInline = sync;
        inner.dataset.rendered = '1';
      } else if (willOpen && body && body._syncInline) {
        body._syncInline();
      }
      const section = item.closest('.acc-section');
      if (section) {
        section.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
      }
      if (willOpen) item.classList.add('open');
    });
  };

  wireColorAcc(
    '.acc-item[data-acc="cardColors"]',
    () => {
      const c = cur();
      return { bg: c ? c.cardBg : '#ffffff', fg: c ? c.cardText : '#333333' };
    },
    (bg, fg) => {
      const c = cur();
      if (!c) return;
      c.cardBg = bg;
      c.cardText = fg;
      applyCardColors();
    }
  );

  wireColorAcc(
    '.acc-item[data-acc="promoColors"]',
    () => {
      const c = cur();
      return { bg: c ? c.promo.bg : '#ffffff', fg: c ? c.promo.fg : '#000000' };
    },
    (bg, fg) => {
      const c = cur();
      if (!c) return;
      c.promo.bg = bg;
      c.promo.fg = fg;
      const banner = q('.promo-banner');
      if (banner) {
        banner.style.background = bg;
        banner.style.color = fg;
      }
      updateAccTagsV2();
    }
  );

  // ----- "+ 新增按鈕" in the right-pane buttons section -----
  // Adding from the right pane stays on the right: expand the new accordion
  // and focus its 按鈕文字 input. Skipping the default focusBubbleButton
  // avoids triggering the left-side button popover, which would otherwise
  // pop open every time the user adds from the right.
  const addBtnV2 = q('.btn-add-v2');
  if (addBtnV2) {
    addBtnV2.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = cur();
      if (!c) return;
      if (c.buttons.length >= 10) {
        showHint('最多 10 個按鈕');
        return;
      }
      addNewButton((btn, leftEl, accItem) => {
        if (!accItem) return;
        // Wait one frame so the freshly-inserted accordion paints at 0fr
        // before we toggle .open — otherwise the browser may skip the
        // open transition.
        requestAnimationFrame(() => {
          const header = accItem.querySelector('.acc-header');
          if (header) header.click();
          const textInp = accItem.querySelector('.acc-btn-text');
          if (textInp) {
            textInp.focus();
            accItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      });
    });
  }

  // ----- Alt text -----
  const altInput = q('.alt-input');
  const altCount = q('.alt-count');
  if (altInput) {
    altInput.addEventListener('input', () => {
      const car = activeCarousel();
      if (!car) return;
      car.altText = altInput.value;
      if (altCount) altCount.textContent = String(altInput.value.length);
    });
  }
}
