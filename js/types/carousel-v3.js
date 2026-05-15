// ============ TYPE: CAROUSEL V3 (多頁訊息 v3) ============
// Same data shape as carousel / carousel-v2. The left bubble is **display-only**
// — every left-pane edit/add affordance lives on the right. Editing happens
// exclusively through the editor pane's image uploader, promo accordion (text
// + 配色), text-content accordion (3 always-on optional inputs), and the
// shared button accordions.
//
// Right-pane structure:
//   - 圖片 section (flat, not an accordion): file uploader with replace/delete
//     tools. Upload is one click — no 動態/一般 picker; the user toggles 動態
//     after upload via the right-pane image controls.
//   - 宣傳標語 accordion: simple optional. 標語文字 input + 配色 picker are
//     always shown (no 啟用/移除 buttons). The bubble banner only renders when
//     the page has an image AND the text is non-empty.
//   - 文字內容 accordion: always renders title/desc/price as 3 optional inputs.
//   - 動作按鈕 accordions: identical to v2 (reuses createBtnAccItem). v3 also
//     adds a "按鈕文字" label on the first input.
//
// The left-side bubble keeps in sync with right-pane edits via the existing
// renderHero / renderPromo / renderBody / renderButtonsV2Full pipeline; those
// shared modules detect carousel-v3 and skip interactive scaffolding.

const PROMO_MAX_V3 = 20;

const CAROUSEL_V3_TEMPLATE = `
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
          <div class="image-add-host empty"></div>
          <div class="bubble-hero" style="display:none">
            <div class="promo-add-host"></div>
            <div class="promo-banner" style="display:none">
              <span class="promo-text"></span>
            </div>
            <div class="anim-badge" style="display:none">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              動態
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

    <div class="editor-pane editor-pane-v3">

      <!-- ===== 圖片 (flat, not an accordion) ===== -->
      <div class="v3-section v3-image-section">
        <div class="v3-section-title">圖片</div>
        <div class="v3-image-frame">
          <div class="v3-image-tools">
            <button type="button" class="v3-image-tool v3-image-toggle-anim" disabled title="切換動態">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </button>
            <button type="button" class="v3-image-tool v3-image-replace" disabled title="替換">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
                <path d="M20.49 15A9 9 0 0 1 5.64 18.36L1 14"/>
              </svg>
            </button>
            <button type="button" class="v3-image-tool v3-image-remove" disabled title="移除">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
              </svg>
            </button>
          </div>
          <div class="v3-image-content">
            <button type="button" class="v3-image-upload">
              <span class="v3-image-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </span>
              <span class="v3-image-line1">點擊上傳檔案 或選取檔案放入</span>
              <span class="v3-image-line2">限 JPG, JPEG or PNG，檔案上限 10MB</span>
            </button>
            <div class="v3-image-preview" hidden>
              <img alt="">
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 訊息內容 group (宣傳標語 + 文字與背景顏色 + 文字內容) ===== -->
      <div class="v3-section">
        <div class="v3-acc-group">

          <div class="acc-item v3-acc-item" data-acc="promo">
            <div class="acc-header">
              <div class="acc-title-block">
                <div class="acc-title">宣傳標語</div>
                <div class="acc-subtitle v3-promo-subtitle is-empty">-</div>
              </div>
              <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="acc-body">
              <div class="acc-body-inner">
                <div class="acc-field">
                  <div class="acc-field-label">標語文字</div>
                  <div class="acc-text-input-wrap">
                    <input type="text" class="v3-promo-input" maxlength="${PROMO_MAX_V3}" placeholder="輸入宣傳標語">
                    <span class="acc-text-counter"><span class="acc-count">0</span><span class="acc-sep">/</span><span class="acc-max">${PROMO_MAX_V3}</span></span>
                  </div>
                </div>
                <div class="acc-field">
                  <div class="acc-field-label">標語配色</div>
                  <div class="v3-promo-color-host"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="acc-item v3-acc-item" data-acc="cardColors">
            <div class="acc-header">
              <div class="acc-title-block">
                <div class="acc-title">文字與背景顏色</div>
                <div class="acc-subtitle v3-card-color-subtitle">
                  <span class="acc-color-preview" aria-hidden="true">
                    <span class="acc-color-dot acc-color-dot-bg"></span>
                    <span class="acc-color-dot acc-color-dot-fg"></span>
                  </span>
                </div>
              </div>
              <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="acc-body">
              <div class="acc-body-inner">
                <div class="v3-card-color-host"></div>
              </div>
            </div>
          </div>

          <div class="acc-item v3-acc-item" data-acc="text">
            <div class="acc-header">
              <div class="acc-title-block">
                <div class="acc-title">文字內容</div>
                <div class="acc-subtitle v3-text-preview is-empty">-</div>
              </div>
              <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="acc-body">
              <div class="acc-body-inner">
                <div class="v3-text-rows"></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ===== 動作按鈕 group ===== -->
      <div class="v3-section">
        <div class="btn-acc-list"></div>
        <button type="button" class="btn-add-v2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新增按鈕
        </button>
      </div>

    </div>
  </div>
`;

