// ============ TYPE: MULTI-IMAGE (多圖訊息) ============
// Carousel-of-images using the v4 card layout (top alt-text → framed page list
// → preview + right-pane editor). Each page has: an image, an optional promo
// banner overlaid on the image, an image-click action, and a single optional
// CTA pill button at the bottom of the bubble.
//
// Differs from carousel-v4 in three ways:
//   1. No body fields (title / desc / price) and no card bg/text colors —
//      bubble is image + promo + pill button only.
//   2. The CTA is a SINGLE button (toggle on/off), not a list. So the
//      "動作按鈕" accordion uses a toggle switch in its body, then reveals
//      text/colors/action fields when on.
//   3. The image-click action lives in its own accordion (圖片點擊行為) with
//      a Select Button (無 / 傳送文字 / 開啟連結) and a value field below.
//
// Reuses v4's page list, image upload frame, compact color picker, and the
// `editor-pane-v4` shell so most CSS is shared via selector extensions.

const PROMO_MAX_MI = 20;
const ALT_MAX_MI = 100;
const BTN_TEXT_MAX_MI = 40;
const BTN_VALUE_MESSAGE_MAX_MI = 40;
const IA_VALUE_MESSAGE_MAX_MI = 40;

const MULTI_IMAGE_TEMPLATE = `

  <div class="v4-section v4-alt-section">
    <div class="v4-form-line v4-form-line-stack">
      <div class="v4-form-label">預覽文字</div>
      <div class="alt-input-wrap v4-alt-wrap">
        <input type="text" class="alt-input" maxlength="${ALT_MAX_MI}" placeholder="請輸入內容">
        <span class="alt-counter"><span class="alt-count">0</span><span class="sep">/</span><span class="max">${ALT_MAX_MI}</span></span>
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

  <div class="content-divider"></div>

  <div class="body-row">
    <div class="preview-pane">
      <div class="bubble">

        <div class="image-section" data-anchor="image">
          <div class="image-add-host empty"></div>
          <div class="bubble-hero" style="display:none">
            <div class="promo-add-host"></div>
            <div class="promo-banner" style="display:none">
              <span class="promo-text" data-placeholder="輸入宣傳標語"></span>
            </div>
          </div>
        </div>

        <div class="buttons-section" data-anchor="buttons">
          <div class="bubble-footer no-buttons"></div>
        </div>

      </div>
    </div>

    <div class="editor-pane editor-pane-v4">

      <!-- ===== 圖片 (upload frame, optional) ===== -->
      <div class="v4-form-line v4-form-line-stack v4-image-form">
        <div class="v4-form-label">圖片</div>
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

      <!-- ===== 訊息內容 group (圖片點擊行為 + 宣傳標語 + 動作按鈕) ===== -->
      <div class="v4-section">
        <div class="v3-acc-group v4-acc-group mi-acc-group">

          <div class="acc-item v3-acc-item v4-acc-item mi-acc-item" data-acc="imageAction">
            <div class="acc-header">
              <div class="acc-title-block">
                <div class="acc-title">圖片點擊行為</div>
                <div class="acc-subtitle mi-ia-subtitle">無</div>
              </div>
              <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="acc-body">
              <div class="acc-body-inner">
                <div class="select-button mi-ia-select" role="tablist" aria-label="圖片點擊行為">
                  <button type="button" class="select-button-option is-selected" data-ia-type="none" role="tab" aria-selected="true">無</button>
                  <button type="button" class="select-button-option" data-ia-type="message" role="tab" aria-selected="false">傳送文字</button>
                  <button type="button" class="select-button-option" data-ia-type="uri" role="tab" aria-selected="false">開啟連結</button>
                </div>
                <div class="acc-field mi-ia-value-field" hidden>
                  <div class="acc-text-input-wrap">
                    <input type="text" class="mi-ia-value v4-promo-input" placeholder="使用者點擊後傳送的文字">
                    <span class="acc-text-counter">
                      <span class="acc-count mi-ia-count">0</span><span class="acc-sep">/</span><span class="acc-max mi-ia-max">${IA_VALUE_MESSAGE_MAX_MI}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="acc-item v3-acc-item v4-acc-item mi-acc-item" data-acc="promo">
            <div class="acc-header">
              <div class="acc-title-block">
                <div class="acc-title">宣傳標語</div>
                <div class="acc-subtitle mi-promo-subtitle is-empty">未設定</div>
              </div>
              <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="acc-body">
              <div class="acc-body-inner">
                <div class="mi-toggle-row">
                  <div class="mi-toggle-label">宣傳標語</div>
                  <label class="toggle-switch">
                    <input type="checkbox" class="mi-promo-toggle">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="mi-fields-block mi-promo-fields" hidden>
                  <div class="acc-field">
                    <div class="acc-field-label">標語文字</div>
                    <div class="acc-text-input-wrap">
                      <input type="text" class="mi-promo-input v4-promo-input" maxlength="${PROMO_MAX_MI}" placeholder="輸入宣傳標語">
                      <span class="acc-text-counter">
                        <span class="acc-count mi-promo-count">0</span><span class="acc-sep">/</span><span class="acc-max">${PROMO_MAX_MI}</span>
                      </span>
                    </div>
                  </div>
                  <div class="mi-promo-color-host"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="acc-item v3-acc-item v4-acc-item mi-acc-item" data-acc="button">
            <div class="acc-header">
              <div class="acc-title-block">
                <div class="acc-title">動作按鈕</div>
                <div class="acc-subtitle mi-btn-subtitle is-empty">未設定</div>
              </div>
              <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="acc-body">
              <div class="acc-body-inner">
                <div class="mi-toggle-row">
                  <div class="mi-toggle-label">動作按鈕</div>
                  <label class="toggle-switch">
                    <input type="checkbox" class="mi-btn-toggle">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="mi-fields-block mi-btn-fields" hidden>
                  <div class="acc-field">
                    <div class="acc-field-label">按鈕文字</div>
                    <div class="acc-text-input-wrap">
                      <input type="text" class="mi-btn-text-input v4-promo-input" maxlength="${BTN_TEXT_MAX_MI}" placeholder="輸入按鈕文字">
                      <span class="acc-text-counter">
                        <span class="acc-count mi-btn-text-count">0</span><span class="acc-sep">/</span><span class="acc-max">${BTN_TEXT_MAX_MI}</span>
                      </span>
                    </div>
                  </div>
                  <div class="acc-field">
                    <div class="acc-field-label">點擊行為</div>
                    <div class="select-button mi-btn-action-select" role="tablist" aria-label="按鈕點擊行為">
                      <button type="button" class="select-button-option is-selected" data-btn-action="message" role="tab" aria-selected="true">傳送文字</button>
                      <button type="button" class="select-button-option" data-btn-action="uri" role="tab" aria-selected="false">開啟連結</button>
                    </div>
                    <div class="acc-text-input-wrap mi-btn-action-value-wrap">
                      <input type="text" class="mi-btn-action-value v4-promo-input" placeholder="使用者點擊後傳送的文字">
                      <span class="acc-text-counter">
                        <span class="acc-count mi-btn-action-count">0</span><span class="acc-sep">/</span><span class="acc-max mi-btn-action-max">${BTN_VALUE_MESSAGE_MAX_MI}</span>
                      </span>
                    </div>
                  </div>
                  <div class="mi-btn-color-host"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
`;

