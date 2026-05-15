// ============ TYPE: STICKER ============
// Mock sticker gallery: emoji-based placeholders. Each entry has an id +
// glyph; future iterations can swap for real LINE sticker assets without
// changing the data shape.
const STICKER_GALLERY = [
  { id: 'st-01', glyph: '😀' }, { id: 'st-02', glyph: '😂' },
  { id: 'st-03', glyph: '🥰' }, { id: 'st-04', glyph: '😎' },
  { id: 'st-05', glyph: '🤔' }, { id: 'st-06', glyph: '😴' },
  { id: 'st-07', glyph: '😭' }, { id: 'st-08', glyph: '🤯' },
  { id: 'st-09', glyph: '👍' }, { id: 'st-10', glyph: '👏' },
  { id: 'st-11', glyph: '🙏' }, { id: 'st-12', glyph: '💪' },
  { id: 'st-13', glyph: '❤️' }, { id: 'st-14', glyph: '🔥' },
  { id: 'st-15', glyph: '✨' }, { id: 'st-16', glyph: '🎉' },
  { id: 'st-17', glyph: '🌸' }, { id: 'st-18', glyph: '🌈' },
  { id: 'st-19', glyph: '☕' }, { id: 'st-20', glyph: '🍰' },
  { id: 'st-21', glyph: '🐶' }, { id: 'st-22', glyph: '🐱' },
  { id: 'st-23', glyph: '🐰' }, { id: 'st-24', glyph: '🦊' },
];

function makeStickerData() {
  return { stickerId: null };
}

function findSticker(id) {
  return STICKER_GALLERY.find(s => s.id === id) || null;
}

function renderStickerBody(msg, body) {
  body.classList.add('msg-upload-body');
  const cur = findSticker(msg.data.stickerId);

  if (!cur) {
    const zone = makeUploadEmptyZone({
      primaryText: '點擊選擇貼圖',
      secondaryText: '從貼圖庫挑選一個你想要的貼圖',
      onClick: (e) => {
        e.stopPropagation();
        openStickerPopover(zone, msg);
      },
    });
    body.appendChild(zone);
    return;
  }

  const preview = document.createElement('div');
  preview.className = 'msg-upload-preview';
  const glyph = document.createElement('div');
  glyph.className = 'msg-upload-sticker';
  glyph.textContent = cur.glyph;
  preview.appendChild(glyph);
  preview.appendChild(makeUploadControls({
    replaceLabel: '替換貼圖',
    removeLabel: '移除貼圖',
    onReplace: () => openStickerPopover(preview, msg),
    onRemove: () => { msg.data.stickerId = null; renderMessages(); },
  }));
  body.appendChild(preview);
}

// ----- Popover (single shared instance) -----
let _stickerPop = null;
let _stickerOutside = null;

function _ensureStickerPopover() {
  if (_stickerPop) return _stickerPop;
  const pop = document.createElement('div');
  pop.className = 'sticker-popover';
  const grid = document.createElement('div');
  grid.className = 'sticker-popover-grid';
  pop.appendChild(grid);
  document.body.appendChild(pop);
  _stickerPop = pop;
  return pop;
}

function openStickerPopover(anchor, msg) {
  const pop = _ensureStickerPopover();
  const grid = pop.querySelector('.sticker-popover-grid');
  grid.innerHTML = '';
  STICKER_GALLERY.forEach(s => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'msg-sticker-cell' + (s.id === msg.data.stickerId ? ' selected' : '');
    cell.textContent = s.glyph;
    cell.title = s.id;
    cell.addEventListener('click', (e) => {
      e.stopPropagation();
      msg.data.stickerId = s.id;
      closeStickerPopover();
      renderMessages();
    });
    grid.appendChild(cell);
  });
  positionMenu(pop, anchor);
  pop.classList.add('open');
  // Close on outside click / Esc. Bind on next tick so the click that
  // opened the popover doesn't immediately close it.
  setTimeout(() => {
    _stickerOutside = (e) => {
      if (pop.contains(e.target) || anchor.contains(e.target)) return;
      closeStickerPopover();
    };
    document.addEventListener('mousedown', _stickerOutside, true);
    document.addEventListener('keydown', _stickerKey, true);
  }, 0);
}

function _stickerKey(e) {
  if (e.key === 'Escape') closeStickerPopover();
}

function closeStickerPopover() {
  if (!_stickerPop) return;
  _stickerPop.classList.remove('open');
  if (_stickerOutside) {
    document.removeEventListener('mousedown', _stickerOutside, true);
    _stickerOutside = null;
  }
  document.removeEventListener('keydown', _stickerKey, true);
}