// ============ Top-level renderBody for carousel-v3 type ============
function renderCarouselV3Body(msg, body) {
  body.innerHTML = CAROUSEL_V3_TEMPLATE;
  renderCarouselV3Full();
  bindCarouselV3Handlers(body.closest('.msg-card'));
}

function renderCarouselV3Full() {
  renderPageTabs();
  renderHero();
  renderBody();
  renderButtonsV2Full();   // reuse v2's bubble-footer + btn-acc-list rendering

  const car = activeCarousel();
  const altInput = $c('.alt-input');
  const altCount = $c('.alt-count');
  if (altInput && car) altInput.value = car.altText;
  if (altCount && car) altCount.textContent = String(car.altText.length);

  applyCardColors();
  updateV3ImagePane();
  updateV3PromoPane();
  updateV3TextPane();
  updateGuideMode();
  scheduleAlign();
}

// ============ Right-pane updaters (called from shared modules' hooks) ============

// Image: toggles upload prompt vs preview thumbnail; enables/disables toolbar.
function updateV3ImagePane() {
  document.querySelectorAll('.msg-card[data-type="carousel-v3"]').forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;

    const upload = card.querySelector('.v3-image-upload');
    const preview = card.querySelector('.v3-image-preview');
    const previewImg = preview && preview.querySelector('img');
    const replaceBtn = card.querySelector('.v3-image-replace');
    const removeBtn = card.querySelector('.v3-image-remove');
    const toggleBtn = card.querySelector('.v3-image-toggle-anim');

    if (page.hasImage && page.imageUrl) {
      if (upload) upload.hidden = true;
      if (preview) preview.hidden = false;
      if (previewImg && previewImg.src !== page.imageUrl) previewImg.src = page.imageUrl;
      if (replaceBtn) replaceBtn.disabled = false;
      if (removeBtn) removeBtn.disabled = false;
      if (toggleBtn) {
        toggleBtn.disabled = false;
        toggleBtn.classList.toggle('is-on', page.imageType === 'animated');
      }
    } else {
      if (upload) upload.hidden = false;
      if (preview) preview.hidden = true;
      if (previewImg) previewImg.removeAttribute('src');
      if (replaceBtn) replaceBtn.disabled = true;
      if (removeBtn) removeBtn.disabled = true;
      if (toggleBtn) {
        toggleBtn.disabled = true;
        toggleBtn.classList.remove('is-on');
      }
    }
  });
}

