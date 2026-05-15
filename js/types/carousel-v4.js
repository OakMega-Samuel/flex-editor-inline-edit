// ============ TYPE: CAROUSEL V4 (多頁訊息 v4) ============
// Same data shape as carousel / carousel-v2 / carousel-v3. Right-pane-only:
// the bubble preview on the left is display-only and all editing happens
// through the editor pane.
//
// Layout vs. v3 (Figma 7164:74745):
//   - 預覽文字 lives in a full-width form-line at the TOP of the card body
//     (v3 kept it inline next to the page tabs).
//   - Page list is a standalone bordered section (.v4-page-list) below the
//     form-line. Each numbered tab is plain (no inline close X); the action
//     toolbar (delete / duplicate / add) is grouped at the right edge of the
//     frame, separated by a vertical divider.
//   - Image section is gated by a Select Button (.select-button) — the user
//     toggles 一般圖片 / 動態圖片 before (or after) uploading; v3 hid this
//     choice behind a small toolbar icon.
//   - Accordions (宣傳標語 / 文字與背景顏色 / 文字內容) and the bottom
//     動作按鈕 list reuse v3 structure (.v3-acc-group, .btn-acc-list) so
//     CSS + handlers stay shared.
//
// The page-list reorder/duplicate/delete/add logic is local to v4 because
// the DOM is laid out differently (separate toolbar) and the tabs aren't
// hover-close style. The drag & drop math mirrors pages.js's renderPageTabs.

const PROMO_MAX_V4 = 20;
const ALT_MAX_V4 = 400;

const CAROUSEL_V4_TEMPLATE = `

  <div class="v4-section v4-alt-section">
    <div class="v4-form-line">
      <div class="v4-form-label">預覽文字</div>
      <div class="alt-input-wrap v4-alt-wrap">
        <input type="text" class="alt-input" maxlength="${ALT_MAX_V4}" placeholder="請輸入內容">
        <span class="alt-counter"><span class="alt-count">0</span><span class="sep">/</span><span class="max">${ALT_MAX_V4}</span></span>
      </div>
    </div>
  </div>

  <div class="v4-section v4-page-section">
    <div class="v4-page-list">
      <div class="v4-page-list-tabs"></div>
      <div class="v4-page-list-divider"></div>
      <div class="v4-page-list-tools">
        <button type="button" class="v4-page-tool v4-page-delete" title="刪除目前頁面">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
          </svg>
        </button>
        <button type="button" class="v4-page-tool v4-page-duplicate" title="複製當前頁面">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="12" height="12" rx="2"/>
            <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
          </svg>
        </button>
      </div>
      <button type="button" class="v4-page-add" title="新增頁面">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  </div>

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

    <div class="editor-pane editor-pane-v4">

      <!-- ===== 圖片 (with Select Button for 一般/動態) ===== -->
      <div class="v4-form-line v4-form-line-stack v4-image-form">
        <div class="v4-form-label">
          圖片
          <span class="v4-form-optional">選填</span>
        </div>
        <div class="select-button" role="tablist" aria-label="圖片類型">
          <button type="button" class="select-button-option is-selected" data-img-type="image" role="tab" aria-selected="true">一般圖片</button>
          <button type="button" class="select-button-option" data-img-type="animated" role="tab" aria-selected="false">動態圖片</button>
        </div>
        <div class="v4-image-frame">
          <div class="v4-image-tools">
            <button type="button" class="v4-image-tool v4-image-replace" disabled title="替換">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
                <path d="M20.49 15A9 9 0 0 1 5.64 18.36L1 14"/>
              </svg>
            </button>
            <button type="button" class="v4-image-tool v4-image-remove" disabled title="移除">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
              </svg>
            </button>
          </div>
          <div class="v4-image-content">
            <button type="button" class="v4-image-upload">
              <span class="v4-image-line1">點擊上傳檔案 或選取檔案放入</span>
              <span class="v4-image-line2">限 JPG, JPEG or PNG，檔案上限 10MB</span>
            </button>
            <div class="v4-image-preview" hidden>
              <img alt="">
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 訊息內容 group (宣傳標語 + 文字與背景顏色 + 文字內容) ===== -->
      <div class="v4-section">
        <div class="v3-acc-group v4-acc-group">

          <div class="acc-item v3-acc-item v4-acc-item" data-acc="promo">
            <div class="acc-header">
              <div class="acc-title-block">
                <div class="acc-title">宣傳標語</div>
                <div class="acc-subtitle v4-promo-subtitle is-empty">-</div>
              </div>
              <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="acc-body">
              <div class="acc-body-inner">
                <div class="acc-field">
                  <div class="acc-field-label">宣傳標語文字<span class="v4-form-optional">選填</span></div>
                  <div class="acc-text-input-wrap">
                    <input type="text" class="v4-promo-input" maxlength="${PROMO_MAX_V4}" placeholder="請輸入標語文字">
                    <span class="acc-text-counter"><span class="acc-count">0</span><span class="acc-sep">/</span><span class="acc-max">${PROMO_MAX_V4}</span></span>
                  </div>
                </div>
                <div class="v4-promo-color-host"></div>
              </div>
            </div>
          </div>

          <div class="acc-item v3-acc-item v4-acc-item" data-acc="cardColors">
            <div class="acc-header">
              <div class="acc-title-block">
                <div class="acc-title">文字與背景顏色</div>
                <div class="acc-subtitle v4-card-color-subtitle">
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
                <div class="v4-card-color-host"></div>
              </div>
            </div>
          </div>

          <div class="acc-item v3-acc-item v4-acc-item" data-acc="text">
            <div class="acc-header">
              <div class="acc-title-block">
                <div class="acc-title">文字內容</div>
                <div class="acc-subtitle v4-text-preview is-empty">-</div>
              </div>
              <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="acc-body">
              <div class="acc-body-inner">
                <div class="v4-text-rows"></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ===== 動作按鈕 ===== -->
      <div class="v4-section v4-action-section">
        <div class="v4-form-label v4-action-label">動作按鈕</div>
        <div class="btn-acc-list"></div>
        <button type="button" class="v4-action-add btn-add-v2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>新增動作按鈕</span>
        </button>
      </div>

    </div>
  </div>
`;