function makeMultiImageData() {
  return {
    altText: '',
    pages: [makeImagePage()],
    currentPage: 0,
  };
}

// ============ Top-level renderBody for multi-image type ============
function renderMultiImageBody(msg, body) {
  body.innerHTML = MULTI_IMAGE_TEMPLATE;
  renderMultiImageFull();
  bindMultiImageHandlers(body.closest('.msg-card'));
}

function renderMultiImageFull() {
  renderMIPageList();
  renderHero();
  renderMIButton();

  const car = activeCarousel();
  const altInput = $c('.alt-input');
  const altCount = $c('.alt-count');
  if (altInput && car) altInput.value = car.altText;
  if (altCount && car) altCount.textContent = String(car.altText.length);

  updateMIImagePane();
  updateMIImageActionPane();
  updateMIPromoPane();
  updateMIButtonPane();
  updateMIPageToolbar();
  updateGuideMode();
  scheduleAlign();
}

// ============ Page list (mirrors v4) ============
function renderMIPageList() {
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
      renderMultiImageFull();
    });

    tabs.appendChild(tab);
  });
}

function updateMIPageToolbar() {
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

function updateMIImagePane() {
  document.querySelectorAll('.msg-card[data-type="multi-image"]').forEach(card => {
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
  });
}

function updateMIImageActionPane() {
  document.querySelectorAll('.msg-card[data-type="multi-image"]').forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;

    const type = page.imageAction.type;
    const value = page.imageAction.value;

    card.querySelectorAll('.mi-ia-select .select-button-option').forEach(opt => {
      const on = opt.dataset.iaType === type;
      opt.classList.toggle('is-selected', on);
      opt.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    const valueField = card.querySelector('.mi-ia-value-field');
    const valueInput = card.querySelector('.mi-ia-value');
    const valueCount = card.querySelector('.mi-ia-count');
    const valueMax = card.querySelector('.mi-ia-max');

    if (type === 'none') {
      if (valueField) valueField.hidden = true;
    } else {
      if (valueField) valueField.hidden = false;
      if (valueInput) {
        if (type === 'uri') {
          valueInput.placeholder = 'https://...';
          valueInput.maxLength = 2048;
          if (valueMax) valueMax.textContent = '2048';
        } else {
          valueInput.placeholder = '使用者點擊後傳送的文字';
          valueInput.maxLength = IA_VALUE_MESSAGE_MAX_MI;
          if (valueMax) valueMax.textContent = String(IA_VALUE_MESSAGE_MAX_MI);
        }
        if (document.activeElement !== valueInput && valueInput.value !== value) {
          valueInput.value = value;
        }
        if (valueCount) valueCount.textContent = String(valueInput.value.length);
      }
    }

    const sub = card.querySelector('.mi-ia-subtitle');
    if (sub) {
      if (type === 'none') {
        sub.textContent = '無';
        sub.classList.remove('is-empty');
      } else {
        const lbl = type === 'uri' ? '開啟連結' : '傳送文字';
        sub.textContent = value ? `${lbl}：${value}` : lbl;
        sub.classList.toggle('is-empty', !value);
      }
    }
  });
}

function updateMIPromoPane() {
  document.querySelectorAll('.msg-card[data-type="multi-image"]').forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;

    const toggle = card.querySelector('.mi-promo-toggle');
    const fields = card.querySelector('.mi-promo-fields');
    const input = card.querySelector('.mi-promo-input');
    const count = card.querySelector('.mi-promo-count');
    const sub = card.querySelector('.mi-promo-subtitle');

    const on = !!page.promo.active;
    if (toggle) toggle.checked = on;
    if (fields) fields.hidden = !on;

    const text = page.promo.text || '';
    if (input && document.activeElement !== input && input.value !== text) {
      input.value = text;
    }
    if (count) count.textContent = String(text.length);

    if (sub) {
      if (!on) {
        sub.textContent = '未設定';
        sub.classList.add('is-empty');
      } else if (text) {
        sub.textContent = text;
        sub.classList.remove('is-empty');
      } else {
        sub.textContent = '已啟用';
        sub.classList.remove('is-empty');
      }
    }

    const item = card.querySelector('.acc-item[data-acc="promo"]');
    const body = item && item.querySelector('.acc-body');
    if (item && item.classList.contains('open') && body && body._syncPromoColor) {
      body._syncPromoColor();
    }
  });
}