// Promo: 選填 — input + color picker are always shown when the accordion opens.
// Banner / badge visibility tracks (hasImage && text !== ''); active flag is
// derived so renderPromo / updateEditorBlocks stay consistent.
function updateV3PromoPane() {
  document.querySelectorAll('.msg-card[data-type="carousel-v3"]').forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;

    const item = card.querySelector('.acc-item[data-acc="promo"]');
    if (!item) return;
    const input = item.querySelector('.v3-promo-input');
    const count = item.querySelector('.acc-count');
    const subtitle = item.querySelector('.v3-promo-subtitle');

    const text = page.promo.text || '';
    if (input && document.activeElement !== input && input.value !== text) {
      input.value = text;
    }
    if (count) count.textContent = String(text.length);

    if (subtitle) {
      if (text === '') {
        subtitle.textContent = '-';
        subtitle.classList.add('is-empty');
      } else {
        subtitle.textContent = text;
        subtitle.classList.remove('is-empty');
      }
    }

    // Sync the inline color picker if mounted (lazy on first open).
    const body = item.querySelector('.acc-body');
    if (item.classList.contains('open') && body && body._syncInline) body._syncInline();
  });
}

// Text content: always render 3 optional rows (title/desc/price). The header
// subtitle previews whichever non-empty field comes first.
function updateV3TextPane() {
  document.querySelectorAll('.msg-card[data-type="carousel-v3"]').forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;

    const item = card.querySelector('.acc-item[data-acc="text"]');
    if (!item) return;
    const rowsHost = item.querySelector('.v3-text-rows');
    const preview = item.querySelector('.v3-text-preview');

    if (rowsHost && rowsHost.children.length === 0) {
      renderV3TextRows(rowsHost, page);
    } else if (rowsHost) {
      // Sync existing inputs with state (skip focused input to preserve caret).
      ['title', 'desc', 'price'].forEach(field => {
        const inp = rowsHost.querySelector(`.v3-text-input[data-field="${field}"]`);
        if (!inp) return;
        const v = page[field] || '';
        if (document.activeElement !== inp && inp.value !== v) {
          inp.value = v;
          autoGrowV3Textarea(inp);
        }
        const counter = inp.parentElement && inp.parentElement.querySelector('.acc-count');
        if (counter) counter.textContent = String(v.length);
      });
    }

    if (preview) {
      const firstNonEmpty = ['title', 'desc', 'price']
        .map(f => page[f] || '')
        .find(v => v !== '');
      if (firstNonEmpty) {
        preview.textContent = firstNonEmpty;
        preview.classList.remove('is-empty');
      } else {
        preview.textContent = '-';
        preview.classList.add('is-empty');
      }
    }
  });
}

function renderV3TextRows(host, page) {
  host.innerHTML = '';
  ['title', 'desc', 'price'].forEach(field => {
    const meta = FIELD_META[field];
    const value = page[field] || '';
    const row = document.createElement('div');
    row.className = 'v3-text-row';
    row.dataset.field = field;
    row.innerHTML = `
      <div class="v3-text-row-label">${meta.label}</div>
      <div class="v3-text-row-input">
        <div class="acc-text-input-wrap">
          <textarea class="v3-text-input" data-field="${field}" rows="1" maxlength="${meta.max}" placeholder="${meta.placeholder}">${escapeHtml(value)}</textarea>
          <span class="acc-text-counter">
            <span class="acc-count">${value.length}</span><span class="acc-sep">/</span><span class="acc-max">${meta.max}</span>
          </span>
        </div>
      </div>
    `;
    host.appendChild(row);
  });
  // Size each textarea to its current content (one line by default, taller
  // when wrapped/multi-line). Run after insertion so scrollHeight is reliable.
  host.querySelectorAll('.v3-text-input').forEach(autoGrowV3Textarea);
}