// ============ Top-level renderBody for carousel-v4 type ============
function renderCarouselV4Body(msg, body) {
  body.innerHTML = CAROUSEL_V4_TEMPLATE;
  renderCarouselV4Full();
  bindCarouselV4Handlers(body.closest('.msg-card'));
}

function renderCarouselV4Full() {
  renderV4PageList();
  renderHero();
  renderBody();
  renderButtonsV4Full();   // v4 has its own Figma-specific acc-item layout

  const car = activeCarousel();
  const altInput = $c('.alt-input');
  const altCount = $c('.alt-count');
  if (altInput && car) altInput.value = car.altText;
  if (altCount && car) altCount.textContent = String(car.altText.length);

  applyCardColors();
  updateV4ImagePane();
  updateV4PromoPane();
  updateV4TextPane();
  updateV4PageToolbar();
  updateGuideMode();
  scheduleAlign();
}

// ============ Page list (drag & drop, separate toolbar) ============
function renderV4PageList() {
  const tabs = $c('.v4-page-list-tabs');
  if (!tabs) return;
  const car = activeCarousel();
  if (!car) return;

  tabs.innerHTML = '';
  car.pages.forEach((p, idx) => {
    const tab = document.createElement('div');
    tab.className = 'page-tab v4-page-tab' + (idx === car.currentPage ? ' active' : '');
    tab.dataset.idx = idx;
    tab.draggable = true;
    tab.textContent = String(idx + 1);

    tab.addEventListener('click', () => switchToPage(idx));

    tab.addEventListener('dragstart', (e) => {
      tab.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(idx));
    });
    tab.addEventListener('dragend', () => {
      tab.classList.remove('dragging');
      $$c('.v4-page-tab').forEach(t => t.classList.remove('drag-over-left', 'drag-over-right'));
    });
    tab.addEventListener('dragover', (e) => {
      e.preventDefault();
      const r = tab.getBoundingClientRect();
      const before = e.clientX < r.left + r.width / 2;
      tab.classList.toggle('drag-over-left', before);
      tab.classList.toggle('drag-over-right', !before);
    });
    tab.addEventListener('dragleave', () => tab.classList.remove('drag-over-left', 'drag-over-right'));
    tab.addEventListener('drop', (e) => {
      e.preventDefault();
      const car2 = activeCarousel();
      if (!car2) return;
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (isNaN(fromIdx) || fromIdx === idx) return;
      const r = tab.getBoundingClientRect();
      const before = e.clientX < r.left + r.width / 2;
      const [moved] = car2.pages.splice(fromIdx, 1);
      let toIdx = idx;
      if (fromIdx < idx) toIdx = idx - 1;
      const insertAt = before ? toIdx : toIdx + 1;
      car2.pages.splice(insertAt, 0, moved);
      if (car2.currentPage === fromIdx) {
        car2.currentPage = insertAt;
      } else {
        let newCur = car2.currentPage;
        if (fromIdx < car2.currentPage) newCur--;
        if (insertAt <= newCur) newCur++;
        car2.currentPage = Math.max(0, Math.min(newCur, car2.pages.length - 1));
      }
      renderCarouselV4Full();
    });

    tabs.appendChild(tab);
  });
}