function updateMIButtonPane() {
  document.querySelectorAll('.msg-card[data-type="multi-image"]').forEach(card => {
    const msgId = card.dataset.msgId;
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg || !msg.data) return;
    const page = msg.data.pages[msg.data.currentPage];
    if (!page) return;
    const btn = page.button;

    const toggle = card.querySelector('.mi-btn-toggle');
    const fields = card.querySelector('.mi-btn-fields');
    const textInput = card.querySelector('.mi-btn-text-input');
    const textCount = card.querySelector('.mi-btn-text-count');
    const actionValueInput = card.querySelector('.mi-btn-action-value');
    const actionValueCount = card.querySelector('.mi-btn-action-count');
    const actionValueMax = card.querySelector('.mi-btn-action-max');
    const sub = card.querySelector('.mi-btn-subtitle');

    const on = !!btn.active;
    if (toggle) toggle.checked = on;
    if (fields) fields.hidden = !on;

    if (textInput && document.activeElement !== textInput && textInput.value !== btn.text) {
      textInput.value = btn.text;
    }
    if (textCount) textCount.textContent = String((btn.text || '').length);

    card.querySelectorAll('.mi-btn-action-select .select-button-option').forEach(opt => {
      const isOn = opt.dataset.btnAction === btn.action;
      opt.classList.toggle('is-selected', isOn);
      opt.setAttribute('aria-selected', isOn ? 'true' : 'false');
    });

    if (actionValueInput) {
      if (btn.action === 'uri') {
        actionValueInput.placeholder = 'https://...';
        actionValueInput.maxLength = 2048;
        if (actionValueMax) actionValueMax.textContent = '2048';
      } else {
        actionValueInput.placeholder = '使用者點擊後傳送的文字';
        actionValueInput.maxLength = BTN_VALUE_MESSAGE_MAX_MI;
        if (actionValueMax) actionValueMax.textContent = String(BTN_VALUE_MESSAGE_MAX_MI);
      }
      if (document.activeElement !== actionValueInput && actionValueInput.value !== btn.value) {
        actionValueInput.value = btn.value;
      }
      if (actionValueCount) actionValueCount.textContent = String(actionValueInput.value.length);
    }

    if (sub) {
      if (!on) {
        sub.textContent = '未設定';
        sub.classList.add('is-empty');
      } else {
        const text = btn.text || '(未輸入按鈕文字)';
        const lbl = btn.action === 'uri' ? '開啟連結' : '傳送文字';
        const v = btn.value;
        sub.textContent = v ? `${text}．${lbl}：${v}` : text;
        sub.classList.toggle('is-empty', !btn.text);
      }
    }

    const item = card.querySelector('.acc-item[data-acc="button"]');
    const body = item && item.querySelector('.acc-body');
    if (item && item.classList.contains('open') && body && body._syncBtnColor) {
      body._syncBtnColor();
    }
  });
}

