// ============ RIGHT SIDEBAR PREVIEW ============
// Mirrors state.messages into the right preview sidebar as LINE-style chat
// items. Read-only — never mutates state.
//
// Carousel / multi-image previews CLONE the corresponding editor card's live
// `.bubble` element so the preview is byte-for-byte the same as the left side.
// The clone is wrapped in `.preview-clone` (pointer-events: none) and stripped
// of interactive add/edit hosts so the preview never reveals add-buttons on
// hover or accepts edits.
//
// Text / image / video / sticker have no left-side bubble preview, so they're
// rendered with custom markup at the widths the design calls for.

(function () {
  const TEXT_MAX = 5000;

  function renderPreview() {
    const list = document.getElementById('previewList');
    if (!list) return;
    list.innerHTML = '';

    if (!state.messages.length) {
      const empty = document.createElement('div');
      empty.className = 'preview-empty';
      empty.textContent = '尚未新增訊息';
      list.appendChild(empty);
      return;
    }

    state.messages.forEach(msg => {
      const node = renderPreviewItem(msg);
      if (node) list.appendChild(node);
    });
  }

  function renderPreviewItem(msg) {
    switch (msg.type) {
      case 'text':         return renderText(msg);
      case 'image':        return renderImage(msg);
      case 'video':        return renderVideo(msg);
      case 'audio':        return renderAudio(msg);
      case 'sticker':      return renderSticker(msg);
      case 'carousel':
      case 'carousel-v2':
      case 'carousel-v3':
      case 'multi-image':
      case 'imagemap':     return renderClonedBubble(msg);
      default:             return null;
    }
  }

  // ---------- carousel / multi-image: clone the editor bubble ----------
  function renderClonedBubble(msg) {
    const card = document.querySelector(`.msg-card[data-msg-id="${msg.id}"]`);
    if (!card) return null;
    const bubble = card.querySelector('.bubble');
    if (!bubble) return null;

    const clone = bubble.cloneNode(true);
    // Strip every interactive add/edit element so the preview reads as a
    // static rendering — no orphan + buttons, no per-field/-button delete X,
    // no drag handles, no v2 ghost rows.
    clone.querySelectorAll([
      '.image-add-host',
      '.promo-add-host',
      '.hero-controls',
      '.btn-add-wrap',
      '.body-inline-add',
      '.body-add-trigger',
      '.field-delete',
      '.btn-delete',
      '.drag-handle',
      '.body-field-ghost',
    ].join(', ')).forEach(el => el.remove());

    // Drop contenteditable so the cloned text fields don't show a caret /
    // accept input. (.preview-clone also has pointer-events: none, but this
    // is belt-and-braces.)
    clone.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
    });

    const wrap = document.createElement('div');
    wrap.className = 'preview-clone';
    wrap.dataset.msgType = msg.type;
    wrap.appendChild(clone);
    return wrap;
  }

  // ---------- text ----------
  function renderText(msg) {
    const wrap = el('div', 'pv-bubble pv-bubble-text');
    const text = (msg.data && msg.data.text) || '';
    const content = el('div', 'pv-text-content');
    if (text) {
      content.textContent = text;
    } else {
      content.classList.add('is-empty');
      content.textContent = '輸入文字內容';
    }
    wrap.appendChild(content);

    const footer = el('div', 'pv-text-footer');
    footer.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
      <span class="pv-count">${text.length}/${TEXT_MAX}</span>
    `;
    wrap.appendChild(footer);
    return wrap;
  }

  // ---------- image ----------
  function renderImage(msg) {
    const wrap = el('div', 'pv-bubble pv-bubble-media');
    wrap.appendChild(mediaNode(msg.data && msg.data.url, 'image'));
    return wrap;
  }

  // ---------- video ----------
  function renderVideo(msg) {
    const wrap = el('div', 'pv-bubble pv-bubble-media');
    wrap.appendChild(mediaNode(msg.data && msg.data.url, 'video'));
    return wrap;
  }

  function mediaNode(url, kind) {
    if (url) {
      const m = el('div', 'pv-media');
      const tag = kind === 'video' ? 'video' : 'img';
      const node = document.createElement(tag);
      node.src = url;
      if (kind === 'video') {
        node.muted = true;
        node.playsInline = true;
        node.controls = false;
      }
      m.appendChild(node);
      return m;
    }
    const m = el('div', 'pv-media empty');
    const ph = el('div', 'pv-media-placeholder');
    ph.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="9" cy="9" r="1.5"/></svg>
      <span>Image</span>
    `;
    m.appendChild(ph);
    return m;
  }

  // ---------- audio ----------
  function renderAudio(msg) {
    const wrap = el('div', 'pv-bubble pv-bubble-audio');
    const url = msg.data && msg.data.url;
    if (url) {
      const audio = document.createElement('audio');
      audio.src = url;
      audio.controls = true;
      wrap.appendChild(audio);
    } else {
      const ph = el('div', 'pv-audio-placeholder');
      ph.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        <span>尚未上傳音訊</span>
      `;
      wrap.appendChild(ph);
    }
    return wrap;
  }

  // ---------- sticker ----------
  function renderSticker(msg) {
    const id = msg.data && msg.data.stickerId;
    const sticker = id && typeof findSticker === 'function' ? findSticker(id) : null;
    if (sticker) {
      const node = el('div', 'pv-sticker');
      node.textContent = sticker.glyph;
      return node;
    }
    const node = el('div', 'pv-sticker empty');
    node.textContent = '尚未選擇貼圖';
    return node;
  }

  // ---------- helpers ----------
  function el(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  // ---------- live updates ----------
  // Capture-phase listeners run before per-card handlers, but the actual
  // mutation usually happens in the bubble-phase handlers — so we rAF after
  // dispatch to read the freshly-updated editor DOM (which we then clone).
  let _scheduled = false;
  function schedule() {
    if (_scheduled) return;
    _scheduled = true;
    requestAnimationFrame(() => {
      _scheduled = false;
      renderPreview();
    });
  }

  ['input', 'change', 'click', 'keyup', 'blur'].forEach(ev => {
    document.addEventListener(ev, schedule, true);
  });

  window.renderPreview = renderPreview;
  window.schedulePreviewUpdate = schedule;
})();