function updateV4PageToolbar() {
  const card = activeCardEl();
  if (!card) return;
  const car = activeCarousel();
  if (!car) return;
  const del = card.querySelector('.v4-page-delete');
  const dup = card.querySelector('.v4-page-duplicate');
  const add = card.querySelector('.v4-page-add');
  if (del) del.disabled = car.pages.length <= 1;
  if (dup) dup.disabled = car.pages.length >= 10;
  if (add) add.disabled = car.pages.length >= 10;
}

// ============ Right-pane updaters ============

function updateV4ImagePane() {
  document.querySelectorAll('.msg-card[data-type="carousel-v4"]').forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;

    const upload = card.querySelector('.v4-image-upload');
    const preview = card.querySelector('.v4-image-preview');
    const previewImg = preview && preview.querySelector('img');
    const replaceBtn = card.querySelector('.v4-image-replace');
    const removeBtn = card.querySelector('.v4-image-remove');

    if (page.hasImage && page.imageUrl) {
      if (upload) upload.hidden = true;
      if (preview) preview.hidden = false;
      if (previewImg && previewImg.src !== page.imageUrl) previewImg.src = page.imageUrl;
      if (replaceBtn) replaceBtn.disabled = false;
      if (removeBtn) removeBtn.disabled = false;
    } else {
      if (upload) upload.hidden = false;
      if (preview) preview.hidden = true;
      if (previewImg) previewImg.removeAttribute('src');
      if (replaceBtn) replaceBtn.disabled = true;
      if (removeBtn) removeBtn.disabled = true;
    }

    // Select-button reflects current image type. The default for a fresh page
    // is 一般圖片 (matches Figma "is-selected"). Once the user uploads, this
    // stays in sync with page.imageType.
    const currentType = page.imageType || 'image';
    card.querySelectorAll('.select-button-option').forEach(opt => {
      const on = opt.dataset.imgType === currentType;
      opt.classList.toggle('is-selected', on);
      opt.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  });
}

function updateV4PromoPane() {
  document.querySelectorAll('.msg-card[data-type="carousel-v4"]').forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;

    const item = card.querySelector('.acc-item[data-acc="promo"]');
    if (!item) return;
    const input = item.querySelector('.v4-promo-input');
    const count = item.querySelector('.acc-count');
    const subtitle = item.querySelector('.v4-promo-subtitle');

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

    const body = item.querySelector('.acc-body');
    if (item.classList.contains('open') && body && body._syncInline) body._syncInline();
  });
}

