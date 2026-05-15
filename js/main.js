// ============ MAIN ============
// Wires up document-level handlers that are NOT specific to one card:
//   - capture-phase listeners that set _activeCardEl + state.activeMessageId
//     before any per-card handler runs (so $c / cur() resolve correctly)
//   - shared file input dispatch (image/video/carousel-hero all share it)
//   - global popover backdrop / Escape

// Capture-phase active-card resolver. Runs before bubble-phase handlers in
// the type modules / carousel internals; ensures global state points to the
// card the user is interacting with.
const _CARD_EVENTS = ['click', 'input', 'change', 'focus', 'mousedown', 'keydown', 'paste', 'dragstart', 'dragend', 'dragover', 'drop'];
_CARD_EVENTS.forEach(ev => {
  document.addEventListener(ev, (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const card = e.target.closest('.msg-card');
    if (card) {
      setActiveCardEl(card);
      state.activeMessageId = card.dataset.msgId;
    }
  }, true);
});

// ============ Shared file input ============
// Used by carousel hero (image-only), image type, and video type. The active
// message + file accept attribute determine how to apply the result.
$('#fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;

  const msg = activeMessage();
  if (!msg) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    if (msg.type === 'image' || msg.type === 'video' || msg.type === 'audio') {
      msg.data.url = dataUrl;
      renderMessages();
    } else if (msg.type === 'imagemap') {
      msg.data.url = dataUrl;
      updateImagemapImagePane();
      renderImagemapBubble();
      if (typeof schedulePreviewUpdate === 'function') schedulePreviewUpdate();
    } else if (msg.type === 'carousel' || msg.type === 'carousel-v2' || msg.type === 'carousel-v3' || msg.type === 'carousel-v4' || msg.type === 'multi-image') {
      const c = cur();
      if (!c) return;
      c.hasImage = true;
      c.imageUrl = dataUrl;
      if (!c.imageType) c.imageType = 'image';
      renderHero();
      updateEditorBlocks();
      if (typeof updateV3ImagePane === 'function') updateV3ImagePane();
      if (typeof updateV3PromoPane === 'function') updateV3PromoPane();
      if (typeof updateV4ImagePane === 'function') updateV4ImagePane();
      if (typeof updateV4PromoPane === 'function') updateV4PromoPane();
      if (typeof updateMIImagePane === 'function') updateMIImagePane();
      if (typeof updateMIPromoPane === 'function') updateMIPromoPane();
      if (typeof updateMIButtonPane === 'function') updateMIButtonPane();
      updateGuideMode();
      scheduleAlign();
      if (typeof schedulePreviewUpdate === 'function') schedulePreviewUpdate();
    }
  };
  reader.readAsDataURL(file);
});

// ============ Popover backdrop / Escape ============
$('#backdrop').addEventListener('click', closePopover);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePopover();
    $('#bodyAddMenu').classList.remove('open');
    $('#imageTypeMenu').classList.remove('open');
    $('#messageTypeMenu').classList.remove('open');
  }
});

// ============ INIT ============
renderMessages();