// Sets a textarea's height to match its content. Called on initial render,
// on input, and after external state syncs. Resetting to 'auto' first lets
// the browser shrink as well as grow.
function autoGrowV3Textarea(ta) {
  if (!ta) return;
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

// Kept for body.js's contentEditable input handler (used by v1/v2 paths). v3
// has no contentEditable bubble body so this is effectively a no-op refresh.
function syncV3TextFromBubble(field) {
  updateV3TextPane();
}

// Called from carousel-v2.js / carousel.js renderPromo flow so v3's accordion
// reflects bubble-side promo edits (only relevant if other surfaces mutate
// promo state; v3 itself drives promo entirely from the right pane).
function syncV3PromoFromBubble() {
  updateV3PromoPane();
}

// ============ Click-outside handler (collapses open accordions) ============
let _v3OutsideHandlerAttached = false;
function ensureV3OutsideHandler() {
  if (_v3OutsideHandlerAttached) return;
  _v3OutsideHandlerAttached = true;
  document.addEventListener('click', (e) => {
    document
      .querySelectorAll('.msg-card[data-type="carousel-v3"] .acc-item.open')
      .forEach(item => {
        if (item.contains(e.target)) return;
        item.classList.remove('open');
      });
  }, true);
}

// ============ Per-card event bindings ============
function bindCarouselV3Handlers(card) {
  if (!card) return;
  const q = (s) => card.querySelector(s);
  ensureV3OutsideHandler();

  // ----- Right-pane image uploader -----
  // Direct file picker (no 動態/一般 selection step). main.js's file-input
  // handler defaults imageType to 'image' when unset; the user toggles 動態
  // afterwards via the v3-image-toggle-anim button.
  const upload = q('.v3-image-upload');
  if (upload) {
    upload.addEventListener('click', (e) => {
      e.stopPropagation();
      $('#fileInput').accept = 'image/*';
      $('#fileInput').click();
    });
  }
  const v3Replace = q('.v3-image-replace');
  if (v3Replace) {
    v3Replace.addEventListener('click', (e) => {
      e.stopPropagation();
      if (v3Replace.disabled) return;
      $('#fileInput').accept = 'image/*';
      $('#fileInput').click();
    });
  }
  const v3Remove = q('.v3-image-remove');
  if (v3Remove) {
    v3Remove.addEventListener('click', (e) => {
      e.stopPropagation();
      if (v3Remove.disabled) return;
      v3RemoveImage();
    });
  }
  const v3ToggleAnim = q('.v3-image-toggle-anim');
  if (v3ToggleAnim) {
    v3ToggleAnim.addEventListener('click', (e) => {
      e.stopPropagation();
      if (v3ToggleAnim.disabled) return;
      const c = cur();
      if (!c) return;
      c.imageType = c.imageType === 'animated' ? 'image' : 'animated';
      renderHero();
      updateV3ImagePane();
    });
  }

  // ----- Promo accordion (selected-only field, no enable/remove buttons) -----
  const promoItem = q('.acc-item[data-acc="promo"]');
  if (promoItem) {
    const header = promoItem.querySelector('.acc-header');
    header.addEventListener('click', (e) => {
      if (e.target.closest('input, select, textarea, button')) return;
      const willOpen = !promoItem.classList.contains('open');
      const section = promoItem.closest('.v3-acc-group');
      if (section) section.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
      if (willOpen) promoItem.classList.add('open');
    });

    const input = promoItem.querySelector('.v3-promo-input');
    if (input) {
      input.addEventListener('input', () => {
        const c = cur();
        if (!c) return;
        let v = input.value;
        if (v.length > PROMO_MAX_V3) {
          v = v.slice(0, PROMO_MAX_V3);
          input.value = v;
          showHint(`宣傳標語最多 ${PROMO_MAX_V3} 字`);
        }
        c.promo.text = v;
        // Auto-derived active flag: promo banner shows when text is non-empty
        // (and an image exists). Keeping the field in sync lets renderPromo /
        // updateEditorBlocks behave the same for v3 as for v1/v2.
        c.promo.active = v !== '';
        renderPromo();
        updateV3PromoPane();
      });
    }

    // Lazy-mount the inline combo picker on first open of the promo body.
    const colorHost = promoItem.querySelector('.v3-promo-color-host');
    const body = promoItem.querySelector('.acc-body');
    header.addEventListener('click', () => {
      if (!promoItem.classList.contains('open')) return;
      if (colorHost && !colorHost.dataset.rendered) {
        const sync = renderInlineComboPicker(
          colorHost,
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
            updateV3PromoPane();
          }
        );
        body._syncInline = sync;
        colorHost.dataset.rendered = '1';
      } else if (body && body._syncInline) {
        body._syncInline();
      }
    });
  }

  // ----- Card colors accordion (文字與背景顏色) -----
  const cardColorItem = q('.acc-item[data-acc="cardColors"]');
  if (cardColorItem) {
    const header = cardColorItem.querySelector('.acc-header');
    const body = cardColorItem.querySelector('.acc-body');
    const colorHost = cardColorItem.querySelector('.v3-card-color-host');
    header.addEventListener('click', (e) => {
      if (e.target.closest('input, select, textarea, button')) return;
      const willOpen = !cardColorItem.classList.contains('open');
      const section = cardColorItem.closest('.v3-acc-group');
      if (section) section.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
      if (willOpen) {
        cardColorItem.classList.add('open');
        if (colorHost && !colorHost.dataset.rendered) {
          const sync = renderInlineComboPicker(
            colorHost,
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
          body._syncInline = sync;
          colorHost.dataset.rendered = '1';
        } else if (body && body._syncInline) {
          body._syncInline();
        }
      }
    });
  }

  // ----- Text content accordion (always 3 optional rows) -----
  const textItem = q('.acc-item[data-acc="text"]');
  if (textItem) {
    const header = textItem.querySelector('.acc-header');
    header.addEventListener('click', (e) => {
      if (e.target.closest('input, select, textarea, button')) return;
      const willOpen = !textItem.classList.contains('open');
      const section = textItem.closest('.v3-acc-group');
      if (section) section.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
      if (willOpen) {
        textItem.classList.add('open');
        // scrollHeight is unreliable while the accordion is collapsed (the
        // grid row clamps to 0fr); re-measure once the open transition has
        // expanded the row so initial multi-line values render at full height.
        requestAnimationFrame(() => {
          textItem.querySelectorAll('.v3-text-input').forEach(autoGrowV3Textarea);
        });
      }
    });

    const rowsHost = textItem.querySelector('.v3-text-rows');
    if (rowsHost) {
      // Event delegation: input handler for the 3 always-present text fields.
      // Empty string maps back to '' (selected-but-blank); the bubble body's
      // renderBody filters those out so the left preview stays uncluttered.
      rowsHost.addEventListener('input', (e) => {
        const inp = e.target.closest('.v3-text-input');
        if (!inp) return;
        const field = inp.dataset.field;
        const meta = FIELD_META[field];
        const c = cur();
        if (!c) return;
        let v = inp.value;
        if (v.length > meta.max) {
          v = v.slice(0, meta.max);
          inp.value = v;
          showHint(`已達 ${meta.max} 字上限`);
        }
        c[field] = v;
        const counter = inp.parentElement && inp.parentElement.querySelector('.acc-count');
        if (counter) counter.textContent = String(v.length);
        autoGrowV3Textarea(inp);
        renderBody();
        updateV3TextPane();
        updateGuideMode();
        scheduleAlign();
      });
    }
  }

  // ----- "+ 新增按鈕" in the right pane -----
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

// ============ Mutators ============

function v3RemoveImage() {
  closeButtonColorOverlay();
  const c = cur();
  if (!c) return;
  c.hasImage = false;
  c.imageUrl = '';
  c.imageType = null;
  // Keep promo.active / promo.text intact — re-uploading the image should
  // restore the banner with whatever text was already entered (the right-pane
  // input keeps it visible the whole time anyway).
  renderHero();
  updateEditorBlocks();
  updateV3ImagePane();
  updateV3PromoPane();
  updateGuideMode();
  scheduleAlign();
}