function updateV4TextPane() {
  // Include the active card explicitly: on initial render the card is
  // created and `renderBody` runs before it's appended to the document,
  // so the document query finds nothing and rows never render. Falling
  // back to activeCardEl covers that first render pass.
  const cards = new Set(document.querySelectorAll('.msg-card[data-type="carousel-v4"]'));
  const active = activeCardEl();
  if (active && active.dataset.type === 'carousel-v4') cards.add(active);
  cards.forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;

    const item = card.querySelector('.acc-item[data-acc="text"]');
    if (!item) return;
    const rowsHost = item.querySelector('.v4-text-rows');
    const preview = item.querySelector('.v4-text-preview');

    if (rowsHost && rowsHost.children.length === 0) {
      renderV4TextRows(rowsHost, page);
    } else if (rowsHost) {
      ['title', 'desc', 'price'].forEach(field => {
        const inp = rowsHost.querySelector(`.v4-text-input[data-field="${field}"]`);
        if (!inp) return;
        const v = page[field] || '';
        if (document.activeElement !== inp && inp.value !== v) {
          inp.value = v;
          autoGrowV4Textarea(inp);
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

function renderV4TextRows(host, page) {
  host.innerHTML = '';
  ['title', 'desc', 'price'].forEach(field => {
    const meta = FIELD_META[field];
    const value = page[field] || '';
    const row = document.createElement('div');
    row.className = 'v4-text-row';
    row.dataset.field = field;
    row.innerHTML = `
      <div class="v4-text-row-label">${meta.label}<span class="v4-form-optional">選填</span></div>
      <div class="v4-text-row-input">
        <div class="acc-text-input-wrap">
          <textarea class="v4-text-input" data-field="${field}" rows="1" maxlength="${meta.max}" placeholder="${meta.placeholder}">${escapeHtml(value)}</textarea>
          <span class="acc-text-counter">
            <span class="acc-count">${value.length}</span><span class="acc-sep">/</span><span class="acc-max">${meta.max}</span>
          </span>
        </div>
      </div>
    `;
    host.appendChild(row);
  });
  host.querySelectorAll('.v4-text-input').forEach(autoGrowV4Textarea);
}

// ============ Compact color row (文字顏色 + 背景顏色 + palette + swap) ============
// Renders the Figma-compact picker: side-by-side hex inputs (with native color
// trigger swatch), plus a palette button that opens the existing #colorPopover
// for presets/recents, plus a swap button. Returns a sync(getCurrent) callback
// so callers can refresh inputs when the underlying state changes (e.g. when
// switching pages).
const V4_COLOR_ROW_TEMPLATE = `
  <div class="v4-color-row">
    <div class="v4-color-field">
      <div class="v4-color-field-label">文字顏色</div>
      <div class="v4-color-input-wrap">
        <input type="color" class="v4-color-native v4-color-native-fg">
        <input type="text" class="v4-color-hex v4-color-hex-fg" maxlength="7" placeholder="#000000">
      </div>
    </div>
    <div class="v4-color-field">
      <div class="v4-color-field-label">背景顏色</div>
      <div class="v4-color-input-wrap">
        <input type="color" class="v4-color-native v4-color-native-bg">
        <input type="text" class="v4-color-hex v4-color-hex-bg" maxlength="7" placeholder="#FFFFFF">
      </div>
    </div>
    <div class="v4-color-actions">
      <button type="button" class="v4-color-action-btn v4-color-palette" title="預設配色" aria-label="預設配色">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor"/>
          <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor"/>
          <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor"/>
          <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.255-.289-.434-.687-.434-1.125 0-.937.738-1.687 1.673-1.687h1.97c3.063 0 5.58-2.516 5.58-5.594C22 6.49 17.52 2 12 2z"/>
        </svg>
      </button>
      <button type="button" class="v4-color-action-btn v4-color-swap" title="反轉文字／背景顏色" aria-label="反轉顏色">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="17 1 21 5 17 9"/>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <polyline points="7 23 3 19 7 15"/>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
      </button>
    </div>
  </div>
`;

function renderV4CompactColorPicker(container, title, getCurrent, onChange) {
  container.innerHTML = V4_COLOR_ROW_TEMPLATE;
  const fgHex = container.querySelector('.v4-color-hex-fg');
  const bgHex = container.querySelector('.v4-color-hex-bg');
  const fgNative = container.querySelector('.v4-color-native-fg');
  const bgNative = container.querySelector('.v4-color-native-bg');
  const palette = container.querySelector('.v4-color-palette');
  const swap = container.querySelector('.v4-color-swap');

  const reflect = (bg, fg) => {
    if (document.activeElement !== fgHex) fgHex.value = fg.toUpperCase();
    if (document.activeElement !== bgHex) bgHex.value = bg.toUpperCase();
    fgNative.value = fg;
    bgNative.value = bg;
  };

  const init = getCurrent();
  reflect(init.bg, init.fg);

  fgHex.addEventListener('input', () => {
    const v = fgHex.value.trim();
    if (isValidHex(v)) {
      const c = normalizeHex(v);
      const { bg } = getCurrent();
      fgNative.value = c;
      onChange(bg, c);
    }
  });
  fgNative.addEventListener('input', () => {
    const c = fgNative.value;
    const { bg } = getCurrent();
    fgHex.value = c.toUpperCase();
    onChange(bg, c);
  });
  bgHex.addEventListener('input', () => {
    const v = bgHex.value.trim();
    if (isValidHex(v)) {
      const c = normalizeHex(v);
      const { fg } = getCurrent();
      bgNative.value = c;
      onChange(c, fg);
    }
  });
  bgNative.addEventListener('input', () => {
    const c = bgNative.value;
    const { fg } = getCurrent();
    bgHex.value = c.toUpperCase();
    onChange(c, fg);
  });
  swap.addEventListener('click', (e) => {
    e.stopPropagation();
    const { bg, fg } = getCurrent();
    onChange(fg, bg);
    reflect(fg, bg);
  });
  palette.addEventListener('click', (e) => {
    e.stopPropagation();
    const { bg, fg } = getCurrent();
    openComboPopover(palette, title, bg, fg, (nb, nf) => {
      onChange(nb, nf);
      reflect(nb, nf);
    });
  });

  return function syncV4ColorRow() {
    const { bg, fg } = getCurrent();
    reflect(bg, fg);
  };
}

function autoGrowV4Textarea(ta) {
  if (!ta) return;
  // Inside a collapsed accordion (grid-template-rows: 0fr + overflow:hidden)
  // scrollHeight is unreliable and often resolves to ~0, which would lock the
  // textarea at 0px and make content look empty after the user opens it.
  // Defer until the accordion is open — the open handler re-runs us.
  const acc = ta.closest('.acc-item');
  if (acc && !acc.classList.contains('open')) {
    ta.style.height = '';
    return;
  }
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

// ============ Click-outside handler ============
let _v4OutsideHandlerAttached = false;
function ensureV4OutsideHandler() {
  if (_v4OutsideHandlerAttached) return;
  _v4OutsideHandlerAttached = true;
  document.addEventListener('click', (e) => {
    document
      .querySelectorAll('.msg-card[data-type="carousel-v4"] .acc-item.open')
      .forEach(item => {
        if (item.contains(e.target)) return;
        item.classList.remove('open');
      });
  }, true);
}

// ============ Per-card event bindings ============
function bindCarouselV4Handlers(card) {
  if (!card) return;
  const q = (s) => card.querySelector(s);
  ensureV4OutsideHandler();

  // ----- Page list toolbar -----
  const pageDel = q('.v4-page-delete');
  if (pageDel) {
    pageDel.addEventListener('click', () => {
      if (pageDel.disabled) return;
      const car = activeCarousel();
      if (!car) return;
      deletePage(car.currentPage);
      renderCarouselV4Full();
    });
  }
  const pageDup = q('.v4-page-duplicate');
  if (pageDup) {
    pageDup.addEventListener('click', () => {
      if (pageDup.disabled) return;
      const car = activeCarousel();
      if (!car) return;
      duplicatePage(car.currentPage);
      renderCarouselV4Full();
    });
  }
  const pageAdd = q('.v4-page-add');
  if (pageAdd) {
    pageAdd.addEventListener('click', () => {
      if (pageAdd.disabled) return;
      addNewPage();
      renderCarouselV4Full();
    });
  }

  // ----- Select Button (一般圖片 / 動態圖片) -----
  // Sets page.imageType. Works before AND after upload — if no image yet, the
  // selection just primes which type the next upload becomes. If an image
  // already exists, it flips between 一般 / 動態 and updates the anim badge.
  card.querySelectorAll('.select-button-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = cur();
      if (!c) return;
      const type = opt.dataset.imgType;
      c.imageType = type;
      if (c.hasImage) {
        renderHero();
      }
      updateV4ImagePane();
    });
  });

  // ----- Image uploader -----
  const upload = q('.v4-image-upload');
  if (upload) {
    upload.addEventListener('click', (e) => {
      e.stopPropagation();
      $('#fileInput').accept = 'image/*';
      $('#fileInput').click();
    });
  }
  const replaceBtn = q('.v4-image-replace');
  if (replaceBtn) {
    replaceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (replaceBtn.disabled) return;
      $('#fileInput').accept = 'image/*';
      $('#fileInput').click();
    });
  }
  const removeBtn = q('.v4-image-remove');
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (removeBtn.disabled) return;
      v4RemoveImage();
    });
  }

  // ----- Promo accordion -----
  const promoItem = q('.acc-item[data-acc="promo"]');
  if (promoItem) {
    const header = promoItem.querySelector('.acc-header');
    const colorHost = promoItem.querySelector('.v4-promo-color-host');
    const body = promoItem.querySelector('.acc-body');
    header.addEventListener('click', (e) => {
      if (e.target.closest('input, select, textarea, button')) return;
      const willOpen = !promoItem.classList.contains('open');
      const section = promoItem.closest('.v4-acc-group');
      if (section) section.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
      if (willOpen) {
        promoItem.classList.add('open');
        if (colorHost && !colorHost.dataset.rendered) {
          const sync = renderV4CompactColorPicker(
            colorHost,
            '宣傳標語配色',
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
              updateV4PromoPane();
            }
          );
          body._syncInline = sync;
          colorHost.dataset.rendered = '1';
        } else if (body && body._syncInline) {
          body._syncInline();
        }
      }
    });

    const input = promoItem.querySelector('.v4-promo-input');
    if (input) {
      input.addEventListener('input', () => {
        const c = cur();
        if (!c) return;
        let v = input.value;
        if (v.length > PROMO_MAX_V4) {
          v = v.slice(0, PROMO_MAX_V4);
          input.value = v;
          showHint(`宣傳標語最多 ${PROMO_MAX_V4} 字`);
        }
        c.promo.text = v;
        c.promo.active = v !== '';
        renderPromo();
        updateV4PromoPane();
      });
    }
  }

  // ----- Card colors accordion -----
  const cardColorItem = q('.acc-item[data-acc="cardColors"]');
  if (cardColorItem) {
    const header = cardColorItem.querySelector('.acc-header');
    const body = cardColorItem.querySelector('.acc-body');
    const colorHost = cardColorItem.querySelector('.v4-card-color-host');
    header.addEventListener('click', (e) => {
      if (e.target.closest('input, select, textarea, button')) return;
      const willOpen = !cardColorItem.classList.contains('open');
      const section = cardColorItem.closest('.v4-acc-group');
      if (section) section.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
      if (willOpen) {
        cardColorItem.classList.add('open');
        if (colorHost && !colorHost.dataset.rendered) {
          const sync = renderV4CompactColorPicker(
            colorHost,
            '文字與背景顏色',
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

  // ----- Text content accordion -----
  const textItem = q('.acc-item[data-acc="text"]');
  if (textItem) {
    const header = textItem.querySelector('.acc-header');
    header.addEventListener('click', (e) => {
      if (e.target.closest('input, select, textarea, button')) return;
      const willOpen = !textItem.classList.contains('open');
      const section = textItem.closest('.v4-acc-group');
      if (section) section.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
      if (willOpen) {
        textItem.classList.add('open');
        requestAnimationFrame(() => {
          textItem.querySelectorAll('.v4-text-input').forEach(autoGrowV4Textarea);
        });
      }
    });

    const rowsHost = textItem.querySelector('.v4-text-rows');
    if (rowsHost) {
      rowsHost.addEventListener('input', (e) => {
        const inp = e.target.closest('.v4-text-input');
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
        autoGrowV4Textarea(inp);
        renderBody();
        updateV4TextPane();
        updateGuideMode();
        scheduleAlign();
      });
    }
  }

  // ----- 新增動作按鈕 -----
  const addBtn = q('.v4-action-add');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
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

// ============ V4 buttons (Figma 7161:56636 — drag/title/trash header,
//   按鈕文字 input + 按鈕點擊行為 toggle + 文字/背景顏色 dual color row) ============
const BTN_TEXT_MAX_V4 = 15;
const BTN_VAL_MSG_MAX_V4 = 40;
const BTN_VAL_URI_MAX_V4 = 2048;

function renderButtonsV4Full() {
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
    accList.appendChild(createBtnAccItemV4(btn));
  });
}

// Mirror btn.action onto the segmented "按鈕點擊行為" chips in this acc item.
// Used both on user toggle clicks and on accordion-open (defensive resync, so
// chips never appear "nothing selected" after a collapse-reopen).
function syncV4ActionToggle(item, btn) {
  if (!btn.action) btn.action = 'message';
  item.querySelectorAll('.v4-btn-action-toggle .select-button-option').forEach(o => {
    const sel = o.dataset.action === btn.action;
    o.classList.toggle('is-selected', sel);
    o.setAttribute('aria-selected', String(sel));
  });
}

function createBtnAccItemV4(btn) {
  if (!btn.action) btn.action = 'message';

  const item = document.createElement('div');
  item.className = 'acc-item btn-acc-item btn-acc-item-v4';
  item.dataset.id = btn.id;

  const titleEmpty = !btn.text;
  const titleText = btn.text || '{按鈕文字}';
  const subtitle = formatBtnSubtitle(btn);
  const valueMax = btn.action === 'uri' ? BTN_VAL_URI_MAX_V4 : BTN_VAL_MSG_MAX_V4;
  const valuePlaceholder = btn.action === 'uri' ? 'https://...' : '請輸入內容';
  const curLen = (btn.text || '').length;
  const valLen = (btn.value || '').length;

  item.innerHTML = `
    <div class="acc-header">
      <div class="v4-btn-drag" title="拖曳排序" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="3" cy="2" r="1"/><circle cx="9" cy="2" r="1"/>
          <circle cx="3" cy="6" r="1"/><circle cx="9" cy="6" r="1"/>
          <circle cx="3" cy="10" r="1"/><circle cx="9" cy="10" r="1"/>
        </svg>
      </div>
      <div class="acc-title-block">
        <div class="acc-title btn-text-preview${titleEmpty ? ' is-empty' : ''}">${escapeHtml(titleText)}</div>
        <div class="acc-subtitle btn-sub">${escapeHtml(subtitle)}</div>
      </div>
      <button type="button" class="v4-btn-trash" title="刪除">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
        </svg>
      </button>
      <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="acc-body">
      <div class="acc-body-inner v4-btn-acc-body">
        <div class="v4-btn-field">
          <div class="v4-btn-field-label">按鈕文字</div>
          <div class="acc-text-input-wrap">
            <input type="text" class="acc-btn-text" maxlength="${BTN_TEXT_MAX_V4}" placeholder="請輸入按鈕文字" value="${escapeHtml(btn.text)}">
            <span class="acc-text-counter">
              <span class="acc-count">${curLen}</span><span class="acc-sep">/</span><span class="acc-max">${BTN_TEXT_MAX_V4}</span>
            </span>
          </div>
        </div>
        <div class="v4-btn-field">
          <div class="v4-btn-field-label">按鈕點擊行為</div>
          <div class="select-button v4-btn-action-toggle" role="tablist" aria-label="按鈕點擊行為">
            <button type="button" class="select-button-option ${btn.action === 'message' ? 'is-selected' : ''}" data-action="message" role="tab" aria-selected="${btn.action === 'message'}">傳送文字</button>
            <button type="button" class="select-button-option ${btn.action === 'uri' ? 'is-selected' : ''}" data-action="uri" role="tab" aria-selected="${btn.action === 'uri'}">開啟連結</button>
          </div>
          <div class="acc-text-input-wrap v4-btn-value-wrap">
            <input type="text" class="btn-value-input" placeholder="${valuePlaceholder}" value="${escapeHtml(btn.value)}" maxlength="${valueMax}">
            <span class="acc-text-counter">
              <span class="acc-count v4-btn-value-count">${valLen}</span><span class="acc-sep">/</span><span class="acc-max v4-btn-value-max">${valueMax}</span>
            </span>
          </div>
        </div>
        <div class="v4-btn-color-row">
          <div class="v4-btn-color-field">
            <div class="v4-btn-field-label">文字顏色</div>
            <div class="v4-btn-color-input">
              <label class="v4-color-prefix">
                <span class="v4-color-swatch" data-role="fg-swatch" style="background:${btn.fg}"></span>
                <input type="color" class="v4-color-native" data-role="fg-native" value="${btn.fg}">
              </label>
              <input type="text" class="v4-color-hex" data-role="fg-hex" value="${(btn.fg || '').toUpperCase()}" maxlength="7">
            </div>
          </div>
          <div class="v4-btn-color-field">
            <div class="v4-btn-field-label">背景顏色</div>
            <div class="v4-btn-color-input">
              <label class="v4-color-prefix">
                <span class="v4-color-swatch" data-role="bg-swatch" style="background:${btn.bg}"></span>
                <input type="color" class="v4-color-native" data-role="bg-native" value="${btn.bg}">
              </label>
              <input type="text" class="v4-color-hex" data-role="bg-hex" value="${(btn.bg || '').toUpperCase()}" maxlength="7">
            </div>
          </div>
          <div class="v4-btn-color-tools">
            <button type="button" class="v4-btn-color-tool v4-btn-color-palette" title="配色預設">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10c0-1.1-.9-2-2-2h-2a2 2 0 0 1 0-4h1a3 3 0 0 0 3-3 5 5 0 0 0-5-3z"/>
                <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/>
                <circle cx="12" cy="7" r="1.2" fill="currentColor"/>
                <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor"/>
              </svg>
            </button>
            <button type="button" class="v4-btn-color-tool v4-btn-color-swap" title="反轉文字／背景顏色">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // ----- Header toggle (ignore clicks on interactive children + trash) -----
  const header = item.querySelector('.acc-header');
  header.addEventListener('click', (e) => {
    if (e.target.closest('input, button, select, textarea, label')) return;
    const willOpen = !item.classList.contains('open');
    item.classList.toggle('open');
    // Resync the 按鈕點擊行為 toggle from btn.action whenever the accordion
    // opens. Defensive against any stale DOM (e.g. state changed via the
    // bubble-button overlay or a sibling re-render) so the chip never shows
    // "nothing selected" when btn.action is in fact set.
    if (willOpen) syncV4ActionToggle(item, btn);
  });

  // ----- Trash -----
  const trash = item.querySelector('.v4-btn-trash');
  trash.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteButton(btn.id);
  });

  // ----- 按鈕文字 -----
  const textInp = item.querySelector('.acc-btn-text');
  const accCount = item.querySelector('.acc-body-inner > .v4-btn-field:first-child .acc-count');
  textInp.addEventListener('input', () => {
    btn.text = textInp.value;
    syncBubbleButtonText(btn);
    updateBtnAccTitle(item, btn);
    if (accCount) accCount.textContent = String(textInp.value.length);
  });

  // ----- 按鈕點擊行為 -----
  const toggleOpts = item.querySelectorAll('.v4-btn-action-toggle .select-button-option');
  const valInp = item.querySelector('.btn-value-input');
  const valCount = item.querySelector('.v4-btn-value-count');
  const valMax = item.querySelector('.v4-btn-value-max');
  toggleOpts.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = opt.dataset.action;
      if (action === btn.action) return;
      btn.action = action;
      syncV4ActionToggle(item, btn);
      const newMax = action === 'uri' ? BTN_VAL_URI_MAX_V4 : BTN_VAL_MSG_MAX_V4;
      valInp.maxLength = newMax;
      valInp.placeholder = action === 'uri' ? 'https://...' : '請輸入內容';
      if (action === 'message' && btn.value.length > BTN_VAL_MSG_MAX_V4) {
        btn.value = btn.value.slice(0, BTN_VAL_MSG_MAX_V4);
        valInp.value = btn.value;
      }
      if (valMax) valMax.textContent = String(newMax);
      if (valCount) valCount.textContent = String((btn.value || '').length);
      updateBtnAccSubtitle(item, btn);
      syncOverlayFromBtn(btn);
    });
  });
  valInp.addEventListener('input', () => {
    btn.value = valInp.value;
    if (valCount) valCount.textContent = String(valInp.value.length);
    updateBtnAccSubtitle(item, btn);
    syncOverlayFromBtn(btn);
  });

  // ----- 文字 / 背景顏色 -----
  const fgSwatch = item.querySelector('[data-role="fg-swatch"]');
  const fgNative = item.querySelector('[data-role="fg-native"]');
  const fgHex = item.querySelector('[data-role="fg-hex"]');
  const bgSwatch = item.querySelector('[data-role="bg-swatch"]');
  const bgNative = item.querySelector('[data-role="bg-native"]');
  const bgHex = item.querySelector('[data-role="bg-hex"]');

  const applyColors = (bg, fg) => {
    btn.bg = bg;
    btn.fg = fg;
    fgSwatch.style.background = fg;
    bgSwatch.style.background = bg;
    fgNative.value = fg;
    bgNative.value = bg;
    fgHex.value = fg.toUpperCase();
    bgHex.value = bg.toUpperCase();
    syncBubbleButtonColors(btn);
    syncOverlayFromBtn(btn);
  };

  fgNative.addEventListener('input', () => applyColors(btn.bg, fgNative.value));
  bgNative.addEventListener('input', () => applyColors(bgNative.value, btn.fg));
  fgHex.addEventListener('input', () => {
    const v = fgHex.value.trim();
    if (isValidHex(v)) applyColors(btn.bg, normalizeHex(v));
  });
  bgHex.addEventListener('input', () => {
    const v = bgHex.value.trim();
    if (isValidHex(v)) applyColors(normalizeHex(v), btn.fg);
  });

  item.querySelector('.v4-btn-color-swap').addEventListener('click', (e) => {
    e.stopPropagation();
    applyColors(btn.fg, btn.bg);
  });
  item.querySelector('.v4-btn-color-palette').addEventListener('click', (e) => {
    e.stopPropagation();
    openComboPopover(e.currentTarget, '按鈕配色', btn.bg, btn.fg, (bg, fg) => {
      applyColors(bg, fg);
    });
  });

  return item;
}

function syncBubbleButtonColors(btn) {
  document.querySelectorAll(`.bubble-button[data-id="${btn.id}"]`).forEach(bub => {
    bub.style.background = btn.bg;
    bub.style.color = btn.fg;
  });
}

// ============ Mutators ============
function v4RemoveImage() {
  closeButtonColorOverlay();
  const c = cur();
  if (!c) return;
  c.hasImage = false;
  c.imageUrl = '';
  // Keep c.imageType so the select-button stays on the user's last choice.
  renderHero();
  updateEditorBlocks();
  updateV4ImagePane();
  updateV4PromoPane();
  updateGuideMode();
  scheduleAlign();
}
