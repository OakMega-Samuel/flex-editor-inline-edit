// ============ TYPE: CAROUSEL (多頁訊息) ============
// Wraps the existing pages/hero/body/buttons rendering. Each carousel card
// gets its own copy of the template; rendering/events scope queries to the
// active card via $c (which reads _activeCardEl set in messages.js before
// renderBody and refreshed by main.js's capture-phase listeners).

const CAROUSEL_TEMPLATE = `
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

    <div class="editor-pane">
      <div class="color-row eb-promo" style="display:none">
        <button class="combo-swatch combo-swatch-sm promo-swatch" type="button" title="宣傳標語顏色">A</button>
        <span class="color-row-label">宣傳標語顏色</span>
      </div>
      <div class="color-row eb-card">
        <button class="combo-swatch combo-swatch-sm card-swatch" type="button" title="卡片顏色">A</button>
        <span class="color-row-label">卡片顏色</span>
      </div>
      <div class="editor-block eb-buttons" style="display:none">
        <div class="button-list"></div>
      </div>
    </div>
  </div>
`;

function makeCarouselData() {
  return {
    altText: '',
    pages: [makePage()],
    currentPage: 0,
  };
}

// Editor-block visibility for the active carousel.
// Selectors are scoped via $c so v1-only blocks (.eb-promo / .eb-buttons) are
// no-ops on v2 cards. v2 has its own promo-row toggle via updateEditorBlocksV2.
function updateEditorBlocks() {
  const c = cur();
  if (!c) return;
  const ebPromo = $c('.eb-promo');
  const ebButtons = $c('.eb-buttons');
  if (ebPromo) ebPromo.style.display = (c.hasImage && c.promo.active) ? '' : 'none';
  if (ebButtons) ebButtons.style.display = c.buttons.length > 0 ? '' : 'none';
  if (typeof updateEditorBlocksV2 === 'function') updateEditorBlocksV2();
  if (typeof updateMultiImageEditorBlocks === 'function') updateMultiImageEditorBlocks();
  if (typeof updateV3ImagePane === 'function') updateV3ImagePane();
  if (typeof updateV3PromoPane === 'function') updateV3PromoPane();
  if (typeof updateV3TextPane === 'function') updateV3TextPane();
  if (typeof updateV4ImagePane === 'function') updateV4ImagePane();
  if (typeof updateV4PromoPane === 'function') updateV4PromoPane();
  if (typeof updateV4TextPane === 'function') updateV4TextPane();
}

function applyCardColors() {
  const c = cur();
  if (!c) return;
  const bubble = $c('.bubble');
  if (!bubble) return;
  bubble.style.background = c.cardBg;
  $$c('.bubble-title, .bubble-desc, .bubble-price').forEach(el => el.style.color = c.cardText);
  const sw = $c('.card-swatch');
  if (sw) styleComboSwatch(sw, c.cardBg, c.cardText);

  const dark = isDarkColor(c.cardBg);
  bubble.style.setProperty('--add-border', dark ? 'rgba(255,255,255,0.45)' : '#d4d4d8');
  bubble.style.setProperty('--add-fg', dark ? 'rgba(255,255,255,0.78)' : '#8a8a92');
  bubble.style.setProperty('--add-hover-border', dark ? 'rgba(255,255,255,0.9)' : 'var(--accent)');
  bubble.style.setProperty('--add-hover-fg', dark ? '#ffffff' : 'var(--accent)');
  bubble.style.setProperty('--add-hover-bg', dark ? 'rgba(255,255,255,0.12)' : 'var(--accent-soft)');
  if (typeof updateAccTagsV2 === 'function') updateAccTagsV2();
}

function isDarkColor(hex) {
  if (!hex) return false;
  const h = hex.replace('#', '');
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

// Full re-render of the active carousel (after page add/delete/swap, etc.)
function renderCarouselFull() {
  renderPageTabs();
  renderHero();
  renderBody();
  renderButtonsFull();

  const car = activeCarousel();
  const altInput = $c('.alt-input');
  const altCount = $c('.alt-count');
  if (altInput && car) altInput.value = car.altText;
  if (altCount && car) altCount.textContent = String(car.altText.length);

  applyCardColors();
  updateEditorBlocks();
  updateGuideMode();
  scheduleAlign();
}

// ============ Top-level renderBody for carousel type ============
function renderCarouselBody(msg, body) {
  // _activeCardEl + state.activeMessageId have already been set by the
  // messages.js dispatcher before this call.
  body.innerHTML = CAROUSEL_TEMPLATE;

  // Initialise sub-views
  renderCarouselFull();

  // Bind per-card event handlers (replicating what main.js used to do for
  // the single-carousel case, now scoped to this card's elements).
  bindCarouselHandlers(body.closest('.msg-card'));
}

function bindCarouselHandlers(card) {
  if (!card) return;
  const q = (s) => card.querySelector(s);

  // Image add trigger → open shared image-type menu
  const imgAddTrigger = q('.image-add-trigger');
  if (imgAddTrigger) {
    imgAddTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openImageTypeMenu(imgAddTrigger);
    });
  }

  // Hero controls
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

  // Promo
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
      openPromoColorOverlay(q('.promo-banner'));
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

  // Editor swatches
  const promoSwatch = q('.promo-swatch');
  if (promoSwatch) {
    promoSwatch.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = cur();
      if (!c) return;
      openComboPopover(promoSwatch, '標語配色', c.promo.bg, c.promo.fg, (bg, fg) => {
        c.promo.bg = bg;
        c.promo.fg = fg;
        styleComboSwatch(promoSwatch, bg, fg);
        const banner = q('.promo-banner');
        if (banner) {
          banner.style.background = bg;
          banner.style.color = fg;
        }
      });
    });
  }
  const cardSwatch = q('.card-swatch');
  if (cardSwatch) {
    cardSwatch.addEventListener('click', () => {
      const c = cur();
      if (!c) return;
      openComboPopover(cardSwatch, '卡片配色', c.cardBg, c.cardText, (bg, fg) => {
        c.cardBg = bg;
        c.cardText = fg;
        applyCardColors();
      });
    });
  }

  // Alt text
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

function focusPromoText(card) {
  const el = card && card.querySelector('.promo-text');
  if (!el) return;
  el.focus();
  try {
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
  } catch (e) {}
}
