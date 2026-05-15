// ============ HERO (carousel) ============
// All queries are scoped to the active carousel card via $c. Called from
// renderCarouselBody / page handlers / file-upload completion.

function renderHero() {
  const hero = $c('.bubble-hero');
  const host = $c('.image-add-host');
  const c = cur();
  if (!hero || !c) return;

  if (!c.hasImage) {
    hero.style.display = 'none';
    if (host) {
      host.classList.add('empty');
      host.style.display = '';
    }
    return;
  }

  if (host) host.style.display = 'none';
  hero.style.display = '';

  let img = hero.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.alt = '';
    img.addEventListener('load', scheduleAlign);
    hero.insertBefore(img, hero.firstChild);
  }
  if (img.src !== c.imageUrl) img.src = c.imageUrl;

  const animBadge = $c('.anim-badge');
  if (animBadge) animBadge.style.display = c.imageType === 'animated' ? '' : 'none';

  renderPromo();
  if (typeof updateV3ImagePane === 'function') updateV3ImagePane();
  if (typeof updateV4ImagePane === 'function') updateV4ImagePane();
}

function renderPromo() {
  const c = cur();
  if (!c) return;
  const banner = $c('.promo-banner');
  const addHost = $c('.promo-add-host');
  const textEl = $c('.promo-text');
  if (!banner || !textEl) return;

  // v3/v4 bubble has no add-host trigger; the right-pane accordion drives promo.
  // textEl is also display-only there (no contentEditable wiring).
  const msg = activeMessage();
  const isRightPaneOnly = !!(msg && isRightPaneOnlyType(msg.type));

  if (!c.hasImage || !c.promo.active) {
    banner.style.display = 'none';
    if (addHost) {
      addHost.classList.add('empty');
      addHost.style.display = c.hasImage ? '' : 'none';
    }
    if (typeof updateV3PromoPane === 'function') updateV3PromoPane();
    if (typeof updateV4PromoPane === 'function') updateV4PromoPane();
    return;
  }

  if (addHost) addHost.style.display = 'none';
  banner.style.display = '';
  banner.style.background = c.promo.bg;
  banner.style.color = c.promo.fg;

  if (!isRightPaneOnly) {
    textEl.contentEditable = 'true';
  }
  textEl.spellcheck = false;
  if (textEl.textContent !== c.promo.text) textEl.textContent = c.promo.text;
  const sw = $c('.promo-swatch');
  if (sw) styleComboSwatch(sw, c.promo.bg, c.promo.fg);
  if (typeof updateAccTagsV2 === 'function') updateAccTagsV2();
  if (typeof updateV3PromoPane === 'function') updateV3PromoPane();
  if (typeof updateV4PromoPane === 'function') updateV4PromoPane();
}

// ===== Image-type menu (shared global menu, anchored to whichever card's
// image-add-trigger was clicked). The activeMessageId is set by the card's
// click handler before openImageTypeMenu fires.
function openImageTypeMenu(anchor) {
  const menu = $('#imageTypeMenu');
  positionMenu(menu, anchor);
  setTimeout(() => {
    document.addEventListener('mousedown', closeImageMenuHandler, { once: true });
  }, 0);
}
function closeImageMenuHandler(e) {
  if (e.target.closest('#imageTypeMenu')) {
    document.addEventListener('mousedown', closeImageMenuHandler, { once: true });
    return;
  }
  $('#imageTypeMenu').classList.remove('open');
}
$('#imageTypeMenu').addEventListener('click', (e) => {
  const item = e.target.closest('.menu-item');
  if (!item) return;
  const c = cur();
  if (!c) return;
  c.imageType = item.dataset.imgType;
  $('#imageTypeMenu').classList.remove('open');
  $('#fileInput').accept = 'image/*';
  $('#fileInput').click();
});