// ============ Bubble preview: single pill button ============
function renderMIButton() {
  const footer = $c('.bubble-footer');
  const c = cur();
  if (!footer || !c) return;
  const btn = c.button;

  footer.innerHTML = '';
  footer.className = 'bubble-footer ' + (btn.active ? '' : 'no-buttons');

  if (btn.active) {
    if (!btn.id) btn.id = newId();
    footer.appendChild(createMIBubbleButton(btn));
  }
}

function createMIBubbleButton(btn) {
  const el = document.createElement('div');
  el.className = 'bubble-button mi-bubble-button' + (btn.text ? '' : ' empty-text');
  // Empty bg/fg means "use the CSS default" — semi-transparent white pill
  // matching Figma. Only commit inline colors once the user picks them.
  if (btn.bg) el.style.background = btn.bg;
  if (btn.fg) el.style.color = btn.fg;
  el.dataset.id = btn.id;

  const textEl = document.createElement('div');
  textEl.className = 'bubble-button-text';
  textEl.textContent = btn.text || '{按鈕文字}';
  el.appendChild(textEl);

  return el;
}

// ============ Per-card event bindings ============
function bindMultiImageHandlers(card) {
  if (!card) return;
  const q = (s) => card.querySelector(s);

  // ----- Page list toolbar -----
  const pageDel = q('.v4-page-delete');
  if (pageDel) {
    pageDel.addEventListener('click', () => {
      if (pageDel.disabled) return;
      const car = activeCarousel();
      if (!car) return;
      deletePage(car.currentPage);
      renderMultiImageFull();
    });
  }
  const pageDup = q('.v4-page-duplicate');
  if (pageDup) {
    pageDup.addEventListener('click', () => {
      if (pageDup.disabled) return;
      const car = activeCarousel();
      if (!car) return;
      duplicatePage(car.currentPage);
      renderMultiImageFull();
    });
  }
  const pageAdd = q('.v4-page-add');
  if (pageAdd) {
    pageAdd.addEventListener('click', () => {
      if (pageAdd.disabled) return;
      addNewPage();
      renderMultiImageFull();
    });
  }

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
      miRemoveImage();
    });
  }

  // ----- Accordion: 圖片點擊行為 -----
  const iaItem = q('.acc-item[data-acc="imageAction"]');
  if (iaItem) {
    const header = iaItem.querySelector('.acc-header');
    header.addEventListener('click', (e) => {
      if (e.target.closest('input, select, textarea, button')) return;
      const willOpen = !iaItem.classList.contains('open');
      const group = iaItem.closest('.mi-acc-group');
      if (group) group.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
      if (willOpen) iaItem.classList.add('open');
    });
    card.querySelectorAll('.mi-ia-select .select-button-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const c = cur();
        if (!c) return;
        const t = opt.dataset.iaType;
        c.imageAction.type = t;
        if (t === 'none') c.imageAction.value = '';
        updateMIImageActionPane();
      });
    });
    const iaValue = q('.mi-ia-value');
    if (iaValue) {
      iaValue.addEventListener('input', () => {
        const c = cur();
        if (!c) return;
        let v = iaValue.value;
        const max = c.imageAction.type === 'uri' ? 2048 : IA_VALUE_MESSAGE_MAX_MI;
        if (v.length > max) {
          v = v.slice(0, max);
          iaValue.value = v;
          showHint(c.imageAction.type === 'uri' ? '連結最多 2048 字' : `傳送文字最多 ${IA_VALUE_MESSAGE_MAX_MI} 字`);
        }
        c.imageAction.value = v;
        updateMIImageActionPane();
      });
    }
  }

  // ----- Accordion: 宣傳標語 -----
  const promoItem = q('.acc-item[data-acc="promo"]');
  if (promoItem) {
    const header = promoItem.querySelector('.acc-header');
    const body = promoItem.querySelector('.acc-body');
    const colorHost = promoItem.querySelector('.mi-promo-color-host');

    header.addEventListener('click', (e) => {
      if (e.target.closest('input, select, textarea, button, label.toggle-switch')) return;
      const willOpen = !promoItem.classList.contains('open');
      const group = promoItem.closest('.mi-acc-group');
      if (group) group.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
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
            }
          );
          body._syncPromoColor = sync;
          colorHost.dataset.rendered = '1';
        } else if (body && body._syncPromoColor) {
          body._syncPromoColor();
        }
      }
    });

    const toggle = q('.mi-promo-toggle');
    if (toggle) {
      toggle.addEventListener('change', () => {
        const c = cur();
        if (!c) return;
        c.promo.active = toggle.checked;
        if (!toggle.checked) c.promo.text = '';
        renderPromo();
        updateMIPromoPane();
        requestAnimationFrame(() => {
          if (toggle.checked) {
            const input = q('.mi-promo-input');
            if (input) input.focus();
          }
        });
      });
    }

    const input = q('.mi-promo-input');
    if (input) {
      input.addEventListener('input', () => {
        const c = cur();
        if (!c) return;
        let v = input.value;
        if (v.length > PROMO_MAX_MI) {
          v = v.slice(0, PROMO_MAX_MI);
          input.value = v;
          showHint(`宣傳標語最多 ${PROMO_MAX_MI} 字`);
        }
        c.promo.text = v;
        renderPromo();
        updateMIPromoPane();
      });
    }
  }

  // ----- Accordion: 動作按鈕 -----
  const btnItem = q('.acc-item[data-acc="button"]');
  if (btnItem) {
    const header = btnItem.querySelector('.acc-header');
    const body = btnItem.querySelector('.acc-body');
    const colorHost = btnItem.querySelector('.mi-btn-color-host');

    header.addEventListener('click', (e) => {
      if (e.target.closest('input, select, textarea, button, label.toggle-switch')) return;
      const willOpen = !btnItem.classList.contains('open');
      const group = btnItem.closest('.mi-acc-group');
      if (group) group.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
      if (willOpen) {
        btnItem.classList.add('open');
        if (colorHost && !colorHost.dataset.rendered) {
          const sync = renderV4CompactColorPicker(
            colorHost,
            '按鈕配色',
            () => {
              const c = cur();
              const btn = c && c.button;
              return {
                bg: (btn && btn.bg) || '#000000',
                fg: (btn && btn.fg) || '#ffffff',
              };
            },
            (bg, fg) => {
              const c = cur();
              if (!c) return;
              c.button.bg = bg;
              c.button.fg = fg;
              const bub = q('.mi-bubble-button');
              if (bub) {
                bub.style.background = bg;
                bub.style.color = fg;
              }
            }
          );
          body._syncBtnColor = sync;
          colorHost.dataset.rendered = '1';
        } else if (body && body._syncBtnColor) {
          body._syncBtnColor();
        }
      }
    });

    const toggle = q('.mi-btn-toggle');
    if (toggle) {
      toggle.addEventListener('change', () => {
        const c = cur();
        if (!c) return;
        c.button.active = toggle.checked;
        if (toggle.checked) {
          if (!c.button.id) c.button.id = newId();
        } else {
          c.button.text = '';
          c.button.value = '';
        }
        renderMIButton();
        updateMIButtonPane();
        requestAnimationFrame(() => {
          if (toggle.checked) {
            const input = q('.mi-btn-text-input');
            if (input) input.focus();
          }
        });
      });
    }

    const textInput = q('.mi-btn-text-input');
    if (textInput) {
      textInput.addEventListener('input', () => {
        const c = cur();
        if (!c) return;
        let v = textInput.value;
        if (v.length > BTN_TEXT_MAX_MI) {
          v = v.slice(0, BTN_TEXT_MAX_MI);
          textInput.value = v;
          showHint(`按鈕文字最多 ${BTN_TEXT_MAX_MI} 字`);
        }
        c.button.text = v;
        const bub = q('.mi-bubble-button');
        if (bub) {
          const bt = bub.querySelector('.bubble-button-text');
          if (bt) bt.textContent = v || '{按鈕文字}';
          bub.classList.toggle('empty-text', !v);
        }
        updateMIButtonPane();
      });
    }

    card.querySelectorAll('.mi-btn-action-select .select-button-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const c = cur();
        if (!c) return;
        const newAction = opt.dataset.btnAction;
        c.button.action = newAction;
        if (newAction === 'message' && c.button.value.length > BTN_VALUE_MESSAGE_MAX_MI) {
          c.button.value = c.button.value.slice(0, BTN_VALUE_MESSAGE_MAX_MI);
        }
        updateMIButtonPane();
      });
    });

    const actionValue = q('.mi-btn-action-value');
    if (actionValue) {
      actionValue.addEventListener('input', () => {
        const c = cur();
        if (!c) return;
        let v = actionValue.value;
        const max = c.button.action === 'uri' ? 2048 : BTN_VALUE_MESSAGE_MAX_MI;
        if (v.length > max) {
          v = v.slice(0, max);
          actionValue.value = v;
          showHint(c.button.action === 'uri' ? '連結最多 2048 字' : `傳送文字最多 ${BTN_VALUE_MESSAGE_MAX_MI} 字`);
        }
        c.button.value = v;
        updateMIButtonPane();
      });
    }
  }

  // ----- Alt text -----
  const altInput = q('.alt-input');
  const altCount = q('.alt-count');
  if (altInput) {
    altInput.addEventListener('input', () => {
      const car = activeCarousel();
      if (!car) return;
      let v = altInput.value;
      if (v.length > ALT_MAX_MI) {
        v = v.slice(0, ALT_MAX_MI);
        altInput.value = v;
        showHint(`預覽文字最多 ${ALT_MAX_MI} 字`);
      }
      car.altText = v;
      if (altCount) altCount.textContent = String(v.length);
    });
  }
}

// ============ Mutators ============
function miRemoveImage() {
  closeButtonColorOverlay();
  const c = cur();
  if (!c) return;
  c.hasImage = false;
  c.imageUrl = '';
  renderHero();
  updateMIImagePane();
  updateMIPromoPane();
  updateGuideMode();
  scheduleAlign();
}
