// ============ TYPE: IMAGEMAP (圖文訊息) ============
// A single image whose area can optionally be split into clickable regions.
// The "顯示版型" toggle decides whether the grid overlay + per-region
// actions are active. When off, the bubble renders as a plain image and the
// region accordions are hidden.
//
// Layouts:
//   1x1 → 1 region (A)
//   2x2 → 4 regions (A B / C D)
//   3x2 → 6 regions (3 columns × 2 rows: A B C / D E F)
//   1x4 → 4 regions stacked (A / B / C / D)
//
// Region action: 無點擊行為 / 傳送文字 (≤40) / 開啟連結 (URL ≤2048)

const IM_ALT_MAX = 100;
const IM_REGION_MESSAGE_MAX = 40;
const IM_REGION_URI_MAX = 2048;
const IM_REGION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const IMAGEMAP_LAYOUTS = {
  '1x1': { rows: 1, cols: 1, count: 1 },
  '2x2': { rows: 2, cols: 2, count: 4 },
  '3x2': { rows: 2, cols: 3, count: 6 },
  '1x4': { rows: 4, cols: 1, count: 4 },
};

const IMAGEMAP_LAYOUT_ORDER = ['1x1', '2x2', '3x2', '1x4'];

// Icon SVGs for the 4 layout cards (mirror Figma 圖文訊息版型 v2 icons).
const IM_LAYOUT_ICONS = {
  '1x1': `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
  '2x2': `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
  '3x2': `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
  '1x4': `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="8.25" x2="21" y2="8.25"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="15.75" x2="21" y2="15.75"/></svg>`,
};

const IM_LAYOUT_REGION_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>`;

function makeImagemapData() {
  return {
    altText: '',
    url: '',
    showLayout: true,
    layout: '2x2',
    regions: makeImagemapRegions(4),
  };
}

function makeImagemapRegions(count) {
  const arr = [];
  for (let i = 0; i < count; i++) arr.push({ action: 'none', value: '' });
  return arr;
}

// Resize the regions array to match the selected layout, preserving any
// already-configured entries (trim from the end / pad with defaults).
function resizeImagemapRegions(data) {
  const want = IMAGEMAP_LAYOUTS[data.layout].count;
  const have = data.regions.length;
  if (want === have) return;
  if (want < have) {
    data.regions = data.regions.slice(0, want);
  } else {
    for (let i = have; i < want; i++) {
      data.regions.push({ action: 'none', value: '' });
    }
  }
}

// ============ Top-level renderBody ============
function renderImagemapBody(msg, body) {
  body.innerHTML = `

    <div class="v4-section v4-alt-section">
      <div class="v4-form-line v4-form-line-stack">
        <div class="v4-form-label">預覽文字</div>
        <div class="alt-input-wrap v4-alt-wrap">
          <input type="text" class="alt-input im-alt-input" maxlength="${IM_ALT_MAX}" placeholder="請輸入內容">
          <span class="alt-counter"><span class="alt-count im-alt-count">0</span><span class="sep">/</span><span class="max">${IM_ALT_MAX}</span></span>
        </div>
      </div>
    </div>

    <div class="body-row im-body-row">

      <div class="preview-pane im-preview-pane">
        <div class="im-preview-header">
          <div class="im-preview-header-label">顯示版型</div>
          <label class="toggle-switch">
            <input type="checkbox" class="im-show-layout-toggle">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="bubble im-bubble">
          <div class="im-bubble-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            <span>尚未上傳圖片</span>
          </div>
          <img class="im-bubble-image" alt="" hidden>
          <div class="im-overlay" hidden></div>
        </div>
      </div>

      <div class="editor-pane editor-pane-v4 im-editor-pane">

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

        <div class="v4-form-line v4-form-line-stack im-layout-section">
          <div class="v4-form-label">版型</div>
          <div class="im-layout-cards">
            ${IMAGEMAP_LAYOUT_ORDER.map(k => `
              <button type="button" class="im-layout-card" data-layout="${k}">
                <div class="im-layout-icon">${IM_LAYOUT_ICONS[k]}</div>
                <div class="im-layout-name">${k}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="v4-section im-regions-section">
          <div class="v4-acc-group im-acc-group"></div>
        </div>

      </div>
    </div>
  `;

  renderImagemapFull();
  bindImagemapHandlers(body.closest('.msg-card'));
}

function renderImagemapFull() {
  const card = activeCardEl();
  if (!card) return;
  const msg = activeMessage();
  if (!msg || msg.type !== 'imagemap') return;
  const data = msg.data;

  // Alt text
  const altInput = card.querySelector('.im-alt-input');
  const altCount = card.querySelector('.im-alt-count');
  if (altInput && document.activeElement !== altInput && altInput.value !== data.altText) {
    altInput.value = data.altText;
  }
  if (altCount) altCount.textContent = String(data.altText.length);

  // showLayout toggle
  const toggle = card.querySelector('.im-show-layout-toggle');
  if (toggle) toggle.checked = !!data.showLayout;

  updateImagemapImagePane();
  updateImagemapLayoutCards();
  renderImagemapBubble();
  renderImagemapRegionList();
  toggleImagemapRegionsSection();
}

// ============ Bubble preview ============
function renderImagemapBubble() {
  const card = activeCardEl();
  if (!card) return;
  const msg = activeMessage();
  if (!msg || msg.type !== 'imagemap') return;
  const data = msg.data;

  const empty = card.querySelector('.im-bubble-empty');
  const img = card.querySelector('.im-bubble-image');
  const overlay = card.querySelector('.im-overlay');
  if (!img || !overlay || !empty) return;

  if (!data.url) {
    empty.hidden = false;
    img.hidden = true;
    img.removeAttribute('src');
    overlay.hidden = true;
    overlay.innerHTML = '';
    return;
  }

  empty.hidden = true;
  img.hidden = false;
  if (img.src !== data.url) img.src = data.url;

  if (!data.showLayout) {
    overlay.hidden = true;
    overlay.innerHTML = '';
    return;
  }

  overlay.hidden = false;
  const layout = IMAGEMAP_LAYOUTS[data.layout];
  overlay.style.gridTemplateColumns = `repeat(${layout.cols}, 1fr)`;
  overlay.style.gridTemplateRows = `repeat(${layout.rows}, 1fr)`;
  overlay.innerHTML = '';
  for (let i = 0; i < layout.count; i++) {
    const cell = document.createElement('div');
    cell.className = 'im-overlay-cell';
    cell.dataset.idx = String(i);
    const badge = document.createElement('div');
    badge.className = 'im-overlay-badge';
    badge.textContent = IM_REGION_LETTERS[i] || '';
    cell.appendChild(badge);
    overlay.appendChild(cell);
  }
}

// ============ Image pane (right side) ============
function updateImagemapImagePane() {
  const card = activeCardEl();
  if (!card) return;
  const msg = activeMessage();
  if (!msg || msg.type !== 'imagemap') return;
  const data = msg.data;

  const upload = card.querySelector('.v4-image-upload');
  const preview = card.querySelector('.v4-image-preview');
  const previewImg = preview && preview.querySelector('img');
  const replaceBtn = card.querySelector('.v4-image-replace');
  const removeBtn = card.querySelector('.v4-image-remove');

  if (data.url) {
    if (upload) upload.hidden = true;
    if (preview) preview.hidden = false;
    if (previewImg && previewImg.src !== data.url) previewImg.src = data.url;
    if (replaceBtn) replaceBtn.disabled = false;
    if (removeBtn) removeBtn.disabled = false;
  } else {
    if (upload) upload.hidden = false;
    if (preview) preview.hidden = true;
    if (previewImg) previewImg.removeAttribute('src');
    if (replaceBtn) replaceBtn.disabled = true;
    if (removeBtn) removeBtn.disabled = true;
  }
}

// ============ Layout cards (selected highlight) ============
function updateImagemapLayoutCards() {
  const card = activeCardEl();
  if (!card) return;
  const msg = activeMessage();
  if (!msg || msg.type !== 'imagemap') return;
  card.querySelectorAll('.im-layout-card').forEach(c => {
    c.classList.toggle('is-selected', c.dataset.layout === msg.data.layout);
  });
}

// ============ Region accordions ============
function toggleImagemapRegionsSection() {
  const card = activeCardEl();
  if (!card) return;
  const msg = activeMessage();
  if (!msg || msg.type !== 'imagemap') return;
  const section = card.querySelector('.im-regions-section');
  if (section) section.hidden = !msg.data.showLayout;
}

function renderImagemapRegionList() {
  const card = activeCardEl();
  if (!card) return;
  const msg = activeMessage();
  if (!msg || msg.type !== 'imagemap') return;
  const group = card.querySelector('.im-acc-group');
  if (!group) return;
  const data = msg.data;

  // Preserve which accordion was open across re-renders. Identify by letter.
  const openLetter = (() => {
    const openItem = group.querySelector('.acc-item.open');
    return openItem ? openItem.dataset.letter : null;
  })();

  group.innerHTML = '';
  data.regions.forEach((region, idx) => {
    const letter = IM_REGION_LETTERS[idx];
    const item = createImagemapRegionItem(idx, letter, region);
    group.appendChild(item);
  });

  if (openLetter) {
    const next = group.querySelector(`.acc-item[data-letter="${openLetter}"]`);
    if (next) next.classList.add('open');
  }

  updateImagemapRegionSubtitles();
}

function createImagemapRegionItem(idx, letter, region) {
  const item = document.createElement('div');
  item.className = 'acc-item v3-acc-item v4-acc-item im-acc-item';
  item.dataset.idx = String(idx);
  item.dataset.letter = letter;

  item.innerHTML = `
    <div class="acc-header">
      <div class="im-acc-icon">${IM_LAYOUT_REGION_ICON}</div>
      <div class="acc-title-block">
        <div class="acc-title">${letter}</div>
        <div class="acc-subtitle is-empty">無點擊行為</div>
      </div>
      <svg class="acc-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="acc-body">
      <div class="acc-body-inner">
        <div class="select-button im-region-action-select" role="tablist" aria-label="${letter} 區塊點擊行為">
          <button type="button" class="select-button-option" data-action="none" role="tab">無點擊行為</button>
          <button type="button" class="select-button-option" data-action="message" role="tab">傳送文字</button>
          <button type="button" class="select-button-option" data-action="uri" role="tab">開啟連結</button>
        </div>
        <div class="acc-field im-region-value-field" hidden>
          <div class="acc-text-input-wrap">
            <input type="text" class="im-region-value v4-promo-input" placeholder="使用者點擊後傳送的文字">
            <span class="acc-text-counter">
              <span class="acc-count im-region-count">0</span><span class="acc-sep">/</span><span class="acc-max im-region-max">${IM_REGION_MESSAGE_MAX}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Reflect state into the select-button + value field.
  syncImagemapRegionItem(item, region);
  return item;
}

function syncImagemapRegionItem(item, region) {
  item.querySelectorAll('.im-region-action-select .select-button-option').forEach(opt => {
    const on = opt.dataset.action === region.action;
    opt.classList.toggle('is-selected', on);
    opt.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  const valueField = item.querySelector('.im-region-value-field');
  const valueInput = item.querySelector('.im-region-value');
  const valueCount = item.querySelector('.im-region-count');
  const valueMax = item.querySelector('.im-region-max');

  if (region.action === 'none') {
    if (valueField) valueField.hidden = true;
  } else {
    if (valueField) valueField.hidden = false;
    if (valueInput) {
      if (region.action === 'uri') {
        valueInput.placeholder = 'https://...';
        valueInput.maxLength = IM_REGION_URI_MAX;
        if (valueMax) valueMax.textContent = String(IM_REGION_URI_MAX);
      } else {
        valueInput.placeholder = '使用者點擊後傳送的文字';
        valueInput.maxLength = IM_REGION_MESSAGE_MAX;
        if (valueMax) valueMax.textContent = String(IM_REGION_MESSAGE_MAX);
      }
      if (document.activeElement !== valueInput && valueInput.value !== region.value) {
        valueInput.value = region.value;
      }
      if (valueCount) valueCount.textContent = String(valueInput.value.length);
    }
  }
}

function updateImagemapRegionSubtitles() {
  const card = activeCardEl();
  if (!card) return;
  const msg = activeMessage();
  if (!msg || msg.type !== 'imagemap') return;
  const items = card.querySelectorAll('.im-acc-group .acc-item');
  items.forEach((item, idx) => {
    const region = msg.data.regions[idx];
    if (!region) return;
    const sub = item.querySelector('.acc-subtitle');
    if (!sub) return;
    if (region.action === 'none') {
      sub.textContent = '無點擊行為';
      sub.classList.add('is-empty');
    } else {
      const lbl = region.action === 'uri' ? '開啟連結' : '傳送文字';
      sub.textContent = region.value ? `${lbl}：${region.value}` : lbl;
      sub.classList.toggle('is-empty', !region.value);
    }
  });
}

// ============ Event bindings ============
function bindImagemapHandlers(card) {
  if (!card) return;
  const q = (s) => card.querySelector(s);
  const data = () => {
    const m = state.messages.find(x => x.id === card.dataset.msgId);
    return m && m.type === 'imagemap' ? m.data : null;
  };

  // Alt text input
  const altInput = q('.im-alt-input');
  if (altInput) {
    altInput.addEventListener('input', () => {
      const d = data();
      if (!d) return;
      let v = altInput.value;
      if (v.length > IM_ALT_MAX) {
        v = v.slice(0, IM_ALT_MAX);
        altInput.value = v;
        showHint(`預覽文字最多 ${IM_ALT_MAX} 字`);
      }
      d.altText = v;
      const c = card.querySelector('.im-alt-count');
      if (c) c.textContent = String(v.length);
    });
  }

  // 顯示版型 toggle
  const showToggle = q('.im-show-layout-toggle');
  if (showToggle) {
    showToggle.addEventListener('change', () => {
      const d = data();
      if (!d) return;
      d.showLayout = showToggle.checked;
      renderImagemapBubble();
      toggleImagemapRegionsSection();
    });
  }

  // Image upload / replace / remove
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
      const d = data();
      if (!d) return;
      d.url = '';
      updateImagemapImagePane();
      renderImagemapBubble();
    });
  }

  // Layout cards
  card.querySelectorAll('.im-layout-card').forEach(c => {
    c.addEventListener('click', () => {
      const d = data();
      if (!d) return;
      const layout = c.dataset.layout;
      if (!IMAGEMAP_LAYOUTS[layout] || d.layout === layout) return;
      d.layout = layout;
      resizeImagemapRegions(d);
      updateImagemapLayoutCards();
      renderImagemapBubble();
      renderImagemapRegionList();
    });
  });

  // Region accordion + per-region controls. Event-delegate so we don't have
  // to rebind every time the region list is rebuilt.
  const group = q('.im-acc-group');
  if (group) {
    group.addEventListener('click', (e) => {
      const item = e.target.closest('.acc-item');
      if (!item) return;

      // Select-button option click
      const opt = e.target.closest('.select-button-option');
      if (opt) {
        e.stopPropagation();
        const d = data();
        if (!d) return;
        const idx = parseInt(item.dataset.idx, 10);
        const region = d.regions[idx];
        if (!region) return;
        const newAction = opt.dataset.action;
        if (region.action === newAction) return;
        region.action = newAction;
        // Clear value if switching to "none"; clamp if switching message ↔ uri.
        if (newAction === 'none') {
          region.value = '';
        } else if (newAction === 'message' && region.value.length > IM_REGION_MESSAGE_MAX) {
          region.value = region.value.slice(0, IM_REGION_MESSAGE_MAX);
        }
        syncImagemapRegionItem(item, region);
        updateImagemapRegionSubtitles();
        return;
      }

      // Other interactive elements should not toggle the accordion.
      if (e.target.closest('input, textarea')) return;

      const header = e.target.closest('.acc-header');
      if (!header) return;
      const willOpen = !item.classList.contains('open');
      group.querySelectorAll('.acc-item').forEach(o => o.classList.remove('open'));
      if (willOpen) item.classList.add('open');
    });

    group.addEventListener('input', (e) => {
      const input = e.target.closest('.im-region-value');
      if (!input) return;
      const item = input.closest('.acc-item');
      if (!item) return;
      const d = data();
      if (!d) return;
      const idx = parseInt(item.dataset.idx, 10);
      const region = d.regions[idx];
      if (!region) return;
      let v = input.value;
      const max = region.action === 'uri' ? IM_REGION_URI_MAX : IM_REGION_MESSAGE_MAX;
      if (v.length > max) {
        v = v.slice(0, max);
        input.value = v;
        showHint(region.action === 'uri' ? `連結最多 ${IM_REGION_URI_MAX} 字` : `傳送文字最多 ${IM_REGION_MESSAGE_MAX} 字`);
      }
      region.value = v;
      const c = item.querySelector('.im-region-count');
      if (c) c.textContent = String(v.length);
      updateImagemapRegionSubtitles();
    });
  }
}
