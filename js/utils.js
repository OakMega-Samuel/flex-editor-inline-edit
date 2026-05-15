const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isValidHex = (h) => /^#?[0-9a-f]{6}$/i.test(h);
const normalizeHex = (h) => {
  if (!h) return '';
  if (!h.startsWith('#')) h = '#' + h;
  return h.toLowerCase();
};

const showHint = (msg) => {
  const h = $('#hint');
  h.textContent = msg;
  h.classList.add('show');
  clearTimeout(showHint._t);
  showHint._t = setTimeout(() => h.classList.remove('show'), 1600);
};

const hasAnyBody = () => {
  const c = cur();
  return !!c && (c.title !== null || c.desc !== null || c.price !== null);
};
const isCompletelyEmpty = () => {
  const c = cur();
  if (!c) return false;
  // multi-image stores its single optional CTA in `c.button` (separate from
  // the `c.buttons` array used by carousel types) — count it as content.
  const singleBtnActive = !!(c.button && c.button.active);
  return !c.hasImage && !hasAnyBody() && c.buttons.length === 0 && !singleBtnActive;
};

function updateGuideMode() {
  const card = activeCardEl();
  if (!card) return;
  card.classList.toggle('initial-guide', isCompletelyEmpty());
}

function styleComboSwatch(el, bg, fg) {
  if (!el) return;
  el.style.background = bg;
  el.style.color = fg;
}

// Floating replace/delete button group docked to the top-left of an upload
// preview (.msg-upload-preview). Used by image / video / audio / sticker.
function makeUploadControls({ replaceLabel, removeLabel, onReplace, onRemove }) {
  const wrap = document.createElement('div');
  wrap.className = 'msg-upload-controls';

  const replaceBtn = document.createElement('button');
  replaceBtn.type = 'button';
  replaceBtn.title = replaceLabel;
  replaceBtn.setAttribute('aria-label', replaceLabel);
  replaceBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`;
  replaceBtn.addEventListener('click', (e) => { e.stopPropagation(); onReplace(); });
  wrap.appendChild(replaceBtn);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'danger';
  removeBtn.title = removeLabel;
  removeBtn.setAttribute('aria-label', removeLabel);
  removeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
  removeBtn.addEventListener('click', (e) => { e.stopPropagation(); onRemove(); });
  wrap.appendChild(removeBtn);

  return wrap;
}

// Shared upload empty-state zone (image / video / audio / sticker share the
// same visual: featured icon + two lines of helper text inside a 192px tall
// clickable area). `onClick` triggers the relevant picker (file dialog or
// sticker popover); `onDrop` is optional drag-drop handling.
function makeUploadEmptyZone({ primaryText, secondaryText, onClick, onDrop }) {
  const zone = document.createElement('div');
  zone.className = 'msg-upload-zone';
  zone.innerHTML = `
    <div class="upload-featured-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    </div>
    <div class="upload-text">
      <span class="primary">${escapeHtml(primaryText)}</span>
      <span class="secondary">${escapeHtml(secondaryText)}</span>
    </div>
  `;
  zone.addEventListener('click', onClick);
  if (onDrop) {
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) onDrop(file);
    });
  }
  return zone;
}

function positionMenu(menu, anchor) {
  menu.style.visibility = 'hidden';
  menu.classList.add('open');
  const rect = anchor.getBoundingClientRect();
  const mr = menu.getBoundingClientRect();
  let top = rect.bottom + 4 + window.scrollY;
  let left = rect.left + window.scrollX;
  if (left + mr.width > window.innerWidth - 8) left = window.innerWidth - mr.width - 8;
  if (left < 8) left = 8;
  menu.style.top = top + 'px';
  menu.style.left = left + 'px';
  menu.style.visibility = '';
}
